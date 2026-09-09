import type { EnterpriseWorkload } from '../types';
import { EMOS_FACTS } from '../config/productFacts';
import { evaluateEvidenceReadiness } from './readiness';

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] || character);
}

function escapeCsv(value: string): string {
  const safeValue = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safeValue.replace(/"/g, '""')}"`;
}

export function buildEvidenceActionPlanCsv(workload: EnterpriseWorkload): string {
  const dimensions = [
    ['Business', workload.dna.business],
    ['Technology', workload.dna.technology],
    ['Dependencies', workload.dna.dependency],
    ['Economics', workload.dna.economics],
    ['Data & Risk', workload.dna.dataAndRisk],
    ['Target State', workload.dna.targetState],
  ] as const;
  const rows = dimensions.flatMap(([dimension, fields]) => fields
    .filter((field) => field.status !== 'known')
    .map((field) => [dimension, field.label, field.status, '', '', '']));
  const header = ['Dimension', 'Evidence Gap', 'Current Status', 'Owner', 'Evidence Source', 'Due Date'];
  return [header, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n');
}

export function buildSampleDecisionBrief(workload: EnterpriseWorkload): string {
  const result = evaluateEvidenceReadiness(workload.dna);
  const gaps = result.criticalGaps.map((gap) => `<li>${escapeHtml(gap)}</li>`).join('');

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>EMOS Sample Decision Brief — ${escapeHtml(workload.name)}</title>
<style>
body{font:15px/1.55 system-ui,-apple-system,sans-serif;color:#1a1a1a;max-width:920px;margin:40px auto;padding:0 28px}header{border-bottom:4px solid #a88554;padding-bottom:22px}h1,h2{font-family:Georgia,serif}h1{font-size:36px;margin:.25rem 0}.eyebrow{color:#785627;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:24px 0}.metric,.gate{border:1px solid #ddd;border-radius:12px;padding:16px}.metric strong{display:block;font-size:26px}.gate{border-color:#e5b84e;background:#fff9e8}.status{font-weight:800;color:#8a5600}.note{color:#666;font-size:13px}.actions{margin-top:28px;border-top:1px solid #ddd;padding-top:20px}@media(max-width:640px){.grid{grid-template-columns:1fr}}@media print{body{margin:0}.no-print{display:none}}
</style></head><body>
<header><div class="eyebrow">EMOS · Sample Governed Decision Artifact</div><h1>${escapeHtml(workload.name)}</h1><p>A wholly synthetic example showing how EMOS separates an explainable modernization hypothesis from a decision that is ready for approval.</p></header>
<div class="grid"><div class="metric"><strong>${result.completeness}%</strong>Evidence complete</div><div class="metric"><strong>${result.knownCount}/${result.totalCount}</strong>Attributes verified</div><div class="metric"><strong>${EMOS_FACTS.readinessThreshold}%</strong>Minimum threshold</div></div>
<section class="gate"><div class="eyebrow">Decision Gate</div><h2 class="status">${result.decisionReadiness}</h2><p>${result.decisionReadiness === 'READY' ? `The ${EMOS_FACTS.readinessThreshold}% minimum is met and no critical evidence gaps remain. The record is ready for human review—not automatically approved.` : `Meeting ${EMOS_FACTS.readinessThreshold}% is necessary but not sufficient. Unresolved critical evidence gaps still block readiness.`}</p></section>
<section><h2>Business Context</h2><p>Apex Aerospace Manufacturing has committed to unified customer analytics. This ${escapeHtml(workload.currentStack)} workload supports a high-criticality capability and has ${escapeHtml(workload.knownDependencies)}.</p></section>
<section><h2>6R Hypothesis</h2><p>Replatform and Refactor remain plausible paths. EMOS does not approve either while the decision record is incomplete. Retain, Retire, Rehost and Repurchase remain visible alternatives and must be rejected with evidence—not vendor preference.</p></section>
<section><h2>Critical Evidence Required Next</h2><ul>${gaps}</ul></section>
<section class="actions"><h2>Governance Conclusion</h2><p><strong>${result.decisionReadiness === 'READY' ? 'The evidence record is ready for human review.' : 'No modernization disposition should be approved yet.'}</strong> ${result.decisionReadiness === 'READY' ? 'A human decision owner must still review the evidence, alternatives and risks before approval.' : 'Validate the missing dependency, TCO and target-state evidence, then rerun the decision gate and request human review.'}</p><p class="note">Generated from synthetic EMOS Beta v1.0 data. This decision-support artifact is not authorization to execute a migration.</p></section>
</body></html>`;
}

export function downloadSampleDecisionBrief(workload: EnterpriseWorkload): void {
  const html = buildSampleDecisionBrief(workload);
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'emos-sample-executive-decision-brief.html';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function downloadEvidenceActionPlan(workload: EnterpriseWorkload): void {
  const csv = buildEvidenceActionPlanCsv(workload);
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'emos-evidence-action-plan.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
