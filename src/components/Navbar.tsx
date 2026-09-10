import React from 'react';
import { Sparkles, LogOut, Plus, User as UserIcon, Layers, FileText, Route, Library } from 'lucide-react';
import type { User } from 'firebase/auth';
import { signOut } from '../lib/firebase';
import { ThemeSelector } from './ThemeSelector';

interface NavbarProps {
  user: User | null;
  currentView: 'portfolio' | 'dna' | 'workspace' | 'plan';
  selectedId?: string | null;
  assessmentCount?: number;
  onNavigate: (view: 'portfolio' | 'decision-intelligence' | 'assessments' | 'plan') => void;
  onNewAssessment: () => void;
  onOpenWalkthrough: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentView,
  selectedId,
  assessmentCount,
  onNavigate,
  onNewAssessment,
  onOpenWalkthrough,
}) => {
  return (
    <header id="app-header" className="border-b border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)]/95 backdrop-blur-md sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#A88554] to-[#E5C492] flex items-center justify-center shadow-lg shadow-[#A88554]/15 shrink-0">
            <Sparkles className="w-4 h-4 text-black" />
          </div>
          <div>
            <span className="block font-serif font-bold text-[var(--emos-text-primary)] tracking-wider text-base sm:text-lg">
              EMOS
            </span>
            <span className="hidden sm:block text-[10px] text-[var(--emos-text-muted)] font-normal">
              Enterprise Modernization Operating System
            </span>
          </div>
        </div>

        {/* Desktop / Tablet Navigation: Portfolio, Decisions, Plan, History */}
        <nav className="hidden md:flex items-center gap-1 p-1 bg-[var(--emos-bg-tertiary)] border border-[var(--emos-border-subtle)] rounded-xl">
          <button
            id="nav-tab-portfolio"
            onClick={() => onNavigate('portfolio')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentView === 'portfolio' || currentView === 'dna'
                ? 'bg-[var(--emos-surface)] text-[var(--emos-accent-text)] border border-[var(--emos-border-strong)] shadow-xs'
                : 'text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[var(--emos-accent)]" />
            <span>Portfolio</span>
          </button>

          <button
            id="nav-tab-decision-intel"
            onClick={() => onNavigate('decision-intelligence')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentView === 'workspace' && !selectedId
                ? 'bg-[var(--emos-surface)] text-[var(--emos-accent-text)] border border-[var(--emos-border-strong)] shadow-xs'
                : 'text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--emos-accent)]" />
            <span>Decisions</span>
          </button>

          <button
            id="nav-tab-plan"
            onClick={() => onNavigate('plan')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentView === 'plan'
                ? 'bg-[var(--emos-surface)] text-[var(--emos-accent-text)] border border-[var(--emos-border-strong)] shadow-xs'
                : 'text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)]'
            }`}
          >
            <Route className="w-3.5 h-3.5 text-[var(--emos-accent)]" />
            <span>Plan</span>
          </button>

          <button
            id="nav-tab-history"
            onClick={() => onNavigate('assessments')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentView === 'workspace' && selectedId
                ? 'bg-[var(--emos-surface)] text-[var(--emos-accent-text)] border border-[var(--emos-border-strong)] shadow-xs'
                : 'text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)]'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[var(--emos-accent)]" />
            <span>History</span>
            {assessmentCount !== undefined && assessmentCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[var(--emos-bg-secondary)] border border-[var(--emos-border-subtle)] text-[10px] text-[var(--emos-text-muted)]">
                {assessmentCount}
              </span>
            )}
          </button>
        </nav>

        {/* Actions & User */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <a
            id="navbar-learning-center-link"
            href="/learn"
            aria-label="Open Learning Center"
            title="Open Learning Center"
            className="inline-flex min-h-[36px] min-w-[36px] items-center justify-center gap-1.5 rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] px-2 text-xs font-medium text-[var(--emos-text-secondary)] transition-colors hover:text-[var(--emos-text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--emos-accent)] xl:px-3"
          >
            <Library className="h-4 w-4" aria-hidden="true" />
            <span className="hidden 2xl:inline">Learning Center</span>
          </a>

          <button
            id="walkthrough-btn"
            onClick={onOpenWalkthrough}
            className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)] hover:border-[var(--emos-border-strong)] text-xs font-medium transition-colors"
            title="Open Product Tour"
          >
            Product Tour
          </button>

          <button
            id="nav-new-assessment-btn"
            onClick={onNewAssessment}
            aria-label="New Assessment"
            className="inline-flex min-h-[36px] items-center gap-1 rounded-xl bg-[#A88554] px-3 py-1.5 text-xs font-semibold text-black shadow-sm transition-all hover:bg-[#BCA075] active:scale-98 dark:hover:bg-[#E5C492] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Assessment</span>
            <span className="sm:hidden">New</span>
          </button>

          {/* Theme Appearance Control */}
          <ThemeSelector />

          {user && (
            <div className="flex shrink-0 items-center gap-2 sm:gap-3 pl-1.5 sm:pl-2.5 border-l border-[var(--emos-border-subtle)]">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[var(--emos-border-subtle)] object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--emos-surface-elevated)] border border-[var(--emos-border-subtle)] flex items-center justify-center text-[var(--emos-accent)] font-serif text-xs sm:text-sm font-semibold">
                  {user.displayName ? user.displayName.slice(0, 1).toUpperCase() : <UserIcon className="w-4 h-4" />}
                </div>
              )}

              <div className="hidden 2xl:block text-left max-w-[112px]">
                <p className="text-xs font-semibold text-[var(--emos-text-primary)] truncate">
                  {user.displayName || 'Authenticated User'}
                </p>
                <p className="text-[10px] text-[var(--emos-text-muted)] truncate">{user.email}</p>
              </div>

              <button
                id="sign-out-btn"
                onClick={() => signOut()}
                className="p-1.5 sm:p-2 rounded-xl text-[var(--emos-text-muted)] hover:text-[var(--emos-text-primary)] hover:bg-[var(--emos-surface-hover)] transition-colors cursor-pointer min-w-[36px] min-h-[36px] shrink-0 flex items-center justify-center"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Secondary Navigation Row (320px - 767px): same order and labels as desktop */}
      <div className="md:hidden border-t border-[var(--emos-border-subtle)] px-2 py-1.5 bg-[var(--emos-bg-tertiary)] flex items-center justify-around gap-1">
        <button
          id="mobile-nav-portfolio"
          onClick={() => onNavigate('portfolio')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all min-h-[40px] cursor-pointer ${
            currentView === 'portfolio' || currentView === 'dna'
              ? 'bg-[var(--emos-surface)] text-[var(--emos-accent-text)] border border-[var(--emos-border-strong)] shadow-xs'
              : 'text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)]'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-[var(--emos-accent)]" />
          <span>Portfolio</span>
        </button>

        <button
          id="mobile-nav-decision"
          onClick={() => onNavigate('decision-intelligence')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all min-h-[40px] cursor-pointer ${
            currentView === 'workspace' && !selectedId
              ? 'bg-[var(--emos-surface)] text-[var(--emos-accent-text)] border border-[var(--emos-border-strong)] shadow-xs'
              : 'text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[var(--emos-accent)]" />
          <span>Decisions</span>
        </button>

        <button
          id="mobile-nav-plan"
          onClick={() => onNavigate('plan')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all min-h-[40px] cursor-pointer ${
            currentView === 'plan'
              ? 'bg-[var(--emos-surface)] text-[var(--emos-accent-text)] border border-[var(--emos-border-strong)] shadow-xs'
              : 'text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)]'
          }`}
        >
          <Route className="w-3.5 h-3.5 text-[var(--emos-accent)]" />
          <span>Plan</span>
        </button>

        <button
          id="mobile-nav-history"
          onClick={() => onNavigate('assessments')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all min-h-[40px] cursor-pointer ${
            currentView === 'workspace' && selectedId
              ? 'bg-[var(--emos-surface)] text-[var(--emos-accent-text)] border border-[var(--emos-border-strong)] shadow-xs'
              : 'text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)]'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-[var(--emos-accent)]" />
          <span>History</span>
          {assessmentCount !== undefined && assessmentCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[var(--emos-bg-secondary)] border border-[var(--emos-border-subtle)] text-[10px] text-[var(--emos-text-muted)]">
              {assessmentCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
