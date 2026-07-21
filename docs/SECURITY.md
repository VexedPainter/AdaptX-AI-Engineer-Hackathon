# Security Architecture & Guardrails

This document outlines the security mechanisms implemented in the Constrained Structured Extraction pipeline.

## 1. Dual-Checkpoint Guardrail System (Stage 05)

The pipeline employs a strict two-pass guardrail system to prevent prompt injection and sanitize data.

### 1.1 Pre-Guard (Input Sanitization)
Runs **before** the LLM is called on the assembled prompt.

- **PII Redaction**: Detects and masks standard PII (Emails, Phone Numbers, SSNs) using non-regex structural analysis. Replaces matches with masks (e.g., `[EMAIL_REDACTED]`). This ensures sensitive data is never sent to the LLM or embedded in the Qdrant vector store.
- **Prompt Injection Detection**: Blocks structural bypass attempts (e.g., "ignore all previous instructions", "jailbreak"). If detected, the pipeline aborts processing for that chunk immediately.

### 1.2 Post-Guard (Output Validation)
Runs **after** the LLM generates the JSON, but **before** schema validation.

- **Hallucination Detection**: Scans the output for uncertainty markers (e.g., "I'm making an assumption", "example.com") which indicate the LLM hallucinated data not present in the source text.
- **Toxicity/Safety**: (via Enkrypt AI) Ensures the output contains no unsafe content.

### 1.3 Provider Strategy
- **Primary**: Enkrypt AI (`ENKRYPT_API_KEY`). If configured, calls the Enkrypt AI REST API for enterprise-grade guardrails.
- **Fallback**: Open-Source Fallback. If the key is missing or the API is unreachable, the system automatically falls back to the in-memory string-analysis guardrails implemented in `src/stage05-guardrails/index.ts`.

## 2. Secure Output Store (Stage 10)

Pipeline outputs are never stored in plaintext if they are valid.

- **Validated Store**: Successful extractions are encrypted at rest using **AES-256-GCM**.
  - Uses a 32-byte (256-bit) encryption key provided via environment variables.
  - Requires the exact key to decrypt the payload.
- **Flagged Store**: Rejected/failed extractions are stored in plaintext in a separate directory specifically for human review.

## 3. API Gateway Security

The `express` gateway implements standard API security practices:
- **JWT Authentication**: Validates Bearer tokens using `jose` before allowing access to extraction endpoints.
- **Rate Limiting**: Token-bucket rate limiting via `express-rate-limit` to prevent abuse.
- **Helmet**: Injects security headers (HSTS, NoSniff, XSS protection).
- **TLS Configuration**: Supports native HTTPS/TLS if certificates are provided in the environment configuration.

## 4. Known Limitations

- **Qdrant Persistence**: For this hackathon implementation, the Qdrant vector store runs in-memory. Data is not persisted between server restarts. In a production environment, Qdrant should be configured with a persistent storage volume.
- **Deterministic Embeddings**: To maintain the zero-cost constraint, the project uses a fast, deterministic word-hashing embedding function rather than calling an external embedding API (like OpenAI's `text-embedding-3-small`). This is sufficient for the hackathon but less semantically accurate than transformer-based embeddings.
- **Data Privacy (Free Tiers)**: The pipeline utilizes free-tier APIs (Mistral, Cerebras, Groq, Gemini) which may use input data for model training. This is acceptable for synthetic hackathon evaluation data, but must not be used with real Production PII.
