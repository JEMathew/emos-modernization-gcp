import type { DecisionReadiness, EnterpriseDna } from '../types';
import { EMOS_FACTS } from '../config/productFacts';

export interface EvidenceReadinessResult {
  completeness: number;
  knownCount: number;
  totalCount: number;
  thresholdMet: boolean;
  criticalGaps: string[];
  decisionReadiness: DecisionReadiness;
}

export const READINESS_DEMO_STAGES = [
  {
    id: 'baseline',
    label: 'Current Evidence',
    summary: '11 of 18 attributes verified. The record remains below the minimum threshold.',
    resolvedFieldIds: [],
  },
  {
    id: 'tco',
    label: 'Verify TCO Baseline',
    summary: '12 of 18 attributes verified. Better evidence, but still below the minimum threshold.',
    resolvedFieldIds: ['e3'],
  },
  {
    id: 'target-state',
    label: 'Define Target Strategy',
    summary: '14 of 18 attributes verified. The threshold is met, but critical gaps still block readiness.',
    resolvedFieldIds: ['e3', 'ts1', 'ts2'],
  },
  {
    id: 'critical-gaps',
    label: 'Close Critical Gaps',
    summary: '16 of 18 attributes verified. The threshold is met and all critical gaps are closed.',
    resolvedFieldIds: ['e3', 'ts1', 'ts2', 'd2', 'ts3'],
  },
] as const;

const SYNTHETIC_EVIDENCE_VALUES: Record<string, string> = {
  e3: '$4.8M verified three-year TCO baseline',
  ts1: 'Enterprise-approved analytics platform strategy',
  ts2: 'Decoupled storage and compute; governed interfaces required',
  d2: 'Seven interfaces mapped with protocols, owners and latency requirements',
  ts3: 'Four-hour cutover window with rollback checkpoint',
};

export function applySyntheticEvidenceStage(dna: EnterpriseDna, stageIndex: number): EnterpriseDna {
  const boundedStageIndex = Math.max(0, Math.min(stageIndex, READINESS_DEMO_STAGES.length - 1));
  const resolvedIds = new Set(READINESS_DEMO_STAGES[boundedStageIndex].resolvedFieldIds);
  const result = structuredClone(dna);

  Object.values(result).flat().forEach((field) => {
    if (resolvedIds.has(field.id)) {
      field.status = 'known';
      field.value = SYNTHETIC_EVIDENCE_VALUES[field.id] ?? 'Verified synthetic evidence';
      field.detail = 'Synthetic evaluation evidence added in the public sandbox.';
    }
  });

  return result;
}

export function evaluateEvidenceReadiness(dna: EnterpriseDna): EvidenceReadinessResult {
  const fields = [
    ...dna.business,
    ...dna.technology,
    ...dna.dependency,
    ...dna.economics,
    ...dna.dataAndRisk,
    ...dna.targetState,
  ];
  const knownCount = fields.filter((field) => field.status === 'known').length;
  const totalCount = fields.length;
  const completeness = totalCount > 0 ? Math.round((knownCount / totalCount) * 100) : 0;
  const criticalFields = [
    ...dna.dependency,
    ...dna.economics.filter((field) => field.id === 'e3'),
    ...dna.targetState,
  ];
  const criticalGaps = criticalFields
    .filter((field) => field.status !== 'known')
    .map((field) => field.label);
  const thresholdMet = completeness >= EMOS_FACTS.readinessThreshold;

  return {
    completeness,
    knownCount,
    totalCount,
    thresholdMet,
    criticalGaps,
    decisionReadiness: thresholdMet && criticalGaps.length === 0 ? 'READY' : 'NEEDS EVIDENCE',
  };
}
