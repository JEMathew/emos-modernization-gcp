// Browser QA uses synthetic local data only; writes and model calls deliberately fail.
import { SAMPLE_PORTFOLIO } from '../../src/data/samplePortfolio';
export const testConnection = () => {};
export const syncUserProfile = async () => {};
export const signOut = async () => {};
export const subscribeToUserInteractions = (uid: string, callback: Function) => { callback([{
  id: 'qa-assessment', userId: uid, title: 'Synthetic Customer Analytics Assessment', category: 'Architecture Review', mode: 'assess',
  content: 'Synthetic evidence only', geminiResponse: '**Recommended 6R Disposition:** Replatform\n\n**Decision Readiness:** NEEDS EVIDENCE', turns: [],
  createdAt: '2026-09-20T00:00:00.000Z', updatedAt: '2026-09-20T00:00:00.000Z', workloadId: SAMPLE_PORTFOLIO[0].id,
  workloadName: SAMPLE_PORTFOLIO[0].name, recommended6R: 'Replatform', confidenceScore: 60,
  evidenceCompleteness: 61, decisionReadiness: 'NEEDS EVIDENCE', trustIndicators: { inputValidated: true, evidenceGrounded: true, schemaValidated: true, wasRepaired: false },
}]); return () => {}; };
export const subscribeToProgramAlignment = (_uid: string, callback: Function) => { callback(null); return () => {}; };
export const subscribeToUserImportedWorkloads = (_uid: string, callback: Function) => {
  callback([{ ...SAMPLE_PORTFOLIO[0], id: 'qa-imported', name: 'Synthetic imported workload', source: 'imported' }]);
  return () => {};
};
export const subscribeToGovernanceRecords = (_uid: string, callback: Function) => { callback([]); return () => {}; };
export const subscribeToTargetStatePlans = (_uid: string, callback: Function) => { callback([]); return () => {}; };
const unavailable = async () => { throw new Error('Writes and model calls are disabled in this local QA fixture.'); };
export const saveInteraction = unavailable;
export const updateInteraction = unavailable;
export const deleteInteraction = unavailable;
export const saveImportedWorkloads = unavailable;
export const deleteImportedWorkload = unavailable;
export const clearAllImportedWorkloads = unavailable;
export const saveProgramAlignment = unavailable;
export const saveGovernanceRecord = unavailable;
export const saveTargetStatePlan = unavailable;
export const chatWithGemini = unavailable;
export const generateAssessmentMeta = unavailable;
