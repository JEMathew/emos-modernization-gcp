import type { Disposition6R, EnterpriseWorkload } from '../../types';
import {
  deriveEvidenceDrivenRecommendation,
  type DeterministicAgentRecommendation,
} from '../../data/enterpriseEstates';
import { PLAIN_ENGLISH_6R } from '../../config/capabilityCues';
import type {
  AgentToolExecution,
  DiscoveryFindings,
  SpecialistAgentContext,
  SpecialistAgentResult,
} from './types';

/**
 * Resolves the canonical 6R disposition for any workload by combining
 * `deriveEvidenceDrivenRecommendation()` with explicit architectural signal
 * disambiguation so both built-in estates and arbitrary synthetic workloads
 * are evaluated consistently across all 6 canonical dispositions:
 * Retain, Retire, Rehost, Replatform, Refactor, Repurchase.
 */
export function synthesizeArchitecturalRecommendation(
  workload: EnterpriseWorkload,
): DeterministicAgentRecommendation {
  const base = deriveEvidenceDrivenRecommendation(workload);
  const allFields = Object.values(workload.dna).flat();
  const textBlob = [
    workload.name,
    workload.businessCapability,
    workload.currentStack,
    workload.hosting,
    workload.knownDependencies,
    ...workload.modernizationSignals,
    ...allFields.map((f) => `${f.label}: ${f.value} ${f.detail || ''}`),
  ]
    .join(' ')
    .toLowerCase();

  // Preserve base recommendation unless an explicit canonical signal was missed by base's narrower regex
  let disposition: Disposition6R = base.recommended6R;

  const isRetireSignal =
    (/decommission|duplicate|superseded|zero active|retention period expired|obsolete|shut down|scrap|archival reporter|end-of-life.*no users|redundant|sunsetting|retire/.test(
      textBlob,
    ) &&
      workload.businessCriticality === 'Low') ||
    /zero active users|fully superseded|sunset complete|redundant legacy reporting/.test(textBlob);

  const isRetainSignal =
    /air-gapped|plc|scada|opc-ua|shop-floor|hsm|tandem nonstop|iso8583|amortized|retain in on-premises|keep on-premises|recent hardware refresh|mainframe.*regulatory lock|sub-millisecond hardware|sovereign hardware vault/.test(
      textBlob,
    );

  const isRepurchaseSignal =
    /saas|turnkey|commercial off-the-shelf|cots|commodity|document management|case tracker|cmms|expense tracker|hris|crm replacement|workday|servicenow|salesforce|commercial platform/.test(
      textBlob,
    );

  const isRehostSignal =
    /lease expiring|colocation|datacenter exit|data center exit|lift-and-shift|lift and shift|edi gateway|swift|vm migration without|as-is vm|rapid exit|no code change/.test(
      textBlob,
    );

  const isReplatformSignal =
    workload.type === 'Data Platform' ||
    /data warehouse|edw|bigquery|lakehouse|managed cloud|managed postgres|managed sql|cloud sql|hadoop|spark|mpp|paas database|containerize without rewrite|managed kubernetes/.test(
      textBlob,
    );

  const isRefactorSignal =
    /java 8|corba|monolith|microservices|event-driven|clearing engine|customer analytics|domain decomposition|strangler fig|tightly coupled.*bottleneck|cloud-native rewrite|re-architect/.test(
      textBlob,
    );

  if (isRetireSignal) {
    disposition = 'Retire';
  } else if (isRetainSignal) {
    disposition = 'Retain';
  } else if (isRepurchaseSignal) {
    disposition = 'Repurchase';
  } else if (isRehostSignal) {
    disposition = 'Rehost';
  } else if (isReplatformSignal) {
    disposition = 'Replatform';
  } else if (isRefactorSignal) {
    disposition = 'Refactor';
  }

  if (disposition === base.recommended6R) {
    return base;
  }

  const plainEnglish = PLAIN_ENGLISH_6R[disposition]?.plainEnglish || disposition;
  const reasonsBy6R: Record<Disposition6R, [string, string, string]> = {
    Retain: [
      `Hardware, sovereign, or ultra-low-latency constraints (${workload.hosting}) make migration high-risk.`,
      `Current stack (${workload.currentStack}) is stable and compliant with operational mandates.`,
      'Retaining in place preserves operational continuity and avoids negative-ROI migration spend.',
    ],
    Retire: [
      `Business capability (${workload.businessCapability}) is superseded or redundant with minimal active usage.`,
      `Maintaining ${workload.currentStack} creates unnecessary licensing and security patching exposure.`,
      'Decommissioning after governed archival eliminates run cost and legacy risk.',
    ],
    Rehost: [
      `Time-bound infrastructure exit constraint requires fast relocation without risky code rewrites.`,
      `Current stack (${workload.currentStack}) is portable directly onto cloud VMs.`,
      `Preserves ${workload.knownDependencies} contracts while meeting facility exit timelines.`,
    ],
    Replatform: [
      `Legacy infrastructure (${workload.currentStack}) limits scalability and imposes database/platform toil.`,
      'Adopting managed cloud platform services reduces TCO and operational overhead without full application rewrite.',
      'Balances modernization value with controlled cutover risk.',
    ],
    Refactor: [
      `Tightly coupled architecture (${workload.currentStack}) and ${workload.knownDependencies} constrain scale and release velocity.`,
      'Lift-and-shift would carry architectural bottlenecks and licensing debt into the cloud.',
      'Phased decomposition unlocks cloud-native elasticity, API boundaries, and long-term agility.',
    ],
    Repurchase: [
      `${workload.businessCapability} is a commodity enterprise capability where bespoke code (${workload.currentStack}) lacks differentiation.`,
      'Commercial SaaS delivers faster compliance, workflow maturity, and lower maintenance burden.',
      'Replacing custom code with a governed SaaS platform eliminates technical debt.',
    ],
  };

  const all6: Disposition6R[] = ['Retain', 'Retire', 'Rehost', 'Replatform', 'Refactor', 'Repurchase'];
  const altWhyNot: Record<Disposition6R, string> = {
    Retain: 'Leaves lifecycle, cost, or scalability constraints unresolved.',
    Retire: `Capability (${workload.businessCapability}) remains actively required by the business.`,
    Rehost: 'Carries legacy licensing, operational toil, or architectural bottlenecks into the cloud.',
    Replatform: 'Either insufficient to break monolithic coupling or unnecessary given SaaS/exit constraints.',
    Refactor: 'Disproportionate engineering cost, timeline, and cutover risk relative to business differentiation.',
    Repurchase: 'Commercial SaaS cannot satisfy specialized domain logic, latency, or dependency constraints.',
  };

  return {
    ...base,
    recommended6R: disposition,
    plainEnglish,
    topReasons: reasonsBy6R[disposition],
    alternatives: all6
      .filter((d) => d !== disposition)
      .slice(0, 3)
      .map((d) => ({
        disposition: d,
        plainEnglish: PLAIN_ENGLISH_6R[d]?.plainEnglish || d,
        whyNot: altWhyNot[d],
      })),
  };
}

