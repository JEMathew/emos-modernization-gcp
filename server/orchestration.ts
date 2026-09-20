export type SpecialistId = 'intake-discovery' | 'evidence-dna' | 'assessment-economics' | 'governance-decision' | 'planning-target-state';

export interface SpecialistDefinition {
  id: SpecialistId;
  name: string;
  responsibility: string;
  deterministicBoundary: string;
  modelBoundary: string;
}

export const EMOS_SPECIALISTS: readonly SpecialistDefinition[] = [
  { id: 'intake-discovery', name: 'Intake and Discovery specialist', responsibility: 'Bound, validate, map and normalize reviewed inventory.', deterministicBoundary: 'Parsing, bounds, normalization and persistence are deterministic.', modelBoundary: 'No model call is required for intake.' },
  { id: 'evidence-dna', name: 'Evidence and Enterprise DNA specialist', responsibility: 'Preserve source traceability and expose known, incomplete and missing evidence.', deterministicBoundary: 'Evidence status and completeness are calculated deterministically from the canonical record.', modelBoundary: 'A model may explain gaps but cannot verify a fact.' },
  { id: 'assessment-economics', name: 'Assessment and Economics specialist', responsibility: 'Compare canonical 6R options using readiness, risk, complexity, feasibility and economics.', deterministicBoundary: 'Taxonomy, scores, evidence gates and TCO arithmetic remain deterministic.', modelBoundary: 'The model may reason over authorized evidence and explain trade-offs.' },
  { id: 'governance-decision', name: 'Governance and Decision specialist', responsibility: 'Apply architecture, security, compliance and human decision gates.', deterministicBoundary: 'Gate state, authorization and persisted decisions are deterministic.', modelBoundary: 'The model cannot approve, reject or waive a material decision.' },
  { id: 'planning-target-state', name: 'Planning and Target-State specialist', responsibility: 'Sequence governed decisions and prepare the target-state handoff.', deterministicBoundary: 'Prioritization, wave placement and readiness checks are deterministic.', modelBoundary: 'The model may explain a plan but cannot execute a migration.' },
] as const;

export interface OrchestrationRoute {
  orchestrator: 'EMOS Orchestrator';
  specialist: SpecialistDefinition;
  instruction: string;
}

export function routeAssessmentRequest(mode: string, hasHistory: boolean): OrchestrationRoute {
  const id: SpecialistId = mode === 'decision' || hasHistory ? 'governance-decision' : 'assessment-economics';
  const specialist = EMOS_SPECIALISTS.find((item) => item.id === id)!;
  return {
    orchestrator: 'EMOS Orchestrator', specialist,
    instruction: `SERVER ORCHESTRATION: ${specialist.name}. ${specialist.modelBoundary} ${specialist.deterministicBoundary}`,
  };
}
