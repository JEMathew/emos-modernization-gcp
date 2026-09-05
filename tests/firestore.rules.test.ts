import { readFileSync } from 'node:fs';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

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

  it('denies unmatched paths', async () => {
    const db = testEnv.authenticatedContext('alice').firestore();
    await assertFails(getDoc(doc(db, 'public/config')));
    await assertFails(setDoc(doc(db, 'public/config'), { enabled: true }));
  });
});
