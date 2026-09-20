import React from 'react';
import { Sparkles, LogOut, Plus, Layers, FileText, Route, Library, LayoutDashboard, CircleHelp } from 'lucide-react';
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
    { id: 'portfolio', label: 'Portfolio', icon: Layers, target: 'portfolio', active: currentView === 'portfolio' || currentView === 'dna' || currentView === 'evidence' },
    { id: 'decision', label: 'Decisions', icon: Sparkles, target: 'decision-intelligence', active: currentView === 'workspace' || currentView === 'governance' },
    { id: 'plan', label: 'Plan', icon: Route, target: 'plan', active: currentView === 'plan' || currentView === 'target' },
    { id: 'history', label: 'History', icon: FileText, target: 'assessments', active: currentView === 'history' },
  ] as const;

  const navigation = (mobile: boolean) => <nav
    aria-label={mobile ? 'Mobile workspace navigation' : 'Workspace navigation'}
    className={mobile
      ? 'grid grid-cols-5 gap-1 border-t border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)] px-2 py-1.5 lg:hidden'
      : 'flex flex-col gap-1'}
  >
    {items.map(({ id, label, icon: Icon, target, active }) => <button
      key={id}
      id={`${mobile ? 'mobile-nav' : 'nav-tab'}-${id}`}
      type="button"
      onClick={() => onNavigate(target)}
      aria-current={active ? 'page' : undefined}
      className={`group flex min-h-11 min-w-0 items-center rounded-lg font-semibold transition-colors ${mobile
        ? 'flex-col justify-center gap-1 px-1 py-1 text-[11px]'
        : 'justify-start gap-3 px-3 text-sm'} ${active
        ? 'border border-[var(--emos-journey-border)] bg-[var(--emos-journey-subtle)] text-[var(--emos-journey-text)]'
        : 'border border-transparent text-[var(--emos-text-secondary)] hover:bg-[var(--emos-surface-hover)] hover:text-[var(--emos-text-primary)]'}`}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="min-w-0 truncate">{label}{id === 'history' && Boolean(assessmentCount) && <span className="ml-1.5 rounded-full bg-[var(--emos-bg-tertiary)] px-1.5 py-0.5 text-[10px]">{assessmentCount}</span>}</span>
    </button>)}
  </nav>;

  return <>
    <aside id="app-header" className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)] px-3 py-4 lg:flex">
      <button onClick={() => onNavigate('overview')} aria-label="EMOS Command Center" className="mb-6 flex min-h-11 items-center gap-3 rounded-lg px-2 text-left font-semibold tracking-wide">
        <span className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--emos-journey-border)] bg-[var(--emos-journey-subtle)]"><Sparkles className="h-4 w-4 text-[var(--emos-journey-text)]" aria-hidden="true" /></span>
        <span><span className="block text-sm">EMOS</span><span className="block text-[10px] font-medium tracking-normal text-[var(--emos-text-muted)]">Modernization workspace</span></span>
      </button>
      {navigation(false)}
      <div className="mt-5 border-t border-[var(--emos-border-subtle)] pt-4">
        <button id="nav-new-assessment-btn" onClick={onNewAssessment} aria-label="New Assessment" className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#A88554] px-3 text-xs font-semibold text-black hover:bg-[#BCA075]"><Plus className="h-4 w-4" aria-hidden="true" />New Assessment</button>
      </div>
      <div className="mt-auto space-y-1 border-t border-[var(--emos-border-subtle)] pt-3">
        <a href="/learn" className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-xs text-[var(--emos-text-secondary)] hover:bg-[var(--emos-surface-hover)]"><Library className="h-4 w-4" aria-hidden="true" />Learning Center</a>
        <button onClick={onOpenWalkthrough} className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-xs text-[var(--emos-text-secondary)] hover:bg-[var(--emos-surface-hover)]"><CircleHelp className="h-4 w-4" aria-hidden="true" />Product Tour</button>
        <div className="flex items-center justify-between gap-2 rounded-lg px-1 py-1">
          <ThemeSelector compact />
          {user && <button onClick={() => signOut()} aria-label="Sign Out" title={`Sign out ${user.displayName || ''}`} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-[var(--emos-text-secondary)] hover:bg-[var(--emos-surface-hover)]"><LogOut className="h-4 w-4" aria-hidden="true" /></button>}
        </div>
      </div>
    </aside>

    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-2 border-b border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)] px-3 lg:hidden">
      <button onClick={() => onNavigate('overview')} aria-label="EMOS Command Center" className="flex min-h-11 items-center gap-2 font-semibold tracking-wider"><Sparkles className="h-5 w-5 text-[var(--emos-journey-text)]" aria-hidden="true" />EMOS</button>
      <div className="flex items-center gap-1">
        <button id="nav-new-assessment-btn-mobile" onClick={onNewAssessment} aria-label="New Assessment" className="inline-flex min-h-11 items-center gap-1 rounded-lg bg-[#A88554] px-2 text-xs font-semibold text-black"><Plus className="h-4 w-4" aria-hidden="true" /><span className="hidden sm:inline">New Assessment</span><span className="sm:hidden">New</span></button>
        <ThemeSelector />
        {user && <button onClick={() => signOut()} aria-label="Sign Out" title={`Sign out ${user.displayName || ''}`} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-[var(--emos-text-secondary)]"><LogOut className="h-4 w-4" aria-hidden="true" /></button>}
      </div>
    </header>
    <div className="fixed inset-x-0 bottom-0 z-30 lg:hidden">{navigation(true)}</div>
  </>;
};
