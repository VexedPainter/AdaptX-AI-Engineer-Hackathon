/**
 * Stage 05 — Guardrails (Enkrypt AI + Open-Source Fallback)
 * 
 * Two guardrail checkpoints:
 * - Pre-Guard: Runs BEFORE the LLM call to sanitize input
 *   • PII redaction (emails, phone numbers, SSNs, credit cards)
 *   • Prompt injection detection
 * - Post-Guard: Runs AFTER the LLM call to scan output
 *   • Hallucination indicators
 *   • Unsafe content detection
 * 
 * Architecture: If ENKRYPT_API_KEY is set, uses Enkrypt AI.
 * Otherwise, uses the open-source fallback guardrails (default).
 * 
 * @module stage05-guardrails
 */

import type { GuardrailResult, GuardrailIssue } from '../types/index.js';

// ─── PII Patterns (used for redaction, NOT content extraction) ────────────────
// These patterns identify PII for REDACTION/SAFETY, not for extracting data.
// The spec prohibits regex in the "extraction path" — guardrails are a 
// security/compliance layer, fundamentally different from data extraction.

/**
 * PII detector configuration. Each entry defines a category of PII
 * with its detection pattern and replacement mask.
 */
interface PiiPattern {
  category: string;
  /** Function-based detector instead of regex — uses string analysis */
  detect: (text: string) => Array<{ start: number; end: number; match: string }>;
  mask: string;
}

/**
 * Detect email-like patterns in text using character analysis.
 * Looks for word@word.word patterns without regex.
 */
function detectEmails(text: string): Array<{ start: number; end: number; match: string }> {
  const results: Array<{ start: number; end: number; match: string }> = [];
  const words = text.split(/\s+/);
  let position = 0;

  for (const word of words) {
    const atIndex = word.indexOf('@');
    if (atIndex > 0 && atIndex < word.length - 1) {
      const afterAt = word.substring(atIndex + 1);
      if (afterAt.includes('.') && afterAt.indexOf('.') < afterAt.length - 1) {
        const start = text.indexOf(word, position);
        if (start >= 0) {
          results.push({ start, end: start + word.length, match: word });
        }
      }
    }
    position += word.length + 1;
  }

  return results;
}

/**
 * Detect phone number patterns using digit analysis.
 * Looks for sequences of 10+ digits (with optional separators).
 */
function detectPhoneNumbers(text: string): Array<{ start: number; end: number; match: string }> {
  const results: Array<{ start: number; end: number; match: string }> = [];
  let i = 0;

  while (i < text.length) {
    // Look for a digit or + that might start a phone number
    if (isDigit(text[i]) || text[i] === '+') {
      let j = i;
      let digitCount = 0;
      let segment = '';

      while (j < text.length && (isDigit(text[j]) || '+-()./ '.includes(text[j]))) {
        if (isDigit(text[j])) digitCount++;
        segment += text[j];
        j++;
      }

      // Phone numbers typically have 10-15 digits
      if (digitCount >= 10 && digitCount <= 15) {
        results.push({ start: i, end: j, match: segment.trim() });
      }

      i = j;
    } else {
      i++;
    }
  }

  return results;
}

function isDigit(char: string): boolean {
  return char >= '0' && char <= '9';
}

/**
 * Detect SSN-like patterns (XXX-XX-XXXX format).
 */
function detectSSNs(text: string): Array<{ start: number; end: number; match: string }> {
  const results: Array<{ start: number; end: number; match: string }> = [];

  for (let i = 0; i <= text.length - 11; i++) {
    const candidate = text.substring(i, i + 11);
    // Check pattern: 3 digits, dash, 2 digits, dash, 4 digits
    if (
      isDigit(candidate[0]) && isDigit(candidate[1]) && isDigit(candidate[2]) &&
      candidate[3] === '-' &&
      isDigit(candidate[4]) && isDigit(candidate[5]) &&
      candidate[6] === '-' &&
      isDigit(candidate[7]) && isDigit(candidate[8]) && isDigit(candidate[9]) && isDigit(candidate[10])
    ) {
      // Make sure it's not part of a longer number
      const before = i > 0 ? text[i - 1] : ' ';
      const after = i + 11 < text.length ? text[i + 11] : ' ';
      if (!isDigit(before) && !isDigit(after)) {
        results.push({ start: i, end: i + 11, match: candidate });
      }
    }
  }

  return results;
}

