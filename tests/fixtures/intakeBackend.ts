// Isolated QA adapter: synthetic browser memory only, no Firebase or model traffic.
export * from './dashboardBackend';
import type { EnterpriseWorkload } from '../../src/types';
import { validateImportBatch } from '../../src/lib/portfolioPersistence';
let inventory: EnterpriseWorkload[] = [];
let listener: (items: EnterpriseWorkload[]) => void = () => {};
let failFirst = true;
export const subscribeToUserImportedWorkloads = (_uid: string, callback: typeof listener) => {
  listener = callback; callback(inventory); return () => { listener = () => {}; };
};
export const saveImportedWorkloads = async (uid: string, items: EnterpriseWorkload[]) => {
  validateImportBatch(items, uid);
  if (failFirst) { failFirst = false; throw new Error('Simulated first-save failure. Retry this same preview to test recovery.'); }
  inventory = [...items, ...inventory.filter(record => !items.some(item => item.id === record.id))];
  listener(inventory);
};
