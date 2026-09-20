import { beforeEach, describe, expect, it, vi } from 'vitest';
import { persistPortfolioImport } from '../src/lib/portfolioPersistence';
import { parseCsvPortfolio } from '../src/utils/portfolioImporter';

const state = vi.hoisted(() => ({
  saved: new Map<string, any>(), writes: [] as string[], calls: 0, fail: false, onRead: () => {},
}));
vi.mock('firebase/firestore', () => ({
  doc: (_db: unknown, ...segments: string[]) => segments.join('/'),
  runTransaction: async (_db: unknown, body: Function) => {
    state.calls++;
    const staged = new Map<string, any>();
    await body({
      get: async (path: string) => { state.onRead(); return { exists: () => state.saved.has(path), data: () => state.saved.get(path) }; },
      set: (path: string, data: unknown) => staged.set(path, data),
    });
    if (state.fail) throw Object.assign(new Error('opaque provider failure'), { code: 'unavailable' });
    staged.forEach((value, key) => { state.saved.set(key, value); state.writes.push(key); });
  },
}));
const records = () => parseCsvPortfolio('workload_id,workload_name,workload_type\na,Payments,Application\nb,Warehouse,Data Platform', 'input.csv', 'alice').validRecords;
beforeEach(() => { state.saved.clear(); state.writes = []; state.calls = 0; state.fail = false; state.onRead = () => {}; });
describe('atomic owner-scoped import persistence', () => {
  it('saves all reviewed records under the authenticated owner in one transaction', async () => {
    await persistPortfolioImport({} as any, () => 'alice', 'alice', records());
    expect(state.calls).toBe(1); expect(state.writes).toEqual(['users/alice/importedWorkloads/a', 'users/alice/importedWorkloads/b']);
  });
  it.each([undefined, 'bob'])('rejects unauthenticated or changed account %s before touching the database', async uid => {
    await expect(persistPortfolioImport({} as any, () => uid, 'alice', records())).rejects.toThrow(/Sign in/);
    expect(state.calls).toBe(0);
  });
  it('rejects spoofed owners, unreviewed fields and oversized batches', async () => {
    for (const batch of [
      records().map(record => ({ ...record, userId: 'bob' })),
      [{ ...records()[0], malicious: 'extra' }],
      Array.from({ length: 201 }, () => records()[0]),
    ]) await expect(persistPortfolioImport({} as any, () => 'alice', 'alice', batch as any)).rejects.toThrow();
    expect(state.calls).toBe(0);
  });
  it('does not leave a partial import when a commit fails and permits a retry', async () => {
    const batch = records(); state.fail = true;
    await expect(persistPortfolioImport({} as any, () => 'alice', 'alice', batch)).rejects.toThrow(/could not be confirmed/);
    expect(state.saved.size).toBe(0);
    state.fail = false;
    await persistPortfolioImport({} as any, () => 'alice', 'alice', batch);
    expect(state.saved.size).toBe(2);
  });
  it('makes retrying the exact same reviewed set idempotent', async () => {
    const batch = records();
    await persistPortfolioImport({} as any, () => 'alice', 'alice', batch);
    await persistPortfolioImport({} as any, () => 'alice', 'alice', batch);
    expect(state.writes).toHaveLength(2);
  });
  it('preserves existing data and aborts every new record on an ID conflict', async () => {
    state.saved.set('users/alice/importedWorkloads/b', { name: 'Existing workload' });
    await expect(persistPortfolioImport({} as any, () => 'alice', 'alice', records())).rejects.toThrow(/already exists/);
    expect(state.writes).toEqual([]); expect(state.saved.get('users/alice/importedWorkloads/b').name).toBe('Existing workload');
  });
  it('rejects an account switch while reading without writing anything', async () => {
    let uid = 'alice'; state.onRead = () => { uid = 'bob'; };
    await expect(persistPortfolioImport({} as any, () => uid, 'alice', records())).rejects.toThrow(/permissions changed/);
    expect(state.writes).toEqual([]);
  });
});
