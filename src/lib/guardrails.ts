import type {
  Disposition6R,
  DecisionReadiness,
  EnterpriseDna,
  EnterpriseWorkload,
} from '../types';

/**
 * EMOS — Enterprise Modernization Operating System
 * Production Guardrails Layer
 *
 * Enforces zero-trust input validation, prompt-injection defense,
 * canonical 6R taxonomy contract, deterministic evidence fidelity,
 * vendor-neutral grounding, and secret redaction.
 */

// Canonical 6R Modernization Taxonomy (Amazon/Gartner enterprise standard)
export const CANONICAL_6R: readonly Disposition6R[] = [
  'Retain',
  'Retire',
  'Rehost',
  'Replatform',
  'Refactor',
  'Repurchase',
] as const;

// Maximum acceptable prompt / message character length to prevent buffer and DoS attacks
export const MAX_PROMPT_LENGTH = 12000;

// Maximum text field length in imported enterprise portfolio records
export const MAX_FIELD_LENGTH = 2000;
export const MAX_NAME_LENGTH = 250;
export const MAX_ID_LENGTH = 100;

// Prompt injection and adversarial instruction detection signatures
const INJECTION_SIGNATURES = [
  /\bignore\s+(all\s+|previous\s+|prior\s+|system\s+)?instructions\b/i,
  /\bdisregard\s+(all\s+|previous\s+|prior\s+)?instructions\b/i,
  /\bforget\s+(all\s+|everything\s+|previous\s+)?(rules|instructions|prompts)\b/i,
  /\brepeat\s+(all\s+|the\s+)?(system\s+prompt|instructions|initial\s+prompt)\b/i,
  /\breveal\s+(the\s+)?(gemini|api|secret|backend|server)?\s*(key|token|secret|env|password)\b/i,
  /\bshow\s+(me\s+)?(the\s+)?(api[_\s]?key|gemini[_\s]?key|credentials|secret)\b/i,
  /\b(process\.env|process\[['"]env['"]\]|GEMINI_API_KEY)\b/i,
  /\bforce\s+(100%|100\s*percent|full)\s+confidence\b/i,
  /\bforce\s+(decision\s+readiness\s+)?ready\b/i,
  /\bmark\s+(as\s+)?ready\s+without\s+evidence\b/i,
  /\boverride\s+(all\s+)?(rules|security|governance|taxonomy)\b/i,
  /\byou\s+are\s+now\s+(in\s+)?(dan|jailbreak|developer|unconstrained)\s+mode\b/i,
  /\b(bypass|disable)\s+(guardrails|security|safety)\b/i,
];

export interface PromptValidationResult {
  isValid: boolean;
  sanitizedMessage: string;
  injectionDetected: boolean;
  detectedSignatures: string[];
  securityNotice?: string;
}

/**
 * 1. PROMPT-INJECTION GUARDRAIL
 * Detects adversarial instructions and encloses untrusted user input within
 * a strictly enforced security boundary fence.
 */
export function validateAndFenceUserPrompt(rawInput: string): PromptValidationResult {
  if (typeof rawInput !== 'string') {
    return {
      isValid: false,
      sanitizedMessage: '',
      injectionDetected: false,
      detectedSignatures: [],
      securityNotice: 'Input must be a valid text string.',
    };
  }

  // Length truncation to prevent buffer attacks
  const trimmed = rawInput.trim();
  const boundedInput = trimmed.length > MAX_PROMPT_LENGTH
    ? trimmed.slice(0, MAX_PROMPT_LENGTH) + '\n[TRUNCATED_DUE_TO_LENGTH_LIMIT]'
    : trimmed;

  const detectedSignatures: string[] = [];
  for (const regex of INJECTION_SIGNATURES) {
    if (regex.test(boundedInput)) {
      detectedSignatures.push(regex.source);
    }
  }

  const injectionDetected = detectedSignatures.length > 0;

  // Defense-in-depth: If injection attempt detected, sanitize known command tokens
  let neutralized = boundedInput;
  if (injectionDetected) {
    neutralized = boundedInput
      .replace(/ignore\s+(all\s+|previous\s+|prior\s+)?instructions/gi, '[ADVERSARIAL_DIRECTIVE_STRIPPED]')
      .replace(/reveal\s+(the\s+)?(gemini|api)?\s*(key|secret)/gi, '[SECURITY_EXTRACTION_STRIPPED]')
      .replace(/force\s+(100%|ready)/gi, '[OVERRIDE_STRIPPED]');
  }

  // Strict Security Boundary Fence
  const securityFenceNotice = injectionDetected
    ? '\n[SECURITY NOTICE]: Adversarial prompt pattern detected and neutralized. Analyzing underlying architecture facts only.\n'
    : '';

  const fencedMessage = `<untrusted_enterprise_evidence security_boundary="strict">
${neutralized}
</untrusted_enterprise_evidence>${securityFenceNotice}`;

  return {
    isValid: true,
    sanitizedMessage: fencedMessage,
    injectionDetected,
    detectedSignatures,
    securityNotice: injectionDetected
      ? 'Adversarial instruction patterns were detected and neutralized. Assessment will be grounded strictly in verified enterprise evidence.'
      : undefined,
  };
}

/**
 * 2. CANONICAL 6R TAXONOMY GUARDRAIL
 * Enforces exactly one primary disposition from the canonical 6R framework.
 * Disallows "Rebuild" as a standalone 6R (mapping it to Refactor).
 * Disallows "Relocate" as a standalone 6R (mapping it to Rehost).
 */
export function validateOrRepair6RDisposition(
  rawCandidate: string | undefined,
  fullText?: string
): { disposition: Disposition6R; wasRepaired: boolean; original?: string; reason?: string } {
  if (!rawCandidate) {
    // Attempt extraction from full text if provided
    if (fullText) {
      const match = fullText.match(/(?:Recommended\s+6R\s+Disposition|6R\s+Disposition|Recommended\s+Disposition)\s*:\*{0,2}\s*(?:\*\*)?\s*([A-Za-z]+)/i);
      if (match) {
        return validateOrRepair6RDisposition(match[1], undefined);
      }
    }
    return {
      disposition: 'Replatform',
      wasRepaired: true,
      original: undefined,
      reason: 'No 6R disposition found in response; defaulted to canonical Replatform.',
    };
  }

  const cleaned = rawCandidate.trim().replace(/^[*_`]+|[*_`]+$/g, '');
  const match = CANONICAL_6R.find((d) => d.toLowerCase() === cleaned.toLowerCase());

  if (match) {
    return { disposition: match, wasRepaired: false, original: cleaned };
  }

  // Canonical Repair Mapping
  const lower = cleaned.toLowerCase();
  if (lower.includes('rebuild') || lower.includes('rewrite') || lower.includes('modernize')) {
    return {
      disposition: 'Refactor',
      wasRepaired: true,
      original: cleaned,
      reason: 'Unsupported disposition "Rebuild/Rewrite" mapped to canonical Refactor.',
    };
  }

  if (lower.includes('relocate') || lower.includes('lift') || lower.includes('shift') || lower.includes('migrate')) {
    return {
      disposition: 'Rehost',
      wasRepaired: true,
      original: cleaned,
      reason: 'Unsupported disposition "Relocate/Lift-and-shift" mapped to canonical Rehost.',
    };
  }

  if (lower.includes('saas') || lower.includes('buy') || lower.includes('vendor') || lower.includes('commercial')) {
    return {
      disposition: 'Repurchase',
      wasRepaired: true,
      original: cleaned,
      reason: 'Term mapped to canonical Repurchase.',
    };
  }

  if (lower.includes('sunset') || lower.includes('decommission') || lower.includes('archive') || lower.includes('kill')) {
    return {
      disposition: 'Retire',
      wasRepaired: true,
      original: cleaned,
      reason: 'Term mapped to canonical Retire.',
    };
  }

  if (lower.includes('keep') || lower.includes('hold') || lower.includes('maintain') || lower.includes('preserve')) {
    return {
      disposition: 'Retain',
      wasRepaired: true,
      original: cleaned,
      reason: 'Term mapped to canonical Retain.',
    };
  }

  // Fallback safe default
  return {
    disposition: 'Replatform',
    wasRepaired: true,
    original: cleaned,
    reason: `Unrecognized disposition "${cleaned}" repaired to canonical Replatform.`,
  };
}

/**
 * 3. SECRET & API KEY REDACTION GUARDRAIL
 * Prevents unintentional leakage of backend credentials, Gemini keys, or auth tokens.
 */
export function redactSecrets(text: string): string {
  if (!text) return '';

  let sanitized = text;

  // Redact Google Cloud / Gemini API Keys (starts with AIzaSy...)
  sanitized = sanitized.replace(/\bAIza[0-9A-Za-z-_]{35}\b/g, '[REDACTED_API_KEY]');

  // Redact OpenAI or standard format secret keys
  sanitized = sanitized.replace(/\b(?:sk|key|token|secret)-[A-Za-z0-9-_]{16,}\b/gi, '[REDACTED_SECRET]');

  // Redact Bearer authorization tokens
  sanitized = sanitized.replace(/Bearer\s+[A-Za-z0-9-_.]+/gi, 'Bearer [REDACTED_AUTH_TOKEN]');

  // Redact active server-side process.env.GEMINI_API_KEY if present in environment
  if (typeof process !== 'undefined' && process?.env?.GEMINI_API_KEY) {
    const key = process.env.GEMINI_API_KEY.trim();
    if (key.length > 5) {
      sanitized = sanitized.split(key).join('[REDACTED_GEMINI_KEY]');
    }
  }

  return sanitized;
}

/**
 * 4. DECISION-READINESS & DETERMINISTIC COMPLETENESS RECONCILIATION
 * Guarantees that:
 * - Evidence Completeness is deterministic and never independently altered by AI hallucinations.
 * - Decision Readiness CANNOT be 'READY' if critical evidence gaps exist or completeness < 70%.
 */
export interface ValidatedAssessmentOutput {
  workloadName?: string;
  recommended6R: Disposition6R;
  confidenceScore: number;
  evidenceCompleteness: number;
  decisionReadiness: DecisionReadiness;
  isGrounded: boolean;
  wasRepaired: boolean;
  repairedReasons: string[];
  sanitizedResponseText: string;
}

export function validateAndReconcileAssessment({
  rawText,
  rawAttributes,
  deterministicCompleteness,
  workloadDna,
}: {
  rawText: string;
  rawAttributes: {
    recommended6R?: string;
    confidenceScore?: number;
    evidenceCompleteness?: number;
    decisionReadiness?: string;
    workloadName?: string;
  };
  deterministicCompleteness?: number;
  workloadDna?: EnterpriseDna;
}): ValidatedAssessmentOutput {
  const repairedReasons: string[] = [];
  let wasRepaired = false;

  // 1. Validate & Repair 6R Disposition
  const r6Result = validateOrRepair6RDisposition(rawAttributes.recommended6R, rawText);
  if (r6Result.wasRepaired) {
    wasRepaired = true;
    if (r6Result.reason) repairedReasons.push(r6Result.reason);
  }

  // 2. Reconcile Evidence Completeness (Deterministic Authority)
  let evidenceCompleteness = typeof deterministicCompleteness === 'number'
    ? deterministicCompleteness
    : (typeof rawAttributes.evidenceCompleteness === 'number' ? rawAttributes.evidenceCompleteness : 35);

  // Clamp completeness to 0-100
  if (evidenceCompleteness < 0) evidenceCompleteness = 0;
  if (evidenceCompleteness > 100) evidenceCompleteness = 100;

  if (
    typeof deterministicCompleteness === 'number' &&
    typeof rawAttributes.evidenceCompleteness === 'number' &&
    rawAttributes.evidenceCompleteness !== deterministicCompleteness
  ) {
    wasRepaired = true;
    repairedReasons.push(
      `Reconciled AI completeness (${rawAttributes.evidenceCompleteness}%) with authoritative deterministic baseline (${deterministicCompleteness}%).`
    );
  }

  // 3. Confidence Score Validation (0-100 numeric bounds)
  let confidence = typeof rawAttributes.confidenceScore === 'number'
    ? rawAttributes.confidenceScore
    : 55;
  if (confidence < 0) confidence = 0;
  if (confidence > 100) confidence = 100;

  // 4. Decision Readiness Guardrail
  // Critical evidence gaps MUST prevent falsely confident 'READY' status
  let readiness: DecisionReadiness = rawAttributes.decisionReadiness?.toUpperCase().includes('READY') && !rawAttributes.decisionReadiness.toUpperCase().includes('NEEDS')
    ? 'READY'
    : 'NEEDS EVIDENCE';

  // Identify critical missing evidence in DNA if provided
  let hasCriticalGaps = evidenceCompleteness < 70;
  if (workloadDna) {
    const missingTarget = workloadDna.targetState.some((f) => f.status === 'missing');
    const missingTco = workloadDna.economics.some((f) => f.id === 'e3' && f.status === 'missing');
    const incompleteDeps = workloadDna.dependency.some((f) => f.status !== 'known');
    if (missingTarget || missingTco || incompleteDeps) {
      hasCriticalGaps = true;
    }
  }

  // If critical gaps exist, enforce 'NEEDS EVIDENCE'
  if (readiness === 'READY' && hasCriticalGaps) {
    readiness = 'NEEDS EVIDENCE';
    wasRepaired = true;
    repairedReasons.push(
      'Decision Readiness repaired from READY to NEEDS EVIDENCE due to critical evidence gaps and incomplete baseline coverage.'
    );
    // Cap confidence if readiness is downgraded
    if (confidence > 75) {
      confidence = 65;
    }
  }

  // 5. Grounding check: verify that unstated cloud platforms were not hallucinated
  let isGrounded = true;
  if (workloadDna) {
    const targetCloudField = workloadDna.targetState.find((f) => f.id === 'ts1');
    const isTargetMissing = !targetCloudField || targetCloudField.status === 'missing';

    if (isTargetMissing) {
      // Check if response claimed enterprise standardized on a specific provider without evidence
      const vendorAssertionRegex = /enterprise\s+(has\s+standardized|standard|mandate)\s+on\s+(google\s+cloud|gcp|aws|azure)/i;
      if (vendorAssertionRegex.test(rawText)) {
        isGrounded = false;
        repairedReasons.push(
          'Flagged ungrounded assertion: Model claimed enterprise cloud standardization when Target Cloud Strategy was marked MISSING.'
        );
      }
    }
  }

  // 6. Redact secrets in final response text
  const sanitizedResponseText = redactSecrets(rawText);

  return {
    workloadName: rawAttributes.workloadName,
    recommended6R: r6Result.disposition,
    confidenceScore: confidence,
    evidenceCompleteness,
    decisionReadiness: readiness,
    isGrounded,
    wasRepaired,
    repairedReasons,
    sanitizedResponseText,
  };
}

/**
 * 5. PORTFOLIO RECORD SANITIZATION GUARDRAIL
 * Protects against formula injection, oversized fields, and undefined payload pollution.
 */
export function sanitizeEvidenceValue(val: unknown, maxLength = MAX_FIELD_LENGTH): string {
  if (val === null || val === undefined) return '';
  let str = String(val).trim();

  // Strip formula injection triggers (=, +, -, @, tab, cr)
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Strip non-printable ASCII control characters except newline and tab
  str = str.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

  // Truncate length
  if (str.length > maxLength) {
    str = str.slice(0, maxLength);
  }

  return str;
}
