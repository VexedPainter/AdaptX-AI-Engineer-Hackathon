/**
 * Observability Module — OpenTelemetry Instrumentation
 * 
 * Instruments every pipeline stage with distributed tracing spans.
 * Features:
 * - Correlation ID generation and propagation
 * - Per-stage span creation with timing
 * - Prompt hash logging (never raw PII)
 * - Token usage and latency metrics
 * - Metrics summary export
 * 
 * @module observability
 */

import { trace, SpanStatusCode, type Span, type Tracer } from '@opentelemetry/api';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { SimpleSpanProcessor, ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { v4 as uuidv4 } from 'uuid';
import type { PipelineStage, PipelineOutput, EvaluationMetrics, FailureCategory } from '../types/index.js';

// ─── Tracer Setup ───────────────────────────────────────────────────────────

let tracerProvider: NodeTracerProvider | null = null;
let tracer: Tracer;

/**
 * Initialize OpenTelemetry tracing.
 * Uses ConsoleSpanExporter for hackathon (outputs to stdout).
 * In production, swap for Jaeger/OTLP exporter.
 */
export function initializeTracing(): void {
  if (tracerProvider) return; // Already initialized

  tracerProvider = new NodeTracerProvider({
    resource: new Resource({
      [ATTR_SERVICE_NAME]: 'constrained-extraction-pipeline',
    }),
  });

  // Console exporter — prints spans to stdout
  tracerProvider.addSpanProcessor(
    new SimpleSpanProcessor(new ConsoleSpanExporter())
  );

  tracerProvider.register();
  tracer = trace.getTracer('extraction-pipeline', '1.0.0');
}

/**
 * Get the configured tracer. Initializes if not already done.
 */
export function getTracer(): Tracer {
  if (!tracer) {
    initializeTracing();
  }
  return tracer;
}

// ─── Correlation ID ─────────────────────────────────────────────────────────

/**
 * Generate a new correlation ID.
 * Created at the gateway and propagated through every stage.
 */
export function generateCorrelationId(): string {
  return uuidv4();
}

// ─── Span Management ────────────────────────────────────────────────────────

/**
 * Create and execute a traced operation.
 * Wraps a pipeline stage execution in an OpenTelemetry span.
 * 
 * @param stage - Pipeline stage name
 * @param correlationId - Correlation ID for this request
 * @param attributes - Additional span attributes
 * @param operation - The async operation to trace
 * @returns The result of the operation + latency
 */
export async function traceStage<T>(
  stage: PipelineStage,
  correlationId: string,
  attributes: Record<string, string | number | boolean>,
  operation: (span: Span) => Promise<T>
): Promise<{ result: T; latencyMs: number }> {
  const currentTracer = getTracer();
  const startTime = Date.now();

  return currentTracer.startActiveSpan(`pipeline.${stage}`, async (span) => {
    try {
      // Set standard attributes
      span.setAttribute('correlation.id', correlationId);
      span.setAttribute('pipeline.stage', stage);
      span.setAttribute('pipeline.start_time', startTime);

      // Set custom attributes
      for (const [key, value] of Object.entries(attributes)) {
        span.setAttribute(key, value);
      }

      // Execute the operation
      const result = await operation(span);
      const latencyMs = Date.now() - startTime;

      span.setAttribute('pipeline.latency_ms', latencyMs);
      span.setStatus({ code: SpanStatusCode.OK });
      span.end();

      return { result, latencyMs };
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      span.setAttribute('pipeline.latency_ms', latencyMs);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (error as Error).message,
      });
      span.recordException(error as Error);
      span.end();

      throw error;
    }
  });
}

// ─── Metrics Collection ─────────────────────────────────────────────────────

/** Collected per-document metrics */
interface DocumentMetrics {
  documentId: string;
  correlationId: string;
  documentType: string;
  totalLatencyMs: number;
  totalTokens: number;
  retryCount: number;
  success: boolean;
  estimatedCostUsd: number;
  stageLatencies: Partial<Record<PipelineStage, number>>;
  failureCategories: FailureCategory[];
}

