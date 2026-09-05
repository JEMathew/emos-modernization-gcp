import type {
  Disposition6R,
  EnterpriseWorkload,
  Interaction,
  MobilizationItem,
  ModernizationWave,
  ProgramAlignment,
  WaveWorkload,
} from '../types';

const dispositionWave: Record<Disposition6R, number> = {
  Retire: 1,
  Repurchase: 1,
  Rehost: 2,
  Replatform: 2,
  Refactor: 3,
  Retain: 3,
};

const waveDefinitions = [
  { id: 'wave-1', order: 1, name: 'Wave 1 · Prove & Simplify', objective: 'Deliver lower-complexity outcomes and validate the modernization operating model.' },
  { id: 'wave-2', order: 2, name: 'Wave 2 · Platform Moves', objective: 'Move suitable workloads to managed target capabilities after core dependencies are understood.' },
  { id: 'wave-3', order: 3, name: 'Wave 3 · Strategic Transformation', objective: 'Sequence high-complexity or business-critical transformations behind proven foundations.' },
];

function assessmentFor(workload: EnterpriseWorkload, interactions: Interaction[]) {
  return interactions
    .filter((item) => item.workloadId === workload.id || item.workloadName?.toLowerCase() === workload.name.toLowerCase())
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
}

function missingEvidence(workload: EnterpriseWorkload): string[] {
  return Object.values(workload.dna)
    .flat()
    .filter((field) => field.status !== 'known')
    .map((field) => field.label)
    .slice(0, 4);
}

export function buildModernizationWaves(
  workloads: EnterpriseWorkload[],
  interactions: Interaction[],
): ModernizationWave[] {
  const buckets = new Map<number, WaveWorkload[]>(waveDefinitions.map((wave) => [wave.order, []]));

  [...workloads]
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((workload) => {
      const assessment = assessmentFor(workload, interactions);
      const disposition = assessment?.recommended6R as Disposition6R | undefined;
      let wave = disposition ? dispositionWave[disposition] : 2;
      const dependencyText = workload.knownDependencies.toLowerCase();
      const dependencyHeavy = /multiple|several|\b[5-9]\b|\b\d{2,}\b/.test(dependencyText);
      if (dependencyHeavy || (workload.businessCriticality === 'High' && disposition === 'Refactor')) wave = Math.min(3, wave + 1);

      const blockers = missingEvidence(workload);
      const readiness = !assessment
        ? 'ASSESSMENT REQUIRED'
        : assessment.decisionReadiness === 'READY' && workload.evidenceCompleteness >= 70
          ? 'READY'
          : 'CONDITIONAL';
      const rationale = disposition
        ? `${disposition} sequencing based on ${workload.businessCriticality.toLowerCase()} criticality, dependency complexity, and ${workload.evidenceCompleteness}% verified evidence.`
        : `Provisional sequencing based on workload criticality, dependency complexity, and ${workload.evidenceCompleteness}% verified evidence; governed 6R assessment is still required.`;

      buckets.get(wave)?.push({
        workloadId: workload.id,
        workloadName: workload.name,
        disposition: disposition || 'Assessment required',
        readiness,
        evidenceCompleteness: workload.evidenceCompleteness,
        rationale,
        blockers,
      });
    });

  return waveDefinitions.map((definition) => ({
    ...definition,
    workloads: buckets.get(definition.order) || [],
  }));
}

export function buildMobilizationReadiness(
  alignment: ProgramAlignment,
  waves: ModernizationWave[],
): MobilizationItem[] {
  const planned = waves.flatMap((wave) => wave.workloads);
  const conditional = planned.filter((item) => item.readiness !== 'READY').length;
  return [
    { id: 'governance', category: 'Governance', label: 'Executive sponsorship and decision ownership', status: alignment.executiveSponsor.trim() ? 'READY' : 'ACTION REQUIRED', evidence: alignment.executiveSponsor.trim() || 'Executive sponsor has not been recorded.' },
    { id: 'outcomes', category: 'Governance', label: 'Measurable program outcomes', status: alignment.businessOutcomes.trim() && alignment.successMeasures.trim() ? 'READY' : 'ACTION REQUIRED', evidence: alignment.successMeasures.trim() || 'Define measurable success criteria before funding waves.' },
    { id: 'platform', category: 'Platform', label: 'Target platform strategy', status: alignment.targetPlatform.trim() ? 'READY' : 'ACTION REQUIRED', evidence: alignment.targetPlatform.trim() || 'Target platform remains intentionally vendor-neutral and unresolved.' },
    { id: 'evidence', category: 'Delivery', label: 'Decision-ready workload evidence', status: conditional === 0 && planned.length > 0 ? 'READY' : 'ACTION REQUIRED', evidence: planned.length ? `${conditional} of ${planned.length} planned workloads require assessment or evidence remediation.` : 'No workloads are currently in the plan.' },
    { id: 'security', category: 'Security', label: 'Security and compliance approval', status: alignment.securityApprover.trim() ? 'READY' : 'ACTION REQUIRED', evidence: alignment.securityApprover.trim() || 'Assign a named security and compliance approver.' },
    { id: 'teams', category: 'People', label: 'Wave delivery accountability', status: alignment.deliveryOwner.trim() ? 'READY' : 'ACTION REQUIRED', evidence: alignment.deliveryOwner.trim() || 'Assign a delivery owner, then validate skills, capacity, vendors, and product ownership for each approved wave.' },
  ];
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] || character);
}

