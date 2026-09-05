import type {
  EnterpriseWorkload,
  EnterpriseDna,
  DnaField,
  RawImportRecord,
  ImportValidationResult,
  InvalidImportRow,
} from '../types';
import { calculateDnaCompleteness } from '../data/samplePortfolio';
import {
  sanitizeEvidenceValue,
  MAX_FIELD_LENGTH,
  MAX_NAME_LENGTH,
  MAX_ID_LENGTH,
} from '../lib/guardrails';

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const MAX_IMPORT_WORKLOADS = 200;
export const MAX_FILE_SIZE_LABEL = '5MB';

function workloadLimitError(count: number): Error {
  return new Error(
    `Portfolio contains ${count} workloads. The maximum supported per file is ${MAX_IMPORT_WORKLOADS}. Split the portfolio into smaller files and try again.`
  );
}

/**
 * Defends against CSV / Spreadsheet formula injection and limits text lengths.
 */
export function sanitizeInputString(val: unknown, maxLength = MAX_FIELD_LENGTH): string {
  return sanitizeEvidenceValue(val, maxLength);
}

/**
 * Robust CSV parser that handles quotes, escaped quotes, multiline values, and commas.
 */
export function parseCsvText(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote inside quoted cell
          currentCell += '"';
          i++;
        } else {
          // Closing quote
          inQuotes = false;
        }
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if (char === '\r') {
        // Skip CR in CRLF
        if (nextChar === '\n') {
          i++;
        }
        currentRow.push(currentCell.trim());
        if (currentRow.some((c) => c.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
      } else if (char === '\n') {
        currentRow.push(currentCell.trim());
        if (currentRow.some((c) => c.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((c) => c.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Normalizes raw key names (e.g. "Workload ID", "workload_id", "WORKLOAD_ID") into canonical schema keys.
 */
function normalizeKey(key: string): string {
  return key
    .toLowerCase()
    .trim()
    .replace(/[\s\-_]+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

/**
 * Evaluates field content to determine DnaEvidenceStatus ('known' | 'missing' | 'incomplete').
 */
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
      detail: trimmed.length > 12 ? trimmed : 'Specification unverified or partially supplied',
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
    { id: 'b2', label: 'Business Criticality', value: businessCrit, status: 'known' },
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
  let currentStack = 'Custom Architecture';
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
    businessCapability: businessCap.status === 'known' ? businessCap.value : 'General Enterprise Capability',
    businessCriticality: businessCrit,
    currentStack,
    hosting: hosting.status === 'known' ? hosting.value : 'On-premises / Unspecified',
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

/**
 * Validates and parses an uploaded file (CSV or JSON).
 */
export async function parseAndValidatePortfolioFile(
  file: File,
  userId?: string
): Promise<ImportValidationResult> {
  const fileName = file.name;
  const extension = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();

  if (extension !== '.csv' && extension !== '.json') {
    throw new Error(`Unsupported file type: "${extension}". Only .csv and .json files are supported.`);
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `File size exceeds ${MAX_FILE_SIZE_LABEL} limit (${(file.size / (1024 * 1024)).toFixed(2)} MB). Please upload a smaller file.`
    );
  }

  const text = await file.text();

  if (extension === '.csv') {
    return parseCsvPortfolio(text, fileName, userId);
  } else {
    return parseJsonPortfolio(text, fileName, userId);
  }
}

/**
 * Parses raw CSV content into validated EnterpriseWorkloads.
 */
export function parseCsvPortfolio(
  csvText: string,
  fileName: string,
  userId?: string
): ImportValidationResult {
  const rawRows = parseCsvText(csvText);

  if (rawRows.length < 2) {
    throw new Error('The CSV file is empty or does not contain data rows beyond the header.');
  }

  const rawHeaders = rawRows[0];
  const normalizedHeaders = rawHeaders.map(normalizeKey);

  // Validate required headers
  const requiredFields = ['workload_id', 'workload_name', 'workload_type'];
  const missingHeaders = requiredFields.filter((f) => !normalizedHeaders.includes(f));

  if (missingHeaders.length > 0) {
    throw new Error(
      `Missing required CSV headers: ${missingHeaders.join(', ')}. Your file must include: workload_id, workload_name, workload_type.`
    );
  }

  const validRecords: EnterpriseWorkload[] = [];
  const invalidRecords: InvalidImportRow[] = [];
  const warnings: string[] = [];
  const seenIds = new Set<string>();
  const detectedWorkloadTypes = new Set<string>();
  let totalEvidenceGaps = 0;

  const dataRows = rawRows.slice(1);
  if (dataRows.length > MAX_IMPORT_WORKLOADS) {
    throw workloadLimitError(dataRows.length);
  }

  const rowsToProcess = dataRows;

  rowsToProcess.forEach((row, idx) => {
    const rowNumber = idx + 2; // 1-indexed including header
    const rowObj: Record<string, string> = {};

    normalizedHeaders.forEach((header, colIdx) => {
      rowObj[header] = row[colIdx] !== undefined ? row[colIdx] : '';
    });

    const id = (rowObj['workload_id'] || '').trim();
    const name = (rowObj['workload_name'] || '').trim();
    const type = (rowObj['workload_type'] || '').trim();

    const rowErrors: string[] = [];

    if (!id) {
      rowErrors.push('Missing workload_id');
    } else if (seenIds.has(id.toLowerCase())) {
      rowErrors.push(`Duplicate workload_id "${id}" (must be unique)`);
    }

    if (!name) {
      rowErrors.push('Missing workload_name');
    }

    if (!type) {
      rowErrors.push('Missing workload_type');
    }

    if (rowErrors.length > 0) {
      invalidRecords.push({
        rowNumber,
        id: id || undefined,
        name: name || undefined,
        errors: rowErrors,
        status: 'REJECTED',
      });
      return;
    }

    seenIds.add(id.toLowerCase());

    try {
      const workload = buildWorkloadFromRawRecord(rowObj as unknown as RawImportRecord, userId);
      validRecords.push(workload);
      detectedWorkloadTypes.add(workload.type);

      const completeness = calculateDnaCompleteness(workload.dna);
      totalEvidenceGaps += completeness.missingCount + completeness.incompleteCount;
    } catch (err: any) {
      invalidRecords.push({
        rowNumber,
        id,
        name,
        errors: [err?.message || 'Failed to process record into Enterprise DNA'],
        status: 'REJECTED',
      });
    }
  });

  return {
    fileName,
    totalDetected: dataRows.length,
    validRecords,
    invalidRecords,
    warnings,
    detectedWorkloadTypes: Array.from(detectedWorkloadTypes),
    totalEvidenceGaps,
    rowBreakdown: {
      valid: validRecords.length,
      warning: warnings.length,
      rejected: invalidRecords.length,
    },
  };
}

/**
 * Parses raw JSON content into validated EnterpriseWorkloads.
 */
export function parseJsonPortfolio(
  jsonText: string,
  fileName: string,
  userId?: string
): ImportValidationResult {
  let parsed: any;
  try {
    parsed = JSON.parse(jsonText);
  } catch (err: any) {
    throw new Error(`Invalid JSON format: ${err?.message || 'Syntax error'}`);
  }

  let rawList: any[] = [];
  if (Array.isArray(parsed)) {
    rawList = parsed;
  } else if (parsed && Array.isArray(parsed.workloads)) {
    rawList = parsed.workloads;
  } else if (parsed && Array.isArray(parsed.data)) {
    rawList = parsed.data;
  } else {
    throw new Error(
      'JSON file must be an array of workload objects or contain a "workloads" array property.'
    );
  }

  const validRecords: EnterpriseWorkload[] = [];
  const invalidRecords: InvalidImportRow[] = [];
  const warnings: string[] = [];
  const seenIds = new Set<string>();
  const detectedWorkloadTypes = new Set<string>();
  let totalEvidenceGaps = 0;

  if (rawList.length > MAX_IMPORT_WORKLOADS) {
    throw workloadLimitError(rawList.length);
  }

  const itemsToProcess = rawList;

  itemsToProcess.forEach((item, idx) => {
    const rowNumber = idx + 1;
    if (!item || typeof item !== 'object') {
      invalidRecords.push({
        rowNumber,
        errors: ['Item must be a valid JSON object'],
        status: 'REJECTED',
      });
      return;
    }

    // Normalize keys
    const rowObj: Record<string, string> = {};
    Object.keys(item).forEach((k) => {
      rowObj[normalizeKey(k)] = typeof item[k] === 'string' ? item[k] : String(item[k] ?? '');
    });

    const id = (rowObj['workload_id'] || '').trim();
    const name = (rowObj['workload_name'] || '').trim();
    const type = (rowObj['workload_type'] || '').trim();

    const rowErrors: string[] = [];

    if (!id) {
      rowErrors.push('Missing workload_id');
    } else if (seenIds.has(id.toLowerCase())) {
      rowErrors.push(`Duplicate workload_id "${id}"`);
    }

    if (!name) {
      rowErrors.push('Missing workload_name');
    }

    if (!type) {
      rowErrors.push('Missing workload_type');
    }

    if (rowErrors.length > 0) {
      invalidRecords.push({
        rowNumber,
        id: id || undefined,
        name: name || undefined,
        errors: rowErrors,
        status: 'REJECTED',
      });
      return;
    }

    seenIds.add(id.toLowerCase());

    try {
      const workload = buildWorkloadFromRawRecord(rowObj as unknown as RawImportRecord, userId);
      validRecords.push(workload);
      detectedWorkloadTypes.add(workload.type);

      const completeness = calculateDnaCompleteness(workload.dna);
      totalEvidenceGaps += completeness.missingCount + completeness.incompleteCount;
    } catch (err: any) {
      invalidRecords.push({
        rowNumber,
        id,
        name,
        errors: [err?.message || 'Failed to process record'],
        status: 'REJECTED',
      });
    }
  });

  return {
    fileName,
    totalDetected: rawList.length,
    validRecords,
    invalidRecords,
    warnings,
    detectedWorkloadTypes: Array.from(detectedWorkloadTypes),
    totalEvidenceGaps,
    rowBreakdown: {
      valid: validRecords.length,
      warning: warnings.length,
      rejected: invalidRecords.length,
    },
  };
}
