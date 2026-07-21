/**
 * Stage 09 — Failure Logger
 * 
 * Categorizes every pipeline failure into a structured log entry.
 * Failures are NEVER silently discarded — they're categorized, logged,
 * and routed to the flagged store for human review.
 * 
 * Failure Categories:
 * - missing_field: Required field not present in extraction
 * - wrong_type: Field value doesn't match expected type/enum
 * - hallucination: LLM generated data not in source text
 * - truncation: Output cut off (incomplete JSON)
 * - merge_conflict: Conflicting values from different chunks
 * - guardrail_block: Input/output blocked by guardrails
 * - llm_error: LLM API error (timeout, rate limit, etc.)
 * - rate_limit: Rate limit exceeded
 * - unknown: Uncategorized error
 * 
 * @module stage09-failure-logger
 */

import type { FailureLogEntry, FailureCategory, PipelineStage, ValidationError } from '../types/index.js';
import type { MergeConflict } from '../stage07-chunk-merge/index.js';

/** In-memory failure log store */
const failureLog: FailureLogEntry[] = [];

/**
 * Log a pipeline failure with full context.
 * Every failure is categorized and stored — never silently discarded.
 * 
 * @param entry - The failure log entry to record
 */
export function logFailure(entry: FailureLogEntry): void {
  failureLog.push(entry);

  // Also output to console for observability
  console.error(
    `❌ FAILURE [${entry.stage}] ${entry.category}: ${entry.description} ` +
    `(doc: ${entry.documentId}, correlation: ${entry.correlationId})`
  );
}

/**
 * Create a failure entry from validation errors.
 */
export function logValidationFailure(
  correlationId: string,
  documentId: string,
  errors: ValidationError[],
  retryCount: number
): void {
  // Categorize each validation error
  for (const error of errors) {
    const category = categorizeError(error);
    logFailure({
      correlationId,
      documentId,
      stage: 'validation',
      category,
      description: `Validation failed at path "${error.path}": ${error.message}`,
      errorTrace: `Expected: ${error.expected}, Received: ${error.received}`,
      timestamp: new Date().toISOString(),
      retryCount,
    });
  }
}

/**
 * Create a failure entry from merge conflicts.
 */
export function logMergeConflicts(
  correlationId: string,
  documentId: string,
  conflicts: MergeConflict[]
): void {
  for (const conflict of conflicts) {
    logFailure({
      correlationId,
      documentId,
      stage: 'chunk_merge',
      category: 'merge_conflict',
      description: `Merge conflict at "${conflict.fieldPath}": resolved by chunk ${conflict.resolvedByOrderIndex}`,
      errorTrace: `Existing: ${JSON.stringify(conflict.existingValue)}, New: ${JSON.stringify(conflict.newValue)}`,
      timestamp: new Date().toISOString(),
      retryCount: 0,
    });
  }
}

/**
 * Create a failure entry from a guardrail block.
 */
export function logGuardrailBlock(
  correlationId: string,
  documentId: string,
  stage: 'pre_guard' | 'post_guard',
  reason: string
): void {
  logFailure({
    correlationId,
    documentId,
    stage,
    category: 'guardrail_block',
    description: `Guardrail blocked: ${reason}`,
    timestamp: new Date().toISOString(),
    retryCount: 0,
  });
}

/**
 * Create a failure entry from an LLM error.
 */
export function logLlmError(
  correlationId: string,
  documentId: string,
  error: Error,
  retryCount: number
): void {
  const category: FailureCategory = error.message.includes('429') || error.message.includes('rate')
    ? 'rate_limit'
    : 'llm_error';

  logFailure({
    correlationId,
    documentId,
    stage: 'extraction',
    category,
    description: error.message,
    errorTrace: error.stack,
    timestamp: new Date().toISOString(),
    retryCount,
  });
}

/**
 * Log a generic pipeline stage failure.
 */
export function logStageFailure(
  correlationId: string,
  documentId: string,
  stage: PipelineStage,
  category: FailureCategory,
  description: string,
  retryCount: number = 0
): void {
  logFailure({
    correlationId,
    documentId,
    stage,
    category,
    description,
    timestamp: new Date().toISOString(),
    retryCount,
  });
}

/**
 * Get all failure log entries, optionally filtered.
 */
export function getFailureLogs(filters?: {
  correlationId?: string;
  documentId?: string;
  category?: FailureCategory;
  stage?: PipelineStage;
}): FailureLogEntry[] {
  if (!filters) return [...failureLog];

  return failureLog.filter((entry) => {
    if (filters.correlationId && entry.correlationId !== filters.correlationId) return false;
    if (filters.documentId && entry.documentId !== filters.documentId) return false;
    if (filters.category && entry.category !== filters.category) return false;
    if (filters.stage && entry.stage !== filters.stage) return false;
    return true;
  });
}

/**
 * Get failure distribution by category.
 */
export function getFailureDistribution(): Record<FailureCategory, number> {
  const distribution: Record<string, number> = {};

  for (const entry of failureLog) {
    distribution[entry.category] = (distribution[entry.category] || 0) + 1;
  }

  return distribution as Record<FailureCategory, number>;
}

/**
 * Clear the failure log (useful for testing).
 */
export function clearFailureLogs(): void {
  failureLog.length = 0;
}

/**
 * Categorize a validation error into a failure category.
 */
function categorizeError(error: ValidationError): FailureCategory {
  const msg = error.message.toLowerCase();

  if (msg.includes('required') || msg.includes('missing')) {
    return 'missing_field';
  }
  if (msg.includes('expected') || msg.includes('type') || msg.includes('enum') || msg.includes('invalid')) {
    return 'wrong_type';
  }
  if (msg.includes('too_small') || msg.includes('too_big') || msg.includes('truncat')) {
    return 'truncation';
  }

  return 'unknown';
}
