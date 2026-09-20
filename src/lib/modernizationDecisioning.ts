import type { Disposition6R, EnterpriseWorkload, Interaction, ProgramAlignment } from '../types';
import { evaluateEvidenceReadiness } from './readiness';

export interface DeterministicAssessment {
  readiness: number;
  complexity: number;
  risk: number;
  feasibility: number;
  costBaseline: 'VERIFIED' | 'INCOMPLETE' | 'MISSING';
  tcoMessage: string;
  options: Array<{ disposition: Disposition6R; fit: 'LEADING' | 'VIABLE' | 'CONSTRAINED'; basis: string }>;
}

const dispositions: Disposition6R[] = ['Retain', 'Retire', 'Rehost', 'Replatform', 'Refactor', 'Repurchase'];
const cap = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

function field(workload: EnterpriseWorkload, id: string) {
  return Object.values(workload.dna).flat().find((item) => item.id === id);
}

export function assessWorkloadDeterministically(workload: EnterpriseWorkload, interaction?: Interaction): DeterministicAssessment {
  const evidence = evaluateEvidenceReadiness(workload.dna);
  const dependencyKnown = workload.dna.dependency.filter((item) => item.status === 'known').length;
  const targetKnown = workload.dna.targetState.filter((item) => item.status === 'known').length;
  const riskKnown = workload.dna.dataAndRisk.filter((item) => item.status === 'known').length;
  const criticality = workload.businessCriticality === 'High' ? 25 : workload.businessCriticality === 'Medium' ? 15 : 5;
  const dependencyPenalty = (workload.dna.dependency.length - dependencyKnown) * 18;
  const complexity = cap(35 + criticality + dependencyPenalty + (workload.modernizationSignals.length * 4));
  const risk = cap(criticality + (workload.dna.dataAndRisk.length - riskKnown) * 20 + evidence.criticalGaps.length * 8);
  const feasibility = cap(25 + targetKnown * 18 + dependencyKnown * 10 + evidence.completeness * 0.15);
  const tco = field(workload, 'e3');
  const costBaseline = tco?.status === 'known' ? 'VERIFIED' : tco?.status === 'incomplete' ? 'INCOMPLETE' : 'MISSING';
  const recommended = interaction?.recommended6R as Disposition6R | undefined;

  return {
    readiness: evidence.completeness,
    complexity,
    risk,
    feasibility,
    costBaseline,
    tcoMessage: costBaseline === 'VERIFIED'
      ? 'A current TCO baseline is recorded; validate assumptions and time horizon before funding.'
      : 'TCO and value comparison is blocked until a current run-cost baseline and assumptions are verified.',
    options: dispositions.map((disposition) => ({
      disposition,
      fit: recommended === disposition ? 'LEADING' : evidence.decisionReadiness === 'READY' ? 'VIABLE' : 'CONSTRAINED',
      basis: recommended === disposition
        ? 'Current governed assessment direction; human approval is still required.'
        : evidence.decisionReadiness === 'READY'
          ? 'Available for evidence-backed comparison against the leading option.'
          : 'Keep visible, but do not eliminate or approve until critical evidence gaps are closed.',
    })),
  };
}

export function prioritizationScore(workload: EnterpriseWorkload, interaction: Interaction | undefined, alignment: ProgramAlignment) {
  const evidence = evaluateEvidenceReadiness(workload.dna);
  const value = workload.businessCriticality === 'High' ? 90 : workload.businessCriticality === 'Medium' ? 65 : 40;
  const effort = assessWorkloadDeterministically(workload, interaction).complexity;
  const riskReduction = Math.min(100, workload.modernizationSignals.length * 15 + (100 - evidence.completeness));
  const dependencyConfidence = Math.round((workload.dna.dependency.filter((item) => item.status === 'known').length / workload.dna.dependency.length) * 100);
  const alignmentConfidence = alignment.businessOutcomes.trim() && alignment.successMeasures.trim() ? 100 : 40;
  const score = cap(value * 0.35 + (100 - effort) * 0.2 + riskReduction * 0.2 + dependencyConfidence * 0.15 + alignmentConfidence * 0.1);
  return { score, value, effort, riskReduction, dependencyConfidence };
}
