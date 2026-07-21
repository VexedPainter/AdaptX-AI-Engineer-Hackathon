/**
 * Pipeline Orchestrator
 * 
 * Ties all 10 stages together into a single end-to-end extraction pipeline.
 * Each stage is independently callable, but this module orchestrates the flow:
 * 
 * Ingestion → Chunking → Retrieval → Prompt Assembly → Pre-Guard →
 * Extraction → Post-Guard → Chunk Merge → Validation → (Retry?) →
 * Failure Logger → Output Store
 * 
 * @module pipeline
 */

import { ingestDocument } from '../stage01-ingestion/index.js';
import { chunkDocument } from '../stage02-chunking/index.js';
import { retrievalEngine } from '../stage03-retrieval/index.js';
import { assemblePrompt, assembleRetryPrompt } from '../stage04-prompt-assembly/index.js';
import { preGuard, postGuard } from '../stage05-guardrails/index.js';
import { ExtractionEngine, type ExtractionConfig } from '../stage06-extraction/index.js';
import { mergeChunkExtractions, type ChunkExtraction } from '../stage07-chunk-merge/index.js';
import { validateExtraction, shouldRetry } from '../stage08-validation/index.js';
import {
  logValidationFailure, logGuardrailBlock, logLlmError,
  logMergeConflicts, logStageFailure, getFailureLogs,
} from '../stage09-failure-logger/index.js';
import { OutputStore } from '../stage10-output-store/index.js';
import { traceStage, recordDocumentMetrics } from '../observability/index.js';
import { config } from '../config/index.js';
import type {
  DocumentType, PipelineOutput, PipelineStage,
  ExtractionResult, FailureLogEntry,
} from '../types/index.js';

// ─── Singleton Instances ────────────────────────────────────────────────────

let extractionEngine: ExtractionEngine | null = null;
let outputStore: OutputStore | null = null;

function getExtractionEngine(): ExtractionEngine {
  if (!extractionEngine) {
    const extractionConfig: ExtractionConfig = {
      mistralApiKey: config.MISTRAL_API_KEY || undefined,
      cerebrasApiKey: config.CEREBRAS_API_KEY || undefined,
      geminiApiKey: config.GEMINI_API_KEY,
      groqApiKey: config.GROQ_API_KEY || undefined,
      temperature: config.LLM_TEMPERATURE,
      topP: config.LLM_TOP_P,
      rateLimitRpm: config.LLM_RATE_LIMIT_RPM,
    };
    extractionEngine = new ExtractionEngine(extractionConfig);
  }
  return extractionEngine;
}

function getOutputStore(): OutputStore {
  if (!outputStore) {
    outputStore = new OutputStore(
      process.cwd() + '/output',
      config.AES_ENCRYPTION_KEY
    );
  }
  return outputStore;
}

// ─── Cost Estimation ────────────────────────────────────────────────────────

/** Estimated cost per 1M tokens for each provider */
const COST_PER_MILLION_TOKENS: Record<string, number> = {
  gemini: 0.075,   // Gemini 2.0 Flash — $0.075/1M input tokens
  groq: 0.05,      // Llama on Groq — very cheap
};

function estimateCost(totalTokens: number, provider: string): number {
  const rate = COST_PER_MILLION_TOKENS[provider] || 0.1;
  return (totalTokens / 1_000_000) * rate;
}

// ─── Pipeline Orchestration ─────────────────────────────────────────────────

/**
 * Process a single document through the entire extraction pipeline.
 * 
 * This is the main entry point called by the API gateway.
 * Each stage is traced with OpenTelemetry spans.
 */
