# Deployment Guide

## Quick Deploy (Railway / Render)

### 1. Required Environment Variables

Set these in your hosting platform's dashboard:

```
# LLM Providers (at least GEMINI_API_KEY is required)
MISTRAL_API_KEY=your_mistral_key
CEREBRAS_API_KEY=your_cerebras_key
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key

# Security
JWT_SECRET=change_me_to_a_random_64_char_hex_string
AES_ENCRYPTION_KEY=a1b2c3d4e5f60708090001020304050607080900010203040506070809000102

# Demo mode — set to "true" to make POST /extract publicly callable
DEMO_MODE=true

# Server
NODE_ENV=production
PORT=3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
LLM_RATE_LIMIT_RPM=30

# LLM Config
LLM_TEMPERATURE=0.1
LLM_TOP_P=0.9
LLM_MAX_RETRIES=3
```

### 2. Build & Start Commands

| Platform | Build Command | Start Command |
|----------|--------------|---------------|
| **Railway** | `npm install && npm run build` | `npm start` |
| **Render** | `npm install && npm run build` | `npm start` |
| **Local** | `npm run build` | `npm start` |

The `npm start` script runs `node dist/gateway/server.js` which starts the Express server on the `PORT` env var.

### 3. Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | None | Health check — returns `{ status: "ok" }` |
| `POST` | `/extract` | JWT or none (if `DEMO_MODE=true`) | Single document extraction |
| `POST` | `/api/extract` | JWT required | Legacy extraction endpoint |
| `POST` | `/api/extract/batch` | JWT required | Batch extraction |
| `POST` | `/auth/token` | None (dev only) | Generate test JWT |

### 4. Testing the Demo Endpoint

```bash
# Health check
curl http://localhost:3000/health

# Extract a contract (DEMO_MODE=true required)
curl -X POST http://localhost:3000/extract \
  -H "Content-Type: application/json" \
  -d '{
    "text": "SERVICE AGREEMENT between Acme Corp and TechStart Inc. Total value $100,000. Governing law: California.",
    "documentType": "contract"
  }'
```

### 5. Disk Storage

The pipeline writes encrypted output to `output/validated/` and flagged items to `output/flagged/`. These directories are created automatically. If the disk write fails (e.g., read-only filesystem on some hosting tiers), the pipeline logs a warning but does **not** crash — the HTTP response still returns the extracted data.

### 6. Node.js Version

Requires Node.js **≥ 20.0.0** (set in `package.json` engines field).

### 7. Railway-Specific

Railway auto-detects Node.js projects. Just connect your repo and set the environment variables above. Railway injects `PORT` automatically.

### 8. Render-Specific

1. Create a new **Web Service**
2. Set Build Command: `npm install && npm run build`
3. Set Start Command: `npm start`
4. Add all environment variables from section 1 above
5. Render injects `PORT` automatically