export function buildExecutiveDecisionHtml(
  alignment: ProgramAlignment,
  waves: ModernizationWave[],
  readiness: MobilizationItem[],
): string {
  const workloadCount = waves.reduce((total, wave) => total + wave.workloads.length, 0);
  const readyCount = waves.flatMap((wave) => wave.workloads).filter((item) => item.readiness === 'READY').length;
  const waveMarkup = waves.map((wave) => `<section><h2>${escapeHtml(wave.name)}</h2><p>${escapeHtml(wave.objective)}</p>${wave.workloads.length ? `<table><thead><tr><th>Workload</th><th>6R</th><th>Readiness</th><th>Evidence</th><th>Decision basis and gaps</th></tr></thead><tbody>${wave.workloads.map((item) => `<tr><td>${escapeHtml(item.workloadName)}</td><td>${escapeHtml(item.disposition)}</td><td>${escapeHtml(item.readiness)}</td><td>${item.evidenceCompleteness}%</td><td>${escapeHtml(item.rationale)}${item.blockers.length ? `<br><strong>Gaps:</strong> ${escapeHtml(item.blockers.join('; '))}` : ''}</td></tr>`).join('')}</tbody></table>` : '<p>No workloads assigned.</p>'}</section>`).join('');
  const readinessMarkup = readiness.map((item) => `<li><strong>${escapeHtml(item.category)} · ${escapeHtml(item.label)}</strong> — ${escapeHtml(item.status)}<br><span>${escapeHtml(item.evidence)}</span></li>`).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(alignment.programName || 'EMOS Executive Decision Pack')}</title><style>body{font:15px system-ui;color:#202124;max-width:1100px;margin:40px auto;padding:0 28px;line-height:1.5}header{border-bottom:3px solid #9a7440;padding-bottom:20px}h1{font:600 34px Georgia;margin:0}h2{font:600 22px Georgia;margin-top:32px}small{color:#666}.metrics{display:flex;gap:12px;flex-wrap:wrap;margin:20px 0}.metric{border:1px solid #ddd;border-radius:10px;padding:12px 16px}.metric strong{font-size:22px;display:block}table{width:100%;border-collapse:collapse;font-size:13px}th,td{text-align:left;vertical-align:top;padding:9px;border-bottom:1px solid #ddd}li{margin:10px 0}span{color:#555}@media print{body{margin:0}.no-print{display:none}}</style></head><body><header><small>EMOS · GOVERNED MODERNIZATION DECISION ARTIFACT</small><h1>${escapeHtml(alignment.programName || 'Enterprise Modernization Program')}</h1><p>Executive sponsor: ${escapeHtml(alignment.executiveSponsor || 'Not assigned')} · Security approver: ${escapeHtml(alignment.securityApprover || 'Not assigned')} · Delivery owner: ${escapeHtml(alignment.deliveryOwner || 'Not assigned')}</p><p>Target platform: ${escapeHtml(alignment.targetPlatform || 'Vendor neutral / undecided')} · Risk posture: ${escapeHtml(alignment.riskTolerance)} · Time horizon: ${alignment.timeHorizonMonths} months</p><p><strong>Business outcomes:</strong> ${escapeHtml(alignment.businessOutcomes || 'Not recorded')}</p><p><strong>Success measures:</strong> ${escapeHtml(alignment.successMeasures || 'Not recorded')}</p></header><div class="metrics"><div class="metric"><strong>${workloadCount}</strong>workloads</div><div class="metric"><strong>${readyCount}</strong>decision ready</div><div class="metric"><strong>${alignment.timeHorizonMonths}</strong>month horizon</div></div>${waveMarkup}<section><h2>Mobilization readiness</h2><ul>${readinessMarkup}</ul></section><p><small>Generated by EMOS from deterministic portfolio evidence and governed 6R assessment metadata. This artifact is a decision aid, not authorization to execute a migration.</small></p></body></html>`;
}
