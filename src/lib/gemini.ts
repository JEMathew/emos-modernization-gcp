import type {
  ChatMessage,
  AssessmentMode,
  Disposition6R,
  DecisionReadiness,
  TrustIndicators,
  EnterpriseDna,
} from '../types';
import { redactSecrets } from './guardrails';
import { chatResponseSchema, titleResponseSchema } from './schemas';

export interface AssessmentAttributes {
  recommended6R: Disposition6R;
  confidenceScore: number;
  evidenceCompleteness: number;
  decisionReadiness: DecisionReadiness;
  workloadName?: string;
  isGrounded: boolean;
  wasRepaired: boolean;
  repairedReasons: string[];
  trustIndicators: TrustIndicators;
}

export interface ChatResponse {
  response: string;
  sanitizedInput: string;
  modelUsed: string;
  attributes: AssessmentAttributes;
  trustIndicators: TrustIndicators;
}

export interface AssessmentMetaResponse {
  title: string;
  category: string;
  workloadName?: string;
  recommended6R?: Disposition6R | string;
  decisionReadiness?: DecisionReadiness | string;
  confidenceScore?: number;
  evidenceCompleteness?: number;
}

export type TitleResponse = AssessmentMetaResponse;

export async function chatWithGemini(params: {
  message: string;
  history?: ChatMessage[];
  mode: AssessmentMode;
  deterministicCompleteness?: number;
  workloadDna?: EnterpriseDna;
}): Promise<ChatResponse> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: params.message,
      history: params.history || [],
      mode: params.mode,
      deterministicCompleteness: params.deterministicCompleteness,
      workloadDna: params.workloadDna,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Server returned error (${res.status}) while generating modernization assessment with Gemini.`);
  }

  const json = await res.json();
  // Ensure client-side secret redaction safety layer
  if (json.response) {
    json.response = redactSecrets(json.response);
  }

  return chatResponseSchema.parse(json) as ChatResponse;
}

export async function generateAssessmentMeta(content: string): Promise<AssessmentMetaResponse> {
  try {
    const res = await fetch('/api/summarize-title', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!res.ok) {
      return {
        title: 'Modernization Assessment ' + new Date().toLocaleDateString(),
        category: 'Legacy Application',
      };
    }

    return titleResponseSchema.parse(await res.json()) as AssessmentMetaResponse;
  } catch (err) {
    console.warn('Could not generate automatic assessment metadata:', err);
    return {
      title: 'Modernization Assessment ' + new Date().toLocaleDateString(),
      category: 'Legacy Application',
    };
  }
}

// Backward compatibility export
export const generateReflectionMeta = generateAssessmentMeta;