/** In-memory metrics store */
const metricsStore: DocumentMetrics[] = [];

/**
 * Record metrics for a completed document processing.
 */
export function recordDocumentMetrics(output: PipelineOutput): void {
  metricsStore.push({
    documentId: output.documentId,
    correlationId: output.correlationId,
    documentType: output.documentType,
    totalLatencyMs: output.totalLatencyMs,
    totalTokens: output.totalTokens,
    retryCount: output.totalRetries,
    success: output.success,
    estimatedCostUsd: output.estimatedCostUsd,
    stageLatencies: output.stageLatencies,
    failureCategories: output.failures.map(f => f.category),
  });
}

/**
 * Generate an evaluation metrics summary from all recorded documents.
 * 
 * Outputs:
 * - Schema-validity %
 * - Average retries per record
 * - p95 latency
 * - Cost per record
 * - Failure-type distribution
 */
export function generateMetricsSummary(): EvaluationMetrics {
  const total = metricsStore.length;
  if (total === 0) {
    return {
      totalDocuments: 0,
      validOutputs: 0,
      schemaValidityPercent: 0,
      avgRetriesPerRecord: 0,
      p95LatencyMs: 0,
      avgCostPerRecord: 0,
      failureDistribution: {} as Record<FailureCategory, number>,
      perTypeMetrics: {
        contract: { total: 0, valid: 0, validityPercent: 0 },
        chat_log: { total: 0, valid: 0, validityPercent: 0 },
        support_ticket: { total: 0, valid: 0, validityPercent: 0 },
      },
    };
  }

  const validOutputs = metricsStore.filter(m => m.success).length;

  // Average retries
  const totalRetries = metricsStore.reduce((sum, m) => sum + m.retryCount, 0);

  // p95 latency
  const latencies = metricsStore.map(m => m.totalLatencyMs).sort((a, b) => a - b);
  const p95Index = Math.ceil(0.95 * latencies.length) - 1;

  // Average cost
  const totalCost = metricsStore.reduce((sum, m) => sum + m.estimatedCostUsd, 0);

  // Failure distribution
  const failureDist: Record<string, number> = {};
  for (const m of metricsStore) {
    for (const cat of m.failureCategories) {
      failureDist[cat] = (failureDist[cat] || 0) + 1;
    }
  }

  // Per-type metrics
  const typeGroups = new Map<string, { total: number; valid: number }>();
  for (const m of metricsStore) {
    const group = typeGroups.get(m.documentType) || { total: 0, valid: 0 };
    group.total++;
    if (m.success) group.valid++;
    typeGroups.set(m.documentType, group);
  }

  const perTypeMetrics: Record<string, { total: number; valid: number; validityPercent: number }> = {};
  for (const [type, group] of typeGroups) {
    perTypeMetrics[type] = {
      ...group,
      validityPercent: group.total > 0 ? (group.valid / group.total) * 100 : 0,
    };
  }

  // Ensure all three types are present
  for (const type of ['contract', 'chat_log', 'support_ticket']) {
    if (!perTypeMetrics[type]) {
      perTypeMetrics[type] = { total: 0, valid: 0, validityPercent: 0 };
    }
  }

  return {
    totalDocuments: total,
    validOutputs,
    schemaValidityPercent: (validOutputs / total) * 100,
    avgRetriesPerRecord: totalRetries / total,
    p95LatencyMs: latencies[p95Index] || 0,
    avgCostPerRecord: totalCost / total,
    failureDistribution: failureDist as Record<FailureCategory, number>,
    perTypeMetrics: perTypeMetrics as Record<string, { total: number; valid: number; validityPercent: number }>,
  };
}

/**
 * Clear collected metrics (useful for testing).
 */
export function clearMetrics(): void {
  metricsStore.length = 0;
}
