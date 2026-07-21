/**
 * Schema Registry — Central Schema Index
 * 
 * Maps document types to their Zod schemas and JSON Schema representations.
 * Used by the prompt assembler and validation stages.
 */

import { z } from 'zod';
import { zodToJsonSchema } from './zod-to-json-schema.js';
import { ContractSchema, type ContractExtraction } from './contract.js';
import { ChatLogSchema, type ChatLogExtraction } from './chat-log.js';
import { SupportTicketSchema, type SupportTicketExtraction } from './support-ticket.js';
import type { DocumentType } from '../types/index.js';

// Re-export all schemas
export { ContractSchema, ChatLogSchema, SupportTicketSchema };
export type { ContractExtraction, ChatLogExtraction, SupportTicketExtraction };

/** Union type of all possible extractions */
export type AnyExtraction = ContractExtraction | ChatLogExtraction | SupportTicketExtraction;

/**
 * Registry mapping document types to their Zod schemas.
 * Used throughout the pipeline to get the correct schema for validation.
 */
export const SchemaRegistry: Record<DocumentType, z.ZodType<unknown>> = {
  contract: ContractSchema,
  chat_log: ChatLogSchema,
  support_ticket: SupportTicketSchema,
};

/**
 * Get the Zod schema for a given document type.
 */
export function getSchemaForType(docType: DocumentType): z.ZodType<unknown> {
  const schema = SchemaRegistry[docType];
  if (!schema) {
    throw new Error(`No schema registered for document type: ${docType}`);
  }
  return schema;
}

/**
 * Get the JSON Schema representation for a document type.
 * Used in prompt assembly to tell the LLM the expected output format.
 */
export function getJsonSchemaForType(docType: DocumentType): Record<string, unknown> {
  const zodSchema = getSchemaForType(docType);
  return zodToJsonSchema(zodSchema);
}

/**
 * Validate data against the schema for a given document type.
 * Returns a detailed result with error paths.
 */
export function validateAgainstSchema(
  docType: DocumentType,
  data: unknown
): { success: boolean; data?: unknown; errors?: Array<{ path: string; message: string; expected: string; received: string }> } {
  const schema = getSchemaForType(docType);
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    expected: 'expected' in issue ? String(issue.expected) : 'valid value',
    received: 'received' in issue ? String(issue.received) : 'invalid value',
  }));

  return { success: false, errors };
}
