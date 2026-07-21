/**
 * API Gateway — Express.js with JWT Auth + Rate Limiting
 * 
 * Lightweight Kong alternative for the hackathon.
 * Features:
 * - JWT/OAuth2 token validation (using `jose` library)
 * - Token bucket rate limiting
 * - TLS support (when certs are provided)
 * - Correlation ID generation at entry point
 * - CORS and security headers (via Helmet)
 * - DEMO_MODE: bypasses JWT on /extract for public demo access
 * 
 * @module gateway
 */

import express, { type Request, type Response, type NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { createServer } from 'https';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { jwtVerify, SignJWT } from 'jose';
import { v4 as uuidv4 } from 'uuid';
import { config, isTlsConfigured } from '../config/index.js';
import { processDocument } from '../pipeline/index.js';
import { retrievalEngine } from '../stage03-retrieval/index.js';
import { isValidDocumentType } from '../stage01-ingestion/index.js';
import { initializeTracing } from '../observability/index.js';
import type { DocumentType, FewShotExample } from '../types/index.js';

// ─── JWT Authentication ─────────────────────────────────────────────────────

const JWT_SECRET = new TextEncoder().encode(config.JWT_SECRET);

/**
 * Generate a JWT token for testing/development.
 * In production, this would be handled by an OAuth2 provider.
 */
export async function generateTestToken(subject: string = 'test-user'): Promise<string> {
  return new SignJWT({ sub: subject, scope: 'extraction:write' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(JWT_SECRET);
}

/**
 * JWT authentication middleware.
 * Validates the Bearer token in the Authorization header.
 */
async function authenticateJWT(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or invalid Authorization header. Expected: Bearer <token>',
    });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    // Attach user info to request for downstream use
    (req as Request & { user?: Record<string, unknown> }).user = payload as Record<string, unknown>;
    next();
  } catch {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired JWT token',
    });
  }
}

/**
 * DEMO MODE: Conditional auth middleware.
 * 
 * When DEMO_MODE=true is set in environment, this middleware skips JWT
 * validation entirely for the /extract route, making it publicly callable.
 * 
 * ⚠️  DELIBERATE DEMO-MODE SIMPLIFICATION — NOT A REMOVAL OF SECURITY.
 * The full JWT authentication code is intact and documented above.
 * In production, remove DEMO_MODE=true to re-enable JWT on all routes.
 */
function demoAwareAuth(req: Request, res: Response, next: NextFunction): void {
  if (process.env.DEMO_MODE === 'true') {
    // Skip JWT in demo mode — route is publicly accessible
    next();
    return;
  }
  // Normal mode — full JWT authentication
  authenticateJWT(req, res, next).catch(next);
}

// ─── Correlation ID Middleware ───────────────────────────────────────────────

/**
 * Generates a correlation ID at the gateway entry point.
 * This ID propagates through every pipeline stage.
 */
function correlationIdMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const correlationId = req.headers['x-correlation-id'] as string || uuidv4();
  (req as Request & { correlationId: string }).correlationId = correlationId;
  next();
}

// ─── Express App Setup ──────────────────────────────────────────────────────

/**
 * Create and configure the Express.js gateway server.
 */