export async function processDocument(
  content: string,
  type: DocumentType,
  correlationId: string,
  source?: string
): Promise<PipelineOutput> {
  const stageLatencies: Partial<Record<PipelineStage, number>> = {};
  let totalTokens = 0;
  let totalRetries = 0;
  const providersUsed = new Set<string>();
  const allFailures: FailureLogEntry[] = [];

  // ── Stage 1: Ingestion ──────────────────────────────────────────────────
  const { result: doc, latencyMs: ingestionLatency } = await traceStage(
    'ingestion',
    correlationId,
    { documentType: type },
    async () => ingestDocument(content, type, source)
  );
  stageLatencies.ingestion = ingestionLatency;

  // ── Stage 2: Chunking ───────────────────────────────────────────────────
  const { result: chunks, latencyMs: chunkingLatency } = await traceStage(
    'chunking',
    correlationId,
    { documentId: doc.id, documentType: type },
    async () => chunkDocument(doc)
  );
  stageLatencies.chunking = chunkingLatency;

  if (chunks.length === 0) {
    logStageFailure(correlationId, doc.id, 'chunking', 'truncation', 'Document produced zero chunks');
    return buildFailedOutput(doc.id, correlationId, type, stageLatencies, totalTokens, totalRetries, allFailures, providersUsed);
  }

  // ── Process each chunk through stages 3-6 ───────────────────────────────
  const chunkExtractions: ChunkExtraction[] = [];

  for (const chunk of chunks) {
    // ── Stage 3: Retrieval ──────────────────────────────────────────────
    const { result: retrievalResult, latencyMs: retrievalLatency } = await traceStage(
      'retrieval',
      correlationId,
      { chunkId: chunk.chunkId, documentId: doc.id },
      async () => retrievalEngine.retrieveExamples(chunk)
    );
    stageLatencies.retrieval = (stageLatencies.retrieval || 0) + retrievalLatency;

    // ── Stage 4: Prompt Assembly ────────────────────────────────────────
    const { result: prompt, latencyMs: assemblyLatency } = await traceStage(
      'prompt_assembly',
      correlationId,
      { chunkId: chunk.chunkId },
      async () => assemblePrompt(chunk, retrievalResult.examples)
    );
    stageLatencies.prompt_assembly = (stageLatencies.prompt_assembly || 0) + assemblyLatency;

    // ── Stage 5a: Pre-Guard ─────────────────────────────────────────────
    const { result: preGuardResult, latencyMs: preGuardLatency } = await traceStage(
      'pre_guard',
      correlationId,
      { chunkId: chunk.chunkId, engine: config.ENKRYPT_API_KEY ? 'enkrypt' : 'fallback' },
      async () => preGuard(prompt.userMessage, config.ENKRYPT_API_KEY || undefined)
    );
    stageLatencies.pre_guard = (stageLatencies.pre_guard || 0) + preGuardLatency;

    if (!preGuardResult.passed) {
      logGuardrailBlock(correlationId, doc.id, 'pre_guard',
        preGuardResult.issues.map(i => i.description).join('; '));
      continue; // Skip this chunk
    }

    // ── Stage 6: Extraction with retry loop ─────────────────────────────
    let extractionResult: ExtractionResult | null = null;
    let currentPrompt = prompt;
    let retryCount = 0;

    while (retryCount <= config.LLM_MAX_RETRIES) {
      try {
        const { result: extraction, latencyMs: extractionLatency } = await traceStage(
          'extraction',
          correlationId,
          {
            chunkId: chunk.chunkId,
            retryCount,
            temperature: config.LLM_TEMPERATURE,
            topP: config.LLM_TOP_P,
          },
          async (span) => {
            const result = await getExtractionEngine().extract(currentPrompt);
            // Log extraction metadata on the span
            span.setAttribute('llm.provider', result.provider);
            span.setAttribute('llm.model', result.model);
            span.setAttribute('llm.prompt_hash', result.promptHash);
            span.setAttribute('llm.token_usage.prompt', result.tokenUsage.promptTokens);
            span.setAttribute('llm.token_usage.completion', result.tokenUsage.completionTokens);
            span.setAttribute('llm.token_usage.total', result.tokenUsage.totalTokens);
            span.setAttribute('llm.temperature', result.temperature);
            span.setAttribute('llm.top_p', result.topP);
            return result;
          }
        );
        stageLatencies.extraction = (stageLatencies.extraction || 0) + extractionLatency;
        totalTokens += extraction.tokenUsage.totalTokens;
        providersUsed.add(extraction.provider);

        // ── Stage 5b: Post-Guard ────────────────────────────────────────
        const { result: postGuardResult, latencyMs: postGuardLatency } = await traceStage(
          'post_guard',
          correlationId,
          { chunkId: chunk.chunkId },
          async () => postGuard(JSON.stringify(extraction.data), config.ENKRYPT_API_KEY || undefined)
        );
        stageLatencies.post_guard = (stageLatencies.post_guard || 0) + postGuardLatency;

        // Post-guard warnings are logged but don't block (only critical issues block)
        if (!postGuardResult.passed) {
          logGuardrailBlock(correlationId, doc.id, 'post_guard',
            postGuardResult.issues.map(i => i.description).join('; '));
        }

        // ── Stage 8: Validation (per-chunk) ─────────────────────────────
        const validationResult = validateExtraction(type, extraction.data, retryCount);

        if (validationResult.valid) {
          extractionResult = extraction;
          break; // Success — exit retry loop
        }

        // Validation failed — prepare retry
        if (shouldRetry(retryCount, config.LLM_MAX_RETRIES)) {
          logValidationFailure(correlationId, doc.id, validationResult.errors, retryCount);
          currentPrompt = assembleRetryPrompt(
            prompt,
            JSON.stringify(extraction.data, null, 2),
            validationResult.errors,
            retryCount + 1
          );
          retryCount++;
          totalRetries++;
        } else {
          // Max retries exhausted — use last attempt even if invalid
          logValidationFailure(correlationId, doc.id, validationResult.errors, retryCount);
          extractionResult = extraction;
          break;
        }
      } catch (error) {
        logLlmError(correlationId, doc.id, error as Error, retryCount);
        if (shouldRetry(retryCount, config.LLM_MAX_RETRIES)) {
          retryCount++;
          totalRetries++;
          // Intelligent backoff: use the server's retryDelay hint if available,
          // otherwise fall back to exponential backoff
          const waitMs = ExtractionEngine.getRetryDelay(error as Error, retryCount);
          console.log(`   ⏳ Waiting ${(waitMs / 1000).toFixed(1)}s before retry ${retryCount}...`);
          await sleep(waitMs);
        } else {
          break;
        }
      }
    }

    if (extractionResult) {
      chunkExtractions.push({
        chunkId: chunk.chunkId,
        parentDocId: doc.id,
        orderIndex: chunk.orderIndex,
        data: extractionResult.data,
        documentType: type,
      });
    }
  }

  // ── Stage 7: Chunk Merge ────────────────────────────────────────────────
  if (chunkExtractions.length === 0) {
    logStageFailure(correlationId, doc.id, 'chunk_merge', 'truncation', 'No successful chunk extractions to merge');
    const failures = getFailureLogs({ documentId: doc.id });
    allFailures.push(...failures);
    return buildFailedOutput(doc.id, correlationId, type, stageLatencies, totalTokens, totalRetries, allFailures, providersUsed);
  }

  const { result: mergeResult, latencyMs: mergeLatency } = await traceStage(
    'chunk_merge',
    correlationId,
    { documentId: doc.id, chunkCount: chunkExtractions.length },
    async () => mergeChunkExtractions(chunkExtractions)
  );
  stageLatencies.chunk_merge = mergeLatency;

  // Log any merge conflicts
  if (mergeResult.conflicts.length > 0) {
    logMergeConflicts(correlationId, doc.id, mergeResult.conflicts);
  }

  // ── Stage 8: Final Validation ───────────────────────────────────────────
  const { result: finalValidation, latencyMs: validationLatency } = await traceStage(
    'validation',
    correlationId,
    { documentId: doc.id },
    async () => validateExtraction(type, mergeResult.mergedData, totalRetries)
  );
  stageLatencies.validation = validationLatency;

  const totalLatencyMs = Object.values(stageLatencies).reduce((sum, v) => sum + (v || 0), 0);

  // ── Build Output ────────────────────────────────────────────────────────
  const output: PipelineOutput = {
    documentId: doc.id,
    correlationId,
    documentType: type,
    success: finalValidation.valid,
    data: finalValidation.valid ? finalValidation.validatedData : mergeResult.mergedData,
    validation: finalValidation,
    totalRetries,
    totalLatencyMs,
    totalTokens,
    estimatedCostUsd: estimateCost(totalTokens, Array.from(providersUsed)[0] || 'mistral'),
    stageLatencies: stageLatencies as Record<PipelineStage, number>,
    failures: getFailureLogs({ documentId: doc.id }),
    providersUsed: Array.from(providersUsed),
  };

  // ── Stage 10: Output Store ──────────────────────────────────────────────
  const { latencyMs: storeLatency } = await traceStage(
    'output_store',
    correlationId,
    { documentId: doc.id, success: output.success },
    async () => {
      const store = getOutputStore();
      if (finalValidation.valid) {
        await store.storeValidated(output);
      } else {
        await store.storeFlagged(output, output.failures);
      }
    }
  );
  stageLatencies.output_store = storeLatency;

  // Record metrics for evaluation
  recordDocumentMetrics(output);

  return output;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildFailedOutput(
  documentId: string,
  correlationId: string,
  documentType: DocumentType,
  stageLatencies: Partial<Record<PipelineStage, number>>,
  totalTokens: number,
  totalRetries: number,
  failures: FailureLogEntry[],
  providersUsed: Set<string>
): PipelineOutput {
  const totalLatencyMs = Object.values(stageLatencies).reduce((sum, v) => sum + (v || 0), 0);

  const output: PipelineOutput = {
    documentId,
    correlationId,
    documentType,
    success: false,
    data: null,
    validation: { valid: false, errors: [], retryCount: totalRetries, validatedData: null },
    totalRetries,
    totalLatencyMs,
    totalTokens,
    estimatedCostUsd: estimateCost(totalTokens, Array.from(providersUsed)[0] || 'mistral'),
    stageLatencies: stageLatencies as Record<PipelineStage, number>,
    failures,
    providersUsed: Array.from(providersUsed),
  };

  // BUG FIX: Record metrics for failed documents too.
  // Without this, failed documents were invisible to the report generator,
  // causing "0 documents processed" when all docs hit rate limits.
  recordDocumentMetrics(output);

  return output;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
