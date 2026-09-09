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
