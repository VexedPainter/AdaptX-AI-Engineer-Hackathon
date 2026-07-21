/**
 * Stage 06 — Constrained LLM Extraction
 * 
 * Calls the LLM with structured output mode to extract JSON.
 * Features:
 * - Primary: Mistral (open-mistral-nemo, large token limits)
 * - Fallbacks: Cerebras → Groq → Google Gemini
 * - Provider-aware rate limiting (Mistral/Cerebras/Groq: 30-60 RPM, Gemini: 15 RPM)
 * - Intelligent retry with retryDelay parsing from 429 responses
 * - Logs prompt hash, token usage, latency per call
 * 
 * @module stage06-extraction
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { Mistral } from '@mistralai/mistralai';
import OpenAI from 'openai';
import { createHash } from 'crypto';
import type { ExtractionResult } from '../types/index.js';
import type { AssembledPrompt } from '../stage04-prompt-assembly/index.js';

// ─── Rate Limiter ───────────────────────────────────────────────────────────

/**
 * Token-bucket rate limiter. Provider-aware.
 * Queues requests and waits instead of erroring on 429.
 */
class RateLimiter {
  private tokens: number;
  private readonly maxTokens: number;
  private readonly refillIntervalMs: number;
  private lastRefill: number;
  private waitQueue: Array<() => void> = [];

  constructor(maxRequestsPerMinute: number) {
    this.maxTokens = maxRequestsPerMinute;
    this.tokens = maxRequestsPerMinute;
    this.refillIntervalMs = 60_000 / maxRequestsPerMinute;
    this.lastRefill = Date.now();
  }

  async acquire(): Promise<void> {
    this.refillTokens();

    if (this.tokens > 0) {
      this.tokens--;
      return;
    }

    return new Promise<void>((resolve) => {
      this.waitQueue.push(resolve);
      setTimeout(() => this.processWaitQueue(), this.refillIntervalMs);
    });
  }

  private refillTokens(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const tokensToAdd = Math.floor(elapsed / this.refillIntervalMs);

    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
      this.lastRefill = now;
    }
  }

  private processWaitQueue(): void {
    this.refillTokens();

    while (this.tokens > 0 && this.waitQueue.length > 0) {
      this.tokens--;
      const resolve = this.waitQueue.shift()!;
      resolve();
    }

    if (this.waitQueue.length > 0) {
      setTimeout(() => this.processWaitQueue(), this.refillIntervalMs);
    }
  }
}

// ─── Retry Delay Parser ─────────────────────────────────────────────────────

