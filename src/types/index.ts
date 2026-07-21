/**
 * Shared Type Definitions
 * 
 * Central type registry for the entire extraction pipeline.
 * Every stage imports from here to ensure consistency.
 */

// ─── Document Types ──────────────────────────────────────────────────────────

/** The three supported document categories */
export type DocumentType = 'contract' | 'chat_log' | 'support_ticket';

/** A raw document entering the pipeline */
export interface RawDocument {
  /** Unique identifier assigned at ingestion */
  id: string;
  /** The raw text content (messy, noisy, real-world) */
  content: string;
  /** Which type of document this is */
  type: DocumentType;
  /** Optional source metadata (filename, URL, etc.) */
  source?: string;
  /** Timestamp of ingestion (ISO 8601) */
  ingestedAt: string;
}

/** A batch of documents for processing */
export interface DocumentBatch {
  /** Unique batch ID */
  batchId: string;
  /** Correlation ID propagated through all stages */
  correlationId: string;
  /** Documents in this batch */
  documents: RawDocument[];
}

// ─── Chunking ────────────────────────────────────────────────────────────────

/** A chunk produced from splitting a document */
export interface DocumentChunk {
  /** Unique chunk ID */
  chunkId: string;
  /** ID of the parent document this chunk came from */
  parentDocId: string;
  /** Position of this chunk in the original document (0-indexed) */
  orderIndex: number;
  /** The normalized chunk text */
  text: string;
  /** Document type inherited from parent */
  documentType: DocumentType;
}

// ─── Few-Shot Retrieval ──────────────────────────────────────────────────────

/** A few-shot example pair stored in Qdrant */
export interface FewShotExample {
  /** Unique ID in the vector store */
  id: string;
  /** The input text example */
  inputText: string;
  /** The expected JSON output */
  expectedOutput: Record<string, unknown>;
  /** Document type this example belongs to */
  documentType: DocumentType;
}

/** Result of a Qdrant similarity search */
export interface RetrievalResult {
  /** The chunk that was queried */
  chunk: DocumentChunk;
  /** Top-k few-shot examples retrieved (k=3) */
  examples: FewShotExample[];
  /** Similarity scores for each example */
  scores: number[];
}

// ─── Guardrails ──────────────────────────────────────────────────────────────

/** Result of a guardrail check (pre or post) */
export interface GuardrailResult {
  /** Whether the content passed the guardrail */
  passed: boolean;
  /** Sanitized/redacted version of the content (for pre-guard) */
  sanitizedContent?: string;
  /** List of detected issues */
  issues: GuardrailIssue[];
  /** Which guardrail engine was used */
  engine: 'enkrypt' | 'fallback';
}

export interface GuardrailIssue {
  /** Category of the issue */
  category: 'pii_detected' | 'prompt_injection' | 'unsafe_content' | 'hallucination';
  /** Severity level */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Human-readable description */
  description: string;
  /** The offending text span, if applicable */
  span?: string;
}

// ─── Extraction ──────────────────────────────────────────────────────────────

/** Result of a single LLM extraction call */
export interface ExtractionResult {
  /** The extracted JSON object */
  data: Record<string, unknown>;
  /** Token usage for this call */
  tokenUsage: TokenUsage;
  /** Which LLM provider was used */
  provider: 'mistral' | 'cerebras' | 'groq' | 'gemini';
  /** Model ID used */
  model: string;
  /** Temperature used for this call */
  temperature: number;
  /** top_p used for this call */
  topP: number;
  /** SHA-256 hash of the prompt (never log raw prompts with PII) */
  promptHash: string;
  /** Latency of the LLM call in milliseconds */
  latencyMs: number;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

// ─── Validation ──────────────────────────────────────────────────────────────

/** Result of schema validation */
export interface ValidationResult {
  /** Whether the JSON is schema-valid */
  valid: boolean;
  /** Detailed validation errors (empty if valid) */
  errors: ValidationError[];
  /** How many retries were attempted */
  retryCount: number;
  /** The validated data (null if invalid after max retries) */
  validatedData: Record<string, unknown> | null;
}

export interface ValidationError {
  /** JSONPath to the failing field */
  path: string;
  /** What was expected */
  expected: string;
  /** What was received */
  received: string;
  /** Zod error message */
  message: string;
}

// ─── Failure Logging ─────────────────────────────────────────────────────────

/** Categories of extraction failures */
export type FailureCategory =
  | 'missing_field'
  | 'wrong_type'
  | 'hallucination'
  | 'truncation'
  | 'merge_conflict'
  | 'guardrail_block'
  | 'llm_error'
  | 'rate_limit'
  | 'unknown';

/** A structured failure log entry */
export interface FailureLogEntry {
  /** Correlation ID from the pipeline */
  correlationId: string;
  /** ID of the document that failed */
  documentId: string;
  /** Which stage the failure occurred in */
  stage: PipelineStage;
  /** Failure category */
  category: FailureCategory;
  /** Human-readable error description */
  description: string;
  /** Detailed error trace (validation errors, etc.) */
  errorTrace?: string;
  /** Timestamp (ISO 8601) */
  timestamp: string;
  /** Retry count at the time of failure */
  retryCount: number;
}

// ─── Pipeline ────────────────────────────────────────────────────────────────

/** All pipeline stages for tracing and logging */
export type PipelineStage =
  | 'ingestion'
  | 'chunking'
  | 'retrieval'
  | 'prompt_assembly'
  | 'pre_guard'
  | 'extraction'
  | 'post_guard'
  | 'chunk_merge'
  | 'validation'
  | 'failure_logging'
  | 'output_store';

/** The final output of the pipeline for a single document */
export interface PipelineOutput {
  /** Original document ID */
  documentId: string;
  /** Correlation ID */
  correlationId: string;
  /** Document type */
  documentType: DocumentType;
  /** Whether extraction succeeded */
  success: boolean;
  /** Validated extracted data (null if failed) */
  data: Record<string, unknown> | null;
  /** Validation result */
  validation: ValidationResult;
  /** Total retries used */
  totalRetries: number;
  /** Total latency across all stages (ms) */
  totalLatencyMs: number;
  /** Total tokens used across all calls */
  totalTokens: number;
  /** Estimated cost in USD */
  estimatedCostUsd: number;
  /** Per-stage latency breakdown */
  stageLatencies: Record<PipelineStage, number>;
  /** Failure logs (empty if success) */
  failures: FailureLogEntry[];
  /** Which LLM providers handled chunks for this document */
  providersUsed: string[];
}

// ─── Metrics ─────────────────────────────────────────────────────────────────

/** Aggregated metrics from an evaluation run */
export interface EvaluationMetrics {
  /** Total documents processed */
  totalDocuments: number;
  /** Number of schema-valid outputs */
  validOutputs: number;
  /** Schema-validity percentage */
  schemaValidityPercent: number;
  /** Average retries per record */
  avgRetriesPerRecord: number;
  /** p95 latency in milliseconds */
  p95LatencyMs: number;
  /** Average cost per record in USD */
  avgCostPerRecord: number;
  /** Failure type distribution */
  failureDistribution: Record<FailureCategory, number>;
  /** Per-document-type breakdown */
  perTypeMetrics: Record<DocumentType, {
    total: number;
    valid: number;
    validityPercent: number;
  }>;
}
