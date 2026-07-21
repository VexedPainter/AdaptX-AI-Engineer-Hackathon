# Observability & Metrics

The extraction pipeline is instrumented with OpenTelemetry to provide deep visibility into every stage of the process.

## 1. Distributed Tracing

Every document processed generates a complete distributed trace, tied together by a unique `Correlation ID` generated at the API Gateway.

Spans are created for every pipeline stage:
- `pipeline.ingestion`
- `pipeline.chunking`
- `pipeline.retrieval`
- `pipeline.prompt_assembly`
- `pipeline.pre_guard`
- `pipeline.extraction` (includes retry loop iterations)
- `pipeline.post_guard`
- `pipeline.chunk_merge`
- `pipeline.validation`
- `pipeline.output_store`

### Span Attributes
The extraction span captures detailed metadata:
- `llm.provider` (e.g., gemini, groq)
- `llm.model`
- `llm.prompt_hash` (Never logs raw PII — hashes the prompt for deduplication)
- `llm.token_usage.prompt`
- `llm.token_usage.completion`
- `llm.latency_ms`

## 2. Failure Taxonomy & Logger (Stage 09)

The pipeline employs a "Never Discard" policy. Any failure in the pipeline is caught, categorized, logged, and the document is routed to the "Flagged Store" for human review.

Failures are categorized into one of the following taxonomies:

1. **missing_field**: The LLM failed to extract a field marked as required in the Zod schema.
2. **wrong_type**: The LLM extracted the wrong data type (e.g., string instead of number) or an invalid enum value.
3. **hallucination**: The Post-Guard detected indicators that the LLM invented data not present in the source text.
4. **truncation**: The output was cut off (e.g., max tokens reached) resulting in invalid JSON, or a document produced zero chunks.
5. **merge_conflict**: During Stage 07, two chunks provided conflicting values for the same scalar field (resolved by order-index priority, but logged).
6. **guardrail_block**: The Pre-Guard or Post-Guard blocked the execution (e.g., prompt injection detected, PII violation).
7. **rate_limit**: The LLM provider returned a 429 Too Many Requests (caught by the retry queue, but logged if max retries are exhausted).
8. **llm_error**: Generic API errors (timeouts, 500s).
9. **unknown**: Uncategorized errors.

## 3. Evaluation Metrics

The `scripts/evaluate.ts` script aggregates the data across a batch run and outputs the following metrics:

- **Schema Validity Percentage**: The core success metric (Target: >90%).
- **Average Retries**: How often the self-correction loop was invoked.
- **Latency (p95)**: The 95th percentile end-to-end processing time.
- **Estimated Cost**: Calculated based on token usage and the provider's cost per 1M tokens.
- **Failure Distribution**: A breakdown of the taxonomy categories across all failed runs.