export function createGatewayServer(): express.Application {
  const app = express();

  // --- Security Headers (Helmet) ---
  // Relaxed CSP to allow inline styles/scripts for the single-page demo frontend.
  // In production without a demo UI, use the default strict helmet() instead.
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
      },
    },
  }));

  // --- CORS ---
  app.use(cors());

  // --- Static Files (Demo Frontend) ---
  // Resolve the public/ directory relative to this file.
  // Works in both dev (tsx → src/gateway/) and prod (node → dist/gateway/).
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const publicDir = join(currentDir, '..', 'public');
  app.use(express.static(publicDir));

  // --- Body Parsing ---
  app.use(express.json({ limit: '10mb' }));

  // --- Rate Limiting ---
  const limiter = rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Rate Limit Exceeded',
      message: `Too many requests. Limit: ${config.RATE_LIMIT_MAX_REQUESTS} per ${config.RATE_LIMIT_WINDOW_MS / 1000}s`,
    },
  });
  app.use('/api/', limiter);

  // --- Correlation ID ---
  app.use(correlationIdMiddleware);

  // ─── Routes ─────────────────────────────────────────────────────────────

  // Health check (no auth required)
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      demoMode: process.env.DEMO_MODE === 'true',
      version: '1.0.0',
    });
  });

  // Generate test token (development only)
  app.post('/auth/token', async (_req: Request, res: Response) => {
    if (config.NODE_ENV === 'production') {
      res.status(404).json({ error: 'Not Found' });
      return;
    }
    const token = await generateTestToken();
    res.json({ token, expiresIn: '1h' });
  });

  // ─── /extract — Demo-friendly extraction endpoint ─────────────────────

  /**
   * POST /extract
   * 
   * Accepts: { text: string, documentType: "contract" | "chat_log" | "support_ticket" }
   * Returns: The final extracted JSON or validation errors.
   * 
   * In DEMO_MODE=true, this route is publicly callable without a JWT token.
   * In normal mode, it requires a valid Bearer token.
   */
  app.post('/extract', demoAwareAuth, async (req: Request, res: Response) => {
    try {
      const { text, documentType } = req.body;
      const correlationId = (req as Request & { correlationId: string }).correlationId;

      // Validate inputs
      if (!text || typeof text !== 'string') {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Missing or invalid "text" field. Expected a string.',
        });
        return;
      }
      if (!documentType || !isValidDocumentType(documentType)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid "documentType" field. Must be: contract, chat_log, or support_ticket',
        });
        return;
      }

      // Process through the full pipeline
      const result = await processDocument(text, documentType as DocumentType, correlationId);

      res.setHeader('X-Correlation-ID', correlationId);

      if (result.success) {
        res.json({
          success: true,
          correlationId,
          documentId: result.documentId,
          documentType: result.documentType,
          data: result.data,
          providersUsed: result.providersUsed,
          metrics: {
            totalLatencyMs: result.totalLatencyMs,
            totalTokens: result.totalTokens,
            retryCount: result.totalRetries,
            estimatedCostUsd: result.estimatedCostUsd,
          },
        });
      } else {
        res.status(422).json({
          success: false,
          correlationId,
          documentId: result.documentId,
          documentType: result.documentType,
          message: 'Extraction failed after max retries',
          data: result.data, // partial data even on failure
          failures: result.failures,
          providersUsed: result.providersUsed,
          metrics: {
            totalLatencyMs: result.totalLatencyMs,
            totalRetries: result.totalRetries,
          },
        });
      }
    } catch (error) {
      console.error('Pipeline error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: (error as Error).message,
      });
    }
  });

  // --- Protected Routes (require JWT) ---

  // Single document extraction (legacy /api/extract with JWT)
  app.post('/api/extract', authenticateJWT, async (req: Request, res: Response) => {
    try {
      const { content, type, source } = req.body;
      const correlationId = (req as Request & { correlationId: string }).correlationId;

      if (!content || typeof content !== 'string') {
        res.status(400).json({ error: 'Bad Request', message: 'Missing or invalid "content" field' });
        return;
      }
      if (!type || !isValidDocumentType(type)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid "type" field. Must be: contract, chat_log, or support_ticket',
        });
        return;
      }

      const result = await processDocument(content, type as DocumentType, correlationId, source);

      res.setHeader('X-Correlation-ID', correlationId);

      if (result.success) {
        res.json({
          success: true,
          correlationId,
          documentId: result.documentId,
          data: result.data,
          metrics: {
            totalLatencyMs: result.totalLatencyMs,
            totalTokens: result.totalTokens,
            retryCount: result.totalRetries,
            estimatedCostUsd: result.estimatedCostUsd,
          },
        });
      } else {
        res.status(422).json({
          success: false,
          correlationId,
          documentId: result.documentId,
          message: 'Extraction failed after max retries',
          failures: result.failures,
          metrics: {
            totalLatencyMs: result.totalLatencyMs,
            totalRetries: result.totalRetries,
          },
        });
      }
    } catch (error) {
      console.error('Pipeline error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: (error as Error).message,
      });
    }
  });

  // Batch extraction
  app.post('/api/extract/batch', authenticateJWT, async (req: Request, res: Response) => {
    try {
      const { documents } = req.body;
      const correlationId = (req as Request & { correlationId: string }).correlationId;

      if (!Array.isArray(documents) || documents.length === 0) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Missing or empty "documents" array',
        });
        return;
      }

      const results = [];
      for (const doc of documents) {
        try {
          const result = await processDocument(
            doc.content,
            doc.type as DocumentType,
            correlationId,
            doc.source
          );
          results.push(result);
        } catch (error) {
          results.push({
            success: false,
            documentId: 'unknown',
            error: (error as Error).message,
          });
        }
      }

      res.setHeader('X-Correlation-ID', correlationId);
      res.json({
        correlationId,
        totalDocuments: documents.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results,
      });
    } catch (error) {
      console.error('Batch pipeline error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: (error as Error).message,
      });
    }
  });

  return app;
}

// ─── Server Startup ─────────────────────────────────────────────────────────

/**
 * Start the gateway server with optional TLS.
 * Seeds Qdrant with few-shot examples before accepting requests.
 */
export async function startServer(): Promise<void> {
  // Initialize OpenTelemetry tracing
  initializeTracing();

  // Seed Qdrant vector store before accepting requests.
  // The few-shot data is outside rootDir (data/ vs src/), so we load it at
  // runtime using a path variable to prevent tsc from statically resolving it.
  const dataPath = '../../data/few-shot-examples/index.js';
  const { fewShotExamples } = await (Function('p', 'return import(p)')(dataPath)) as { fewShotExamples: FewShotExample[] };
  console.log(`📚 Seeding Qdrant with ${fewShotExamples.length} few-shot examples...`);
  await retrievalEngine.seedExamples(fewShotExamples);
  console.log('✅ Qdrant seeded.');

  const app = createGatewayServer();

  if (process.env.DEMO_MODE === 'true') {
    console.log('🎭 DEMO MODE ACTIVE — POST /extract is publicly accessible (no JWT required)');
  }

  if (isTlsConfigured()) {
    const httpsOptions = {
      cert: readFileSync(config.TLS_CERT_PATH),
      key: readFileSync(config.TLS_KEY_PATH),
    };

    const server = createServer(httpsOptions, app);
    server.listen(config.PORT, () => {
      console.log(`🔒 HTTPS Gateway running on https://localhost:${config.PORT}`);
      console.log(`   Rate limit: ${config.RATE_LIMIT_MAX_REQUESTS} req/${config.RATE_LIMIT_WINDOW_MS / 1000}s`);
    });
  } else {
    app.listen(config.PORT, () => {
      console.log(`🚀 HTTP Gateway running on http://localhost:${config.PORT}`);
      console.log(`   Rate limit: ${config.RATE_LIMIT_MAX_REQUESTS} req/${config.RATE_LIMIT_WINDOW_MS / 1000}s`);
      if (config.NODE_ENV !== 'production') {
        console.log(`   ⚠️  TLS not configured — using HTTP (set TLS_CERT_PATH and TLS_KEY_PATH for HTTPS)`);
      }
    });
  }
}

// Start if run directly
const isMainModule = process.argv[1]?.includes('server');
if (isMainModule) {
  startServer().catch(console.error);
}
