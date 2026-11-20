import type { Disposition6R, EnterpriseWorkload } from '../types';
import { PLAIN_ENGLISH_6R } from '../config/capabilityCues';
import { deriveEvidenceDrivenRecommendation } from '../data/enterpriseEstates';

export type LifecycleStageStatus = 'completed' | 'in_progress' | 'blocked' | 'upcoming';

export interface TransformationStage {
  id: string;
  order: number;
  label: string;
  description: string;
  ownerRole: string;
  gateRequirement: string;
  status: LifecycleStageStatus;
  blocker?: string;
  deliverable: string;
}

export interface OutcomeMetric {
  id: string;
  label: string;
  unit: string;
  baseline: string;
  target: string;
  observed: string;
  status: 'on_track' | 'exceeded' | 'variance';
  deltaSummary: string;
}

export interface LearningCapture {
  id: string;
  originalAssumption: string;
  actualResult: string;
  difference: string;
  lesson: string;
  futureApplicability: string;
}

export interface WorkloadLifecycleState {
  workloadId: string;
  disposition: Disposition6R;
  plainEnglish: string;
  governanceStatus: 'DRAFT' | 'BLOCKED_EVIDENCE' | 'PENDING_APPROVAL' | 'APPROVED';
  approvedBy?: string;
  approvedRole?: string;
  approvedAt?: string;
  approvalNote?: string;
  overallProgress: number;
  currentPhaseLabel: string;
  nextGateLabel: string;
  activeBlocker: string | null;
  agentAlert: string;
  currentArchSummary: string;
  targetArchSummary: string;
  stages: TransformationStage[];
  outcomes: OutcomeMetric[];
  learnings: LearningCapture[];
}

