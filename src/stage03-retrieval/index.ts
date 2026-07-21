/**
 * Stage 03 — Few-Shot Example Retrieval (Qdrant)
 * 
 * Manages the Qdrant vector store for few-shot example retrieval:
 * - Initialize in-memory Qdrant collection
 * - Embed and store few-shot example pairs
 * - Retrieve top-3 similar examples per chunk via cosine similarity
 * 
 * KNOWN LIMITATION: In-memory mode means seeded examples do not persist
 * across process restarts. Must re-seed on startup.
 * See docs/OBSERVABILITY.md for documentation.
 * 
 * @module stage03-retrieval
 */

import { QdrantClient } from '@qdrant/js-client-rest';
import type { DocumentChunk, FewShotExample, RetrievalResult, DocumentType } from '../types/index.js';

/** Embedding dimension for all-MiniLM-L6-v2 */
const EMBEDDING_DIM = 384;

/** Number of few-shot examples to retrieve per chunk */
const TOP_K = 3;

/** Collection name in Qdrant */
const COLLECTION_NAME = 'few_shot_examples';

/**
 * Lightweight embedding function using TF-IDF-style hashing.
 * 
 * For the hackathon, we use a deterministic text-to-vector approach
 * that doesn't require downloading a model. In production, replace
 * with @xenova/transformers or an API-based embedder.
 * 
 * This produces consistent embeddings for similar text, enabling
 * meaningful cosine similarity search.
 */
export function embedText(text: string): number[] {
  const vector = new Float32Array(EMBEDDING_DIM).fill(0);
  const normalized = text.toLowerCase().trim();
  const words = normalized.split(/\s+/);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    // Hash each word to a position in the vector
    let hash = 0;
    for (let j = 0; j < word.length; j++) {
      hash = ((hash << 5) - hash + word.charCodeAt(j)) | 0;
    }
    const position = Math.abs(hash) % EMBEDDING_DIM;
    // TF-IDF inspired: weight by inverse position in document
    const weight = 1.0 / Math.sqrt(i + 1);
    vector[position] += weight;

    // Also encode bigrams for better semantic matching
    if (i > 0) {
      const bigram = `${words[i - 1]}_${word}`;
      let bigramHash = 0;
      for (let j = 0; j < bigram.length; j++) {
        bigramHash = ((bigramHash << 5) - bigramHash + bigram.charCodeAt(j)) | 0;
      }
      const bigramPos = Math.abs(bigramHash) % EMBEDDING_DIM;
      vector[bigramPos] += weight * 0.5;
    }
  }

  // L2 normalize the vector
  let norm = 0;
  for (let i = 0; i < EMBEDDING_DIM; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < EMBEDDING_DIM; i++) {
      vector[i] /= norm;
    }
  }

  return Array.from(vector);
}

/**
 * Retrieval engine that manages the Qdrant vector store.
 * Initialized with in-memory Qdrant for the hackathon.
 */
export class RetrievalEngine {
  private client: QdrantClient;
  private initialized = false;
  private pointCounter = 0;

  constructor() {
    // In-memory Qdrant — no server needed
    this.client = new QdrantClient({ url: 'http://localhost:6333' });
  }

  /**
   * Initialize with a local in-memory store for hackathon use.
   * Falls back to a simple Map-based store if Qdrant server isn't running.
   */
  private inMemoryStore: Map<number, { vector: number[]; payload: Record<string, unknown> }> = new Map();
  private useInMemory = true;

  /**
   * Initialize the collection. Creates it if it doesn't exist.
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Try connecting to a real Qdrant server first
      await this.client.getCollections();
      this.useInMemory = false;

      // Check if collection exists
      try {
        await this.client.getCollection(COLLECTION_NAME);
      } catch {
        // Create collection
        await this.client.createCollection(COLLECTION_NAME, {
          vectors: {
            size: EMBEDDING_DIM,
            distance: 'Cosine',
          },
        });
      }
    } catch {
      // No Qdrant server — use in-memory fallback
      this.useInMemory = true;
      console.log('⚠️  Qdrant server not available. Using in-memory vector store.');
    }

    this.initialized = true;
  }

  /**
   * Seed the vector store with few-shot examples.
   * Must be called on startup since in-memory mode doesn't persist.
   */
  async seedExamples(examples: FewShotExample[]): Promise<void> {
    await this.initialize();

    for (const example of examples) {
      const vector = embedText(example.inputText);
      const id = ++this.pointCounter;

      if (this.useInMemory) {
        this.inMemoryStore.set(id, {
          vector,
          payload: {
            id: example.id,
            inputText: example.inputText,
            expectedOutput: JSON.stringify(example.expectedOutput),
            documentType: example.documentType,
          },
        });
      } else {
        await this.client.upsert(COLLECTION_NAME, {
          wait: true,
          points: [{
            id,
            vector,
            payload: {
              id: example.id,
              inputText: example.inputText,
              expectedOutput: JSON.stringify(example.expectedOutput),
              documentType: example.documentType,
            },
          }],
        });
      }
    }
  }

  /**
   * Retrieve top-3 few-shot examples for a given chunk.
   * Filters by document type to ensure type-matched examples.
   */
  async retrieveExamples(chunk: DocumentChunk): Promise<RetrievalResult> {
    await this.initialize();

    const queryVector = embedText(chunk.text);
    let examples: FewShotExample[] = [];
    let scores: number[] = [];

    if (this.useInMemory) {
      // In-memory cosine similarity search
      const results = this.inMemorySearch(queryVector, chunk.documentType, TOP_K);
      examples = results.map(r => ({
        id: r.payload.id as string,
        inputText: r.payload.inputText as string,
        expectedOutput: JSON.parse(r.payload.expectedOutput as string),
        documentType: r.payload.documentType as DocumentType,
      }));
      scores = results.map(r => r.score);
    } else {
      // Qdrant server search
      const searchResult = await this.client.search(COLLECTION_NAME, {
        vector: queryVector,
        limit: TOP_K,
        filter: {
          must: [{
            key: 'documentType',
            match: { value: chunk.documentType },
          }],
        },
      });

      examples = searchResult.map(r => ({
        id: r.payload?.id as string,
        inputText: r.payload?.inputText as string,
        expectedOutput: JSON.parse(r.payload?.expectedOutput as string),
        documentType: r.payload?.documentType as DocumentType,
      }));
      scores = searchResult.map(r => r.score);
    }

    return { chunk, examples, scores };
  }

  /**
   * In-memory cosine similarity search with type filtering.
   */
  private inMemorySearch(
    queryVector: number[],
    documentType: DocumentType,
    limit: number
  ): Array<{ payload: Record<string, unknown>; score: number }> {
    const results: Array<{ payload: Record<string, unknown>; score: number }> = [];

    for (const [, point] of this.inMemoryStore) {
      // Type filter
      if (point.payload.documentType !== documentType) continue;

      // Cosine similarity (vectors are already L2-normalized)
      let dotProduct = 0;
      for (let i = 0; i < queryVector.length; i++) {
        dotProduct += queryVector[i] * point.vector[i];
      }

      results.push({ payload: point.payload, score: dotProduct });
    }

    // Sort by score descending, take top-k
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }

  /**
   * Get the count of stored examples (for diagnostics).
   */
  getExampleCount(): number {
    return this.inMemoryStore.size;
  }
}

/** Singleton retrieval engine instance */
export const retrievalEngine = new RetrievalEngine();
