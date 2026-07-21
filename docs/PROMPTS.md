# Prompt Engineering Architecture

The extraction pipeline utilizes dynamic, context-aware prompt assembly leveraging the CRISPE framework (Capacity, Role, Insight, Statement, Personality, Experiment).

## 1. System Prompt

The system prompt establishes the persona, strict constraints, and schema expectations.

### Base Persona
```text
You are an expert data extraction AI.
Your ONLY purpose is to extract structured JSON data from messy, unstructured text.
You are meticulous, precise, and never hallucinate data that is not present in the source text.
```

### Constraints
```text
CRITICAL CONSTRAINTS:
1. You MUST output ONLY valid JSON.
2. The JSON MUST exactly match the provided schema.
3. DO NOT include markdown formatting (like \`\`\`json).
4. If a field is not present in the text, use null or omit it according to schema requirements. DO NOT invent data.
5. If you are unsure, extract exactly what is in the text rather than interpreting.
```

### Dynamic Schema Injection
The exact Zod schema for the requested `DocumentType` is dynamically converted to JSON Schema and injected here.

## 2. User Prompt (CRISPE Framework)

The user prompt is assembled dynamically per-chunk.

- **Capacity & Role**: Defined in the system prompt.
- **Insight (Context)**: The specific document type and chunk order index.
- **Statement (Task)**: "Extract the data from this chunk according to the schema."
- **Personality**: Objective, data-driven.
- **Experiment (Few-Shot)**: Dynamically injected examples retrieved from Qdrant based on semantic similarity to the current chunk.

### Few-Shot Injection Strategy
1. The chunk text is hashed/embedded.
2. Qdrant retrieves the top-K (default K=3) most similar few-shot examples.
3. These examples are formatted as Input/Output pairs and injected BEFORE the actual task.

```text
Here are examples of correct extraction for this document type:

[Example 1 Input]
...
[Example 1 Output (Valid JSON)]
...

[Example 2 Input]
...
[Example 2 Output (Valid JSON)]
...
```

## 3. Retry Prompts (Self-Correction)

When Zod validation fails, the pipeline generates a specific retry prompt that feeds the exact errors back to the LLM. This allows the LLM to self-correct its structural mistakes.

```text
Your previous JSON output failed schema validation.

Validation Errors:
Error 1:
  Path: root.parties[0].role
  Message: Invalid enum value.
  Expected: 'buyer' | 'seller' | 'provider' | 'client'
  Received: 'vendor'

Please fix these specific errors and try again. Output ONLY valid JSON.
```

This self-correction loop runs up to `LLM_MAX_RETRIES` times (default 3) before hard-failing the chunk.
