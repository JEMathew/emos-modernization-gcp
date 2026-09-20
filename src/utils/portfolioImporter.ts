import type { EnterpriseWorkload, ImportValidationResult, RawImportRecord } from '../types';
import { buildWorkloadFromRawRecord, sanitizeInputString } from './workloadNormalizer';
import { MAX_FIELD_LENGTH, MAX_ID_LENGTH, MAX_NAME_LENGTH, redactSecrets, validateAndFenceUserPrompt } from '../lib/guardrails';
import { calculateDnaCompleteness } from '../data/samplePortfolio';
export { buildWorkloadFromRawRecord, sanitizeInputString } from './workloadNormalizer';

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_FILE_SIZE_LABEL = '5MB';
export const MAX_IMPORT_WORKLOADS = 200;
export const MAX_IMPORT_COLUMNS = 40;
export const MAX_NORMALIZED_BATCH_BYTES = 4 * 1024 * 1024;

const fields = [
  ['workload_id', 'Workload ID'], ['workload_name', 'Workload name'], ['workload_type', 'Workload type'],
  ['business_capability', 'Business capability'], ['business_criticality', 'Business criticality'],
  ['modernization_drivers', 'Modernization drivers'], ['runtime', 'Runtime'], ['database', 'Database'],
  ['hosting', 'Hosting'], ['technology_lifecycle_risk', 'Technology lifecycle risk'],
  ['known_dependencies', 'Known dependencies'], ['dependency_details', 'Dependency details'],
  ['infrastructure_cost', 'Infrastructure cost'], ['licensing_cost', 'Licensing cost'], ['tco_baseline', 'TCO baseline'],
  ['customer_data', 'Customer data / sensitivity'], ['data_volume_velocity', 'Data volume / velocity'],
  ['compliance_constraints', 'Compliance constraints'], ['target_cloud_platform', 'Target platform'],
  ['target_architecture_constraints', 'Target architecture constraints'], ['migration_downtime_tolerance', 'Downtime tolerance'],
  ['expected_6r', 'Expected 6R (evaluation only)'], ['expected_reason', 'Expected reason (evaluation only)'],
] as const;
export type ImportField = typeof fields[number][0];
export const IMPORT_FIELDS = fields.map(([key, label], index) => ({ key, label, required: index < 3 }));
export type ColumnMapping = Array<ImportField | ''>;
export interface PortfolioSource {
  fileName: string;
  format: 'csv' | 'json';
  columns: string[];
  rows: Array<{ rowNumber: number; values: unknown[]; errors: string[] }>;
}
export interface RowPreview {
  rowNumber: number;
  fields: Partial<Record<ImportField, string>>;
  warnings: string[];
  errors: string[];
  workload?: EnterpriseWorkload;
}
export interface IntakePreview extends ImportValidationResult { rows: RowPreview[]; importId: string }

function limitRows(count: number) {
  if (count > MAX_IMPORT_WORKLOADS) throw new Error(`Portfolio contains ${count} workloads. The maximum supported per file is ${MAX_IMPORT_WORKLOADS}. Split the file and try again.`);
}
const normalizeKey = (key: string) => key.trim().toLowerCase().replace(/[\s-]+/g, '_');
export const isSafeWorkloadId = (id: string) => /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,99}$/.test(id);
const aliases: Record<string, ImportField> = {
  id: 'workload_id', asset_id: 'workload_id', application_id: 'workload_id',
  name: 'workload_name', application_name: 'workload_name', asset_name: 'workload_name',
  type: 'workload_type', asset_type: 'workload_type', criticality: 'business_criticality',
  platform: 'hosting', technology: 'runtime',
};
export function suggestColumnMapping(columns: string[]): ColumnMapping {
  return columns.map(column => {
    const key = normalizeKey(column);
    return IMPORT_FIELDS.find(field => field.key === key)?.key ?? aliases[key] ?? '';
  });
}
export function mappingErrors(columns: string[], mapping: ColumnMapping): string[] {
  const errors: string[] = [];
  if (mapping.length !== columns.length) errors.push('Map each source column or explicitly choose Do not import.');
  for (const field of IMPORT_FIELDS) {
    const count = mapping.filter(value => value === field.key).length;
    if (field.required && !count) errors.push(`Map the required field: ${field.label}.`);
    if (count > 1) errors.push(`Map only one source column to ${field.label}.`);
  }
  if (mapping.some(value => value && !IMPORT_FIELDS.some(field => field.key === value))) errors.push('An unsupported target field was selected.');
  return errors;
}
function validateColumns(columns: string[]) {
  if (!columns.length || columns.length > MAX_IMPORT_COLUMNS) throw new Error(`Use between 1 and ${MAX_IMPORT_COLUMNS} source columns.`);
  const seen = new Set<string>();
  for (const column of columns) {
    const key = normalizeKey(column);
    if (!key || column.length > 100 || /[\x00-\x1f\x7f]/.test(column)) throw new Error('Every source column needs a non-empty name of at most 100 characters without control characters.');
    if (['__proto__', 'constructor', 'prototype'].includes(key)) throw new Error('Reserved object keys cannot be used as source columns.');
    if (redactSecrets(column) !== column) throw new Error('A source column appears to contain a credential. Remove it before uploading.');
    if (seen.has(key)) throw new Error('Duplicate or ambiguous source column names. Rename them before uploading.');
    seen.add(key);
  }
}

