import type {
  ChatMessage,
  AssessmentMode,
  Disposition6R,
  DecisionReadiness,
  TrustIndicators,
  EnterpriseDna,
  EnterpriseWorkload,
  Interaction,
} from '../types';
import type { AgentToolExecution, SpecialistAgentId } from './agents/types';
import { redactSecrets } from './guardrails';
import {
  assessmentResponseSchema,
  chatResponseSchema,
  followUpResponseSchema,
  titleResponseSchema,
} from './schemas';
import { auth } from './firebase';
import type { z } from 'zod';

async function authenticatedHeaders(): Promise<HeadersInit> {
  const user = auth.currentUser;
  if (!user) throw new Error('Your session has expired. Please sign in again.');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${await user.getIdToken()}`,
  };
}

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

export type AssessmentChatResponse = z.infer<typeof assessmentResponseSchema>;
export type FollowUpChatResponse = z.infer<typeof followUpResponseSchema>;
export type ChatResponse = AssessmentChatResponse | FollowUpChatResponse;

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
    headers: await authenticatedHeaders(),
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
    const error = new Error(data.error || `Server returned error (${res.status}) while generating modernization assessment with Gemini.`);
    (error as any).code = data.code;
    throw error;
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
      headers: await authenticatedHeaders(),
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

export interface AskEmosApiResponse {
  id: string;
  question: string;
  workloadId: string;
  workloadName: string;
  stage: string;
  routedAgents: SpecialistAgentId[];
  handoffOccurred: boolean;
  governanceIntercepted: boolean;
  recommended6R: Disposition6R;
  decisionReadiness: DecisionReadiness;
  evidenceCompleteness: number;
  confidenceScore: number;
  conclusion: string;
  bullets: string[];
  nextAction: string;
  evidenceSummary: string;
  reasoningSummary: string;
  toolsCalled: AgentToolExecution[];
  timestamp: string;
  isLiveGemini?: boolean;
  executionMode: 'live-gemini' | 'deterministic-fallback' | 'deterministic-governance-block';
  modelsUsed?: string[];
}

export async function askEmosWithGemini(params: {
  question: string;
  workload: EnterpriseWorkload;
  currentStage?: string;
  estateName?: string;
  activeInteraction?: Interaction | null;
}): Promise<AskEmosApiResponse> {
  const res = await fetch('/api/ask-emos', {
    method: 'POST',
    headers: await authenticatedHeaders(),
    body: JSON.stringify({
      question: params.question,
      workload: params.workload,
      currentStage: params.currentStage,
      estateName: params.estateName,
      activeInteraction: params.activeInteraction ?? null,
    }),
  });

  if (!res.ok) {
    throw new Error(`ASK_EMOS_HTTP_${res.status}`);
  }

  return (await res.json()) as AskEmosApiResponse;
}

// Backward compatibility export
export const generateReflectionMeta = generateAssessmentMeta;
