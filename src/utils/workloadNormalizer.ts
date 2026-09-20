import type { EnterpriseWorkload, EnterpriseDna, DnaField, RawImportRecord } from '../types';
import { calculateDnaCompleteness } from '../data/samplePortfolio';
import { sanitizeEvidenceValue, MAX_FIELD_LENGTH, MAX_NAME_LENGTH, MAX_ID_LENGTH } from '../lib/guardrails';

export function sanitizeInputString(val: unknown, maxLength = MAX_FIELD_LENGTH): string {
  return sanitizeEvidenceValue(val, maxLength);
}

function evaluateFieldStatus(
  rawVal: string | undefined,
  defaultMissingLabel = 'Missing'
): { status: 'known' | 'missing' | 'incomplete'; value: string; detail?: string } {
  if (!rawVal) {
    return { status: 'missing', value: defaultMissingLabel };
  }

  const trimmed = rawVal.trim();
  const lower = trimmed.toLowerCase();

  if (
    lower === '' ||
    lower === 'missing' ||
    lower === 'unknown' ||
    lower === 'n/a' ||
    lower === 'none' ||
    lower === 'null' ||
    lower === 'undefined'
  ) {
    return { status: 'missing', value: defaultMissingLabel };
  }

  if (lower.startsWith('incomplete') || lower.includes('unverified') || lower.includes('partial')) {
    return {
      status: 'incomplete',
      value: 'Incomplete',
      detail: trimmed.length > 12 ? sanitizeInputString(trimmed) : 'Specification unverified or partially supplied',
    };
  }

  return {
    status: 'known',
    value: sanitizeInputString(trimmed),
  };
}

/**
 * Converts a validated raw record into a complete 6-dimension EnterpriseWorkload with DNA.
 */
