import { readFileSync } from 'node:fs';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { parseCsvPortfolio } from '../src/utils/portfolioImporter';
import { persistPortfolioImport } from '../src/lib/portfolioPersistence';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

let testEnv: RulesTestEnvironment;

const validInteraction = (userId: string, id = 'assessment-1') => ({
  id,
  userId,
  title: 'Payments modernization',
  category: 'Legacy Application',
  mode: 'assess',
  content: 'Java 8 workload',
  geminiResponse: 'Recommended 6R Disposition: Refactor',
  turns: [],
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
  recommended6R: 'Refactor',
  confidenceScore: 65,
  evidenceCompleteness: 61,
  decisionReadiness: 'NEEDS EVIDENCE',
  trustIndicators: {
    inputValidated: true,
    evidenceGrounded: true,
    schemaValidated: true,
    wasRepaired: false,
  },
});

const validImportedWorkload = (userId: string, id = 'workload-1') => ({
  id,
  userId,
  name: 'Payments',
  type: 'Application',
  businessCapability: 'Payments',
  businessCriticality: 'High',
  currentStack: 'Java 8',
  hosting: 'On-premises',
  knownDependencies: 'Two services',
  modernizationSignals: ['Lifecycle risk'],
  evidenceCompleteness: 61,
  dna: {
    business: [{}, {}, {}],
    technology: [{}, {}, {}, {}],
    dependency: [{}, {}],
    economics: [{}, {}, {}],
    dataAndRisk: [{}, {}, {}],
    targetState: [{}, {}, {}],
  },
  importedAt: new Date(0).toISOString(),
  source: 'imported',
});

const validProgramAlignment = (userId: string) => ({
  userId,
  programName: 'Core modernization',
  executiveSponsor: 'CTO',
  securityApprover: 'CISO delegate',
  deliveryOwner: 'Program director',
  businessOutcomes: 'Reduce operational risk',
  targetPlatform: 'Vendor neutral',
  riskTolerance: 'Balanced',
  timeHorizonMonths: 18,
  successMeasures: 'Reduce run cost by 20%',
  updatedAt: new Date(0).toISOString(),
});

const validGovernanceRecord = (userId: string, workloadId = 'workload-1') => ({
  userId, workloadId, assessmentId: 'assessment-1', decision: 'MORE EVIDENCE', approver: 'CISO delegate',
  rationale: 'Close dependency and TCO gaps.', exception: '', audit: '[]', updatedAt: new Date(0).toISOString(),
});

const validTargetStatePlan = (userId: string, workloadId = 'workload-1') => ({
  userId, workloadId, architecturePattern: 'Decoupled service boundary', platformPattern: 'Managed runtime capability',
  availabilityTarget: 'Tier 1 SLO', recoveryTarget: 'Documented RTO and RPO', securityRequirements: 'Identity and encryption controls',
  dataMigrationApproach: 'Reconciled staged migration', cutoverApproach: 'Controlled maintenance window',
  rollbackPlan: 'Restore at verified checkpoint', owner: 'Architecture owner', status: 'DRAFT', updatedAt: new Date(0).toISOString(),
});

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-emos-guardrails',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  });
});

beforeEach(async () => testEnv.clearFirestore());
afterAll(async () => testEnv.cleanup());

