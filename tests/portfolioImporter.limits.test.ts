import { describe, expect, it } from 'vitest';
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_LABEL, MAX_IMPORT_WORKLOADS, parseCsvPortfolio } from '../src/utils/portfolioImporter';

describe('canonical portfolio import limits', () => {
  it('uses one documented 5MB / 200 workload contract', () => {
    expect(MAX_FILE_SIZE_BYTES).toBe(5 * 1024 * 1024);
    expect(MAX_FILE_SIZE_LABEL).toBe('5MB');
    expect(MAX_IMPORT_WORKLOADS).toBe(200);
  });

  it('caps oversized portfolios at the canonical record limit', () => {
    const rows = Array.from({ length: MAX_IMPORT_WORKLOADS + 3 }, (_, index) => `id-${index},Workload ${index},Application`);
    const result = parseCsvPortfolio(['workload_id,workload_name,workload_type', ...rows].join('\n'), 'large.csv', 'alice');
    expect(result.validRecords).toHaveLength(MAX_IMPORT_WORKLOADS);
    expect(result.warnings[0]).toContain(`first ${MAX_IMPORT_WORKLOADS} workloads`);
  });
});