// Strict bounded CSV state machine. Preserves source text; normalization happens visibly later.
export function parseCsvText(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cell = '', state: 'start' | 'plain' | 'quoted' | 'closed' = 'start';
  const endCell = () => {
    row.push(cell); cell = ''; state = 'start';
    if (row.length > MAX_IMPORT_COLUMNS) throw new Error(`Maximum ${MAX_IMPORT_COLUMNS} columns supported.`);
  };
  const endRow = () => {
    endCell();
    if (row.some(value => value.trim())) rows.push(row);
    row = [];
    limitRows(Math.max(0, rows.length - 1));
  };
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (state === 'quoted') {
      if (char === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (char === '"') state = 'closed';
      else cell += char;
    } else if (char === ',') endCell();
    else if (char === '\n' || char === '\r') { endRow(); if (char === '\r' && text[i + 1] === '\n') i++; }
    else if (char === '"' && state === 'start') state = 'quoted';
    else if (char === '"' || (state === 'closed' && !/[ \t]/.test(char))) throw new Error(`Malformed CSV near record ${rows.length + 1}: check quotes and separators.`);
    else if (state !== 'closed') { cell += char; state = 'plain'; }
    if (cell.length > 10000) throw new Error('A source cell exceeds 10,000 characters. Shorten it before uploading.');
  }
  if (state === 'quoted') throw new Error('Malformed CSV: an opening quote has no closing quote.');
  if (cell.length || row.length || state === 'closed') endRow();
  return rows;
}
function checkText(text: string) {
  if (new TextEncoder().encode(text).byteLength > MAX_FILE_SIZE_BYTES) throw new Error('File size exceeds 5MB limit.');
  if (!text.trim()) throw new Error('The file is empty. Add headers and at least one workload.');
}
export function parsePortfolioSource(text: string, fileName: string, format: 'csv' | 'json'): PortfolioSource {
  checkText(text);
  if (fileName.length > 250 || redactSecrets(fileName) !== fileName || /[\x00-\x1f\x7f]/.test(fileName)) throw new Error('Use a filename of at most 250 characters without credentials or control characters.');
  text = text.replace(/^\uFEFF/, '');
  if (format === 'csv') {
    const rows = parseCsvText(text);
    if (rows.length < 2) throw new Error('The CSV file needs a header and at least one data row.');
    const columns = rows[0];
    validateColumns(columns);
    return { fileName, format, columns, rows: rows.slice(1).map((values, index) => ({
      rowNumber: index + 2, values, errors: values.length === columns.length ? [] : ['Column count does not match the header. Correct the source row and upload again.'],
    })) };
  }
  let parsed: unknown;
  try { parsed = JSON.parse(text); } catch { throw new Error('Invalid JSON. Check commas, quotes and brackets; use an array of workload objects.'); }
  // JSON.parse otherwise silently keeps the last duplicate key. Reject that ambiguity.
  const keySets: Set<string>[] = [];
  for (const token of text.matchAll(/"(?:\\.|[^"\\])*"|[{}]/g)) {
    if (token[0] === '{') keySets.push(new Set());
    else if (token[0] === '}') keySets.pop();
    else if (/^\s*:/.test(text.slice(token.index! + token[0].length))) {
      const key = JSON.parse(token[0]) as string;
      if (keySets.at(-1)?.has(key)) throw new Error('Duplicate JSON object key. Rename duplicate fields before uploading.');
      keySets.at(-1)?.add(key);
    }
  }
  const envelope = parsed as { workloads?: unknown; data?: unknown } | null;
  if (!Array.isArray(parsed) && envelope?.workloads && envelope?.data) throw new Error('Use one workloads or data array, not both.');
  const list = Array.isArray(parsed) ? parsed : envelope?.workloads ?? envelope?.data;
  if (!Array.isArray(list) || !list.length) throw new Error('JSON must contain a non-empty array of workload objects, directly or under workloads or data.');
  limitRows(list.length);
  const columns = [...new Set(list.flatMap(item => item && typeof item === 'object' && !Array.isArray(item) ? Object.keys(item) : []))];
  validateColumns(columns);
  return { fileName, format, columns, rows: list.map((item, index) => {
    const valid = item && typeof item === 'object' && !Array.isArray(item);
    return { rowNumber: index + 1, values: columns.map(key => valid && Object.hasOwn(item, key) ? item[key] : ''), errors: valid ? [] : ['Each row must be a JSON object.'] };
  }) };
}
export async function readPortfolioSource(file: File): Promise<PortfolioSource> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension !== 'csv' && extension !== 'json') throw new Error('Unsupported file type. Choose a .csv or .json file.');
  if (file.size > MAX_FILE_SIZE_BYTES) throw new Error('File size exceeds 5MB limit. Split the inventory into smaller files.');
  const mime = file.type.toLowerCase().split(';')[0];
  const allowed = extension === 'csv' ? ['text/csv', 'application/csv', 'application/vnd.ms-excel'] : ['application/json', 'text/json'];
  if (mime && !['text/plain', 'application/octet-stream', ...allowed].includes(mime)) throw new Error('File type and content indication do not match. Export a genuine CSV or JSON file.');
  return parsePortfolioSource(await file.text(), file.name, extension);
}

