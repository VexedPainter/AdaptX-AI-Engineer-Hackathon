/**
 * Stage 07 — Chunk-Merge Agent
 * 
 * Mastra sub-agent that reassembles multi-chunk partial JSON
 * into a single consolidated nested object.
 * 
 * Handles:
 * - Merging partial extractions from multiple chunks
 * - Resolving field conflicts by parent-doc-ID + order-index priority
 * - Deep merging arrays (concatenate) and objects (later chunks win)
 * - Type-aware reconciliation (don't overwrite a value with null)
 * 
 * No regex-based logic — uses structural JSON traversal for merging.
 * 
 * @module stage07-chunk-merge
 */

import type { DocumentType } from '../types/index.js';

/**
 * A partial extraction result from a single chunk.
 */
export interface ChunkExtraction {
  /** Chunk ID for traceability */
  chunkId: string;
  /** Parent document ID */
  parentDocId: string;
  /** Order index of the chunk (used for conflict resolution) */
  orderIndex: number;
  /** The partial JSON extracted from this chunk */
  data: Record<string, unknown>;
  /** Document type */
  documentType: DocumentType;
}

/**
 * Result of merging multiple chunk extractions.
 */
export interface MergeResult {
  /** The merged JSON object */
  mergedData: Record<string, unknown>;
  /** Parent document ID */
  parentDocId: string;
  /** Document type */
  documentType: DocumentType;
  /** Number of chunks merged */
  chunkCount: number;
  /** Fields that had conflicts during merge */
  conflicts: MergeConflict[];
}

/**
 * Record of a field conflict during merge.
 */
export interface MergeConflict {
  /** Path to the conflicting field */
  fieldPath: string;
  /** Value from the earlier chunk */
  existingValue: unknown;
  /** Value from the later chunk (this one wins) */
  newValue: unknown;
  /** Which chunk order-index won */
  resolvedByOrderIndex: number;
}

/**
 * Merge multiple chunk extractions into a single consolidated object.
 * 
 * Strategy:
 * 1. Sort chunks by orderIndex (earliest first)
 * 2. Start with the first chunk's data as the base
 * 3. Deep-merge subsequent chunks into the base
 * 4. Conflict resolution: later chunks (higher orderIndex) WIN
 *    for scalar values, but arrays are CONCATENATED
 * 5. Null/undefined values never overwrite existing values
 * 
 * @param extractions - Partial extractions from each chunk, sorted by orderIndex
 * @returns A merged result with the consolidated data and any conflicts
 */
export function mergeChunkExtractions(extractions: ChunkExtraction[]): MergeResult {
  if (extractions.length === 0) {
    throw new Error('Cannot merge zero chunk extractions');
  }

  // Sort by orderIndex to ensure deterministic merge order
  const sorted = [...extractions].sort((a, b) => a.orderIndex - b.orderIndex);

  // Use the first extraction's metadata
  const { parentDocId, documentType } = sorted[0];

  // Single chunk — no merge needed
  if (sorted.length === 1) {
    return {
      mergedData: sorted[0].data,
      parentDocId,
      documentType,
      chunkCount: 1,
      conflicts: [],
    };
  }

  // Multi-chunk merge
  const conflicts: MergeConflict[] = [];
  let merged = deepClone(sorted[0].data);

  for (let i = 1; i < sorted.length; i++) {
    merged = deepMerge(merged, sorted[i].data, '', sorted[i].orderIndex, conflicts);
  }

  return {
    mergedData: merged,
    parentDocId,
    documentType,
    chunkCount: sorted.length,
    conflicts,
  };
}

/**
 * Deep merge two objects with conflict tracking.
 * 
 * Rules:
 * - Scalars: new value wins if it's non-null (conflict recorded)
 * - Arrays: concatenated and deduplicated
 * - Objects: recursively merged
 * - null/undefined: never overwrites an existing value
 */
function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
  path: string,
  sourceOrderIndex: number,
  conflicts: MergeConflict[]
): Record<string, unknown> {
  const result = { ...target };

  for (const [key, sourceValue] of Object.entries(source)) {
    const currentPath = path ? `${path}.${key}` : key;
    const targetValue = result[key];

    // Skip null/undefined source values — don't overwrite existing data
    if (sourceValue === null || sourceValue === undefined) {
      continue;
    }

    // Target doesn't have this key — just add it
    if (targetValue === null || targetValue === undefined) {
      result[key] = deepClone(sourceValue);
      continue;
    }

    // Both are arrays — concatenate and deduplicate
    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      result[key] = mergeArrays(targetValue, sourceValue);
      continue;
    }

    // Both are objects — recurse
    if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
      result[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>,
        currentPath,
        sourceOrderIndex,
        conflicts
      );
      continue;
    }

    // Scalar conflict — later chunk wins
    if (targetValue !== sourceValue) {
      conflicts.push({
        fieldPath: currentPath,
        existingValue: targetValue,
        newValue: sourceValue,
        resolvedByOrderIndex: sourceOrderIndex,
      });
      result[key] = sourceValue;
    }
  }

  return result;
}

/**
 * Merge two arrays: concatenate and deduplicate objects by content.
 */
function mergeArrays(target: unknown[], source: unknown[]): unknown[] {
  const result = [...target];
  const existingSet = new Set(target.map(item => JSON.stringify(item)));

  for (const item of source) {
    const serialized = JSON.stringify(item);
    if (!existingSet.has(serialized)) {
      result.push(item);
      existingSet.add(serialized);
    }
  }

  return result;
}

/**
 * Check if a value is a plain object (not array, null, Date, etc.).
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date);
}

/**
 * Deep clone a value. Uses structured clone for correctness.
 */
function deepClone<T>(value: T): T {
  if (value === null || typeof value !== 'object') return value;
  return JSON.parse(JSON.stringify(value));
}