export function buildDefaultLifecycleState(
  workload: EnterpriseWorkload,
  overrideDisposition?: Disposition6R,
  governanceApproved = false,
  completedStageCountOverride?: number,
  blockerCleared = false,
): WorkloadLifecycleState {
  const rec = deriveEvidenceDrivenRecommendation(workload);
  const disposition = overrideDisposition || rec.recommended6R;
  const meta = PLAIN_ENGLISH_6R[disposition];
  const isReady = rec.decisionReadiness === 'READY';

  const targetCloudField = workload.dna.targetState.find((f) => f.id === 'ts1');
  const verifiedTarget = targetCloudField?.status === 'known' ? targetCloudField.value : 'Governed Target Platform';

  const targetArchBy6R: Record<Disposition6R, string> = {
    Retain: `Governed On-Premises Tier (${workload.hosting}) with automated health & lifecycle telemetry`,
    Retire: 'Decommissioned runtime · Consumers routed to enterprise standard · Encrypted cold compliance archive',
    Rehost: `Managed Cloud Virtual Machines (${verifiedTarget.includes('Google') ? 'Google Cloud Compute Engine' : 'Cloud IaaS VMs'}) with load balancing`,
    Replatform: workload.type === 'Data Platform'
      ? `${verifiedTarget.includes('Google') ? 'Google Cloud BigQuery + Cloud Storage + Dataform' : 'Managed Cloud Data Warehouse & Lakehouse'}`
      : `${verifiedTarget.includes('Google') ? 'Google Cloud Run / GKE + Cloud SQL' : 'Managed Cloud Containers & Managed Relational Database'}`,
    Refactor: `${verifiedTarget.includes('Google') ? 'Google Cloud Run Microservices + Pub/Sub + Cloud Spanner/SQL' : 'Decoupled Cloud-Native Microservices & Event-Driven APIs'}`,
    Repurchase: `Commercial Enterprise SaaS Platform (${verifiedTarget.includes('SaaS') ? verifiedTarget : 'Turnkey Regulated Cloud SaaS'}) with federated SSO`,
  };

  const stageDescriptions: Record<string, { desc: string; owner: string; gate: string; deliverable: string }> = {
    'Keep': { desc: 'Confirm baseline stability and freeze unnecessary architectural changes.', owner: 'Enterprise Architect', gate: 'Architecture stability review', deliverable: 'Operational Baseline Record' },
    'Optimize': { desc: 'Tune database indexes, prune unused licenses, and harden security patching.', owner: 'Platform Operations', gate: 'Maintenance window sign-off', deliverable: 'Cost & Patch Optimization Log' },
    'Monitor': { desc: 'Track SLA adherence, hardware depreciation, and trigger signals for future reassessment.', owner: 'SRE Lead', gate: 'Quarterly telemetry checkpoint', deliverable: 'Automated Lifecycle Monitor' },
    'Review Outcome': { desc: 'Verify operational cost stability and zero unplanned downtime against baseline.', owner: 'Finance & IT Owner', gate: 'Annual TCO audit', deliverable: 'Validated Run-Rate Report' },
    'Approve': { desc: 'Verify evidence readiness (≥70% and zero critical gaps) and record accountable human sign-off.', owner: 'Executive Sponsor & CISO', gate: 'Human Governance Approval Gate', deliverable: 'Signed 6R Decision Brief' },
    'Consumer Transition': { desc: `Repoint ${workload.knownDependencies} to the surviving enterprise system and verify zero traffic.`, owner: 'Integration Lead', gate: 'Zero active consumer traffic for 14 days', deliverable: 'Consumer Cutover Certificate' },
    'Archive': { desc: 'Export historical records to immutable cold storage with verified compliance retention.', owner: 'Data Governance Lead', gate: 'Checksum & legal-hold verification', deliverable: 'Encrypted Cold Archive Snapshot' },
    'Decommission': { desc: `Power down ${workload.hosting} compute instances, revoke certificates, and terminate licenses.`, owner: 'Infrastructure Lead', gate: 'Change Advisory Board (CAB) approval', deliverable: 'Decommission Execution Receipt' },
    'Validate Closure': { desc: 'Confirm CMDB retirement status and remove residual network routes and backups.', owner: 'Security Operations', gate: 'Vulnerability scan closure', deliverable: 'Clean Closure Audit Stamp' },
    'Measure Savings/Risk': { desc: 'Reconcile eliminated infrastructure and license spend against the approved business case.', owner: 'FinOps Lead', gate: 'Billing ledger reconciliation', deliverable: 'Realized Savings Verification' },
    'Prepare Destination': { desc: 'Configure target VPC network, IAM boundaries, and landing zone virtual machines.', owner: 'Cloud Platform Team', gate: 'Landing zone security check', deliverable: 'Validated Cloud Landing Zone' },
    'Move': { desc: `Replicate ${workload.currentStack} VM images and storage volumes to target environment.`, owner: 'Migration Engineer', gate: 'Block-level sync completion', deliverable: 'Replicated Workload Images' },
    'Validate': { desc: 'Execute functional parity, integration latency, and rollback drill tests.', owner: 'QA & Architecture Lead', gate: '100% critical test pass rate', deliverable: 'Parity Validation Sign-Off' },
    'Cutover': { desc: 'Switch DNS / load balancer routing within the approved maintenance window.', owner: 'Delivery Owner', gate: 'Go/No-Go cutover readiness check', deliverable: 'Production Cutover Log' },
    'Stabilize': { desc: 'Monitor post-cutover latency, error rates, and retire legacy source servers.', owner: 'SRE & Operations', gate: '14-day hypercare SLA met', deliverable: 'Hypercare Handover Report' },
    'Prepare Target Platform': { desc: `Provision ${targetArchBy6R[disposition]} with governed IAM, encryption, and networking.`, owner: 'Cloud Data/Platform Architect', gate: 'Target platform security review', deliverable: 'Target Platform Blueprint' },
    'Transform/Migrate': { desc: 'Convert schemas, migrate historical data/containers, and configure managed pipelines.', owner: 'Modernization Engineering', gate: 'Schema & row-count reconciliation', deliverable: 'Migrated Managed Workload' },
    'Redesign/Decompose': { desc: 'Define domain service boundaries, strangler-fig API gateway, and target data contracts.', owner: 'Principal Architect', gate: 'Target Architecture Board approval', deliverable: 'Service Decomposition Spec' },
    'Implement': { desc: 'Extract high-change services and decouple shared database dependencies incrementally.', owner: 'Product Engineering Squad', gate: 'Automated contract & security tests', deliverable: 'Cloud-Native Service Modules' },
    'Test': { desc: 'Run shadow traffic, chaos resilience drills, and peak-load benchmark validation.', owner: 'Quality & SRE Lead', gate: 'Latency & throughput SLA verification', deliverable: 'Load & Chaos Test Report' },
    'Transition': { desc: 'Shift production traffic progressively via canary routing and retire legacy monolith modules.', owner: 'Release Manager', gate: 'Canary error-budget check', deliverable: 'Traffic Transition Audit' },
    'Select Replacement': { desc: 'Complete commercial SaaS fit-gap, security assessment, and contract procurement.', owner: 'Business Capability Owner', gate: 'Vendor security & FinOps sign-off', deliverable: 'Approved SaaS Contract' },
    'Configure': { desc: 'Configure tenant SSO, RBAC roles, standard workflows, and API integration webhooks.', owner: 'SaaS Solution Architect', gate: 'SSO & compliance control check', deliverable: 'Configured SaaS Tenant' },
    'Migrate Data/Users': { desc: 'Transform and load active historical records and onboard business user cohorts.', owner: 'Data & Change Lead', gate: 'Data reconciliation & UAT sign-off', deliverable: 'Migrated Tenant Dataset' },
    'Retire Previous Product': { desc: `Archive residual data and decommission legacy ${workload.currentStack} servers.`, owner: 'Infrastructure Lead', gate: 'Legacy license termination', deliverable: 'Legacy Shutdown Certificate' },
    'Measure': { desc: 'Compare observed post-transformation cost, latency, and reliability against target KPIs.', owner: 'Value Realization Lead', gate: '30/60/90-day benefit review', deliverable: 'Outcome Realization Scorecard' },
    'Learn': { desc: 'Record variance between original assumptions and observed outcomes for future waves.', owner: 'Modernization PMO', gate: 'Lessons learned cataloged', deliverable: 'Enterprise DNA Learning Record' },
  };

  const defaultCompleted = governanceApproved
    ? Math.min(meta.stages.length, Math.max(2, completedStageCountOverride ?? 2))
    : isReady
    ? 1
    : 0;

  const hasBlocker = !blockerCleared && (!isReady || !governanceApproved);
  const activeBlockerText = !isReady
    ? `Evidence Readiness Gate blocked (${rec.evidenceCompleteness}%): Verify ${rec.criticalGaps.slice(0, 2).join(' & ') || 'missing critical DNA fields'} before approval.`
    : !governanceApproved
    ? 'Awaiting Human Governance Approval sign-off before execution stages can proceed.'
    : null;

  const stages: TransformationStage[] = meta.stages.map((label, idx) => {
    const info = stageDescriptions[label] || {
      desc: `Execute governed ${label.toLowerCase()} activities for ${workload.name}.`,
      owner: 'Modernization Lead',
      gate: 'Stage verification gate',
      deliverable: `${label} Verification Artifact`,
    };
    let status: LifecycleStageStatus = 'upcoming';
    if (idx < defaultCompleted) {
      status = 'completed';
    } else if (idx === defaultCompleted) {
      status = hasBlocker ? 'blocked' : 'in_progress';
    }
    return {
      id: `stage-${idx + 1}`,
      order: idx + 1,
      label,
      description: info.desc,
      ownerRole: info.owner,
      gateRequirement: info.gate,
      status,
      blocker: status === 'blocked' ? activeBlockerText || undefined : undefined,
      deliverable: info.deliverable,
    };
  });

  const currentStage = stages.find((s) => s.status === 'in_progress' || s.status === 'blocked') || stages[stages.length - 1];
  const nextStage = stages[Math.min(stages.length - 1, currentStage.order)] || currentStage;
  const overallProgress = Math.round((stages.filter((s) => s.status === 'completed').length / stages.length) * 100);

  const outcomesBy6R: Record<Disposition6R, OutcomeMetric[]> = {
    Retain: [
      { id: 'm1', label: 'Annual Run Cost', unit: 'USD/yr', baseline: '$365K / yr', target: '$340K / yr', observed: '$335K / yr', status: 'exceeded', deltaSummary: '-8.2% via license pruning (Representative)' },
      { id: 'm2', label: 'Operational Availability', unit: 'SLA %', baseline: '99.95%', target: '99.95%', observed: '99.98%', status: 'on_track', deltaSummary: 'Zero unplanned plant/vault outages' },
      { id: 'm3', label: 'Migration Risk Exposure', unit: 'Risk Index', baseline: 'Low', target: 'Zero Cutover Risk', observed: 'Zero Cutover Risk', status: 'on_track', deltaSummary: 'Protected certified hardware boundary' },
    ],
    Retire: [
      { id: 'm1', label: 'Annual Run & License Cost', unit: 'USD/yr', baseline: '$245K / yr', target: '$12K / yr (Cold Archive)', observed: '$9K / yr', status: 'exceeded', deltaSummary: '96% run-cost eliminated (Representative)' },
      { id: 'm2', label: 'EOL Security Vulnerabilities', unit: 'Critical CVEs', baseline: '14 open CVEs', target: '0 CVEs', observed: '0 CVEs', status: 'on_track', deltaSummary: '100% legacy runtime surface removed' },
      { id: 'm3', label: 'Consumer Cutover Completeness', unit: 'Integrations', baseline: workload.knownDependencies, target: '0 active dependencies', observed: '0 active dependencies', status: 'on_track', deltaSummary: 'All consumers verified on modern ERP/Lake' },
    ],
    Rehost: [
      { id: 'm1', label: 'Infrastructure & Facility TCO', unit: 'USD/yr', baseline: '$510K / yr', target: '$360K / yr', observed: '$352K / yr', status: 'exceeded', deltaSummary: '31% savings post-colocation exit (Representative)' },
      { id: 'm2', label: 'Cutover Downtime Window', unit: 'Hours', baseline: '6.0 hr max', target: '< 4.0 hrs', observed: '3.2 hrs', status: 'exceeded', deltaSummary: 'Completed 48 mins ahead of maintenance window' },
      { id: 'm3', label: 'Partner Interface Continuity', unit: 'Pass Rate', baseline: '100%', target: '100%', observed: '100%', status: 'on_track', deltaSummary: 'Zero dropped partner connections' },
    ],
    Replatform: [
      { id: 'm1', label: '3-Year Platform TCO', unit: 'USD (3-yr)', baseline: '$4.8M baseline', target: '$3.1M (-35%)', observed: '$2.95M (-38%)', status: 'exceeded', deltaSummary: '38% lower TCO via serverless autoscaling (Representative)' },
      { id: 'm2', label: 'Analytical / Batch Throughput', unit: 'Latency', baseline: '4.5 hr nightly batch', target: '< 30 mins', observed: '18 mins (15x faster)', status: 'exceeded', deltaSummary: 'Unblocked real-time AI/ML & BI reporting' },
      { id: 'm3', label: 'Database Patching Toil', unit: 'Eng Hours/mo', baseline: '64 hrs/mo', target: '< 10 hrs/mo', observed: '8 hrs/mo', status: 'on_track', deltaSummary: '87% reduction in manual DBA maintenance' },
    ],
    Refactor: [
      { id: 'm1', label: 'Release Deployment Frequency', unit: 'Cadence', baseline: 'Quarterly monolith release', target: 'Weekly independent deploy', observed: '2.4x / week', status: 'exceeded', deltaSummary: '10x faster feature delivery (Representative)' },
      { id: 'm2', label: 'Peak Throughput Capacity', unit: 'Events/sec', baseline: '1,200 req/s (saturated)', target: '10,000 req/s elastic', observed: '11,500 req/s', status: 'exceeded', deltaSummary: 'Zero throttling during peak surge simulation' },
      { id: 'm3', label: 'Legacy Database License Spend', unit: 'USD/yr', baseline: '$1.2M / yr', target: '$420K / yr', observed: '$460K / yr', status: 'variance', deltaSummary: '8% variance due to 30-day dual-run overlap' },
    ],
    Repurchase: [
      { id: 'm1', label: 'Annual Total Cost of Ownership', unit: 'USD/yr', baseline: '$960K / yr custom dev', target: '$485K / yr SaaS', observed: '$475K / yr', status: 'exceeded', deltaSummary: '50% TCO reduction vs. custom maintenance (Representative)' },
      { id: 'm2', label: 'Time to Regulatory Compliance', unit: 'Weeks', baseline: '16 wks custom coding', target: 'Immediate vendor SLA', observed: 'Immediate vendor SLA', status: 'on_track', deltaSummary: 'Automated rule updates included in SaaS subscription' },
      { id: 'm3', label: 'Legacy Custom Code Debt', unit: 'LOC Retired', baseline: '140,000 LOC', target: '0 custom LOC', observed: '0 custom LOC', status: 'on_track', deltaSummary: '100% custom codebase retired after cutover' },
    ],
  };

  const learningsBy6R: Record<Disposition6R, LearningCapture[]> = {
    Retain: [
      {
        id: 'l1',
        originalAssumption: 'Assumed all on-premises workloads should move to public cloud in Wave 1.',
        actualResult: 'Latency and hardware certification evidence proved on-premises retention avoided negative ROI and production risk.',
        difference: 'Saved $1.1M+ in unnecessary re-certification cost by validating Dependency & Risk DNA early.',
        lesson: 'Enforce equal consideration of Retain when sub-5ms hardware buses or recent amortization exist.',
        futureApplicability: 'Apply to all shop-floor MES, PLC/SCADA, and physical HSM vault workloads.',
      },
    ],
    Retire: [
      {
        id: 'l1',
        originalAssumption: 'Assumed legacy utility had no downstream impact because UI login count was zero.',
        actualResult: 'Dependency DNA inspection uncovered scheduled nightly CSV/archive exports that required consumer sign-off first.',
        difference: '2-week consumer transition phase prevented downstream reporting breakage before server shutdown.',
        lesson: 'Never approve Retire without verifying both interactive users and automated batch/API consumers.',
        futureApplicability: 'Mandatory checklist gate for all Wave 1 Retire candidates across the enterprise.',
      },
    ],
    Rehost: [
      {
        id: 'l1',
        originalAssumption: 'Assumed external partner connections would transfer automatically during VM lift-and-shift.',
        actualResult: 'External partner IP allowlists required 14-day advance notice prior to DNS cutover.',
        difference: 'Early Dependency DNA verification kept the 90-day colocation exit on schedule without downtime.',
        lesson: 'Verify external B2B IP allowlist lead times during the Prepare Destination phase.',
        futureApplicability: 'Standardize across all B2B EDI and payment gateway Rehost waves.',
      },
    ],
    Replatform: [
      {
        id: 'l1',
        originalAssumption: 'Assumed 100% of legacy stored procedures/ETL scripts would auto-convert without tuning.',
        actualResult: '88% converted automatically; 12% required partitioning adjustments during the Transform/Migrate phase.',
        difference: '3-day schema validation spike yielded 38% lower query TCO on the target managed platform.',
        lesson: 'Require Target-State partitioning rules (`ts2`) and TCO baseline (`e3`) before approving Replatform.',
        futureApplicability: 'Use as the default blueprint for all legacy EDW and Oracle-to-managed-cloud moves.',
      },
    ],
    Refactor: [
      {
        id: 'l1',
        originalAssumption: 'Assumed monolithic database could be split simultaneously with service extraction.',
        actualResult: 'Dual-run change-data-capture (CDC) buffer was required for 30 days across 7 downstream integrations.',
        difference: 'Added 8% temporary dual-run cost but guaranteed zero data loss and zero SLA breaches.',
        lesson: 'Budget a 30-day parallel CDC window whenever refactoring high-criticality workloads with >5 integrations.',
        futureApplicability: 'Update Economics DNA TCO estimators for all Wave 3 Refactor candidates.',
      },
    ],
    Repurchase: [
      {
        id: 'l1',
        originalAssumption: 'Assumed historical attachments and audit records needed 100% migration into the new SaaS tenant.',
        actualResult: 'Migrating only active 24-month records to SaaS and archiving older data to cold storage cut onboarding time by 60%.',
        difference: 'Saved $180K in SaaS tier storage overages while satisfying statutory retention.',
        lesson: 'Split active operational data from cold archival data before SaaS data migration.',
        futureApplicability: 'Standardize across all Repurchase SaaS transitions.',
      },
    ],
  };

  return {
    workloadId: workload.id,
    disposition,
    plainEnglish: meta.plainEnglish,
    governanceStatus: governanceApproved
      ? 'APPROVED'
      : isReady
      ? 'PENDING_APPROVAL'
      : 'BLOCKED_EVIDENCE',
    approvedBy: governanceApproved ? 'Chief Enterprise Architect & CISO Delegate' : undefined,
    approvedRole: governanceApproved ? 'Architecture Review Board (ARB)' : undefined,
    approvedAt: governanceApproved ? new Date().toISOString() : undefined,
    approvalNote: governanceApproved ? `Approved ${meta.plainEnglish} (${disposition}) based on ${rec.evidenceCompleteness}% verified Enterprise DNA evidence.` : undefined,
    overallProgress,
    currentPhaseLabel: `${currentStage.order}. ${currentStage.label}`,
    nextGateLabel: nextStage.gateRequirement,
    activeBlocker: activeBlockerText,
    agentAlert: !isReady
      ? `Modernization Agent blocked execution: ${rec.criticalGaps.length} critical evidence gap(s) must be verified before governance sign-off.`
      : !governanceApproved
      ? `Evidence Readiness Gate passed (${rec.evidenceCompleteness}% READY). Modernization Agent recommends Human Governance Approval to unlock ${meta.stages[1] || 'execution'}.`
      : `Governance approved. Modernization Agent is tracking ${currentStage.label} against ${nextStage.gateRequirement}.`,
    currentArchSummary: `${workload.currentStack} · ${workload.hosting} · ${workload.knownDependencies}`,
    targetArchSummary: targetArchBy6R[disposition],
    stages,
    outcomes: outcomesBy6R[disposition],
    learnings: learningsBy6R[disposition],
  };
}
