import { GoogleGenAI } from '@google/genai';
import { redactSecrets } from '../guardrails';

/**
 * Shared server-side Gemini fallback ladder matching server.ts.
 * Must ONLY be invoked in Node.js (server.ts or local eval runners) — NEVER in browser bundles.
 */
export const GEMINI_FALLBACK_MODELS = [
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-2.0-flash',
  'gemini-3.6-flash',
] as const;

export interface GeminiTokenUsage {
  promptTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface GeminiCallResult {
  text: string;
  modelUsed: string;
  latencyMs: number;
  tokenUsage?: GeminiTokenUsage;
}

export type GeminiFailureCode =
  | 'api_key_missing'
  | 'timeout'
  | 'model_unavailable'
  | 'malformed_json'
  | 'schema_validation_failed';

export class GeminiAgentError extends Error {
  code: GeminiFailureCode;
  modelAttempted?: string;

  constructor(code: GeminiFailureCode, message: string, modelAttempted?: string) {
    super(message);
    this.name = 'GeminiAgentError';
    this.code = code;
    this.modelAttempted = modelAttempted;
  }
}

export type StructuredModelCaller = (params: {
  systemInstruction: string;
  userPrompt: string;
  temperature?: number;
  timeoutMs?: number;
}) => Promise<GeminiCallResult>;

let cachedAiClient: GoogleGenAI | null = null;
let cachedApiKey: string | undefined;

function getServerGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new GeminiAgentError(
      'api_key_missing',
      'GEMINI_API_KEY is not configured in the server environment.',
    );
  }
  if (!cachedAiClient || cachedApiKey !== apiKey) {
    cachedAiClient = new GoogleGenAI({ apiKey });
    cachedApiKey = apiKey;
  }
  return cachedAiClient;
}

/**
 * Calls the configured Gemini model ladder requesting strict JSON output,
 * enforcing a bounded timeout and capturing real latency and token metadata.
 */
export async function callGeminiStructuredJson(params: {
  systemInstruction: string;
  userPrompt: string;
  temperature?: number;
  timeoutMs?: number;
}): Promise<GeminiCallResult> {
  const ai = getServerGeminiClient();
  const timeoutMs = params.timeoutMs ?? 20_000;
  let lastError: unknown = null;
  let lastModel: string | undefined;

  for (const model of GEMINI_FALLBACK_MODELS) {
    lastModel = model;
    const t0 = performance.now();
    try {
      const callPromise = ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: params.userPrompt }] }],
        config: {
          systemInstruction: params.systemInstruction,
          responseMimeType: 'application/json',
          temperature: params.temperature ?? 0.2,
        },
      });

      const response = await Promise.race([
        callPromise,
        new Promise<never>((_, reject) =>
          setTimeout(
            () =>
              reject(
                new GeminiAgentError(
                  'timeout',
                  `Gemini model ${model} timed out after ${timeoutMs}ms.`,
                  model,
                ),
              ),
            timeoutMs,
          ),
        ),
      ]);

      const latencyMs = Math.round((performance.now() - t0) * 100) / 100;
      const usageMeta: any = (response as any)?.usageMetadata;
      const tokenUsage: GeminiTokenUsage | undefined =
        usageMeta && typeof usageMeta.totalTokenCount === 'number'
          ? {
              promptTokens: Number(usageMeta.promptTokenCount ?? 0),
              outputTokens: Number(usageMeta.candidatesTokenCount ?? 0),
              totalTokens: Number(usageMeta.totalTokenCount ?? 0),
            }
          : undefined;

      return {
        text: response.text ?? '',
        modelUsed: model,
        latencyMs,
        tokenUsage,
      };
    } catch (err: any) {
      if (err instanceof GeminiAgentError && err.code === 'timeout') {
        lastError = err;
        continue;
      }
      lastError = err;
    }
  }

  if (lastError instanceof GeminiAgentError) {
    throw lastError;
  }

  const msg = redactSecrets(
    lastError instanceof Error ? lastError.message : String(lastError || 'Unknown error'),
  );
  throw new GeminiAgentError(
    'model_unavailable',
    `All Gemini fallback models failed. Last error: ${msg}`,
    lastModel,
  );
}

/**
 * Safely parses JSON from Gemini output (stripping markdown code fences if present).
 */
export function parseStructuredJson(rawText: string, modelUsed?: string): unknown {
  const cleaned = rawText
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  if (!cleaned) {
    throw new GeminiAgentError(
      'malformed_json',
      'Model returned an empty structured response.',
      modelUsed,
    );
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new GeminiAgentError(
      'malformed_json',
      `Model returned malformed JSON: ${err instanceof Error ? err.message : String(err)}`,
      modelUsed,
    );
  }
}
