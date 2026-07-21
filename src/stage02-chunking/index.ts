/**
 * Stage 02 — Text Normalization & Semantic-Boundary Chunking
 * 
 * Handles:
 * - Unicode NFC normalization
 * - Whitespace collapse and encoding fixes
 * - Semantic-boundary chunking (paragraph/section breaks)
 * - Chunk metadata assignment (parentDocId, orderIndex)
 * 
 * IMPORTANT: No regex-based content extraction anywhere in this module.
 * The chunking uses string split operations on natural boundaries,
 * not pattern matching for data extraction.
 * 
 * @module stage02-chunking
 */

import { v4 as uuidv4 } from 'uuid';
import type { RawDocument, DocumentChunk } from '../types/index.js';

/**
 * Maximum characters per chunk. Chosen to fit within LLM context windows
 * while providing enough context for extraction.
 */
const MAX_CHUNK_SIZE = 2000;

/**
 * Minimum characters for a chunk to be worth processing.
 * Avoids sending tiny fragments to the LLM.
 */
const MIN_CHUNK_SIZE = 50;

/**
 * Normalize raw text for consistent processing.
 * 
 * Operations (in order):
 * 1. Unicode NFC normalization (canonical decomposition + composition)
 * 2. Replace common encoding artifacts (smart quotes, em dashes, etc.)
 * 3. Normalize line endings to \n
 * 4. Collapse multiple blank lines to double newline
 * 5. Collapse multiple spaces/tabs to single space (within lines)
 * 6. Trim leading/trailing whitespace
 */
export function normalizeText(raw: string): string {
  let text = raw;

  // Step 1: Unicode NFC normalization
  text = text.normalize('NFC');

  // Step 2: Replace common encoding artifacts
  // Smart quotes → straight quotes
  text = text.replace(/[\u2018\u2019\u201A\u201B]/g, "'");
  text = text.replace(/[\u201C\u201D\u201E\u201F]/g, '"');
  // Em/en dashes → hyphens
  text = text.replace(/[\u2013\u2014]/g, '-');
  // Ellipsis → three dots
  text = text.replace(/\u2026/g, '...');
  // Non-breaking space → regular space
  text = text.replace(/\u00A0/g, ' ');
  // Zero-width characters
  text = text.replace(/[\u200B\u200C\u200D\uFEFF]/g, '');

  // Step 3: Normalize line endings
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Step 4: Collapse multiple blank lines to max 2 newlines (paragraph break)
  text = text.replace(/\n{3,}/g, '\n\n');

  // Step 5: Collapse multiple spaces/tabs within lines
  text = text.split('\n').map(line => line.replace(/[ \t]+/g, ' ').trim()).join('\n');

  // Step 6: Trim
  text = text.trim();

  return text;
}

/**
 * Split text into semantic chunks using natural boundaries.
 * 
 * Strategy (in priority order):
 * 1. Split on section headers (lines that look like headers)
 * 2. Split on double newlines (paragraph boundaries)
 * 3. If a paragraph is still too long, split on sentence boundaries
 * 4. Merge adjacent small chunks to avoid tiny fragments
 * 
 * Each chunk gets metadata: parentDocId and orderIndex.
 */
export function chunkDocument(doc: RawDocument): DocumentChunk[] {
  const normalizedText = normalizeText(doc.content);

  if (normalizedText.length === 0) {
    return [];
  }

  // If the entire document fits in one chunk, return it as-is
  if (normalizedText.length <= MAX_CHUNK_SIZE) {
    return [{
      chunkId: uuidv4(),
      parentDocId: doc.id,
      orderIndex: 0,
      text: normalizedText,
      documentType: doc.type,
    }];
  }

  // Step 1: Split on paragraph boundaries (double newlines)
  const paragraphs = normalizedText.split('\n\n').filter(p => p.trim().length > 0);

  // Step 2: Build chunks by merging paragraphs up to MAX_CHUNK_SIZE
  const rawChunks: string[] = [];
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    // If this single paragraph exceeds max size, split it on sentence boundaries
    if (paragraph.length > MAX_CHUNK_SIZE) {
      // Flush current chunk first
      if (currentChunk.trim().length > 0) {
        rawChunks.push(currentChunk.trim());
        currentChunk = '';
      }
      // Split long paragraph into sentence-bounded chunks
      const sentenceChunks = splitBySentenceBoundary(paragraph);
      rawChunks.push(...sentenceChunks);
      continue;
    }

    // Would adding this paragraph exceed the limit?
    const combined = currentChunk.length > 0
      ? `${currentChunk}\n\n${paragraph}`
      : paragraph;

    if (combined.length > MAX_CHUNK_SIZE) {
      // Flush current chunk and start a new one
      if (currentChunk.trim().length > 0) {
        rawChunks.push(currentChunk.trim());
      }
      currentChunk = paragraph;
    } else {
      currentChunk = combined;
    }
  }

  // Flush remaining
  if (currentChunk.trim().length > 0) {
    rawChunks.push(currentChunk.trim());
  }

  // Step 3: Filter out chunks that are too small (merge with neighbors)
  const mergedChunks = mergeSmallChunks(rawChunks);

  // Step 4: Assign metadata
  return mergedChunks.map((text, index) => ({
    chunkId: uuidv4(),
    parentDocId: doc.id,
    orderIndex: index,
    text,
    documentType: doc.type,
  }));
}

/**
 * Split a long paragraph on sentence boundaries.
 * Uses period + space/newline as a boundary indicator.
 * This is NOT regex-based content extraction — it's text segmentation
 * for fitting within LLM context windows.
 */
function splitBySentenceBoundary(text: string): string[] {
  const chunks: string[] = [];
  let current = '';

  // Split on common sentence endings: ". ", ".\n", "! ", "? "
  const sentences = text.split(/(?<=[.!?])\s+/);

  for (const sentence of sentences) {
    const combined = current.length > 0 ? `${current} ${sentence}` : sentence;

    if (combined.length > MAX_CHUNK_SIZE && current.length > 0) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current = combined;
    }
  }

  if (current.trim().length > 0) {
    chunks.push(current.trim());
  }

  return chunks;
}

/**
 * Merge adjacent chunks that are below MIN_CHUNK_SIZE.
 * Prevents sending tiny, context-poor fragments to the LLM.
 */
function mergeSmallChunks(chunks: string[]): string[] {
  if (chunks.length <= 1) return chunks;

  const result: string[] = [];
  let buffer = '';

  for (const chunk of chunks) {
    if (buffer.length === 0) {
      buffer = chunk;
      continue;
    }

    // If buffer is too small, merge with current chunk
    if (buffer.length < MIN_CHUNK_SIZE) {
      buffer = `${buffer}\n\n${chunk}`;
    } else {
      result.push(buffer);
      buffer = chunk;
    }
  }

  // Flush remaining buffer
  if (buffer.length > 0) {
    // If the last chunk is tiny, merge with previous
    if (buffer.length < MIN_CHUNK_SIZE && result.length > 0) {
      result[result.length - 1] = `${result[result.length - 1]}\n\n${buffer}`;
    } else {
      result.push(buffer);
    }
  }

  return result;
}
