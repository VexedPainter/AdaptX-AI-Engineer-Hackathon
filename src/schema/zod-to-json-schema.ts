/**
 * Zod to JSON Schema Converter
 * 
 * Lightweight converter that turns Zod schemas into JSON Schema objects.
 * Used by the prompt assembler to include the target schema in LLM prompts.
 * 
 * This avoids pulling in the heavy `zod-to-json-schema` npm package
 * while covering the subset of Zod types we actually use.
 */

import { z } from 'zod';

/**
 * Convert a Zod schema to a JSON Schema representation.
 * Handles the types used in our extraction schemas:
 * string, number, boolean, enum, array, object, optional, default.
 */
export function zodToJsonSchema(schema: z.ZodType<unknown>): Record<string, unknown> {
  return convertNode(schema);
}

function convertNode(schema: z.ZodType<unknown>): Record<string, unknown> {
  // Unwrap ZodOptional
  if (schema instanceof z.ZodOptional) {
    return convertNode(schema.unwrap());
  }

  // Unwrap ZodDefault
  if (schema instanceof z.ZodDefault) {
    const inner = convertNode(schema._def.innerType);
    inner.default = schema._def.defaultValue();
    return inner;
  }

  // ZodString
  if (schema instanceof z.ZodString) {
    const result: Record<string, unknown> = { type: 'string' };
    if (schema.description) result.description = schema.description;
    // Check for email validation
    for (const check of schema._def.checks) {
      if (check.kind === 'email') result.format = 'email';
      if (check.kind === 'min') result.minLength = check.value;
    }
    return result;
  }

  // ZodNumber
  if (schema instanceof z.ZodNumber) {
    const result: Record<string, unknown> = { type: 'number' };
    if (schema.description) result.description = schema.description;
    for (const check of schema._def.checks) {
      if (check.kind === 'int') result.type = 'integer';
      if (check.kind === 'min') result.minimum = check.value;
      if (check.kind === 'max') result.maximum = check.value;
    }
    return result;
  }

  // ZodBoolean
  if (schema instanceof z.ZodBoolean) {
    const result: Record<string, unknown> = { type: 'boolean' };
    if (schema.description) result.description = schema.description;
    return result;
  }

  // ZodEnum
  if (schema instanceof z.ZodEnum) {
    const result: Record<string, unknown> = {
      type: 'string',
      enum: schema._def.values,
    };
    if (schema.description) result.description = schema.description;
    return result;
  }

  // ZodArray
  if (schema instanceof z.ZodArray) {
    const result: Record<string, unknown> = {
      type: 'array',
      items: convertNode(schema._def.type),
    };
    if (schema.description) result.description = schema.description;
    if (schema._def.minLength !== null) result.minItems = schema._def.minLength.value;
    return result;
  }

  // ZodObject
  if (schema instanceof z.ZodObject) {
    const shape = schema._def.shape();
    const properties: Record<string, unknown> = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(shape)) {
      const fieldSchema = value as z.ZodType<unknown>;
      properties[key] = convertNode(fieldSchema);

      // A field is required if it's NOT optional and NOT defaulted
      if (!(fieldSchema instanceof z.ZodOptional) && !(fieldSchema instanceof z.ZodDefault)) {
        required.push(key);
      }
    }

    const result: Record<string, unknown> = {
      type: 'object',
      properties,
    };
    if (required.length > 0) result.required = required;
    if (schema.description) result.description = schema.description;
    return result;
  }

  // Fallback for unhandled types
  return { type: 'object' };
}