function parseRetryDelay(errorMessage: string): number {
  const retryMatch = errorMessage.match(/(?:retry|try again) in (\d+(?:\.\d+)?)s/i);
  if (retryMatch) {
    return Math.ceil(parseFloat(retryMatch[1]) * 1000);
  }

  const jsonMatch = errorMessage.match(/"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/);
  if (jsonMatch) {
    return Math.ceil(parseFloat(jsonMatch[1]) * 1000);
  }

  return 0;
}

// ─── Extraction Engine ──────────────────────────────────────────────────────

export interface ExtractionConfig {
  mistralApiKey?: string;
  cerebrasApiKey?: string;
  groqApiKey?: string;
  geminiApiKey: string;
  temperature: number;
  topP: number;
  rateLimitRpm: number;
}

export class ExtractionEngine {
  private mistral: Mistral | null = null;
  private cerebras: OpenAI | null = null;
  private groq: Groq | null = null;
  private gemini: GoogleGenerativeAI;
  
  private mistralRateLimiter: RateLimiter;
  private cerebrasRateLimiter: RateLimiter;
  private groqRateLimiter: RateLimiter;
  private geminiRateLimiter: RateLimiter;
  
  private config: ExtractionConfig;

  constructor(extractionConfig: ExtractionConfig) {
    this.config = extractionConfig;
    this.gemini = new GoogleGenerativeAI(extractionConfig.geminiApiKey);

    // Provider-aware rate limiters
    this.mistralRateLimiter = new RateLimiter(30);
    this.cerebrasRateLimiter = new RateLimiter(30);
    this.groqRateLimiter = new RateLimiter(30);
    this.geminiRateLimiter = new RateLimiter(15);

    if (extractionConfig.mistralApiKey) {
      this.mistral = new Mistral({ apiKey: extractionConfig.mistralApiKey });
    }
    if (extractionConfig.cerebrasApiKey) {
      this.cerebras = new OpenAI({ 
        apiKey: extractionConfig.cerebrasApiKey,
        baseURL: 'https://api.cerebras.ai/v1'
      });
    }
    if (extractionConfig.groqApiKey) {
      this.groq = new Groq({ apiKey: extractionConfig.groqApiKey });
    }
  }

  async extract(prompt: AssembledPrompt): Promise<ExtractionResult> {
    const promptHash = hashPrompt(prompt.userMessage);
    const startTime = Date.now();

    // 1. Mistral
    if (this.mistral) {
      try {
        await this.mistralRateLimiter.acquire();
        return await this.extractWithMistral(prompt, promptHash, startTime);
      } catch (error) {
        const err = error as Error;
        console.warn(`⚠️  Mistral extraction failed: ${err.message.substring(0, 120)}`);
        if (err.message.includes('429')) {
          const delay = parseRetryDelay(err.message);
          if (delay > 0) console.warn(`   ⏳ Mistral rate limited. Suggested wait: ${(delay / 1000).toFixed(1)}s`);
        }
      }
    }

    // 2. Cerebras
    if (this.cerebras) {
      try {
        await this.cerebrasRateLimiter.acquire();
        return await this.extractWithCerebras(prompt, promptHash, startTime);
      } catch (error) {
        const err = error as Error;
        console.warn(`⚠️  Cerebras extraction failed: ${err.message.substring(0, 120)}`);
        if (err.message.includes('429')) {
          const delay = parseRetryDelay(err.message);
          if (delay > 0) console.warn(`   ⏳ Cerebras rate limited. Suggested wait: ${(delay / 1000).toFixed(1)}s`);
        }
      }
    }

    // 3. Groq
    if (this.groq) {
      try {
        await this.groqRateLimiter.acquire();
        return await this.extractWithGroq(prompt, promptHash, startTime);
      } catch (error) {
        const err = error as Error;
        console.warn(`⚠️  Groq extraction failed: ${err.message.substring(0, 120)}`);
        if (err.message.includes('429')) {
          const delay = parseRetryDelay(err.message);
          if (delay > 0) console.warn(`   ⏳ Groq rate limited. Suggested wait: ${(delay / 1000).toFixed(1)}s`);
        }
      }
    }

    // 4. Gemini (Fallback)
    try {
      await this.geminiRateLimiter.acquire();
      return await this.extractWithGemini(prompt, promptHash, startTime);
    } catch (error) {
      const err = error as Error;
      if (err.message.includes('429')) {
        const delay = parseRetryDelay(err.message);
        if (delay > 0) (err as any)._parsedRetryDelayMs = delay;
      }
      throw err;
    }
  }

  static getRetryDelay(error: Error, retryCount: number): number {
    const parsedDelay = (error as any)?._parsedRetryDelayMs || 0;
    const exponentialBackoff = Math.pow(2, retryCount) * 1000;
    return Math.max(parsedDelay, exponentialBackoff);
  }

  private async extractWithMistral(prompt: AssembledPrompt, promptHash: string, startTime: number): Promise<ExtractionResult> {
    if (!this.mistral) throw new Error('Mistral client not initialized');
    const modelStr = 'mistral-large-latest';
    const chatResponse = await this.mistral.chat.complete({
      model: modelStr,
      messages: [
        { role: 'system', content: prompt.systemMessage },
        { role: 'user', content: prompt.userMessage },
      ],
      temperature: this.config.temperature,
      topP: this.config.topP,
      responseFormat: { type: 'json_object' },
    });
    
    const text = (chatResponse.choices?.[0]?.message?.content || '{}') as string;
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Mistral returned non-JSON: ${text.substring(0, 200)}`);
    }

    return {
      data,
      tokenUsage: {
        promptTokens: chatResponse.usage?.promptTokens ?? 0,
        completionTokens: chatResponse.usage?.completionTokens ?? 0,
        totalTokens: chatResponse.usage?.totalTokens ?? 0,
      },
      provider: 'mistral',
      model: modelStr,
      temperature: this.config.temperature,
      topP: this.config.topP,
      promptHash,
      latencyMs: Date.now() - startTime,
    };
  }

  private async extractWithCerebras(prompt: AssembledPrompt, promptHash: string, startTime: number): Promise<ExtractionResult> {
    if (!this.cerebras) throw new Error('Cerebras client not initialized');
    const modelStr = 'llama3.1-8b';
    const response = await this.cerebras.chat.completions.create({
      model: modelStr,
      messages: [
        { role: 'system', content: prompt.systemMessage },
        { role: 'user', content: prompt.userMessage },
      ],
      temperature: this.config.temperature,
      top_p: this.config.topP,
      response_format: { type: 'json_object' },
    });
    
    const text = response.choices[0]?.message?.content || '{}';
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Cerebras returned non-JSON: ${text.substring(0, 200)}`);
    }

    return {
      data,
      tokenUsage: {
        promptTokens: response.usage?.prompt_tokens ?? 0,
        completionTokens: response.usage?.completion_tokens ?? 0,
        totalTokens: response.usage?.total_tokens ?? 0,
      },
      provider: 'cerebras',
      model: modelStr,
      temperature: this.config.temperature,
      topP: this.config.topP,
      promptHash,
      latencyMs: Date.now() - startTime,
    };
  }

  private async extractWithGroq(prompt: AssembledPrompt, promptHash: string, startTime: number): Promise<ExtractionResult> {
    if (!this.groq) throw new Error('Groq client not initialized');
    const modelStr = 'llama-3.1-8b-instant';
    const response = await this.groq.chat.completions.create({
      model: modelStr,
      messages: [
        { role: 'system', content: prompt.systemMessage },
        { role: 'user', content: prompt.userMessage },
      ],
      temperature: this.config.temperature,
      top_p: this.config.topP,
      response_format: { type: 'json_object' },
    });
    
    const text = response.choices[0]?.message?.content || '{}';
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Groq returned non-JSON: ${text.substring(0, 200)}`);
    }

    return {
      data,
      tokenUsage: {
        promptTokens: response.usage?.prompt_tokens ?? 0,
        completionTokens: response.usage?.completion_tokens ?? 0,
        totalTokens: response.usage?.total_tokens ?? 0,
      },
      provider: 'groq',
      model: modelStr,
      temperature: this.config.temperature,
      topP: this.config.topP,
      promptHash,
      latencyMs: Date.now() - startTime,
    };
  }

  private async extractWithGemini(prompt: AssembledPrompt, promptHash: string, startTime: number): Promise<ExtractionResult> {
    const modelStr = 'gemini-2.0-flash';
    const model = this.gemini.getGenerativeModel({
      model: modelStr,
      generationConfig: {
        temperature: this.config.temperature,
        topP: this.config.topP,
        responseMimeType: 'application/json',
      },
    });

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: prompt.systemMessage + '\n\n' + prompt.userMessage }],
      }],
    });

    const text = result.response.text();
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Gemini returned non-JSON: ${text.substring(0, 200)}`);
    }

    const usage = result.response.usageMetadata;
    return {
      data,
      tokenUsage: {
        promptTokens: usage?.promptTokenCount ?? 0,
        completionTokens: usage?.candidatesTokenCount ?? 0,
        totalTokens: usage?.totalTokenCount ?? 0,
      },
      provider: 'gemini',
      model: modelStr,
      temperature: this.config.temperature,
      topP: this.config.topP,
      promptHash,
      latencyMs: Date.now() - startTime,
    };
  }
}

function hashPrompt(prompt: string): string {
  return createHash('sha256').update(prompt).digest('hex').substring(0, 16);
}
