// Browser QA uses synthetic local data only; writes and model calls deliberately fail.
import { SAMPLE_PORTFOLIO } from '../../src/data/samplePortfolio';
export const testConnection = () => {};
export const syncUserProfile = async () => {};
export const signOut = async () => {};
export const subscribeToUserInteractions = (_uid: string, callback: Function) => { callback([]); return () => {}; };
export const subscribeToProgramAlignment = (_uid: string, callback: Function) => { callback(null); return () => {}; };
export const subscribeToUserImportedWorkloads = (_uid: string, callback: Function) => {
  callback([{ ...SAMPLE_PORTFOLIO[0], id: 'qa-imported', name: 'Synthetic imported workload', source: 'imported' }]);
  return () => {};
};
const unavailable = async () => { throw new Error('Writes and model calls are disabled in this local QA fixture.'); };
export const saveInteraction = unavailable;
export const updateInteraction = unavailable;
export const deleteInteraction = unavailable;
export const saveImportedWorkloads = unavailable;
export const deleteImportedWorkload = unavailable;
export const clearAllImportedWorkloads = unavailable;
export const saveProgramAlignment = unavailable;
export const chatWithGemini = unavailable;
export const generateAssessmentMeta = unavailable;
