/**
 * Stage 04 — Mastra Prompt Assembler
 * 
 * Uses the Mastra agent framework to assemble constrained-generation prompts.
 * Merges three components into a single prompt:
 * 1. Target JSON schema (for the document type)
 * 2. Few-shot examples (top-3 from Qdrant retrieval)
 * 3. The input chunk text
 * 
 * All prompts follow the CRISPE framework.
 * See docs/PROMPTS.md for template documentation.
 * 
 * @module stage04-prompt-assembly
 */

import type { DocumentChunk, FewShotExample, DocumentType } from '../types/index.js';
import { getJsonSchemaForType } from '../schema/index.js';

/**
 * Assembled prompt ready for LLM extraction.
 * Contains all components needed for constrained generation.
 */
export interface AssembledPrompt {
  /** The system message setting the extraction role */
  systemMessage: string;
  /** The user message with schema + examples + input */
  userMessage: string;
  /** Document type for schema selection */
  documentType: DocumentType;
  /** Chunk ID for traceability */
  chunkId: string;
  /** Parent document ID */
  parentDocId: string;
  /** Order index of the chunk */
  orderIndex: number;
}

/**
 * CRISPE-framework system prompt template.
 * 
 * C (Capacity/Role): Expert structured data extractor
 * R (Insight): Domain knowledge about the document type
 * I (Statement): Extract structured JSON matching the schema
 * S (Personality): Precise, conservative, no hallucination
 * P (Experiment): Follow the few-shot examples exactly
 * E (Experiment): Output ONLY valid JSON, nothing else
 */
function buildSystemMessage(documentType: DocumentType): string {
  const typeDescriptions: Record<DocumentType, string> = {
    contract: 'legal contracts, service agreements, NDAs, and purchase orders',
    chat_log: 'chat transcripts, Slack conversations, live chat support logs, and messaging threads',
    support_ticket: 'customer support tickets, bug reports, feature requests, and service desk entries',
  };

  return `You are an expert structured data extraction system specialized in processing ${typeDescriptions[documentType]}.

ROLE: You extract structured JSON from noisy, real-world text with high precision.

INSIGHT: Real-world documents contain inconsistent formatting, typos, missing fields, and varied structures. You must handle this noise gracefully:
- Extract what IS present; use null/omit for what is genuinely missing
- Never fabricate or hallucinate data that isn't in the source text
- Prefer conservative extraction over speculative inference
- Map informal language to the closest schema enum value

PERSONALITY: You are methodical, precise, and conservative. When uncertain about a field value, you omit it rather than guess.

RULES:
1. Output ONLY a valid JSON object matching the provided schema — no markdown, no explanation, no preamble
2. Every required field must be present; use reasonable defaults only when the schema specifies them
3. For optional fields: include them ONLY if the source text contains clear evidence
4. Array fields should contain all items found in the text, even if formatting is inconsistent
5. Dates should be extracted as-is from the text (e.g., "March 15, 2024" or "2024-03-15")
6. Never invent names, emails, amounts, or dates not present in the source text`;
}

/**
 * Build the user message containing schema, few-shot examples, and input chunk.
 */
function buildUserMessage(
  chunk: DocumentChunk,
  examples: FewShotExample[],
  jsonSchema: Record<string, unknown>
): string {
  let message = '';

  // Section 1: Target schema
  message += '## TARGET JSON SCHEMA\n\n';
  message += 'Extract data matching this exact JSON schema:\n\n';
  message += '```json\n';
  message += JSON.stringify(jsonSchema, null, 2);
  message += '\n```\n\n';

  // Section 2: Few-shot examples
  if (examples.length > 0) {
    message += '## FEW-SHOT EXAMPLES\n\n';
    message += 'Follow these examples of correct extraction:\n\n';

    for (let i = 0; i < examples.length; i++) {
      message += `### Example ${i + 1}\n\n`;
      message += `**Input:**\n${examples[i].inputText.substring(0, 500)}${examples[i].inputText.length > 500 ? '...' : ''}\n\n`;
      message += `**Output:**\n\`\`\`json\n${JSON.stringify(examples[i].expectedOutput, null, 2)}\n\`\`\`\n\n`;
    }
  }

  // Section 3: Input text to extract from
  message += '## INPUT TEXT TO EXTRACT FROM\n\n';
  message += `This is chunk ${chunk.orderIndex + 1} from document ${chunk.parentDocId}.\n`;
  message += 'Extract structured data from the following text:\n\n';
  message += '```\n';
  message += chunk.text;
  message += '\n```\n\n';

  // Section 4: Output instruction
  message += '## YOUR TASK\n\n';
  message += 'Extract the structured JSON from the input text above. ';
  message += 'Output ONLY the JSON object — no markdown fences, no explanation. ';
  message += 'If this is a partial chunk, extract whatever fields are present in this chunk.';

  return message;
}

/**
 * Assemble a complete constrained-generation prompt for a chunk.
 * 
 * This is the Mastra Prompt Assembler — it merges:
 * 1. Schema definition (from the schema registry)
 * 2. Few-shot examples (from Qdrant retrieval)
 * 3. Input chunk text (from the chunking stage)
 * 
 * Into a single structured prompt for the LLM.
 * 
 * @param chunk - The document chunk to extract from
 * @param examples - Top-3 few-shot examples from Qdrant
 * @returns An assembled prompt ready for the extraction LLM
 */
export function assemblePrompt(
  chunk: DocumentChunk,
  examples: FewShotExample[]
): AssembledPrompt {
  const jsonSchema = getJsonSchemaForType(chunk.documentType);
  const systemMessage = buildSystemMessage(chunk.documentType);
  const userMessage = buildUserMessage(chunk, examples, jsonSchema);

  return {
    systemMessage,
    userMessage,
    documentType: chunk.documentType,
    chunkId: chunk.chunkId,
    parentDocId: chunk.parentDocId,
    orderIndex: chunk.orderIndex,
  };
}

/**
 * Build a retry prompt that includes the previous validation errors.
 * Used by Stage 08 when schema validation fails.
 * 
 * @param originalPrompt - The original assembled prompt
 * @param previousOutput - The invalid JSON that was generated
 * @param validationErrors - Detailed error descriptions
 * @param retryNumber - Which retry this is (1-3)
 */
export function assembleRetryPrompt(
  originalPrompt: AssembledPrompt,
  previousOutput: string,
  validationErrors: Array<{ path: string; message: string; expected: string; received: string }>,
  retryNumber: number
): AssembledPrompt {
  const errorTrace = validationErrors
    .map(e => `  - Field "${e.path}": ${e.message} (expected: ${e.expected}, got: ${e.received})`)
    .join('\n');

  const retryAddendum = `

## CORRECTION REQUIRED (Retry ${retryNumber}/3)

Your previous output had schema validation errors. Here is your previous output:

\`\`\`json
${previousOutput}
\`\`\`

These validation errors must be fixed:
${errorTrace}

Please output a corrected JSON object that fixes ALL of the above errors. Output ONLY the JSON — no explanation.`;

  return {
    ...originalPrompt,
    userMessage: originalPrompt.userMessage + retryAddendum,
  };
}
