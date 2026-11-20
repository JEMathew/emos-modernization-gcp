import type { DnaField } from '../../types';
import type {
  AgentToolExecution,
  DiscoveryFindings,
  SpecialistAgentContext,
  SpecialistAgentResult,
} from './types';

/**
 * Portfolio Discovery Agent
 *
 * Specialist agent responsible for reasoning over heterogeneous workload evidence:
 * - interpreting Enterprise DNA completeness and missing/incomplete attributes
 * - analyzing upstream/downstream dependencies and integration coupling
 * - surfacing ambiguity or conflicting signals across DNA sections
 * - recommending prioritized next evidence investigations
 *
 * Deterministic readiness thresholds (>= 70% + zero critical gaps) are NEVER
 * recomputed here; they are consumed directly from EMOS's deterministic
 * `evaluateEvidenceReadiness()` result passed in `ctx.readiness`.
 */
export function inspectDiscoveryFindings(ctx: SpecialistAgentContext): DiscoveryFindings {
  const { workload, readiness } = ctx;
  const allFields: DnaField[] = [
    ...workload.dna.business,
    ...workload.dna.technology,
    ...workload.dna.dependency,
    ...workload.dna.economics,
    ...workload.dna.dataAndRisk,
    ...workload.dna.targetState,
  ];

  const criticalGapSet = new Set(readiness.criticalGaps);
  const nonCriticalGaps = allFields
    .filter((f) => f.status !== 'known' && !criticalGapSet.has(f.label))
    .map((f) => `${f.label} (${f.status})`);

  const incompleteFields = allFields
    .filter((f) => f.status === 'incomplete')
    .map((f) => (f.detail ? `${f.label}: ${f.detail}` : `${f.label} requires field-level verification`));

  const ambiguitySignals: string[] = [];
  if (readiness.thresholdMet && readiness.criticalGaps.length > 0) {
    ambiguitySignals.push(
      `Overall completeness (${readiness.completeness}%) meets the 70% floor, but ${readiness.criticalGaps.length} critical gate field(s) remain unverified.`,
    );
  }
  const hasHighCrit = workload.businessCriticality === 'High';
  const hasUnmappedDep = workload.dna.dependency.some((f) => f.status !== 'known');
  if (hasHighCrit && hasUnmappedDep) {
    ambiguitySignals.push(
      `High-criticality workload (${workload.name}) has unverified dependency contracts (${workload.knownDependencies}), creating cutover blast-radius ambiguity.`,
    );
  }
  const hasUnverifiedTarget = workload.dna.targetState.some((f) => f.status !== 'known');
  if (hasUnverifiedTarget) {
    ambiguitySignals.push(
      'Target-state architecture or downtime tolerance is unverified, leaving migration pattern feasibility open.',
    );
  }
  const hasUnverifiedTco = workload.dna.economics.some((f) => f.id === 'e3' && f.status !== 'known');
  if (hasUnverifiedTco) {
    ambiguitySignals.push(
      'Detailed TCO baseline is missing; ROI comparisons cannot be fabricated until baseline run costs are verified.',
    );
  }

  const prioritizedNextInvestigations: string[] = [];
  if (readiness.criticalGaps.length > 0) {
    readiness.criticalGaps.slice(0, 3).forEach((gap, idx) => {
      const matchingField = allFields.find((f) => f.label === gap);
      const hint = matchingField?.detail ? ` — ${matchingField.detail}` : '';
      prioritizedNextInvestigations.push(`Priority ${idx + 1}: Verify ${gap}${hint}`);
    });
  } else if (nonCriticalGaps.length > 0) {
    nonCriticalGaps.slice(0, 2).forEach((gap, idx) => {
      prioritizedNextInvestigations.push(`Optional enrichment ${idx + 1}: Confirm ${gap}`);
    });
  } else {
    prioritizedNextInvestigations.push(
      'All critical Dependency, TCO Baseline, and Target-State DNA attributes are verified; proceed to governance review.',
    );
  }

  const depFields = workload.dna.dependency
    .map((f) => `${f.label}: ${f.value}${f.status !== 'known' ? ` [${f.status}]` : ''}`)
    .join(' · ');

  return {
    completeness: readiness.completeness,
    decisionReadiness: readiness.decisionReadiness,
    criticalGaps: readiness.criticalGaps,
    nonCriticalGaps,
    incompleteFields,
    dependencySummary: `${workload.knownDependencies} (${depFields})`,
    ambiguitySignals,
    prioritizedNextInvestigations,
  };
}

