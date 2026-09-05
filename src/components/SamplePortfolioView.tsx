import React, { useState } from 'react';
import {
  Layers,
  ArrowRight,
  Server,
  Database,
  Info,
  Dna,
  Zap,
  UploadCloud,
  Trash2,
  FolderOpen,
  Search,
  FileSpreadsheet,
  Route,
} from 'lucide-react';
import type { EnterpriseWorkload } from '../types';
import { SAMPLE_PORTFOLIO } from '../data/samplePortfolio';

interface SamplePortfolioViewProps {
  onSelectWorkload: (workload: EnterpriseWorkload) => void;
  onAssessWorkload: (workload: EnterpriseWorkload) => void;
  importedWorkloads?: EnterpriseWorkload[];
  onOpenImportModal: () => void;
  onDeleteImportedWorkload?: (workloadId: string) => Promise<void>;
  onClearImportedPortfolio?: () => Promise<void>;
  isProcessing?: boolean;
  onOpenPlan: () => void;
}

export const SamplePortfolioView: React.FC<SamplePortfolioViewProps> = ({
  onSelectWorkload,
  onAssessWorkload,
  importedWorkloads = [],
  onOpenImportModal,
  onDeleteImportedWorkload,
  onClearImportedPortfolio,
  isProcessing = false,
  onOpenPlan,
}) => {
  const [activeTab, setActiveTab] = useState<'sample' | 'imported'>('sample');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  const currentWorkloads = activeTab === 'sample' ? SAMPLE_PORTFOLIO : importedWorkloads;

  const filteredWorkloads = currentWorkloads.filter((w) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      w.name.toLowerCase().includes(q) ||
      w.id.toLowerCase().includes(q) ||
      w.businessCapability.toLowerCase().includes(q) ||
      w.currentStack.toLowerCase().includes(q) ||
      w.type.toLowerCase().includes(q)
    );
  });

  const handleDeleteWorkload = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!onDeleteImportedWorkload) return;
    if (confirm(`Remove workload "${id}" from your imported portfolio?`)) {
      setDeletingId(id);
      try {
        await onDeleteImportedWorkload(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleClearAll = async () => {
    if (!onClearImportedPortfolio) return;
    if (confirm('Are you sure you want to remove all imported workloads? This action cannot be undone.')) {
      setIsClearing(true);
      try {
        await onClearImportedPortfolio();
      } finally {
        setIsClearing(false);
      }
    }
  };

  return (
    <div id="sample-portfolio-view" className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-5xl mx-auto w-full transition-colors">
      {/* Top Banner & Title */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] text-[11px] text-[var(--emos-accent)] font-medium">
            <span className="font-bold tracking-wider uppercase text-[var(--emos-accent-text)]">DISCOVER</span>
            <span className="text-[var(--emos-text-muted)]">•</span>
            <span>What workloads are in scope for modernization?</span>
          </div>

          {/* Subtle Modernization Journey Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-[var(--emos-text-muted)] font-mono bg-[var(--emos-bg-tertiary)] px-2.5 py-1 rounded-lg border border-[var(--emos-border-subtle)]">
            <span className="text-[var(--emos-accent-text)] font-semibold bg-[var(--emos-accent-subtle)] px-1.5 py-0.5 rounded border border-[var(--emos-accent-border)]">DISCOVER</span>
            <span>→</span>
            <span>UNDERSTAND</span>
            <span>→</span>
            <span>ASSESS</span>
            <span>→</span>
            <span>DECIDE</span>
            <span>→</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">TRUST</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif text-[var(--emos-text-primary)] tracking-tight">
              Enterprise Modernization Portfolio
            </h1>
            <p className="text-xs sm:text-sm text-[var(--emos-text-secondary)] mt-1 max-w-2xl leading-relaxed">
              Understand your estate, structure modernization evidence, identify evidence gaps, and make explainable modernization decisions.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 self-start sm:self-auto">
            <button onClick={onOpenPlan} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[var(--emos-accent-border)] bg-[var(--emos-accent-subtle)] text-[var(--emos-accent-text)] text-xs font-semibold shadow-sm transition-all cursor-pointer min-h-[38px]">
              <Route className="w-4 h-4" /><span>Plan & Mobilize</span>
            </button>
            <button
              id="import-portfolio-header-btn"
              onClick={onOpenImportModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#A88554] hover:bg-[#BCA075] dark:hover:bg-[#E5C492] text-black text-xs font-semibold shadow-sm transition-all cursor-pointer min-h-[38px]"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Import CSV / JSON</span>
            </button>
          </div>
        </div>

        {/* Two Prominent Entry Paths: A. Explore Sample Portfolio | B. Bring Your Own Portfolio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {/* Path A: Explore Sample Portfolio */}
          <div
            id="entry-path-sample"
            onClick={() => setActiveTab('sample')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              activeTab === 'sample'
                ? 'bg-[var(--emos-surface-elevated)] border-[var(--emos-accent)] shadow-sm ring-1 ring-[var(--emos-accent-border)]'
                : 'bg-[var(--emos-surface)] border-[var(--emos-border-subtle)] hover:border-[var(--emos-border-strong)] hover:bg-[var(--emos-surface-hover)]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--emos-accent-subtle)] border border-[var(--emos-accent-border)] text-[var(--emos-accent-text)] font-bold">
                  Entry Path A
                </span>
                <h3 className="text-xs font-semibold text-[var(--emos-text-primary)]">Explore Sample Portfolio</h3>
              </div>
              <span className="text-[10px] text-[var(--emos-text-secondary)] font-mono bg-[var(--emos-bg-tertiary)] px-2 py-0.5 rounded border border-[var(--emos-border-subtle)]">3 Workloads</span>
            </div>
            <p className="text-[11px] text-[var(--emos-text-secondary)] mt-2 leading-relaxed">
              Use representative enterprise workloads: Legacy Java/Oracle monolith, Core Banking mainframe, and an Enterprise Data Warehouse with verified evidence baselines.
            </p>
          </div>

          {/* Path B: Bring Your Own Portfolio */}
          <div
            id="entry-path-byop"
            onClick={() => {
              setActiveTab('imported');
              if (importedWorkloads.length === 0) {
                onOpenImportModal();
              }
            }}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              activeTab === 'imported'
                ? 'bg-[var(--emos-surface-elevated)] border-[var(--emos-accent)] shadow-sm ring-1 ring-[var(--emos-accent-border)]'
                : 'bg-[var(--emos-surface)] border-[var(--emos-border-subtle)] hover:border-[var(--emos-border-strong)] hover:bg-[var(--emos-surface-hover)]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--emos-accent-subtle)] border border-[var(--emos-accent-border)] text-[var(--emos-accent-text)] font-bold">
                  Entry Path B
                </span>
                <h3 className="text-xs font-semibold text-[var(--emos-text-primary)]">Bring Your Own Portfolio</h3>
              </div>
              <span className="text-[10px] text-[var(--emos-text-secondary)] font-mono bg-[var(--emos-bg-tertiary)] px-2 py-0.5 rounded border border-[var(--emos-border-subtle)]">
                {importedWorkloads.length} Imported
              </span>
            </div>
            <p className="text-[11px] text-[var(--emos-text-secondary)] mt-2 leading-relaxed">
              Import your organization's CSV or JSON inventory with pre-ingestion schema validation, deterministic evidence completeness scoring, and tenant-isolated storage.
            </p>
          </div>
        </div>

        {/* Portfolio Tabs & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-b border-[var(--emos-border-subtle)]">
          {/* Segmented Tab Control */}
          <div className="flex items-center space-x-2">
            <button
              id="tab-sample-portfolio"
              onClick={() => setActiveTab('sample')}
              className={`pb-3 px-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'sample'
                  ? 'border-[var(--emos-accent)] text-[var(--emos-text-primary)] font-semibold'
                  : 'border-transparent text-[var(--emos-text-muted)] hover:text-[var(--emos-text-secondary)]'
              }`}
            >
              <span>Sample Portfolio</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[var(--emos-bg-tertiary)] text-[var(--emos-text-muted)] border border-[var(--emos-border-subtle)]">
                3 Seeded
              </span>
            </button>

            <button
              id="tab-imported-portfolio"
              onClick={() => setActiveTab('imported')}
              className={`pb-3 px-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'imported'
                  ? 'border-[var(--emos-accent)] text-[var(--emos-text-primary)] font-semibold'
                  : 'border-transparent text-[var(--emos-text-muted)] hover:text-[var(--emos-text-secondary)]'
              }`}
            >
              <span>My Imported Portfolio</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                  importedWorkloads.length > 0
                    ? 'bg-[var(--emos-accent-subtle)] text-[var(--emos-accent-text)] border border-[var(--emos-accent-border)]'
                    : 'bg-[var(--emos-bg-tertiary)] text-[var(--emos-text-muted)] border border-[var(--emos-border-subtle)]'
                }`}
              >
                {importedWorkloads.length}
              </span>
            </button>
          </div>

          {/* Search Bar & Clear Action */}
          <div className="flex items-center gap-2 pb-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[var(--emos-text-muted)] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search workloads..."
                className="pl-8 pr-3 py-1.5 bg-[var(--emos-input-bg)] border border-[var(--emos-border-subtle)] focus:border-[var(--emos-accent)] rounded-xl text-xs text-[var(--emos-text-primary)] placeholder-[var(--emos-text-muted)] focus:outline-hidden transition-colors w-full sm:w-56 min-h-[34px]"
              />
            </div>

            {activeTab === 'imported' && importedWorkloads.length > 0 && onClearImportedPortfolio && (
              <button
                onClick={handleClearAll}
                disabled={isClearing}
                className="px-2.5 py-1.5 text-[11px] text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-lg border border-rose-500/30 transition-colors disabled:opacity-50 cursor-pointer"
                title="Clear all imported workloads"
              >
                {isClearing ? 'Clearing...' : 'Clear All'}
              </button>
            )}
          </div>
        </div>

        {/* Governance Disclaimer Notice */}
        <div className="p-3.5 rounded-xl bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] flex items-start gap-3 text-xs text-[var(--emos-text-secondary)]">
          <Info className="w-4 h-4 text-[var(--emos-accent)] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[var(--emos-text-primary)]">
              {activeTab === 'sample' ? 'Representative Reference Dataset: ' : 'User-Isolated Portfolio Inventory: '}
            </span>
            {activeTab === 'sample' ? (
              'These candidate workloads represent typical on-premises enterprise systems for ideation and modernization assessment. EMOS does not claim live automated CMDB synchronization or cloud agent discovery.'
            ) : (
              'Your uploaded workloads are parsed into structured Enterprise DNA and isolated strictly to your authenticated session in Cloud Firestore. Missing attributes become deterministic evidence gaps.'
            )}
          </div>
        </div>
      </div>

      {/* Empty State for Imported Portfolio */}
      {activeTab === 'imported' && importedWorkloads.length === 0 && (
        <div className="p-8 sm:p-12 rounded-2xl bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-full bg-[var(--emos-surface-elevated)] border border-[var(--emos-border-subtle)] flex items-center justify-center text-[var(--emos-accent)]">
            <FolderOpen className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-semibold text-[var(--emos-text-primary)]">No Imported Workloads Yet</h3>
            <p className="text-xs text-[var(--emos-text-secondary)] leading-relaxed">
              Import your enterprise portfolio inventory via CSV or JSON to automatically extract structured Enterprise DNA, calculate evidence completeness, and run canonical 6R modernization assessments.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenImportModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#A88554] hover:bg-[#BCA075] dark:hover:bg-[#E5C492] text-black text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Import Enterprise Portfolio</span>
            </button>
            <button
              onClick={onOpenImportModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--emos-surface-elevated)] hover:bg-[var(--emos-surface-hover)] border border-[var(--emos-border-subtle)] text-[var(--emos-text-primary)] text-xs font-medium transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-[var(--emos-accent)]" />
              <span>Browse Sample Datasets</span>
            </button>
          </div>
        </div>
      )}

      {/* No Search Results */}
      {filteredWorkloads.length === 0 && currentWorkloads.length > 0 && (
        <div className="p-8 text-center bg-[var(--emos-surface)] rounded-xl border border-[var(--emos-border-subtle)] text-xs text-[var(--emos-text-muted)]">
          No workloads matching <span className="text-[var(--emos-text-primary)] font-semibold">"{searchQuery}"</span>. Try a different keyword or clear search.
        </div>
      )}

      {/* Workload Cards Grid: Responsive 1 col on mobile, 2 on tablet, 3 on desktop */}
      {filteredWorkloads.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredWorkloads.map((workload) => {
            const isApp = workload.type === 'Application';
            const isHighCrit = workload.businessCriticality === 'High';
            const isMediumCrit = workload.businessCriticality === 'Medium';
            const isImported = workload.source === 'imported';

            return (
              <div
                key={workload.id}
                id={`portfolio-card-${workload.id}`}
                className="rounded-2xl bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] hover:border-[var(--emos-border-strong)] transition-all flex flex-col justify-between p-4 sm:p-5 group shadow-xs hover:shadow-md relative"
              >
                <div className="space-y-3.5">
                  {/* Header: Type, Source Badge & Criticality */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[var(--emos-bg-tertiary)] border border-[var(--emos-border-subtle)] text-[10px] font-medium text-[var(--emos-text-secondary)]">
                        {isApp ? <Server className="w-3 h-3 text-[var(--emos-accent)]" /> : <Database className="w-3 h-3 text-sky-500" />}
                        {workload.type}
                      </span>

                      {isImported && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-[var(--emos-accent-subtle)] text-[var(--emos-accent-text)] border border-[var(--emos-accent-border)]">
                          Imported
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                          isHighCrit
                            ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30'
                            : isMediumCrit
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {workload.businessCriticality}
                      </span>

                      {isImported && onDeleteImportedWorkload && (
                        <button
                          onClick={(e) => handleDeleteWorkload(e, workload.id)}
                          disabled={deletingId === workload.id}
                          className="text-[var(--emos-text-muted)] hover:text-rose-500 p-1 rounded hover:bg-[var(--emos-surface-hover)] transition-colors cursor-pointer"
                          title="Remove workload"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Workload Title & Business Capability */}
                  <div>
                    <div className="text-[10px] font-mono text-[var(--emos-text-muted)]">{workload.id}</div>
                    <h3 className="text-base font-semibold text-[var(--emos-text-primary)] group-hover:text-[var(--emos-accent-text)] transition-colors leading-snug">
                      {workload.name}
                    </h3>
                    <p className="text-xs text-[var(--emos-text-muted)] mt-0.5 truncate" title={workload.businessCapability}>
                      Capability: <span className="text-[var(--emos-text-secondary)] font-medium">{workload.businessCapability}</span>
                    </p>
                  </div>

                  {/* Current Technology Stack & Hosting */}
                  <div className="p-3 rounded-xl bg-[var(--emos-bg-tertiary)] border border-[var(--emos-border-subtle)] space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[var(--emos-text-muted)]">Current Stack:</span>
                      <span className="font-mono text-[var(--emos-text-primary)] text-right font-medium max-w-[140px] truncate" title={workload.currentStack}>
                        {workload.currentStack}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[var(--emos-text-muted)]">Hosting:</span>
                      <span className="text-[var(--emos-text-secondary)] max-w-[140px] truncate" title={workload.hosting}>
                        {workload.hosting}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[var(--emos-text-muted)]">Dependencies:</span>
                      <span className="text-[var(--emos-text-secondary)] font-mono max-w-[140px] truncate" title={workload.knownDependencies}>
                        {workload.knownDependencies}
                      </span>
                    </div>
                  </div>

                  {/* Key Modernization Signals */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-[var(--emos-text-muted)] font-semibold block">
                      Key Modernization Signals:
                    </span>
                    <div className="space-y-1">
                      {workload.modernizationSignals.slice(0, 3).map((sig, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-[11px] text-[var(--emos-text-secondary)] leading-tight">
                          <span className="text-[var(--emos-accent)] mt-0.5">•</span>
                          <span className="line-clamp-1">{sig}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Deterministic Evidence Completeness Indicator */}
                  <div className="pt-2 border-t border-[var(--emos-border-subtle)] space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[var(--emos-text-muted)]">Evidence Completeness:</span>
                      <span className="font-mono font-semibold text-[var(--emos-accent-text)]">{workload.evidenceCompleteness}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[var(--emos-bg-tertiary)] rounded-full overflow-hidden border border-[var(--emos-border-subtle)]">
                      <div
                        className="h-full bg-gradient-to-r from-[#A88554] to-[#E5C492] rounded-full transition-all duration-500"
                        style={{ width: `${workload.evidenceCompleteness}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions: View Enterprise DNA & Assess */}
                <div className="pt-4 mt-3.5 border-t border-[var(--emos-border-subtle)] space-y-2">
                  <button
                    id={`view-dna-btn-${workload.id}`}
                    onClick={() => onSelectWorkload(workload)}
                    className="w-full py-2 px-3 rounded-xl bg-[var(--emos-surface-elevated)] hover:bg-[var(--emos-surface-hover)] border border-[var(--emos-border-subtle)] hover:border-[var(--emos-accent)] text-[var(--emos-text-primary)] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs min-h-[36px]"
                  >
                    <Dna className="w-3.5 h-3.5 text-[var(--emos-accent)]" />
                    <span>View Enterprise DNA</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[var(--emos-text-muted)] group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <button
                    id={`quick-assess-btn-${workload.id}`}
                    onClick={() => onAssessWorkload(workload)}
                    disabled={isProcessing}
                    className="w-full py-1.5 px-3 rounded-xl bg-transparent hover:bg-[var(--emos-surface-hover)] text-[var(--emos-text-secondary)] hover:text-[var(--emos-accent-text)] text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 min-h-[32px]"
                  >
                    <Zap className="w-3 h-3 text-[var(--emos-accent)]" />
                    <span>Direct Assess for Modernization</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