export function buildWorkloadFromRawRecord(
  record: RawImportRecord,
  userId?: string
): EnterpriseWorkload {
  const id = sanitizeInputString(record.workload_id || `wl-${Date.now()}`, MAX_ID_LENGTH);
  const name = sanitizeInputString(record.workload_name || 'Unnamed Workload', MAX_NAME_LENGTH);
  const typeStr = sanitizeInputString(record.workload_type || 'Application', 100);
  const type: 'Application' | 'Data Platform' =
    typeStr.toLowerCase().includes('data') || typeStr.toLowerCase().includes('platform')
      ? 'Data Platform'
      : 'Application';

  // 1. Business DNA (3 fields)
  const businessCap = evaluateFieldStatus(record.business_capability);
  const businessCritRaw = (record.business_criticality || 'Medium').trim();
  const businessCrit: 'High' | 'Medium' | 'Low' =
    businessCritRaw.toLowerCase() === 'high'
      ? 'High'
      : businessCritRaw.toLowerCase() === 'low'
      ? 'Low'
      : 'Medium';
  const modDrivers = evaluateFieldStatus(record.modernization_drivers);

  const business: DnaField[] = [
    { id: 'b1', label: 'Business Capability', value: businessCap.value, status: businessCap.status, detail: businessCap.detail },
    { id: 'b2', label: 'Business Criticality', value: record.business_criticality ? businessCrit : 'Missing', status: record.business_criticality ? 'known' : 'missing' },
    { id: 'b3', label: 'Modernization Drivers', value: modDrivers.value, status: modDrivers.status, detail: modDrivers.detail },
  ];

  // 2. Technology DNA (4 fields)
  const runtime = evaluateFieldStatus(record.runtime);
  const database = evaluateFieldStatus(record.database);
  const hosting = evaluateFieldStatus(record.hosting);
  const techRisk = evaluateFieldStatus(record.technology_lifecycle_risk);

  const technology: DnaField[] = [
    { id: 't1', label: 'Runtime', value: runtime.value, status: runtime.status, detail: runtime.detail },
    { id: 't2', label: 'Database', value: database.value, status: database.status, detail: database.detail },
    { id: 't3', label: 'Hosting', value: hosting.value, status: hosting.status, detail: hosting.detail },
    { id: 't4', label: 'Technology Lifecycle Risk', value: techRisk.value, status: techRisk.status, detail: techRisk.detail },
  ];

  // 3. Dependency DNA (2 fields)
  const knownDeps = evaluateFieldStatus(record.known_dependencies);
  const depDetails = evaluateFieldStatus(record.dependency_details);

  const dependency: DnaField[] = [
    { id: 'd1', label: 'Known Dependencies', value: knownDeps.value, status: knownDeps.status, detail: knownDeps.detail },
    { id: 'd2', label: 'Dependency Details', value: depDetails.value, status: depDetails.status, detail: depDetails.detail },
  ];

  // 4. Economics DNA (3 fields)
  const infraCost = evaluateFieldStatus(record.infrastructure_cost);
  const licenseCost = evaluateFieldStatus(record.licensing_cost);
  const tcoBaseline = evaluateFieldStatus(record.tco_baseline);

  const economics: DnaField[] = [
    { id: 'e1', label: 'Infrastructure Cost', value: infraCost.value, status: infraCost.status, detail: infraCost.detail },
    { id: 'e2', label: 'Licensing Cost', value: licenseCost.value, status: licenseCost.status, detail: licenseCost.detail },
    { id: 'e3', label: 'Detailed TCO Baseline', value: tcoBaseline.value, status: tcoBaseline.status, detail: tcoBaseline.detail },
  ];

  // 5. Data & Risk DNA (3 fields)
  const custData = evaluateFieldStatus(record.customer_data);
  const dataVol = evaluateFieldStatus(record.data_volume_velocity);
  const compliance = evaluateFieldStatus(record.compliance_constraints);

  const dataAndRisk: DnaField[] = [
    { id: 'dr1', label: 'Customer Data / Sensitivity', value: custData.value, status: custData.status, detail: custData.detail },
    { id: 'dr2', label: 'Data Volume & Velocity', value: dataVol.value, status: dataVol.status, detail: dataVol.detail },
    { id: 'dr3', label: 'Compliance Constraints', value: compliance.value, status: compliance.status, detail: compliance.detail },
  ];

  // 6. Target-State DNA (3 fields)
  const targetCloud = evaluateFieldStatus(record.target_cloud_platform);
  const targetArch = evaluateFieldStatus(record.target_architecture_constraints);
  const downtimeTol = evaluateFieldStatus(record.migration_downtime_tolerance);

  const targetState: DnaField[] = [
    { id: 'ts1', label: 'Target Cloud / Platform Strategy', value: targetCloud.value, status: targetCloud.status, detail: targetCloud.detail },
    { id: 'ts2', label: 'Target Architecture Constraints', value: targetArch.value, status: targetArch.status, detail: targetArch.detail },
    { id: 'ts3', label: 'Migration Downtime Tolerance', value: downtimeTol.value, status: downtimeTol.status, detail: downtimeTol.detail },
  ];

  const dna: EnterpriseDna = {
    business,
    technology,
    dependency,
    economics,
    dataAndRisk,
    targetState,
  };

  const completenessStats = calculateDnaCompleteness(dna);

  // Modernization Signals extraction
  const signals: string[] = [];
  if (record.modernization_drivers && record.modernization_drivers !== 'Missing') {
    record.modernization_drivers
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .forEach((s) => signals.push(sanitizeInputString(s)));
  }
  if (signals.length === 0) {
    if (infraCost.status === 'known') signals.push(`Infra cost: ${infraCost.value}`);
    if (licenseCost.status === 'known') signals.push(`Licensing: ${licenseCost.value}`);
    if (techRisk.status === 'known') signals.push(`Lifecycle risk: ${techRisk.value}`);
    if (signals.length === 0) signals.push('General modernization assessment required');
  }

  // Current stack summary
  let currentStack = 'Unspecified';
  if (runtime.status === 'known' && database.status === 'known') {
    currentStack = `${runtime.value} + ${database.value}`;
  } else if (runtime.status === 'known') {
    currentStack = runtime.value;
  } else if (database.status === 'known') {
    currentStack = `Database: ${database.value}`;
  }

  const workload: EnterpriseWorkload = {
    id,
    name,
    type,
    businessCapability: businessCap.status === 'known' ? businessCap.value : 'Unspecified',
    businessCriticality: businessCrit,
    currentStack,
    hosting: hosting.status === 'known' ? hosting.value : 'Unspecified',
    knownDependencies: knownDeps.status === 'known' ? knownDeps.value : 'Unmapped Dependencies',
    modernizationSignals: signals,
    evidenceCompleteness: completenessStats.completeness,
    dna,
    userId,
    importedAt: new Date().toISOString(),
    source: 'imported',
  };

  // Evaluation metadata (isolated for testing, never sent to Gemini)
  if (record.expected_6r || record.expected_reason) {
    workload.evaluationMeta = {
      expected6r: sanitizeInputString(record.expected_6r),
      expectedReason: sanitizeInputString(record.expected_reason),
    };
  }

  return workload;
}
