/**
 * Stage 08 — Schema Validation + Retry Manager
 * 
 * Validates extracted JSON against Zod schemas with detailed error traces.
 * On failure, formats the exact validation errors and triggers re-prompting
 * through the extraction pipeline (max 3 retries).
 * 
 * @module stage08-validation
 */

import type { ValidationResult, ValidationError } from '../types/index.js';
import type { DocumentType } from '../types/index.js';
import { validateAgainstSchema } from '../schema/index.js';

/**
 * Validate extracted data against the schema for the given document type.
 * Returns a detailed validation result with error paths.
 * 
 * @param documentType - The type of document (determines which schema to use)
 * @param data - The extracted JSON data to validate
 * @param retryCount - How many retries have been attempted (for tracking)
 * @returns ValidationResult with success status, errors, and validated data
 */
export function validateExtraction(
  documentType: DocumentType,
  data: Record<string, unknown>,
  retryCount: number = 0
): ValidationResult {
  const result = validateAgainstSchema(documentType, data);

  if (result.success) {
    return {
      valid: true,
      errors: [],
      retryCount,
      validatedData: result.data as Record<string, unknown>,
    };
  }

  // Map validation errors to our error format
  const errors: ValidationError[] = (result.errors || []).map((error) => ({
    path: error.path || 'root',
    expected: error.expected || 'valid value',
    received: error.received || 'invalid value',
    message: error.message,
  }));

  return {
    valid: false,
    errors,
    retryCount,
    validatedData: null,
  };
}

/**
 * Format validation errors into a human-readable error trace.
 * Used to build the retry prompt with exact error information.
 * 
 * @param errors - Array of validation errors
 * @returns Formatted error trace string
 */
export function formatErrorTrace(errors: ValidationError[]): string {
  if (errors.length === 0) return 'No errors';

  const lines = errors.map((error, index) => {
    return [
      `Error ${index + 1}:`,
      `  Path: ${error.path}`,
      `  Message: ${error.message}`,
      `  Expected: ${error.expected}`,
      `  Received: ${error.received}`,
    ].join('\n');
  });

  return lines.join('\n\n');
}

/**
 * Determine if a retry should be attempted based on current state.
 * 
 * @param retryCount - Current number of retries attempted
 * @param maxRetries - Maximum allowed retries (default: 3)
 * @returns Whether another retry should be attempted
 */
export function shouldRetry(retryCount: number, maxRetries: number = 3): boolean {
  return retryCount < maxRetries;
}

/**
 * Categorize validation errors into failure types for the failure logger.
 * Maps Zod error messages to our failure categories.
 */
export function categorizeValidationErrors(
  errors: ValidationError[]
): Array<{ category: string; count: number }> {
  const categories: Record<string, number> = {};

  for (const error of errors) {
    let category: string;

    if (error.message.includes('Required') || error.message.includes('required')) {
      category = 'missing_field';
    } else if (error.message.includes('Expected') && error.message.includes('received')) {
      category = 'wrong_type';
    } else if (error.message.includes('Invalid enum') || error.message.includes('invalid_enum')) {
      category = 'wrong_type';
    } else if (error.message.includes('too_small') || error.message.includes('too_big')) {
      category = 'truncation';
    } else {
      category = 'wrong_type';
    }

    categories[category] = (categories[category] || 0) + 1;
  }

  return Object.entries(categories).map(([category, count]) => ({ category, count }));
}
