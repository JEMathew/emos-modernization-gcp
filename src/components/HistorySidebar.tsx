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
  AlertCircle
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
        item.category?.toLowerCase() === categoryFilter.toLowerCase() ||
        item.mode?.toLowerCase() === categoryFilter.toLowerCase() ||
        item.recommended6R?.toLowerCase() === categoryFilter.toLowerCase();

      return matchesSearch && matchesCat;
    });
  }, [interactions, searchTerm, categoryFilter]);

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'options':
        return <GitCompare className="w-3.5 h-3.5 text-[#E5C492]" />;
      case 'decision':
        return <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-[#A88554]" />;
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
      className="w-full lg:w-80 border-r border-[#222] bg-[#0F0F0F] flex flex-col shrink-0 h-[calc(100vh-4rem)] overflow-hidden text-[#D4D4D4]"
    >
      {/* Top action & search */}
      <div className="p-4 border-b border-[#222] space-y-3 bg-[#0F0F0F]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#666] font-semibold">
            Recent Assessments
          </span>
          <span className="text-[10px] text-[#A88554] bg-[#1A1A1A] border border-[#2E2E2E] px-2 py-0.5 rounded-full font-medium">
            {interactions.length} {interactions.length === 1 ? 'assessment' : 'assessments'}
          </span>
        </div>

        {/* Portfolio shortcut button */}
        {onOpenPortfolio && (
          <button
            id="sidebar-portfolio-btn"
            onClick={onOpenPortfolio}
            className={`w-full flex items-center justify-between py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              currentView === 'portfolio' || currentView === 'dna'
                ? 'bg-[#1E1E1E] border-[#A88554]/50 text-[#E5C492] shadow-xs'
                : 'bg-[#141414] hover:bg-[#1A1A1A] border-[#2A2A2A] text-[#CCC] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-[#A88554]" />
              <span>Enterprise Portfolio</span>
            </div>
            <span className="px-1.5 py-0.2 rounded-md bg-[#222] border border-[#333] text-[10px] text-[#AAA]">
              Portfolio
            </span>
          </button>
        )}

        <button
          id="sidebar-new-btn"
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#1A1A1A] hover:bg-[#222] border border-[#333] hover:border-[#A88554]/60 text-white text-xs font-medium transition-all shadow-xs group cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#A88554] group-hover:scale-110 transition-transform" />
          <span>New Assessment</span>
        </button>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#555] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="history-search-input"
            type="text"
            placeholder="Search workloads & decisions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 bg-[#111] border border-[#333] rounded-xl focus:outline-hidden focus:border-[#A88554] focus:ring-1 focus:ring-[#A88554] text-[#D4D4D4] placeholder-[#555] transition-all"
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
                  : 'bg-[#151515] border border-[#262626] text-[#888] hover:text-white hover:bg-[#1A1A1A]'
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
                    : 'bg-[#151515] border border-[#262626] text-[#888] hover:text-white hover:bg-[#1A1A1A]'
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
          <div className="p-8 text-center text-xs text-[#666] space-y-2">
            <div className="w-5 h-5 border-2 border-[#333] border-t-[#A88554] rounded-full animate-spin mx-auto" />
            <p>Loading your modernization assessments...</p>
          </div>
        ) : filteredInteractions.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#666] space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#151515] border border-[#262626] flex items-center justify-center mx-auto text-[#555]">
              <Sparkles className="w-5 h-5 text-[#A88554]/70" />
            </div>
            {searchTerm ? (
              <p>No assessments matching "{searchTerm}"</p>
            ) : (
              <div className="space-y-1">
                <p className="font-medium text-[#BBB]">No assessments saved yet</p>
                <p className="text-[11px] text-[#555]">
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
                onClick={() => onSelect(item.id)}
                className={`group relative p-3.5 rounded-xl cursor-pointer transition-all border text-left ${
                  isSelected
                    ? 'bg-[#1A1A1A] border-[#333] shadow-lg'
                    : 'bg-[#121212]/70 border-[#222]/80 hover:bg-[#161616] hover:border-[#333]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="shrink-0">{getModeIcon(item.mode)}</span>
                    <h4 className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-[#BBB] group-hover:text-white'}`}>
                      {item.workloadName || item.title || 'Untitled Assessment'}
                    </h4>
                  </div>
                  <span className="text-[11px] text-[#555] shrink-0">
                    {formatDate(item.createdAt)}
                  </span>
                </div>

                <p className="text-[11px] text-[#777] line-clamp-2 mt-1.5 font-normal leading-relaxed">
                  {item.content}
                </p>

                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#222] text-[10px]">
                  <div className="flex items-center gap-1.5 truncate max-w-[200px] flex-wrap">
                    {item.recommended6R && (
                      <span className="px-1.5 py-0.5 rounded bg-[#201A12] border border-[#3E3220] text-[#E5C492] font-semibold uppercase tracking-wider text-[9px]">
                        {item.recommended6R}
                      </span>
                    )}
                    {item.decisionReadiness && (
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        item.decisionReadiness === 'READY'
                          ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/80'
                          : 'bg-[#241B10] text-[#E5A866] border border-[#4A3320]'
                      }`}>
                        {item.decisionReadiness}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md bg-[#151515] border border-[#262626] text-[#A88554] font-medium truncate">
                      {item.category || 'Architecture'}
                    </span>
                  </div>

                  {item.turns && item.turns.length > 0 && (
                    <span className="text-[#555]">
                      {item.turns.length} {item.turns.length === 1 ? 'turn' : 'turns'}
                    </span>
                  )}

                  {/* Delete Button / Confirmation */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
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
                          className="px-2 py-0.5 rounded bg-rose-900/80 border border-rose-700 text-white font-medium hover:bg-rose-800 transition-colors cursor-pointer"
                          title="Confirm Delete"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-0.5 rounded bg-[#222] border border-[#333] text-[#AAA] hover:bg-[#2A2A2A] transition-colors cursor-pointer"
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
                        className="p-1 text-[#555] hover:text-rose-400 rounded transition-colors cursor-pointer"
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
