/**
 * Configuration Loader — 12-Factor App Pattern
 * 
 * All configuration is loaded from environment variables.
 * No secrets are ever hardcoded. Missing required vars throw on startup,
 * failing fast rather than at runtime.
 */

import dotenv from 'dotenv';
import { z } from 'zod';

// Load .env file (development only; production uses real env vars)
dotenv.config();

/**
 * Schema for validating all environment configuration.
 * Uses Zod to ensure type safety and provide clear error messages
 * when required variables are missing.
 */
const ConfigSchema = z.object({
  // --- LLM Providers ---
  MISTRAL_API_KEY: z.string().default(''),
  CEREBRAS_API_KEY: z.string().default(''),
  GROQ_API_KEY: z.string().default(''),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required as the final fallback. Get one free at https://aistudio.google.com/'),

  // --- Guardrails (optional — falls back to open-source if empty) ---
  ENKRYPT_API_KEY: z.string().default(''),

  // --- API Gateway Security ---
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(30),

  // --- Encryption ---
  AES_ENCRYPTION_KEY: z.string().min(32, 'AES_ENCRYPTION_KEY must be at least 32 hex characters'),

  // --- LLM Configuration ---
  LLM_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.1),
  LLM_TOP_P: z.coerce.number().min(0).max(1).default(0.9),
  LLM_MAX_RETRIES: z.coerce.number().int().min(1).max(10).default(3),
  LLM_RATE_LIMIT_RPM: z.coerce.number().int().positive().default(12),

  // --- Qdrant ---
  QDRANT_URL: z.string().default(':memory:'),
  QDRANT_COLLECTION_NAME: z.string().default('few_shot_examples'),

  // --- Server ---
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),

  // --- Demo Mode ---
  // When true, POST /extract is publicly callable without JWT.
  // This is a deliberate demo-mode simplification for hackathon judging.
  DEMO_MODE: z.string().default('false'),

  // --- TLS (optional) ---
  TLS_CERT_PATH: z.string().default(''),
  TLS_KEY_PATH: z.string().default(''),
});

export type AppConfig = z.infer<typeof ConfigSchema>;

/**
 * Parse and validate configuration from environment.
 * Throws a descriptive error at startup if any required values are missing.
 */
function loadConfig(): AppConfig {
  const result = ConfigSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  • ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(
      `\n❌ Configuration Error — fix these environment variables:\n${errors}\n\n` +
      `Copy .env.example to .env and fill in the required values.\n`
    );
  }

  return result.data;
}

/**
 * Singleton config instance. Validated once at module load time.
 * Import this from any module: `import { config } from '@/config/index.js';`
 */
export const config = loadConfig();

/**
 * Helper: check if Enkrypt AI guardrails are available.
 * When false, the pipeline uses open-source fallback guardrails.
 */
export function isEnkryptAvailable(): boolean {
  return config.ENKRYPT_API_KEY.length > 0;
}

/**
 * Helper: check if Groq LLM is available.
 */
export function isGroqAvailable(): boolean {
  return config.GROQ_API_KEY.length > 0;
}

/**
 * Helper: check if Mistral LLM is available.
 */
export function isMistralAvailable(): boolean {
  return config.MISTRAL_API_KEY.length > 0;
}

/**
 * Helper: check if Cerebras LLM is available.
 */
export function isCerebrasAvailable(): boolean {
  return config.CEREBRAS_API_KEY.length > 0;
}

/**
 * Helper: check if TLS is configured.
 */
export function isTlsConfigured(): boolean {
  return config.TLS_CERT_PATH.length > 0 && config.TLS_KEY_PATH.length > 0;
}