describe('Firestore owner isolation and integrity', () => {
  it('denies anonymous access', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, 'users/alice/interactions/assessment-1')));
    await assertFails(setDoc(doc(db, 'users/alice/interactions/assessment-1'), validInteraction('alice')));
  });

  it('allows owner CRUD and collection queries', async () => {
    const db = testEnv.authenticatedContext('alice').firestore();
    const ref = doc(db, 'users/alice/interactions/assessment-1');
    await assertSucceeds(setDoc(ref, validInteraction('alice')));
    await assertSucceeds(getDoc(ref));
    await assertSucceeds(updateDoc(ref, { title: 'Updated title' }));
    await assertSucceeds(getDocs(collection(db, 'users/alice/interactions')));
    await assertSucceeds(deleteDoc(ref));
  });

  it('persists and reloads multi-turn conversation turns while maintaining owner isolation', async () => {
    const aliceDb = testEnv.authenticatedContext('alice').firestore();
    const bobDb = testEnv.authenticatedContext('bob').firestore();
    const ref = doc(aliceDb, 'users/alice/interactions/assessment-turns');
    await assertSucceeds(setDoc(ref, validInteraction('alice', 'assessment-turns')));

    const turns = [
      { role: 'user', content: 'What are the main database migration risks?', timestamp: new Date(1000).toISOString() },
      { role: 'model', content: 'The main database migration risks are PL/SQL packages and database links.', timestamp: new Date(2000).toISOString() },
    ];

    // Owner can persist conversation turns
    await assertSucceeds(updateDoc(ref, { turns }));

    // Owner can reload persisted conversation turns
    const snapshot = await assertSucceeds(getDoc(ref));
    expect(snapshot.data()?.turns).toHaveLength(2);
    expect(snapshot.data()?.turns[0].content).toBe('What are the main database migration risks?');
    expect(snapshot.data()?.turns[1].content).toContain('PL/SQL packages');

    // Other users cannot read or modify the conversation turns
    await assertFails(getDoc(doc(bobDb, 'users/alice/interactions/assessment-turns')));
    await assertFails(updateDoc(doc(bobDb, 'users/alice/interactions/assessment-turns'), { turns: [] }));
  });

  it('denies cross-user reads, queries, writes, updates, and deletes', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'users/bob/interactions/assessment-1'), validInteraction('bob'));
    });
    const alice = testEnv.authenticatedContext('alice').firestore();
    const bobRef = doc(alice, 'users/bob/interactions/assessment-1');
    await assertFails(getDoc(bobRef));
    await assertFails(getDocs(collection(alice, 'users/bob/interactions')));
    await assertFails(setDoc(doc(alice, 'users/bob/interactions/new'), validInteraction('bob', 'new')));
    await assertFails(updateDoc(bobRef, { title: 'Stolen' }));
    await assertFails(deleteDoc(bobRef));
  });

  it('denies spoofed ownership and invalid canonical fields', async () => {
    const db = testEnv.authenticatedContext('alice').firestore();
    await assertFails(setDoc(
      doc(db, 'users/alice/interactions/assessment-1'),
      validInteraction('bob'),
    ));
    await assertFails(setDoc(
      doc(db, 'users/alice/interactions/assessment-1'),
      { ...validInteraction('alice'), recommended6R: 'Rebuild' },
    ));
  });

  it('isolates imported workloads and validates their owner field', async () => {
    const alice = testEnv.authenticatedContext('alice').firestore();
    const aliceRef = doc(alice, 'users/alice/importedWorkloads/workload-1');
    await assertSucceeds(setDoc(aliceRef, validImportedWorkload('alice')));
    await assertFails(setDoc(
      doc(alice, 'users/alice/importedWorkloads/spoofed'),
      validImportedWorkload('bob', 'spoofed'),
    ));
    await assertFails(getDoc(doc(alice, 'users/bob/importedWorkloads/workload-1')));
  });

  it('isolates and validates the modernization program alignment', async () => {
    const alice = testEnv.authenticatedContext('alice').firestore();
    await assertSucceeds(setDoc(doc(alice, 'users/alice/programContext/alignment'), validProgramAlignment('alice')));
    await assertFails(setDoc(doc(alice, 'users/alice/programContext/alignment'), validProgramAlignment('bob')));
    await assertFails(getDoc(doc(alice, 'users/bob/programContext/alignment')));
  });

  it('isolates bounded governance and target-state records', async () => {
    const alice = testEnv.authenticatedContext('alice').firestore();
    const bob = testEnv.authenticatedContext('bob').firestore();
    const governance = doc(alice, 'users/alice/governance/workload-1');
    const target = doc(alice, 'users/alice/targetState/workload-1');
    await assertSucceeds(setDoc(governance, validGovernanceRecord('alice')));
    await assertSucceeds(setDoc(target, validTargetStatePlan('alice')));
    await assertFails(setDoc(governance, { ...validGovernanceRecord('alice'), audit: 'x'.repeat(12001) }));
    await assertFails(setDoc(target, { ...validTargetStatePlan('alice'), status: 'EXECUTING' }));
    await assertFails(setDoc(doc(alice, 'users/alice/governance/spoofed'), validGovernanceRecord('bob', 'spoofed')));
    await assertFails(getDoc(doc(bob, 'users/alice/targetState/workload-1')));
  });

  it('validates new import provenance without admitting extra metadata or cross-user access', async () => {
    const alice = testEnv.authenticatedContext('alice').firestore();
    const bob = testEnv.authenticatedContext('bob').firestore();
    const record = { ...validImportedWorkload('alice'), importMetadata: {
      importId: '00000000-0000-4000-8000-000000000001', fileName: 'inventory.csv',
      rowNumber: 2, columnMapping: '[["id","workload_id"]]', validationVersion: 1, warningCount: 0,
    } };
    const ref = doc(alice, 'users/alice/importedWorkloads/workload-1');
    await assertSucceeds(setDoc(ref, record));
    await assertFails(setDoc(ref, { ...record, importMetadata: { ...record.importMetadata, rawFile: 'not allowed' } }));
    await assertFails(setDoc(ref, { ...record, importMetadata: { ...record.importMetadata, rowNumber: 202 } }));
    await assertFails(getDoc(doc(bob, 'users/alice/importedWorkloads/workload-1')));
    await assertFails(deleteDoc(doc(bob, 'users/alice/importedWorkloads/workload-1')));
  });
  it('persists and retries a reviewed intake through the real transaction and rules boundary', async () => {
    const db = testEnv.authenticatedContext('alice').firestore();
    const records = parseCsvPortfolio('id,name,type\na,Payments,Application\nb,Data,Data Platform', 'inventory.csv', 'alice').validRecords;
    await persistPortfolioImport(db as any, () => 'alice', 'alice', records);
    await persistPortfolioImport(db as any, () => 'alice', 'alice', records);
    expect((await getDocs(collection(db, 'users/alice/importedWorkloads'))).size).toBe(2);
  });
  it('atomically rejects an import batch when any record violates ownership rules', async () => {
    const db = testEnv.authenticatedContext('alice').firestore();
    const batch = writeBatch(db);
    batch.set(doc(db, 'users/alice/importedWorkloads/a'), validImportedWorkload('alice', 'a'));
    batch.set(doc(db, 'users/alice/importedWorkloads/b'), validImportedWorkload('bob', 'b'));
    await assertFails(batch.commit());
    expect((await getDoc(doc(db, 'users/alice/importedWorkloads/a'))).exists()).toBe(false);
  });

  it('denies unmatched paths', async () => {
    const db = testEnv.authenticatedContext('alice').firestore();
    await assertFails(getDoc(doc(db, 'public/config')));
    await assertFails(setDoc(doc(db, 'public/config'), { enabled: true }));
  });
});
