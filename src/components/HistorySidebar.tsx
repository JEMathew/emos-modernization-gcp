import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  ShieldCheck,
  Filter,
  GitCompare,
  FileCheck2,
  Layers,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import type { Interaction } from '../types';

interface HistorySidebarProps {
  interactions: Interaction[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onOpenPortfolio?: () => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
  currentView?: string;
  onCloseMobile?: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  interactions,
  selectedId,
  onSelect,
  onNew,
  onOpenPortfolio,
  onDelete,
  isLoading,
  currentView,
  onCloseMobile,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    interactions.forEach(item => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [interactions]);

  const filteredInteractions = useMemo(() => {
    return interactions.filter((item) => {
      const matchesSearch =
        searchTerm === '' ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.recommended6R && item.recommended6R.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCat =
        categoryFilter === 'all' ||
        item.category?.toLowerCase() === categoryFilter.toLowerCase();

      return matchesSearch && matchesCat;
    });
  }, [interactions, searchTerm, categoryFilter]);

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'reflect':
        return <Sparkles className="w-3.5 h-3.5 text-[var(--emos-accent)]" />;
      case 'align':
        return <GitCompare className="w-3.5 h-3.5 text-[var(--emos-accent)]" />;
      case 'act':
        return <FileCheck2 className="w-3.5 h-3.5 text-[var(--emos-accent)]" />;
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-[var(--emos-accent)]" />;
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <aside
      id="history-sidebar"
      className="w-full lg:w-80 border-r border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)] flex flex-col shrink-0 h-full lg:h-[calc(100vh-4rem)] overflow-hidden text-[var(--emos-text-primary)] transition-colors"
    >
      {/* Top action & search */}
      <div className="p-3.5 sm:p-4 border-b border-[var(--emos-border-subtle)] space-y-3 bg-[var(--emos-bg-secondary)]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--emos-text-muted)] font-semibold">
            Recent Assessments
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[var(--emos-accent)] bg-[var(--emos-accent-subtle)] border border-[var(--emos-accent-border)] px-2 py-0.5 rounded-full font-medium">
              {interactions.length} {interactions.length === 1 ? 'assessment' : 'assessments'}
            </span>
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1 text-[var(--emos-text-muted)] hover:text-[var(--emos-text-primary)] rounded-lg hover:bg-[var(--emos-surface-hover)]"
                title="Close sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Portfolio shortcut button */}
        {onOpenPortfolio && (
          <button
            id="sidebar-portfolio-btn"
            onClick={onOpenPortfolio}
            className={`w-full flex items-center justify-between py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              currentView === 'portfolio' || currentView === 'dna'
                ? 'bg-[var(--emos-surface-elevated)] border-[var(--emos-accent)] text-[var(--emos-accent-text)] shadow-xs'
                : 'bg-[var(--emos-surface)] hover:bg-[var(--emos-surface-hover)] border-[var(--emos-border-subtle)] text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-[var(--emos-accent)]" />
              <span>Enterprise Portfolio</span>
            </div>
            <span className="px-1.5 py-0.2 rounded-md bg-[var(--emos-bg-tertiary)] border border-[var(--emos-border-subtle)] text-[10px] text-[var(--emos-text-muted)]">
              Portfolio
            </span>
          </button>
        )}

        <button
          id="sidebar-new-btn"
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[var(--emos-surface)] hover:bg-[var(--emos-surface-hover)] border border-[var(--emos-border-subtle)] hover:border-[var(--emos-accent)] text-[var(--emos-text-primary)] text-xs font-semibold transition-all shadow-xs group cursor-pointer min-h-[38px]"
        >
          <Plus className="w-4 h-4 text-[var(--emos-accent)] group-hover:scale-110 transition-transform" />
          <span>New Assessment</span>
        </button>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[var(--emos-text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="history-search-input"
            type="text"
            placeholder="Search workloads & decisions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 bg-[var(--emos-input-bg)] border border-[var(--emos-border-subtle)] rounded-xl focus:outline-hidden focus:border-[var(--emos-accent)] focus:ring-1 focus:ring-[var(--emos-accent)] text-[var(--emos-text-primary)] placeholder-[var(--emos-text-muted)] transition-all min-h-[38px]"
          />
        </div>

        {/* Category Filter Chips */}
        {categories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors shrink-0 cursor-pointer ${
                categoryFilter === 'all'
                  ? 'bg-[#A88554] text-black font-semibold'
                  : 'bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)] hover:bg-[var(--emos-surface-hover)]'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg transition-colors shrink-0 cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-[#A88554] text-black font-semibold'
                    : 'bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)] hover:bg-[var(--emos-surface-hover)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* List of past interactions */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-[var(--emos-text-muted)] space-y-2">
            <div className="w-5 h-5 border-2 border-[var(--emos-border-subtle)] border-t-[var(--emos-accent)] rounded-full animate-spin mx-auto" />
            <p>Loading your modernization assessments...</p>
          </div>
        ) : filteredInteractions.length === 0 ? (
          <div className="p-8 text-center text-xs text-[var(--emos-text-muted)] space-y-3">
            <div className="w-10 h-10 rounded-full bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] flex items-center justify-center mx-auto text-[var(--emos-text-muted)]">
              <Sparkles className="w-5 h-5 text-[var(--emos-accent)]" />
            </div>
            {searchTerm ? (
              <p>No assessments matching "{searchTerm}"</p>
            ) : (
              <div className="space-y-1">
                <p className="font-medium text-[var(--emos-text-primary)]">No assessments saved yet</p>
                <p className="text-[11px] text-[var(--emos-text-muted)]">
                  Submit your first workload to generate an explainable 6R decision with Gemini.
                </p>
              </div>
            )}
          </div>
        ) : (
          filteredInteractions.map((item) => {
            const isSelected = item.id === selectedId;
            const isConfirming = confirmDeleteId === item.id;

            return (
              <div
                key={item.id}
                id={`history-item-${item.id}`}
                onClick={() => {
                  onSelect(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`group relative p-3 rounded-xl cursor-pointer transition-all border text-left ${
                  isSelected
                    ? 'bg-[var(--emos-surface-elevated)] border-[var(--emos-border-strong)] shadow-sm'
                    : 'bg-[var(--emos-surface)] border-[var(--emos-border-subtle)] hover:bg-[var(--emos-surface-hover)] hover:border-[var(--emos-border-strong)]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="shrink-0">{getModeIcon(item.mode)}</span>
                    <h4 className={`text-sm font-medium truncate ${isSelected ? 'text-[var(--emos-text-primary)] font-semibold' : 'text-[var(--emos-text-primary)] group-hover:text-[var(--emos-accent)]'}`}>
                      {item.workloadName || item.title || 'Untitled Assessment'}
                    </h4>
                  </div>
                  <span className="text-[11px] text-[var(--emos-text-muted)] shrink-0">
                    {formatDate(item.createdAt)}
                  </span>
                </div>

                <p className="text-[11px] text-[var(--emos-text-secondary)] line-clamp-2 mt-1.5 font-normal leading-relaxed">
                  {item.content}
                </p>

                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[var(--emos-border-subtle)] text-[10px]">
                  <div className="flex items-center gap-1.5 truncate max-w-[200px] flex-wrap">
                    {item.recommended6R && (
                      <span className="px-1.5 py-0.5 rounded bg-[var(--emos-accent-subtle)] border border-[var(--emos-accent-border)] text-[var(--emos-accent-text)] font-semibold uppercase tracking-wider text-[9px]">
                        {item.recommended6R}
                      </span>
                    )}
                    {item.decisionReadiness && (
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        item.decisionReadiness === 'READY'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                      }`}>
                        {item.decisionReadiness}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md bg-[var(--emos-bg-tertiary)] border border-[var(--emos-border-subtle)] text-[var(--emos-accent-text)] font-medium truncate">
                      {item.category || 'Architecture'}
                    </span>
                  </div>

                  {item.turns && item.turns.length > 0 && (
                    <span className="text-[var(--emos-text-muted)]">
                      {item.turns.length} {item.turns.length === 1 ? 'turn' : 'turns'}
                    </span>
                  )}

                  {/* Delete Button / Confirmation */}
                  <div className="opacity-80 group-hover:opacity-100 transition-opacity">
                    {isConfirming ? (
                      <div
                        className="flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            onDelete(item.id);
                            setConfirmDeleteId(null);
                          }}
                          className="px-2 py-0.5 rounded bg-rose-600 text-white font-medium hover:bg-rose-700 transition-colors cursor-pointer text-[10px]"
                          title="Confirm Delete"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-0.5 rounded bg-[var(--emos-surface-hover)] border border-[var(--emos-border-subtle)] text-[var(--emos-text-secondary)] transition-colors cursor-pointer text-[10px]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        id={`delete-btn-${item.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(item.id);
                        }}
                        className="p-1 text-[var(--emos-text-muted)] hover:text-rose-500 rounded transition-colors cursor-pointer"
                        title="Delete this assessment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
