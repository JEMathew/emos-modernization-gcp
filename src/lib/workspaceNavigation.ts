import { useEffect, useState } from 'react';

export type WorkspaceView = 'overview' | 'portfolio' | 'dna' | 'evidence' | 'workspace' | 'governance' | 'plan' | 'target' | 'history';
export type PortfolioSource = 'sample' | 'imported';
export type WorkspaceStage = 'Align' | 'Discover' | 'Understand' | 'Assess' | 'Decide' | 'Govern' | 'Prioritize' | 'Plan' | 'Mobilize' | 'Define Target State';
export interface WorkspaceContext {
  portfolio: PortfolioSource;
  workloadId: string | null;
  assessmentId: string | null;
  stage?: WorkspaceStage;
}

export function workspaceUrl(view: WorkspaceView, context: WorkspaceContext): string {
  const params = new URLSearchParams();
  if (context.portfolio === 'imported') params.set('portfolio', 'imported');
  let path = '/app';
  const id = context.workloadId ? encodeURIComponent(context.workloadId) : null;
  if (view === 'portfolio') path += '/portfolio';
  if (view === 'history') path += '/history';
  if (view === 'dna') path += id ? `/workloads/${id}/dna` : '/portfolio';
  if (view === 'evidence') path += id ? `/workloads/${id}/evidence` : '/portfolio';
  if (view === 'workspace') {
    const section = context.stage === 'Decide' ? 'decision' : 'assessment';
    path += id ? `/workloads/${id}/${section}` : `/${section}`;
    if (context.assessmentId) params.set('assessment', context.assessmentId);
  }
  if (view === 'plan') {
    path += '/plan';
    if (context.stage === 'Align') params.set('stage', 'align');
    if (context.stage === 'Mobilize') params.set('stage', 'mobilize');
  }
  if (view === 'governance') path += context.stage === 'Prioritize' ? '/prioritize' : '/govern';
  if (view === 'target') path += id ? `/workloads/${id}/target-state` : '/plan';
  if (id && !['dna', 'evidence', 'workspace', 'target'].includes(view)) params.set('workload', context.workloadId!);
  return `${path}${params.size ? `?${params}` : ''}`;
}

export function readWorkspaceRoute(location: Pick<Location, 'pathname' | 'search'>) {
  const params = new URLSearchParams(location.search);
  const path = location.pathname.replace(/\/$/, '') || '/';
  const match = path.match(/^\/app\/workloads\/([^/]+)\/(dna|evidence|assessment|decision|target-state)$/);
  let workloadId = params.get('workload');
  let malformed = false;
  try { if (match) workloadId = decodeURIComponent(match[1]); } catch { workloadId = null; malformed = true; }
  let view: WorkspaceView = 'overview';
  let stage: WorkspaceStage | undefined;
  const known = ['/', '/app', '/app/portfolio', '/app/history', '/app/plan', '/app/assessment', '/app/decision', '/app/govern', '/app/prioritize'].includes(path) || Boolean(match);
  if (path === '/app/portfolio') { view = 'portfolio'; stage = 'Discover'; }
  if (path === '/app/history') view = 'history';
  if (path === '/app/plan') {
    view = 'plan';
    stage = params.get('stage') === 'align' ? 'Align' : params.get('stage') === 'mobilize' ? 'Mobilize' : 'Plan';
  }
  if (match?.[2] === 'dna') { view = 'dna'; stage = 'Understand'; }
  if (match?.[2] === 'evidence') { view = 'evidence'; stage = 'Understand'; }
  if (match?.[2] === 'target-state') { view = 'target'; stage = 'Define Target State'; }
  if (path === '/app/govern' || path === '/app/prioritize') { view = 'governance'; stage = path.endsWith('/prioritize') ? 'Prioritize' : 'Govern'; }
  if (path === '/app/assessment' || path === '/app/decision' || (match && ['assessment', 'decision'].includes(match[2]))) {
    view = 'workspace'; stage = path.endsWith('/decision') ? 'Decide' : 'Assess';
  }
  return {
    view, stage, known: known && !malformed, workloadId,
    portfolio: (params.get('portfolio') === 'imported' ? 'imported' : 'sample') as PortfolioSource,
    assessmentId: view === 'workspace' ? params.get('assessment') : null,
  };
}

export function useWorkspaceNavigation() {
  const [route, setRoute] = useState(() => readWorkspaceRoute(window.location));
  useEffect(() => {
    const read = () => setRoute(readWorkspaceRoute(window.location));
    window.addEventListener('popstate', read);
    if (window.location.pathname === '/' || window.location.pathname === '/app/') {
      window.history.replaceState({}, '', '/app');
      read();
    }
    return () => window.removeEventListener('popstate', read);
  }, []);
  const navigate = (view: WorkspaceView, changes: Partial<WorkspaceContext> = {}) => {
    const url = workspaceUrl(view, { ...route, assessmentId: null, stage: undefined, ...changes });
    if (`${window.location.pathname}${window.location.search}` !== url) {
      window.history.pushState({}, '', url);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };
  return { route, navigate };
}
