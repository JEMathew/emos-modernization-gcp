import React from 'react';
import { Sparkles, LogOut, Plus, Layers, FileText, Route, Library, LayoutDashboard } from 'lucide-react';
import type { User } from 'firebase/auth';
import { signOut } from '../lib/firebase';
import type { WorkspaceView } from '../lib/workspaceNavigation';
import { ThemeSelector } from './ThemeSelector';

interface NavbarProps {
  user: User | null;
  currentView: WorkspaceView;
  selectedId?: string | null;
  assessmentCount?: number;
  onNavigate: (view: 'overview' | 'portfolio' | 'decision-intelligence' | 'assessments' | 'plan') => void;
  onNewAssessment: () => void;
  onOpenWalkthrough: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, currentView, assessmentCount, onNavigate, onNewAssessment, onOpenWalkthrough }) => {
  const items = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, target: 'overview', active: currentView === 'overview' },
    { id: 'portfolio', label: 'Portfolio', icon: Layers, target: 'portfolio', active: currentView === 'portfolio' || currentView === 'dna' },
    { id: 'decision', label: 'Decisions', icon: Sparkles, target: 'decision-intelligence', active: currentView === 'workspace' },
    { id: 'plan', label: 'Plan', icon: Route, target: 'plan', active: currentView === 'plan' },
    { id: 'history', label: 'History', icon: FileText, target: 'assessments', active: currentView === 'history' },
  ] as const;
  const navigation = (mobile: boolean) => <nav aria-label={mobile ? 'Mobile workspace navigation' : 'Workspace navigation'} className={mobile ? 'grid grid-cols-5 gap-1 border-t border-[var(--emos-border-subtle)] bg-[var(--emos-bg-tertiary)] px-2 py-1.5 lg:hidden' : 'hidden items-center gap-1 rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-bg-tertiary)] p-1 lg:flex'}>
    {items.map(({ id, label, icon: Icon, target, active }) => <button
      key={id} id={`${mobile ? 'mobile-nav' : 'nav-tab'}-${id}`} type="button" onClick={() => onNavigate(target)} aria-current={active ? 'page' : undefined}
      className={`flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-lg font-semibold ${mobile ? 'flex-col whitespace-nowrap px-1 py-1 text-[11px]' : 'px-2 text-xs'} ${active ? 'border border-[var(--emos-border-strong)] bg-[var(--emos-surface)] text-[var(--emos-accent-text)]' : 'text-[var(--emos-text-secondary)] hover:bg-[var(--emos-surface-hover)]'}`}
    ><Icon className="h-4 w-4 shrink-0" aria-hidden="true" /><span>{label}{id === 'history' && Boolean(assessmentCount) && <span className="ml-1 text-[10px]">{assessmentCount}</span>}</span></button>)}
  </nav>;
  return <header id="app-header" className="sticky top-0 z-30 border-b border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)]">
    <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:px-6">
      <button onClick={() => onNavigate('overview')} aria-label="EMOS Command Center" className="flex min-h-11 items-center gap-2 font-semibold tracking-wider"><Sparkles className="h-5 w-5 text-[var(--emos-accent)]" aria-hidden="true" />EMOS</button>
      {navigation(false)}
      <div className="flex items-center gap-1 sm:gap-2">
        <a href="/learn" aria-label="Open Learning Center" title="Learning Center" className="hidden min-h-11 min-w-11 items-center justify-center rounded-lg border border-[var(--emos-border-subtle)] sm:inline-flex"><Library className="h-4 w-4" /></a>
        <button onClick={onOpenWalkthrough} className="hidden min-h-11 rounded-lg border border-[var(--emos-border-subtle)] px-3 text-xs xl:inline-flex xl:items-center">Product Tour</button>
        <button id="nav-new-assessment-btn" onClick={onNewAssessment} aria-label="New Assessment" className="inline-flex min-h-11 items-center gap-1 rounded-lg bg-[#A88554] px-2 text-xs font-semibold text-black"><Plus className="h-4 w-4" aria-hidden="true" /><span className="hidden sm:inline">New Assessment</span><span className="sm:hidden">New</span></button>
        <ThemeSelector />
        {user && <button onClick={() => signOut()} aria-label="Sign Out" title={`Sign out ${user.displayName || ''}`} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-[var(--emos-text-secondary)]"><LogOut className="h-4 w-4" aria-hidden="true" /></button>}
      </div>
    </div>
    {navigation(true)}
  </header>;
};