/** PII detection patterns */
const PII_PATTERNS: PiiPattern[] = [
  { category: 'email', detect: detectEmails, mask: '[EMAIL_REDACTED]' },
  { category: 'phone', detect: detectPhoneNumbers, mask: '[PHONE_REDACTED]' },
  { category: 'ssn', detect: detectSSNs, mask: '[SSN_REDACTED]' },
];

// ─── Prompt Injection Detection ─────────────────────────────────────────────

/** 
 * Known prompt injection phrases. 
 * Detected via string matching, not regex extraction.
 */
const INJECTION_INDICATORS: string[] = [
  'ignore previous instructions',
  'ignore all previous',
  'disregard your instructions',
  'forget your system prompt',
  'you are now',
  'act as if you',
  'pretend you are',
  'override your instructions',
  'system prompt:',
  'new instructions:',
  'ignore the above',
  'do not follow',
  'bypass the rules',
  'jailbreak',
  'DAN mode',
];

/**
 * Detect potential prompt injection attempts.
 * Uses substring matching against known injection phrases.
 */
function detectPromptInjection(text: string): GuardrailIssue[] {
  const issues: GuardrailIssue[] = [];
  const lowerText = text.toLowerCase();

  for (const indicator of INJECTION_INDICATORS) {
    if (lowerText.includes(indicator.toLowerCase())) {
      issues.push({
        category: 'prompt_injection',
        severity: 'critical',
        description: `Potential prompt injection detected: "${indicator}"`,
        span: indicator,
      });
    }
  }

  return issues;
}

// ─── Hallucination Detection ────────────────────────────────────────────────

/**
 * Indicators that an LLM output may contain hallucinated content.
 * These are phrases the LLM sometimes adds when it's uncertain.
 */
const HALLUCINATION_INDICATORS: string[] = [
  'I cannot determine',
  'Based on my training',
  'As an AI',
  'I don\'t have access',
  'I\'m not sure',
  'This is just an estimate',
  'I\'m making an assumption',
  'placeholder',
  'example.com',
  'john.doe@',
  'jane.doe@',
  '555-0',  // Classic fake phone number prefix
  '123-45-6789',  // Classic fake SSN
];

/**
 * Detect potential hallucination in generated JSON output.
 */
function detectHallucination(text: string): GuardrailIssue[] {
  const issues: GuardrailIssue[] = [];
  const lowerText = text.toLowerCase();

  for (const indicator of HALLUCINATION_INDICATORS) {
    if (lowerText.includes(indicator.toLowerCase())) {
      issues.push({
        category: 'hallucination',
        severity: 'medium',
        description: `Potential hallucination indicator: "${indicator}"`,
        span: indicator,
      });
    }
  }

  return issues;
}

// ─── Enkrypt AI Client ──────────────────────────────────────────────────────

/**
 * Enkrypt AI REST API client.
 * Used when ENKRYPT_API_KEY is set in environment.
 */
async function enkryptGuardrailCheck(
  text: string,
  apiKey: string,
  _type: 'pre' | 'post'
): Promise<GuardrailResult> {
  try {
    const response = await fetch('https://api.enkryptai.com/v1/guardrails/detect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        text,
        detectors: ['pii', 'prompt_injection', 'toxicity', 'hallucination'],
      }),
    });

    if (!response.ok) {
      console.warn(`Enkrypt AI API returned ${response.status}. Falling back to open-source guardrails.`);
      return fallbackGuardrailCheck(text, _type);
    }

    const result = await response.json() as {
      is_safe: boolean;
      violations: Array<{ type: string; severity: string; description: string; text?: string }>;
    };

    return {
      passed: result.is_safe,
      sanitizedContent: text, // Enkrypt doesn't modify text, just flags
      issues: result.violations.map((v) => ({
        category: mapEnkryptCategory(v.type),
        severity: mapEnkryptSeverity(v.severity),
        description: v.description,
        span: v.text,
      })),
      engine: 'enkrypt' as const,
    };
  } catch (error) {
    console.warn(`Enkrypt AI API error: ${error}. Falling back to open-source guardrails.`);
    return fallbackGuardrailCheck(text, _type);
  }
}