/**
 * Enterprise Architect Agent
 *
 * Specialist agent responsible for reasoning over architecture context:
 * - synthesizing business, technical, dependency, economic, and target-state signals
 * - evaluating all 6 canonical 6R dispositions and rejecting inferior alternatives
 * - surfacing architectural risks, constraints, and counterfactual sensitivity
 * - reasoning over target-state execution blockers and post-change outcome/learning deltas
 *
 * Governance boundary: NEVER independently authorizes decisions, never bypasses
 * the deterministic readiness gate, and never fabricates missing evidence.
 */
export function runEnterpriseArchitectAgent(
  ctx: SpecialistAgentContext,
  discoveryFindings?: DiscoveryFindings,
): SpecialistAgentResult {
  const { workload, lifecycle, readiness, activeInteraction, question, intent } = ctx;
  const rec = synthesizeArchitecturalRecommendation(workload);
  const disposition: Disposition6R =
    (activeInteraction?.recommended6R as Disposition6R) || lifecycle.disposition || rec.recommended6R;
  const plain = PLAIN_ENGLISH_6R[disposition]?.plainEnglish || rec.plainEnglish;
  const completeness = activeInteraction?.evidenceCompleteness ?? readiness.completeness;
  const readinessStatus = activeInteraction?.decisionReadiness || readiness.decisionReadiness;
  const confidence = activeInteraction?.confidenceScore ?? rec.confidenceScore;
  const q = question.toLowerCase();

  const toolsCalled: AgentToolExecution[] = [
    {
      toolName: 'enterprise_architect_agent',
      label: 'enterprise_architect_agent.evaluate_architecture()',
      summary: `Synthesized business, stack (${workload.currentStack}), dependency (${workload.knownDependencies}), and 6R trade-offs for ${workload.name}.`,
      status: 'verified',
    },
  ];

  const defaultNextAction =
    readinessStatus === 'NEEDS EVIDENCE'
      ? `Verify ${readiness.criticalGaps.slice(0, 2).join(' and ') || 'missing critical DNA evidence'} in Enterprise DNA before human governance approval.`
      : lifecycle.governanceStatus !== 'APPROVED'
      ? `Review and record Human Governance Approval for ${workload.name} to proceed to ${lifecycle.currentPhaseLabel}.`
      : `Complete "${lifecycle.currentPhaseLabel}" and verify gate: ${lifecycle.nextGateLabel}.`;

  // 1. Alternatives comparison ("Why not X?")
  if (intent === 'architect_alternatives') {
    toolsCalled.push({
      toolName: 'compare_6r_dispositions',
      label: 'compare_6r_dispositions()',
      summary: `Evaluated all 6 canonical dispositions against ${workload.name} constraints.`,
      status: 'verified',
    });
    return {
      agentId: 'enterprise-architect-agent',
      agentLabel: 'Enterprise Architect Agent',
      conclusion: `For ${workload.name}, "${plain}" (${disposition}) outperforms alternatives because other 6R paths either leave core drivers unresolved or introduce disproportionate risk.`,
      bullets: rec.alternatives
        .slice(0, 3)
        .map((alt) => `${alt.plainEnglish} (${alt.disposition}): ${alt.whyNot}`),
      nextAction: defaultNextAction,
      toolsCalled,
      reasoningNote: `Enterprise Architect Agent compared ${disposition} against rejected canonical 6R alternatives for ${workload.name}.`,
      recommended6R: disposition,
    };
  }

  // 2. Counterfactual sensitivity ("What would change your recommendation?")
  if (intent === 'architect_counterfactual') {
    toolsCalled.push({
      toolName: 'compare_6r_dispositions',
      label: 'compare_6r_dispositions()',
      summary: 'Computed counterfactual sensitivity across Business, Dependency, and Target-State DNA.',
      status: 'verified',
    });
    return {
      agentId: 'enterprise-architect-agent',
      agentLabel: 'Enterprise Architect Agent',
      conclusion: `Changing core criticality, dependency coupling, or target-platform constraints in Enterprise DNA would shift ${workload.name} away from "${plain}" (${disposition}).`,
      bullets: [
        'If business criticality drops to Low and capability is duplicated → shifts to Safely shut it down (Retire).',
        'If sub-5ms hardware/vault latency constraints or recent hardware amortization dominate → shifts to Keep it as-is (Retain).',
        'If a commercial SaaS platform covers 100% of capability without custom differentiation → shifts to Replace it (Repurchase).',
      ],
      nextAction:
        'Update verified facts in Enterprise DNA ("Edit Selected Evidence") to re-evaluate readiness and 6R scoring.',
      toolsCalled,
      reasoningNote: `Enterprise Architect Agent evaluated counterfactual 6R decision boundaries for ${workload.name}.`,
      recommended6R: disposition,
    };
  }

  // 3. Architectural Risks & Approval Readiness ("What risks remain?")
  if (intent === 'architect_risks') {
    const gapWarning =
      readiness.criticalGaps.length > 0
        ? `Evidence Gate Risk: ${readiness.criticalGaps.join(', ')} remain unverified (${completeness}% complete), blocking approval.`
        : `Governance Posture: Evidence gate is READY (${completeness}% verified), awaiting explicit human sign-off.`;
    return {
      agentId: 'enterprise-architect-agent',
      agentLabel: 'Enterprise Architect Agent',
      conclusion: `Primary architectural risk for ${workload.name} (${disposition}) centers on ${workload.knownDependencies}, cutover continuity, and operational constraints on ${workload.hosting}.`,
      bullets: [rec.keyRisks[0], rec.keyRisks[1] || gapWarning, gapWarning].filter(Boolean).slice(0, 3),
      nextAction: defaultNextAction,
      toolsCalled,
      reasoningNote: `Enterprise Architect Agent assessed architectural and governance risks for ${workload.name}.`,
      recommended6R: disposition,
    };
  }

  // 4. Execution & Blockers ("Why is this blocked?")
  if (intent === 'architect_execution') {
    toolsCalled.push({
      toolName: 'build_transformation_stages',
      label: 'build_transformation_stages()',
      summary: `Inspected ${lifecycle.stages.length}-stage ${disposition} execution timeline (${lifecycle.overallProgress}% complete).`,
      status: 'verified',
    });
    const conclusion = lifecycle.activeBlocker
      ? `Execution for ${workload.name} is currently gated at "${lifecycle.currentPhaseLabel}": ${lifecycle.activeBlocker}`
      : `Execution for ${workload.name} is active at "${lifecycle.currentPhaseLabel}" (${lifecycle.overallProgress}% overall progress) with no active blockers.`;
    return {
      agentId: 'enterprise-architect-agent',
      agentLabel: 'Enterprise Architect Agent',
      conclusion,
      bullets: [
        `Current Stage: ${lifecycle.currentPhaseLabel} — Next Gate: ${lifecycle.nextGateLabel}.`,
        `Target State: ${lifecycle.targetArchSummary}.`,
        `Dependency Scope: ${workload.knownDependencies} (Human governance status: ${lifecycle.governanceStatus}).`,
      ],
      nextAction:
        lifecycle.governanceStatus !== 'APPROVED'
          ? `Obtain Human Governance Approval for ${workload.name} before advancing execution gates.`
          : `Resolve "${lifecycle.nextGateLabel}" to advance ${workload.name} in the ${disposition} plan.`,
      toolsCalled,
      reasoningNote: `Enterprise Architect Agent inspected execution stage gates and blockers for ${workload.name}.`,
      recommended6R: disposition,
    };
  }

  // 5. Outcomes & Learning ("Why did this miss target?", "Where should this lesson apply?")
  if (intent === 'architect_outcomes_learning') {
    toolsCalled.push({
      toolName: 'evaluate_outcomes_and_learning',
      label: 'evaluate_outcomes_and_learning()',
      summary: `Compared Baseline vs. Target vs. Observed metrics and captured lessons for ${workload.name}.`,
      status: 'verified',
    });
    const firstLesson = lifecycle.learnings[0];
    const isLearningScopeQuery = /where should this lesson|apply|reuse|next wave|future/.test(q);
    const conclusion = isLearningScopeQuery
      ? `Lessons from ${workload.name} (${disposition}) should be applied to upcoming ${workload.type} workloads with similar ${workload.currentStack} or ${workload.knownDependencies} profiles.`
      : `Outcome tracking for ${workload.name} (${disposition}) compares Baseline vs. Target vs. Observed metrics to explain variance and feed future modernization waves.`;
    return {
      agentId: 'enterprise-architect-agent',
      agentLabel: 'Enterprise Architect Agent',
      conclusion,
      bullets: [
        ...lifecycle.outcomes
          .slice(0, 2)
          .map(
            (o) =>
              `${o.label}: Baseline ${o.baseline} → Target ${o.target} → Observed ${o.observed} (${o.deltaSummary}).`,
          ),
        firstLesson
          ? `Captured Lesson (${firstLesson.futureApplicability}): ${firstLesson.lesson}`
          : `Lesson: Verify dependency contracts and TCO baselines for ${workload.type} workloads prior to wave mobilization.`,
      ],
      nextAction:
        'Record this verified lesson into the Enterprise DNA playbook so future waves inherit the updated guardrails.',
      toolsCalled,
      reasoningNote: `Enterprise Architect Agent analyzed observed outcome variance and institutional learning applicability for ${workload.name}.`,
      recommended6R: disposition,
    };
  }

  // 6. Executive Brief
  if (q.includes('executive')) {
    return {
      agentId: 'enterprise-architect-agent',
      agentLabel: 'Enterprise Architect Agent',
      conclusion: `Executive Brief: We recommend "${plain}" (${disposition}) for ${workload.name} to deliver ${rec.expectedImpact.split('·')[0].trim()}.`,
      bullets: [
        `Business Value: ${rec.expectedImpact}`,
        `Governance Posture: ${completeness}% evidence verified (${readinessStatus}) · ${confidence}% confidence.`,
        `Accountability: Bounded by human approval and ${lifecycle.stages.length}-stage execution checkpoints.`,
      ],
      nextAction: defaultNextAction,
      toolsCalled,
      reasoningNote: `Enterprise Architect Agent synthesized executive brief for ${workload.name} (${disposition}).`,
      recommended6R: disposition,
    };
  }

  // 7. Hybrid handoff or Standard 6R Recommendation ("Why {6R}?")
  const bullets = [...rec.topReasons];
  if (discoveryFindings && discoveryFindings.criticalGaps.length > 0) {
    bullets[2] = `Discovery Handoff Note: ${discoveryFindings.criticalGaps.length} critical gap(s) (${discoveryFindings.criticalGaps.slice(0, 2).join(', ')}) must be verified before human approval.`;
  }

  return {
    agentId: 'enterprise-architect-agent',
    agentLabel: 'Enterprise Architect Agent',
    conclusion: `${workload.name} is recommended for "${plain}" (${disposition}) at ${confidence}% confidence (${readinessStatus}).`,
    bullets: bullets.slice(0, 3),
    nextAction: defaultNextAction,
    toolsCalled,
    reasoningNote: `Enterprise Architect Agent evaluated all 6 canonical dispositions for ${workload.name}; recommended ${disposition} under EMOS governance.`,
    recommended6R: disposition,
  };
}
