import type {
  ChatMessage,
  AssessmentMode,
  Disposition6R,
  DecisionReadiness,
  TrustIndicators,
  EnterpriseDna,
} from '../types';
import {
  validateAndReconcileAssessment,
  validateOrRepair6RDisposition,
  redactSecrets,
} from './guardrails';

export interface AssessmentAttributes {
  recommended6R?: Disposition6R;
  confidenceScore?: number;
  evidenceCompleteness?: number;
  decisionReadiness?: DecisionReadiness;
  workloadName?: string;
  isGrounded?: boolean;
  wasRepaired?: boolean;
  repairedReasons?: string[];
  trustIndicators?: TrustIndicators;
}

export interface ChatResponse {
  response: string;
  modelUsed: string;
  attributes?: AssessmentAttributes;
  trustIndicators?: TrustIndicators;
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

// Canonical Assessment Attributes Extractor (Single Source of Truth & Guardrail Enforced)
export function extractAssessmentAttributes(
  text: string,
  deterministicCompleteness?: number,
  workloadDna?: EnterpriseDna
): AssessmentAttributes {
  if (!text) return {};

  // 1. Recommended 6R Disposition (Raw match)
  const r6Match = text.match(/(?:Recommended\s+6R\s+Disposition|6R\s+Disposition|Recommended\s+Disposition)\s*:\*{0,2}\s*(?:\*\*)?\s*([A-Za-z]+)/i);
  const rawCandidate = r6Match ? r6Match[1].trim() : undefined;
  const { disposition, wasRepaired: was6RRepaired, reason: r6Reason } = validateOrRepair6RDisposition(rawCandidate, text);

  // 2. Confidence Score
  const confMatch = text.match(/(?:Confidence\s+Score|Confidence)\s*:\*{0,2}\s*(?:\*\*)?\s*(\d{1,3})%?/i);
  let confidenceScore: number | undefined;
  if (confMatch) {
    const val = parseInt(confMatch[1], 10);
    if (!isNaN(val) && val >= 0 && val <= 100) {
      confidenceScore = val;
    }
  }

  // 3. Evidence Completeness
  const compMatch = text.match(/(?:Evidence\s+Completeness|Completeness)\s*:\*{0,2}\s*(?:\*\*)?\s*(\d{1,3})%?/i);
  let evidenceCompleteness: number | undefined;
  if (compMatch) {
    const val = parseInt(compMatch[1], 10);
    if (!isNaN(val) && val >= 0 && val <= 100) {
      evidenceCompleteness = val;
    }
  }

  // 4. Decision Readiness
  const readyMatch = text.match(/Decision\s+Readiness\s*:\*{0,2}\s*(?:\*\*)?\s*(READY|NEEDS\s+EVIDENCE)/i);
  let decisionReadiness: DecisionReadiness | undefined;
  if (readyMatch) {
    decisionReadiness = readyMatch[1].toUpperCase().includes('NEEDS') ? 'NEEDS EVIDENCE' : 'READY';
  }

  // 5. Workload / Application Name
  const workMatch = text.match(/(?:Workload\s*\/\s*Application|Application|Workload)\s*:\*{0,2}\s*(?:\*\*)?\s*([^\n\r*]+)/i);
  let workloadName: string | undefined;
  if (workMatch) {
    const raw = workMatch[1].trim().replace(/^\[|\]$/g, '').replace(/^\*+|\*+$/g, '').trim();
    if (raw && !raw.toLowerCase().includes('identified or inferred')) {
      workloadName = raw;
    }
  }

  // Run comprehensive guardrail reconciliation
  const reconciled = validateAndReconcileAssessment({
    rawText: text,
    rawAttributes: {
      recommended6R: disposition,
      confidenceScore,
      evidenceCompleteness,
      decisionReadiness,
      workloadName,
    },
    deterministicCompleteness,
    workloadDna,
  });

  const repairedReasons = [...reconciled.repairedReasons];
  if (was6RRepaired && r6Reason && !repairedReasons.includes(r6Reason)) {
    repairedReasons.push(r6Reason);
  }

  return {
    recommended6R: reconciled.recommended6R,
    confidenceScore: reconciled.confidenceScore,
    evidenceCompleteness: reconciled.evidenceCompleteness,
    decisionReadiness: reconciled.decisionReadiness,
    workloadName: reconciled.workloadName,
    isGrounded: reconciled.isGrounded,
    wasRepaired: reconciled.wasRepaired || was6RRepaired,
    repairedReasons,
    trustIndicators: {
      inputValidated: true,
      evidenceGrounded: reconciled.isGrounded,
      schemaValidated: true,
      wasRepaired: reconciled.wasRepaired || was6RRepaired,
    },
  };
}

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

  return json;
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

    return res.json();
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

