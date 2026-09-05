import { describe, expect, it } from 'vitest';
import {
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_LABEL,
  MAX_IMPORT_WORKLOADS,
  parseCsvPortfolio,
  parseJsonPortfolio,
} from '../src/utils/portfolioImporter';

describe('canonical portfolio import limits', () => {
  it('uses one documented 5MB / 200 workload contract', () => {
    expect(MAX_FILE_SIZE_BYTES).toBe(5 * 1024 * 1024);
    expect(MAX_FILE_SIZE_LABEL).toBe('5MB');
    expect(MAX_IMPORT_WORKLOADS).toBe(200);
  });

  it('rejects oversized CSV portfolios instead of partially importing them', () => {
    const rows = Array.from({ length: MAX_IMPORT_WORKLOADS + 3 }, (_, index) => `id-${index},Workload ${index},Application`);
    expect(() =>
      parseCsvPortfolio(['workload_id,workload_name,workload_type', ...rows].join('\n'), 'large.csv', 'alice')
    ).toThrow(`maximum supported per file is ${MAX_IMPORT_WORKLOADS}`);
  });

  it('rejects oversized JSON portfolios instead of partially importing them', () => {
    const workloads = Array.from({ length: MAX_IMPORT_WORKLOADS + 1 }, (_, index) => ({
      workload_id: `id-${index}`,
      workload_name: `Workload ${index}`,
      workload_type: 'Application',
    }));

    expect(() => parseJsonPortfolio(JSON.stringify(workloads), 'large.json', 'alice')).toThrow(
      `maximum supported per file is ${MAX_IMPORT_WORKLOADS}`
    );
  });

  it('accepts a portfolio at the canonical record limit', () => {
    const rows = Array.from({ length: MAX_IMPORT_WORKLOADS }, (_, index) => `id-${index},Workload ${index},Application`);
    const result = parseCsvPortfolio(['workload_id,workload_name,workload_type', ...rows].join('\n'), 'limit.csv', 'alice');
    expect(result.validRecords).toHaveLength(MAX_IMPORT_WORKLOADS);
  });
});