export function previewPortfolio(source: PortfolioSource, mapping: ColumnMapping, userId?: string, existingIds: string[] = []): IntakePreview {
  const errors = mappingErrors(source.columns, mapping);
  if (errors.length) throw new Error(errors.join(' '));
  limitRows(source.rows.length);
  const seen = new Set<string>(), existing = new Set(existingIds.map(id => id.toLowerCase()));
  const importId = crypto.randomUUID();
  const columnMapping = JSON.stringify(source.columns.flatMap((column, index) => mapping[index] ? [[column, mapping[index]]] : []));
  const rows: RowPreview[] = source.rows.map(row => {
    const fields: Partial<Record<ImportField, string>> = {};
    const warnings: string[] = [], errors = [...row.errors];
    mapping.forEach((key, index) => {
      if (!key) return;
      const raw = row.values[index] ?? '';
      const label = IMPORT_FIELDS.find(field => field.key === key)!.label;
      if (typeof raw === 'number' && !Number.isFinite(raw)) { errors.push(`${label}: numeric value must be finite.`); return; }
      if (typeof raw === 'object' || (['workload_id', 'workload_name', 'workload_type'].includes(key) && typeof raw !== 'string')) {
        errors.push(`${label}: use a text value, not a nested object, array or numeric identifier.`); return;
      }
      const text = String(raw);
      const bound = key === 'workload_id' ? MAX_ID_LENGTH : key === 'workload_name' ? MAX_NAME_LENGTH : MAX_FIELD_LENGTH;
      if (text.length > bound) { errors.push(`${label}: maximum ${bound} characters; shorten the source value.`); return; }
      const normalized = sanitizeInputString(text, bound + 1);
      if (normalized.length > bound) { errors.push(`${label}: normalized value exceeds ${bound} characters.`); return; }
      fields[key] = normalized;
      if (normalized !== text || typeof raw !== 'string') warnings.push(`${label}: normalized (whitespace/control cleanup, literal formula prefix or credential redaction). Review the displayed value.`);
      if (validateAndFenceUserPrompt(text).injectionDetected) warnings.push(`${label}: instruction-like text retained as untrusted data. AI assessment may reject it.`);
      if (/<[^>]+>|javascript:/i.test(text)) warnings.push(`${label}: markup or script-like text is displayed literally; it is never executed.`);
    });
    for (const field of IMPORT_FIELDS.filter(field => field.required)) if (!fields[field.key]?.trim()) errors.push(`${field.label}: required value is missing.`);
    const id = fields.workload_id ?? '';
    if (id && !isSafeWorkloadId(id)) errors.push('Workload ID: start with a letter or digit; use only letters, digits, dots, underscores and hyphens (maximum 100).');
    if (id && (seen.has(id.toLowerCase()) || existing.has(id.toLowerCase()))) errors.push('Workload ID: already present in this file or imported portfolio. Use a unique ID; existing records will not be overwritten.');
    if (id) seen.add(id.toLowerCase());
    const type = fields.workload_type?.toLowerCase();
    if (type && !['application', 'data platform'].includes(type)) errors.push('Workload type: use Application or Data Platform.');
    else if (type) fields.workload_type = type === 'application' ? 'Application' : 'Data Platform';
    const criticality = fields.business_criticality?.toLowerCase();
    if (criticality && !['high', 'medium', 'low'].includes(criticality)) errors.push('Business criticality: use High, Medium or Low, or leave blank.');
    else if (criticality) fields.business_criticality = criticality[0].toUpperCase() + criticality.slice(1);
    else warnings.push('Business criticality is missing: excluded from evidence completeness; Medium is the provisional planning default.');
    if ((fields.modernization_drivers ?? '').split(/[,;]/).filter(value => value.trim()).length > 100) errors.push('Modernization drivers: maximum 100 separate signals.');
    if ((fields.runtime?.length ?? 0) + (fields.database?.length ?? 0) + 3 > 4000) errors.push('Runtime and database: combined stack description exceeds 4,000 characters.');
    const workload = errors.length ? undefined : buildWorkloadFromRawRecord(fields as RawImportRecord, userId);
    if (workload?.modernizationSignals.some(signal => signal.length > MAX_FIELD_LENGTH)) {
      workload.modernizationSignals = workload.modernizationSignals.map(signal => signal.length > MAX_FIELD_LENGTH ? signal.slice(0, MAX_FIELD_LENGTH - 1) + '…' : signal);
      warnings.push('A derived modernization signal summary was shortened to 2,000 characters. The full mapped value remains in Enterprise DNA.');
    }
    if (workload) workload.importMetadata = { importId, fileName: source.fileName, rowNumber: row.rowNumber, columnMapping, validationVersion: 1, warningCount: warnings.length };
    return { rowNumber: row.rowNumber, fields, warnings, errors, workload };
  });
  const validRecords = rows.flatMap(row => row.workload ? [row.workload] : []);
  if (new TextEncoder().encode(JSON.stringify(validRecords)).byteLength > MAX_NORMALIZED_BATCH_BYTES) throw new Error('Normalized inventory exceeds the 4MB save budget. Split the source into smaller files.');
  const ignored = mapping.filter(value => !value).length;
  return {
    fileName: source.fileName, importId, totalDetected: rows.length, rows, validRecords,
    invalidRecords: rows.filter(row => row.errors.length).map(row => ({ rowNumber: row.rowNumber, id: row.fields.workload_id, name: row.fields.workload_name, errors: row.errors, status: 'REJECTED' })),
    warnings: [...(ignored ? [`${ignored} unmapped column(s) will not be saved or sent to AI.`] : []), ...rows.flatMap(row => row.warnings.map(warning => `Row ${row.rowNumber}: ${warning}`))],
    detectedWorkloadTypes: [...new Set(validRecords.map(workload => workload.type))],
    totalEvidenceGaps: validRecords.reduce((total, workload) => { const result = calculateDnaCompleteness(workload.dna); return total + result.missingCount + result.incompleteCount; }, 0),
    rowBreakdown: { valid: validRecords.length, rejected: rows.filter(row => row.errors.length).length, warning: rows.filter(row => row.warnings.length).length },
  };
}
export const parseCsvPortfolio = (text: string, fileName: string, userId?: string) => {
  const source = parsePortfolioSource(text, fileName, 'csv');
  return previewPortfolio(source, suggestColumnMapping(source.columns), userId);
};
export const parseJsonPortfolio = (text: string, fileName: string, userId?: string) => {
  const source = parsePortfolioSource(text, fileName, 'json');
  return previewPortfolio(source, suggestColumnMapping(source.columns), userId);
};
export async function parseAndValidatePortfolioFile(file: File, userId?: string) {
  const source = await readPortfolioSource(file);
  return previewPortfolio(source, suggestColumnMapping(source.columns), userId);
}
