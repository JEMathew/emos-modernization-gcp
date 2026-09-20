import { doc, runTransaction, type Firestore } from 'firebase/firestore';
import { z } from 'zod';
import type { EnterpriseWorkload } from '../types';
import { isSafeWorkloadId, MAX_IMPORT_WORKLOADS, MAX_NORMALIZED_BATCH_BYTES } from '../utils/portfolioImporter';

const text = z.string().max(2000);
const dnaField = z.object({
  id: z.string().max(100), label: z.string().max(250), value: text,
  status: z.enum(['known', 'missing', 'incomplete']), detail: text.nullable().optional(),
}).strict();
const workloadSchema = z.object({
  id: z.string().refine(isSafeWorkloadId), name: z.string().min(1).max(250),
  type: z.enum(['Application', 'Data Platform']), businessCapability: text,
  businessCriticality: z.enum(['High', 'Medium', 'Low']), currentStack: z.string().max(4000),
  hosting: text, knownDependencies: text, modernizationSignals: z.array(text).max(100),
  evidenceCompleteness: z.number().min(0).max(100),
  dna: z.object({
    business: z.array(dnaField).length(3), technology: z.array(dnaField).length(4),
    dependency: z.array(dnaField).length(2), economics: z.array(dnaField).length(3),
    dataAndRisk: z.array(dnaField).length(3), targetState: z.array(dnaField).length(3),
  }).strict(),
  source: z.literal('imported'), userId: z.string().min(1), importedAt: z.string().datetime(),
  evaluationMeta: z.object({ expected6r: text.optional(), expectedReason: text.optional() }).strict().optional(),
  importMetadata: z.object({
    importId: z.string().uuid(), fileName: z.string().min(1).max(250),
    rowNumber: z.number().int().min(1).max(201), columnMapping: z.string().max(12000),
    validationVersion: z.literal(1), warningCount: z.number().int().min(0).max(100),
  }).strict(),
}).strict();

export function validateImportBatch(workloads: EnterpriseWorkload[], userId: string) {
  const result = z.array(workloadSchema).min(1).max(MAX_IMPORT_WORKLOADS).safeParse(workloads);
  if (!result.success) throw new Error('Import validation expired or the normalized records are invalid. Return to mapping and preview again.');
  const records = result.data;
  if (records.some(record => record.userId !== userId)) throw new Error('Your account changed. Sign in again and restart the import.');
  if (new Set(records.map(record => record.id.toLowerCase())).size !== records.length) throw new Error('Duplicate workload IDs cannot be saved.');
  if (new Set(records.map(record => record.importMetadata.importId)).size !== 1) throw new Error('Use one reviewed import at a time.');
  if (new TextEncoder().encode(JSON.stringify(records)).length > MAX_NORMALIZED_BATCH_BYTES) throw new Error('Normalized inventory exceeds the 4MB save budget. Split the file.');
  return records;
}

// All reads precede all writes. Conflicts and permission failures abort the entire import.
// The stable import ID and exact reviewed payload make an uncertain retry idempotent.
export async function persistPortfolioImport(db: Firestore, currentUid: () => string | undefined, userId: string, workloads: EnterpriseWorkload[]) {
  if (!userId || currentUid() !== userId) throw new Error('Sign in to the account that reviewed this import.');
  const records = validateImportBatch(workloads, userId);
  try {
    await runTransaction(db, async transaction => {
      if (currentUid() !== userId) throw new Error('account-changed');
      const refs = records.map(record => doc(db, 'users', userId, 'importedWorkloads', record.id));
      const snapshots = await Promise.all(refs.map(ref => transaction.get(ref)));
      if (currentUid() !== userId) throw new Error('account-changed');
      snapshots.forEach((snapshot, index) => {
        if (!snapshot.exists()) return;
        const prior = workloadSchema.safeParse(snapshot.data());
        if (!prior.success || JSON.stringify(prior.data) !== JSON.stringify(records[index])) throw new Error('import-conflict');
      });
      snapshots.forEach((snapshot, index) => {
        if (!snapshot.exists()) transaction.set(refs[index], JSON.parse(JSON.stringify(records[index])));
      });
    });
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if ((error as Error)?.message === 'import-conflict') throw new Error('A workload ID already exists with different data. No records were replaced. Change the conflicting ID in your source and upload again.');
    if ((error as Error)?.message === 'account-changed' || code === 'permission-denied' || code === 'unauthenticated') throw new Error('Your sign-in or permissions changed. No partial import was saved. Sign in again before retrying.');
    throw new Error('The save could not be confirmed. Check your connection and retry this same preview; existing records will not be duplicated. The import is saved as one atomic operation.');
  }
}
