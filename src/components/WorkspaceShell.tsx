import React, { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  LayoutDashboard,
  Layers,
  Dna,
  GitBranch,
  ShieldCheck,
  Route,
  Play,
  BarChart3,
  BookOpen,
  History,
  Bot,
  Search,
  Sparkles,
  Plus,
  Library,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  User as UserIcon,
  Compass,
  Building2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { signInWithGoogle, signOut } from '../lib/firebase';
import { ThemeSelector } from './ThemeSelector';
import type { EnterpriseSampleId } from '../data/enterpriseEstates';

export type ShellNavTarget =
  | 'command-center'
  | 'portfolio'
  | 'dna'
  | 'decisions'
  | 'governance'
  | 'plan'
  | 'execute'
  | 'measure'
  | 'learn';

export type PrimaryJobId = 'understand' | 'decide' | 'transform' | 'outcomes';
export type DecideSubTab = 'recommendation' | 'evidence' | 'alternatives' | 'approval';

interface WorkspaceShellProps {
  user: User | null;
  activeNav: ShellNavTarget;
  activeDecideTab?: DecideSubTab;
  onSelectDecideTab?: (tab: DecideSubTab) => void;
  activeEstateId: EnterpriseSampleId;
  onChangeEstate: (estateId: 'apex-aerospace' | 'financial-services') => void;
  estateAssetLabel: string;
  activeWorkloadName?: string;
  activeWorkloadReadiness?: string;
  activeWorkloadCompleteness?: number;
  workloadCount: number;
  assessmentCount: number;
  needsEvidenceCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onNavigate: (target: ShellNavTarget) => void;
  onOpenLearningCenter?: () => void;
  onOpenHistory: () => void;
  onToggleAgent: () => void;
  onNewAssessment: () => void;
  onOpenWalkthrough: () => void;
  children: React.ReactNode;
}

interface PrimaryJobConfig {
  id: PrimaryJobId;
  label: string;
  subtitle: string;
  icon: React.ElementType;
  defaultTarget: ShellNavTarget;
  badge?: number | string;
  badgeTone?: 'indigo' | 'amber' | 'neutral';
}

function getActiveJob(nav: ShellNavTarget): PrimaryJobId {
  if (nav === 'command-center' || nav === 'portfolio' || nav === 'dna') return 'understand';
  if (nav === 'decisions' || nav === 'governance') return 'decide';
  if (nav === 'plan' || nav === 'execute') return 'transform';
  return 'outcomes';
}

export const WorkspaceShell: React.FC<WorkspaceShellProps> = ({
  user,
  activeNav,
  activeDecideTab = 'recommendation',
  onSelectDecideTab,
  activeEstateId,
  onChangeEstate,
  estateAssetLabel,
  activeWorkloadName,
  activeWorkloadReadiness,
  activeWorkloadCompleteness,
  workloadCount,
  assessmentCount,
  needsEvidenceCount,
  searchQuery,
  onSearchChange,
  onNavigate,
  onOpenLearningCenter,
  onOpenHistory,
  onToggleAgent,
  onNewAssessment,
  onOpenWalkthrough,
  children,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const activeJob = getActiveJob(activeNav);

  // Support Cmd/Ctrl + J to toggle Modernization Agent drawer
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        onToggleAgent();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onToggleAgent]);

  // Level 1: Four Canonical Business Jobs
  const primaryJobs: PrimaryJobConfig[] = [
    {
      id: 'understand',
      label: 'Understand',
      subtitle: 'Estate & DNA',
      icon: LayoutDashboard,
      defaultTarget: 'command-center',
      badge: workloadCount,
      badgeTone: 'neutral',
    },
    {
      id: 'decide',
      label: 'Decide',
      subtitle: '6R & Approval',
      icon: GitBranch,
      defaultTarget: 'decisions',
      badge: needsEvidenceCount > 0 ? needsEvidenceCount : assessmentCount > 0 ? assessmentCount : undefined,
      badgeTone: needsEvidenceCount > 0 ? 'amber' : 'indigo',
    },
    {
      id: 'transform',
      label: 'Transform',
      subtitle: 'Plan & Execute',
      icon: Route,
      defaultTarget: 'plan',
    },
    {
      id: 'outcomes',
      label: 'Outcomes',
      subtitle: 'Measure & Learn',
      icon: BarChart3,
      defaultTarget: 'measure',
    },
  ];

  // Level 2: Contextual Sub-Navigation per active job
  const contextualItems: {
    id: string;
    label: string;
    icon: React.ElementType;
    isActive: boolean;
    onClick: () => void;
    badge?: number | string;
  }[] =
    activeJob === 'understand'
      ? [
          {
            id: 'sub-overview',
            label: 'Overview',
            icon: LayoutDashboard,
            isActive: activeNav === 'command-center',
            onClick: () => onNavigate('command-center'),
          },
          {
            id: 'sub-portfolio',
            label: 'Portfolio',
            icon: Layers,
            isActive: activeNav === 'portfolio',
            onClick: () => onNavigate('portfolio'),
            badge: workloadCount,
          },
          {
            id: 'sub-dna',
            label: 'Enterprise DNA',
            icon: Dna,
            isActive: activeNav === 'dna',
            onClick: () => onNavigate('dna'),
          },
        ]
      : activeJob === 'decide'
      ? [
          {
            id: 'sub-recommendation',
            label: 'Recommendation',
            icon: GitBranch,
            isActive: activeNav === 'decisions' && activeDecideTab === 'recommendation',
            onClick: () => {
              onSelectDecideTab?.('recommendation');
              onNavigate('decisions');
            },
          },
          {
            id: 'sub-evidence',
            label: 'Evidence',
            icon: Dna,
            isActive: activeNav === 'decisions' && activeDecideTab === 'evidence',
            onClick: () => {
              onSelectDecideTab?.('evidence');
              onNavigate('decisions');
            },
          },
          {
            id: 'sub-alternatives',
            label: 'Alternatives',
            icon: Layers,
            isActive: activeNav === 'decisions' && activeDecideTab === 'alternatives',
            onClick: () => {
              onSelectDecideTab?.('alternatives');
              onNavigate('decisions');
            },
          },
          {
            id: 'sub-approval',
            label: 'Approval',
            icon: ShieldCheck,
            isActive:
              activeNav === 'governance' ||
              (activeNav === 'decisions' && activeDecideTab === 'approval'),
            onClick: () => {
              onSelectDecideTab?.('approval');
              onNavigate('governance');
            },
            badge: needsEvidenceCount > 0 ? needsEvidenceCount : undefined,
          },
        ]
      : activeJob === 'transform'
      ? [
          {
            id: 'sub-plan',
            label: 'Plan',
            icon: Route,
            isActive: activeNav === 'plan',
            onClick: () => onNavigate('plan'),
          },
          {
            id: 'sub-execute',
            label: 'Execute',
            icon: Play,
            isActive: activeNav === 'execute',
            onClick: () => onNavigate('execute'),
          },
        ]
      : [
          {
            id: 'sub-measure',
            label: 'Measure',
            icon: BarChart3,
            isActive: activeNav === 'measure',
            onClick: () => onNavigate('measure'),
          },
          {
            id: 'sub-learn',
            label: 'Learn',
            icon: BookOpen,
            isActive: activeNav === 'learn',
            onClick: () => onNavigate('learn'),
          },
        ];

  const handleSelectJob = (job: PrimaryJobConfig) => {
    if (job.id === 'decide') {
      onSelectDecideTab?.('recommendation');
    }
    onNavigate(job.defaultTarget);
    setIsMobileNavOpen(false);
  };

  const handleLearningCenterClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onOpenLearningCenter) {
      e.preventDefault();
      onOpenLearningCenter();
      setIsMobileNavOpen(false);
    }
  };

  const renderSidebarContent = (compact: boolean) => (
    <div className="flex flex-col h-full bg-[var(--emos-surface)] border-r border-[var(--emos-border-subtle)] select-none">
      {/* Brand Header */}
      <div className={`h-14 px-3.5 border-b border-[var(--emos-border-subtle)] flex items-center ${compact ? 'justify-center' : 'justify-between'} gap-2 shrink-0`}>
        <button
          type="button"
          onClick={() => {
            onNavigate('command-center');
            setIsMobileNavOpen(false);
          }}
          className="flex items-center gap-2.5 min-w-0 cursor-pointer text-left"
          aria-label="EMOS Command Center"
        >
          <span className="w-8 h-8 rounded-lg bg-[#4648D4] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-4 h-4" />
          </span>
          {!compact && (
            <span className="min-w-0">
              <span className="flex items-center gap-1.5">
                <span className="font-display font-bold text-sm tracking-tight text-[var(--emos-text-primary)]">
                  EMOS
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-[var(--emos-accent-subtle)] border border-[var(--emos-accent-border)] text-[9px] font-mono font-semibold text-[var(--emos-accent-text)] uppercase">
                  v2.0
                </span>
              </span>
              <span className="block text-[10px] text-[var(--emos-text-muted)] truncate">
                Modernization OS
              </span>
            </span>
          )}
        </button>

        {!compact && (
          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
            className="hidden lg:inline-flex p-1.5 rounded-lg text-[var(--emos-text-muted)] hover:text-[var(--emos-text-primary)] hover:bg-[var(--emos-surface-hover)] cursor-pointer transition-colors"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Level 1: Four Canonical Business Jobs */}
      <nav aria-label="EMOS primary navigation" className="flex-1 overflow-y-auto px-2.5 py-4 space-y-1.5">
        {!compact && (
          <p className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--emos-text-muted)]">
            Modernization Journey
          </p>
        )}
        {primaryJobs.map((job, idx) => {
          const Icon = job.icon;
          const isActive = activeJob === job.id;
          return (
            <button
              key={job.id}
              id={`shell-nav-${job.id}`}
              type="button"
              onClick={() => handleSelectJob(job)}
              title={compact ? `${job.label} — ${job.subtitle}` : undefined}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full relative flex items-center ${compact ? 'justify-center px-2 py-2.5' : 'justify-between px-2.5 py-2.5'} rounded-lg text-xs transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[var(--emos-accent-subtle)] text-[var(--emos-accent-text)] font-semibold'
                  : 'text-[var(--emos-text-secondary)] hover:bg-[var(--emos-surface-hover)] hover:text-[var(--emos-text-primary)] font-medium'
              }`}
            >
              {isActive && (
                <span
                  className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-[#4648D4]"
                  aria-hidden="true"
                />
              )}
              <span className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-[#4648D4] dark:text-[#818CF8]' : 'text-[var(--emos-text-muted)]'
                  }`}
                />
                {!compact && (
                  <span className="min-w-0 text-left">
                    <span className="block truncate leading-tight">
                      <span className="font-mono text-[10px] opacity-60 mr-1.5">0{idx + 1}</span>
                      {job.label}
                    </span>
                    <span className="block text-[10px] font-normal text-[var(--emos-text-muted)] truncate mt-0.5">
                      {job.subtitle}
                    </span>
                  </span>
                )}
              </span>
              {!compact && job.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-semibold shrink-0 ${
                    job.badgeTone === 'amber'
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25'
                      : job.badgeTone === 'indigo'
                      ? 'bg-[var(--emos-accent-subtle)] text-[var(--emos-accent-text)] border border-[var(--emos-accent-border)]'
                      : 'bg-[var(--emos-bg-tertiary)] text-[var(--emos-text-muted)]'
                  }`}
                >
                  {job.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Utility Controls: History Drawer, Agent Drawer, Learning Center, Tour */}
      <div className="p-2.5 border-t border-[var(--emos-border-subtle)] space-y-1.5 shrink-0">
        {!compact && (
          <p className="px-2.5 pb-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--emos-text-muted)]">
            Utilities
          </p>
        )}
        {compact && (
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            aria-label="Expand sidebar"
            title="Expand sidebar"
            className="w-full flex items-center justify-center p-2 rounded-lg text-[var(--emos-text-muted)] hover:text-[var(--emos-text-primary)] hover:bg-[var(--emos-surface-hover)] cursor-pointer"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}

        <button
          id="shell-history-drawer-btn"
          type="button"
          onClick={() => {
            onOpenHistory();
            setIsMobileNavOpen(false);
          }}
          title="Assessment History"
          className={`w-full flex items-center ${compact ? 'justify-center px-2' : 'justify-between px-2.5'} py-2 rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-bg)] hover:bg-[var(--emos-surface-hover)] text-xs font-medium text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)] transition-colors cursor-pointer`}
        >
          <span className="flex items-center gap-2 min-w-0">
            <History className="w-3.5 h-3.5 text-[var(--emos-text-muted)] shrink-0" />
            {!compact && <span className="truncate">History</span>}
          </span>
          {!compact && (
            <span className="px-1.5 py-0.5 rounded-full bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] text-[10px] font-mono text-[var(--emos-text-muted)]">
              {assessmentCount}
            </span>
          )}
        </button>

        {compact ? (
          <div className="flex flex-col items-center gap-1 pt-1">
            <a
              href="/learn"
              onClick={handleLearningCenterClick}
              aria-label="Learning Center"
              title="Learning Center"
              className="w-full flex items-center justify-center p-2 rounded-lg text-[var(--emos-text-muted)] hover:text-[var(--emos-text-primary)] hover:bg-[var(--emos-surface-hover)] transition-colors"
            >
              <Library className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={() => {
                onOpenWalkthrough();
                setIsMobileNavOpen(false);
              }}
              aria-label="Product Tour"
              title="Product Tour"
              className="w-full flex items-center justify-center p-2 rounded-lg text-[var(--emos-text-muted)] hover:text-[var(--emos-text-primary)] hover:bg-[var(--emos-surface-hover)] transition-colors cursor-pointer"
            >
              <Compass className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between pt-1 px-1 text-[11px] text-[var(--emos-text-muted)]">
            <a
              href="/learn"
              onClick={handleLearningCenterClick}
              className="inline-flex items-center gap-1.5 font-medium hover:text-[var(--emos-text-primary)] transition-colors"
            >
              <Library className="w-3.5 h-3.5" />
              <span>Learning Center</span>
            </a>
            <button
              type="button"
              onClick={onOpenWalkthrough}
              className="inline-flex items-center gap-1 hover:text-[var(--emos-text-primary)] transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Tour</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--emos-bg)] text-[var(--emos-text-primary)] flex font-sans selection:bg-[#4648D4] selection:text-white transition-colors">
      {/* Desktop Persistent Left Sidebar (Level 1 — 4 Business Jobs) */}
      <aside
        className={`hidden lg:block shrink-0 sticky top-0 h-screen transition-all duration-200 z-30 ${
          isCollapsed ? 'w-16' : 'w-56'
        }`}
      >
        {renderSidebarContent(isCollapsed)}
      </aside>

      {/* Mobile / Tablet Slide-over Navigation Drawer */}
      {isMobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <div className="relative w-64 max-w-[85vw] h-full z-50 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(false)}
              aria-label="Close navigation menu"
              className="absolute top-3 right-3 z-10 p-1.5 rounded-lg text-[var(--emos-text-muted)] hover:text-[var(--emos-text-primary)] hover:bg-[var(--emos-surface-hover)]"
            >
              <X className="w-4 h-4" />
            </button>
            {renderSidebarContent(false)}
          </div>
        </div>
      )}

      {/* Main Column: Top Bar + Level 2 Contextual Sub-Nav + Dynamic Canvas */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <header
          id="workspace-topbar"
          className="sticky top-0 z-20 bg-[var(--emos-surface)]/95 backdrop-blur-md border-b border-[var(--emos-border-subtle)]"
        >
          {/* Row 1: Estate + Active Workload Pill + Global Search + Global Actions */}
          <div className="h-14 px-3 sm:px-5 flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(true)}
                aria-label="Open navigation"
                className="lg:hidden p-2 rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-bg)] text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)] cursor-pointer"
              >
                <Menu className="w-4 h-4" />
              </button>

              <div className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-bg)] px-2.5 py-1.5 text-xs">
                <Building2 className="w-3.5 h-3.5 text-[#4648D4] dark:text-[#818CF8] shrink-0" />
                <select
                  aria-label="Select enterprise estate"
                  value={activeEstateId === 'financial-services' ? 'financial-services' : 'apex-aerospace'}
                  onChange={(e) => onChangeEstate(e.target.value as 'apex-aerospace' | 'financial-services')}
                  className="bg-transparent font-semibold text-[var(--emos-text-primary)] focus:outline-hidden cursor-pointer pr-1 max-w-[130px] sm:max-w-none truncate"
                >
                  <option value="apex-aerospace">Apex Aerospace</option>
                  <option value="financial-services">Global Financial Services</option>
                </select>
                <span className="hidden 2xl:inline text-[11px] font-mono text-[var(--emos-text-muted)] border-l border-[var(--emos-border-subtle)] pl-2">
                  {estateAssetLabel}
                </span>
              </div>

              {/* Persistent Active Workload Context Pill */}
              {activeWorkloadName && (
                <button
                  type="button"
                  onClick={() => onNavigate('dna')}
                  title={`Active workload: ${activeWorkloadName} (${activeWorkloadCompleteness ?? 0}% DNA)`}
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-bg)] hover:border-[var(--emos-accent-border)] px-2.5 py-1.5 text-xs min-w-0 max-w-[230px] cursor-pointer transition-colors"
                >
                  {activeWorkloadReadiness === 'READY' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  )}
                  <span className="truncate font-medium text-[var(--emos-text-primary)]">
                    {activeWorkloadName}
                  </span>
                </button>
              )}
            </div>

            {/* Center: Global Search */}
            <div className="hidden md:flex flex-1 max-w-sm mx-2">
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 text-[var(--emos-text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search workloads, capabilities, or 6R..."
                  aria-label="Search estate workloads"
                  className="w-full h-9 pl-8 pr-3 rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-bg)] text-xs text-[var(--emos-text-primary)] placeholder-[var(--emos-text-muted)] focus:outline-hidden focus:border-[#4648D4] focus:bg-[var(--emos-surface)] transition-colors"
                />
              </div>
            </div>

            {/* Right: Single Subtle Ask EMOS ⌘J Utility, New Assessment, Theme, Auth State */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                id="topbar-ask-agent-btn"
                type="button"
                onClick={onToggleAgent}
                title="Ask EMOS Modernization Agent (⌘J)"
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-[var(--emos-accent-border)] bg-[var(--emos-accent-subtle)] hover:bg-[var(--emos-accent)]/15 text-[var(--emos-accent-text)] text-xs font-semibold transition-colors cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Ask EMOS</span>
                <kbd className="hidden md:inline text-[10px] font-mono opacity-75">⌘J</kbd>
              </button>

              <button
                id="topbar-new-assessment-btn"
                type="button"
                onClick={onNewAssessment}
                title="New Assessment"
                className="inline-flex items-center gap-1 h-9 px-2.5 rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] hover:bg-[var(--emos-surface-hover)] text-xs font-medium text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)] transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[var(--emos-text-muted)]" />
                <span className="hidden xl:inline">New Assessment</span>
              </button>

              <ThemeSelector />

              {user ? (
                <div className="flex items-center gap-2 pl-2 border-l border-[var(--emos-border-subtle)]">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-7 h-7 rounded-full border border-[var(--emos-border-subtle)] object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[var(--emos-accent-subtle)] border border-[var(--emos-accent-border)] flex items-center justify-center text-[var(--emos-accent-text)] text-xs font-semibold">
                      {user.displayName ? user.displayName.slice(0, 1).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                    </div>
                  )}
                  <div className="hidden 2xl:block text-left max-w-[120px]">
                    <p className="text-xs font-semibold text-[var(--emos-text-primary)] truncate">
                      {user.displayName || 'Architect'}
                    </p>
                    <p className="text-[10px] text-[var(--emos-text-muted)] truncate">{user.email}</p>
                  </div>
                  <button
                    id="sign-out-btn"
                    type="button"
                    onClick={() => signOut()}
                    aria-label="Sign Out"
                    title="Sign Out"
                    className="p-1.5 rounded-lg text-[var(--emos-text-muted)] hover:text-[var(--emos-text-primary)] hover:bg-[var(--emos-surface-hover)] cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 pl-2 border-l border-[var(--emos-border-subtle)]">
                  <span
                    title="Local evaluation session — assessments are not persisted to Cloud Firestore until you sign in."
                    className="hidden xl:inline-flex items-center px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-[10px] font-mono font-semibold text-amber-800 dark:text-amber-300"
                  >
                    Local Evaluation
                  </span>
                  <button
                    id="workspace-signin-btn"
                    type="button"
                    onClick={() => void signInWithGoogle()}
                    className="h-8 px-2.5 rounded-lg border border-[var(--emos-border-strong)] bg-[var(--emos-surface)] hover:bg-[var(--emos-surface-hover)] text-xs font-semibold text-[var(--emos-text-primary)] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Sign in
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Level 2 Contextual Sub-Navigation */}
          <nav
            aria-label="Contextual section navigation"
            className="h-10 px-3 sm:px-5 border-t border-[var(--emos-border-subtle)] bg-[var(--emos-bg)]/80 flex items-center gap-1 overflow-x-auto"
          >
            <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.08em] text-[var(--emos-text-muted)] mr-2 shrink-0">
              {activeJob}
            </span>
            <span className="text-[var(--emos-border-strong)] mr-1 select-none" aria-hidden="true">/</span>
            {contextualItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  id={item.id}
                  type="button"
                  onClick={item.onClick}
                  aria-current={item.isActive ? 'page' : undefined}
                  className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    item.isActive
                      ? 'bg-[var(--emos-surface)] text-[var(--emos-accent-text)] font-semibold shadow-2xs ring-1 ring-[var(--emos-border-subtle)]'
                      : 'text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)] hover:bg-[var(--emos-surface-hover)]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0 rounded-full bg-[var(--emos-bg-tertiary)] text-[10px] font-mono text-[var(--emos-text-muted)]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </header>

        {/* Main Workspace Slot */}
        <div className="flex-1 flex min-w-0 relative">
          {children}
        </div>
      </div>
    </div>
  );
};