export function runPortfolioDiscoveryAgent(ctx: SpecialistAgentContext): SpecialistAgentResult {
  const { workload, readiness, intent } = ctx;
  const findings = inspectDiscoveryFindings(ctx);

  const toolsCalled: AgentToolExecution[] = [
    {
      toolName: 'portfolio_discovery_agent',
      label: 'portfolio_discovery_agent.analyze_evidence()',
      summary: `Analyzed ${readiness.knownCount}/${readiness.totalCount} verified DNA facts, ${findings.criticalGaps.length} critical gap(s), and dependency surface for ${workload.name}.`,
      status: 'verified',
    },
  ];

  if (intent === 'discovery_dependencies') {
    toolsCalled.push({
      toolName: 'map_dependency_relationships',
      label: 'map_dependency_relationships()',
      summary: `Mapped integration surface (${workload.knownDependencies}) and checked dependency verification status.`,
      status: 'verified',
    });

    const depIncomplete = workload.dna.dependency.some((f) => f.status !== 'known');
    const conclusion = depIncomplete
      ? `${workload.name} touches ${workload.knownDependencies}, and dependency details are still incomplete — creating blast-radius risk until interface contracts are verified.`
      : `${workload.name} dependency surface (${workload.knownDependencies}) is verified with documented interface contracts and owners.`;

    const bullets = [
      `Dependency Scope: ${findings.dependencySummary}.`,
      depIncomplete
        ? `Ambiguity Detected: ${findings.ambiguitySignals[0] || 'Interface protocols, sync/async contracts, and latency SLAs require verification before cutover.'}`
        : `Coupling Assessment: ${workload.businessCriticality} criticality on ${workload.hosting} (${workload.currentStack}) — interfaces are verified for target-state planning.`,
      findings.prioritizedNextInvestigations[0],
    ];

    const nextAction = depIncomplete
      ? `Verify Dependency Details for ${workload.name} in Enterprise DNA before locking cutover sequencing.`
      : `Use verified dependency map for ${workload.name} during Architecture Review and Wave Sequencing.`;

    return {
      agentId: 'portfolio-discovery-agent',
      agentLabel: 'Portfolio Discovery Agent',
      conclusion,
      bullets,
      nextAction,
      toolsCalled,
      reasoningNote: `Portfolio Discovery Agent evaluated dependency relationships and interface completeness for ${workload.name}.`,
      discoveryFindings: findings,
    };
  }

  // Default: discovery_gaps (missing evidence, ambiguity, next evidence investigation)
  const conclusion =
    findings.criticalGaps.length > 0
      ? `${workload.name} is at ${findings.completeness}% evidence completeness (${readiness.decisionReadiness}) with ${findings.criticalGaps.length} critical gap(s) blocking READY status: ${findings.criticalGaps.join(', ')}.`
      : `${workload.name} has ${findings.completeness}% verified evidence and zero blocking critical gaps (${readiness.decisionReadiness} for human governance review).`;

  const bullets: string[] =
    findings.criticalGaps.length > 0
      ? [
          ...findings.prioritizedNextInvestigations.slice(0, 2),
          findings.ambiguitySignals[0] ||
            `Deterministic gate requires >= 70% completeness and zero critical gaps before human approval.`,
        ]
      : [
          'All critical Dependency, TCO Baseline, and Target-State attributes are verified.',
          `Evidence completeness (${findings.completeness}%) meets or exceeds the mandatory 70% threshold.`,
          findings.nonCriticalGaps.length > 0
            ? `Optional non-blocking fields still open: ${findings.nonCriticalGaps.slice(0, 2).join(', ')}.`
            : 'Human approval remains required before transformation execution proceeds.',
        ];

  const nextAction =
    findings.criticalGaps.length > 0
      ? `Verify ${findings.criticalGaps.slice(0, 2).join(' and ')} in Enterprise DNA for ${workload.name} to unlock READY status.`
      : `Proceed to Architecture Review & Human Governance Approval for ${workload.name}.`;

  return {
    agentId: 'portfolio-discovery-agent',
    agentLabel: 'Portfolio Discovery Agent',
    conclusion,
    bullets,
    nextAction,
    toolsCalled,
    reasoningNote: `Portfolio Discovery Agent audited ${readiness.knownCount}/${readiness.totalCount} DNA fields and identified ${findings.criticalGaps.length} critical gap(s) for ${workload.name}.`,
    discoveryFindings: findings,
  };
}
