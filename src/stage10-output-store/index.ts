/**
 * Stage 10 — Output Store (AES-256 Encrypted + Flagged)
 * 
 * Two stores:
 * 1. Validated Store: AES-256-GCM encrypted at rest for successful extractions
 * 2. Flagged Store: Plaintext store for rejected/failed items (human review)
 * 
 * Uses Node.js built-in `crypto` module — no external encryption dependencies.
 * 
 * @module stage10-output-store
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { writeFileSync, readFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import type { PipelineOutput, FailureLogEntry } from '../types/index.js';

// ─── AES-256-GCM Encryption ────────────────────────────────────────────────

/** AES-256-GCM settings */
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits

/**
 * Encrypt data using AES-256-GCM.
 * 
 * @param plaintext - The data to encrypt (will be JSON-stringified)
 * @param key - 32-byte encryption key (64 hex characters)
 * @returns Buffer containing: IV (16 bytes) + authTag (16 bytes) + ciphertext
 */
export function encrypt(plaintext: string, key: string): Buffer {
  // Convert hex key to buffer
  const keyBuffer = Buffer.from(key, 'hex');
  if (keyBuffer.length !== 32) {
    throw new Error('AES-256 key must be exactly 32 bytes (64 hex characters)');
  }

  // Generate random IV
  const iv = randomBytes(IV_LENGTH);

  // Encrypt
  const cipher = createCipheriv(ALGORITHM, keyBuffer, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  // Get auth tag
  const authTag = cipher.getAuthTag();

  // Pack: IV + authTag + ciphertext
  return Buffer.concat([iv, authTag, encrypted]);
}

/**
 * Decrypt data encrypted with AES-256-GCM.
 * 
 * @param encryptedData - Buffer from encrypt() containing IV + authTag + ciphertext
 * @param key - Same 32-byte key used for encryption
 * @returns Decrypted plaintext string
 */
export function decrypt(encryptedData: Buffer, key: string): string {
  const keyBuffer = Buffer.from(key, 'hex');
  if (keyBuffer.length !== 32) {
    throw new Error('AES-256 key must be exactly 32 bytes (64 hex characters)');
  }

  // Unpack: IV + authTag + ciphertext
  const iv = encryptedData.subarray(0, IV_LENGTH);
  const authTag = encryptedData.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = encryptedData.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  // Decrypt
  const decipher = createDecipheriv(ALGORITHM, keyBuffer, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

// ─── Output Store ───────────────────────────────────────────────────────────

/**
 * Output store manager for validated and flagged extractions.
 */
export class OutputStore {
  private validatedDir: string;
  private flaggedDir: string;
  private encryptionKey: string;

  constructor(baseDir: string, encryptionKey: string) {
    this.validatedDir = join(baseDir, 'validated');
    this.flaggedDir = join(baseDir, 'flagged');
    this.encryptionKey = encryptionKey;

    // Ensure directories exist — gracefully handle read-only filesystems
    try {
      mkdirSync(this.validatedDir, { recursive: true });
      mkdirSync(this.flaggedDir, { recursive: true });
    } catch (err) {
      console.warn(`⚠️  OutputStore: Could not create directories (read-only filesystem?). Disk storage disabled.`);
    }
  }

  /**
   * Store a validated extraction result.
   * Encrypted at rest using AES-256-GCM.
   * 
   * @param output - The pipeline output to store
   */
  storeValidated(output: PipelineOutput): void {
    try {
      const filename = `${output.documentId}.enc`;
      const filepath = join(this.validatedDir, filename);

      const plaintext = JSON.stringify(output, null, 2);
      const encrypted = encrypt(plaintext, this.encryptionKey);

      writeFileSync(filepath, encrypted);
    } catch (err) {
      // Gracefully handle disk write failures (e.g., read-only container filesystem).
      // The HTTP response still returns the extracted data — only persistent storage is skipped.
      console.warn(`⚠️  OutputStore: Failed to write validated output for ${output.documentId}: ${(err as Error).message}`);
    }
  }

  /**
   * Retrieve a validated extraction by document ID.
   * Decrypts the stored data.
   * 
   * @param documentId - The document ID to retrieve
   * @returns The decrypted pipeline output, or null if not found
   */
  retrieveValidated(documentId: string): PipelineOutput | null {
    const filename = `${documentId}.enc`;
    const filepath = join(this.validatedDir, filename);

    if (!existsSync(filepath)) return null;

    const encrypted = readFileSync(filepath);
    const plaintext = decrypt(encrypted, this.encryptionKey);
    return JSON.parse(plaintext);
  }

  /**
   * Store a flagged/rejected item for human review.
   * Stored as plaintext JSON (not encrypted) so reviewers can inspect.
   * 
   * @param output - The failed pipeline output
   * @param failures - Associated failure log entries
   */
  storeFlagged(output: PipelineOutput, failures: FailureLogEntry[]): void {
    try {
      const filename = `${output.documentId}.json`;
      const filepath = join(this.flaggedDir, filename);

      const flaggedEntry = {
        output,
        failures,
        flaggedAt: new Date().toISOString(),
        reviewStatus: 'pending',
      };

      writeFileSync(filepath, JSON.stringify(flaggedEntry, null, 2));
    } catch (err) {
      // Gracefully handle disk write failures — log warning, don't crash.
      console.warn(`⚠️  OutputStore: Failed to write flagged output for ${output.documentId}: ${(err as Error).message}`);
    }
  }

  /**
   * Retrieve a flagged item by document ID.
   * 
   * @param documentId - The document ID to retrieve
   * @returns The flagged entry or null if not found
   */
  retrieveFlagged(documentId: string): { output: PipelineOutput; failures: FailureLogEntry[] } | null {
    const filename = `${documentId}.json`;
    const filepath = join(this.flaggedDir, filename);

    if (!existsSync(filepath)) return null;

    const content = readFileSync(filepath, 'utf8');
    return JSON.parse(content);
  }

  /**
   * List all flagged document IDs (human review queue).
   */
  listFlagged(): string[] {
    if (!existsSync(this.flaggedDir)) return [];

    return readdirSync(this.flaggedDir)
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''));
  }

  /**
   * List all validated document IDs.
   */
  listValidated(): string[] {
    if (!existsSync(this.validatedDir)) return [];

    return readdirSync(this.validatedDir)
      .filter(f => f.endsWith('.enc'))
      .map(f => f.replace('.enc', ''));
  }

  /**
   * Get store statistics.
   */
  getStats(): { validatedCount: number; flaggedCount: number } {
    return {
      validatedCount: this.listValidated().length,
      flaggedCount: this.listFlagged().length,
    };
  }
}
