/**
 * Stage 01 — Document Ingestion
 * 
 * Entry point for raw documents. Handles:
 * - Single document ingestion with ID assignment
 * - Batch ingestion with correlation ID generation
 * - Input type validation
 * - Timestamp recording
 * 
 * @module stage01-ingestion
 */

import { v4 as uuidv4 } from 'uuid';
import type { RawDocument, DocumentBatch, DocumentType } from '../types/index.js';

/** Valid document types for input validation */
const VALID_DOCUMENT_TYPES: ReadonlySet<DocumentType> = new Set([
  'contract',
  'chat_log',
  'support_ticket',
]);

/**
 * Ingest a single raw document into the pipeline.
 * Assigns a unique document ID and records the ingestion timestamp.
 * 
 * @param content - Raw text content of the document
 * @param type - Document type (contract, chat_log, support_ticket)
 * @param source - Optional source identifier (filename, URL, etc.)
 * @returns A RawDocument ready for pipeline processing
 * @throws Error if the document type is invalid or content is empty
 */
export function ingestDocument(
  content: string,
  type: DocumentType,
  source?: string
): RawDocument {
  // Validate inputs
  if (!content || content.trim().length === 0) {
    throw new Error('Document content cannot be empty');
  }

  if (!VALID_DOCUMENT_TYPES.has(type)) {
    throw new Error(
      `Invalid document type: "${type}". Must be one of: ${[...VALID_DOCUMENT_TYPES].join(', ')}`
    );
  }

  return {
    id: uuidv4(),
    content,
    type,
    source,
    ingestedAt: new Date().toISOString(),
  };
}

/**
 * Ingest a batch of documents for pipeline processing.
 * Generates a single correlation ID that will propagate through
 * every stage of the pipeline for traceability.
 * 
 * @param items - Array of { content, type, source } objects
 * @returns A DocumentBatch with unique batch ID and correlation ID
 * @throws Error if the batch is empty
 */
export function ingestBatch(
  items: Array<{ content: string; type: DocumentType; source?: string }>
): DocumentBatch {
  if (!items || items.length === 0) {
    throw new Error('Batch cannot be empty');
  }

  const correlationId = uuidv4();
  const batchId = uuidv4();

  const documents = items.map((item) =>
    ingestDocument(item.content, item.type, item.source)
  );

  return {
    batchId,
    correlationId,
    documents,
  };
}

/**
 * Validate that a string is a supported document type.
 * Useful for API input validation at the gateway layer.
 */
export function isValidDocumentType(type: string): type is DocumentType {
  return VALID_DOCUMENT_TYPES.has(type as DocumentType);
}