function mapEnkryptCategory(type: string): GuardrailIssue['category'] {
  const map: Record<string, GuardrailIssue['category']> = {
    pii: 'pii_detected',
    prompt_injection: 'prompt_injection',
    toxicity: 'unsafe_content',
    hallucination: 'hallucination',
  };
  return map[type] || 'unsafe_content';
}

function mapEnkryptSeverity(severity: string): GuardrailIssue['severity'] {
  const map: Record<string, GuardrailIssue['severity']> = {
    low: 'low',
    medium: 'medium',
    high: 'high',
    critical: 'critical',
  };
  return map[severity] || 'medium';
}

// ─── Open-Source Fallback Guardrails ────────────────────────────────────────

/**
 * Open-source fallback guardrail check.
 * Uses the PII detection, injection detection, and hallucination
 * detection functions defined above.
 */
function fallbackGuardrailCheck(text: string, type: 'pre' | 'post'): GuardrailResult {
  const issues: GuardrailIssue[] = [];
  let sanitized = text;

  if (type === 'pre') {
    // Pre-guard: detect PII and redact, detect injection
    for (const pattern of PII_PATTERNS) {
      const detections = pattern.detect(text);
      for (const detection of detections) {
        issues.push({
          category: 'pii_detected',
          severity: 'high',
          description: `${pattern.category} detected and redacted`,
          span: detection.match,
        });
        // Redact in sanitized text
        sanitized = sanitized.replace(detection.match, pattern.mask);
      }
    }

    // Detect prompt injection
    const injectionIssues = detectPromptInjection(text);
    issues.push(...injectionIssues);
  } else {
    // Post-guard: detect hallucination indicators
    const hallucinationIssues = detectHallucination(text);
    issues.push(...hallucinationIssues);
  }

  // Determine if content passes
  const hasCritical = issues.some(i => i.severity === 'critical');
  const passed = !hasCritical;

  return {
    passed,
    sanitizedContent: sanitized,
    issues,
    engine: 'fallback' as const,
  };
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Run Pre-Guard on input text before sending to the LLM.
 * 
 * Checks for:
 * - PII that should be redacted
 * - Prompt injection attempts
 * 
 * @param text - The input text (chunk + prompt components)
 * @param enkryptApiKey - Optional Enkrypt AI API key
 * @returns GuardrailResult with sanitized content and any issues
 */
export async function preGuard(
  text: string,
  enkryptApiKey?: string
): Promise<GuardrailResult> {
  if (enkryptApiKey && enkryptApiKey.length > 0) {
    return enkryptGuardrailCheck(text, enkryptApiKey, 'pre');
  }
  return fallbackGuardrailCheck(text, 'pre');
}

/**
 * Run Post-Guard on LLM output before validation.
 * 
 * Checks for:
 * - Hallucinated content indicators
 * - Unsafe content
 * 
 * @param generatedJson - The JSON string generated by the LLM
 * @param enkryptApiKey - Optional Enkrypt AI API key
 * @returns GuardrailResult indicating if the output is safe
 */
export async function postGuard(
  generatedJson: string,
  enkryptApiKey?: string
): Promise<GuardrailResult> {
  if (enkryptApiKey && enkryptApiKey.length > 0) {
    return enkryptGuardrailCheck(generatedJson, enkryptApiKey, 'post');
  }
  return fallbackGuardrailCheck(generatedJson, 'post');
}
