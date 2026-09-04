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
  Download,
  FolderOpen,
  Search,
  CheckCircle2,
  FileSpreadsheet,
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
}

export const SamplePortfolioView: React.FC<SamplePortfolioViewProps> = ({
  onSelectWorkload,
  onAssessWorkload,
  importedWorkloads = [],
  onOpenImportModal,
  onDeleteImportedWorkload,
  onClearImportedPortfolio,
  isProcessing = false,
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
    <div id="sample-portfolio-view" className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 max-w-5xl mx-auto w-full">
      {/* Top Banner & Title */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181818] border border-[#2E2E2E] text-[11px] text-[#A88554] font-medium">
            <span className="font-bold tracking-wider uppercase text-[#E5C492]">DISCOVER</span>
            <span className="text-[#555]">•</span>
            <span>What workloads are in scope for modernization?</span>
          </div>

          {/* Subtle Modernization Journey Indicator */}
          <div className="flex items-center gap-1.5 text-[10px] text-[#666] font-mono bg-[#111] px-2.5 py-1 rounded-lg border border-[#222]">
            <span className="text-[#E5C492] font-semibold bg-[#221A10] px-1.5 py-0.5 rounded border border-[#443018]">DISCOVER</span>
            <span>→</span>
            <span>UNDERSTAND</span>
            <span>→</span>
            <span>ASSESS</span>
            <span>→</span>
            <span>DECIDE</span>
            <span>→</span>
            <span>TRUST</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif text-white tracking-tight">
              Enterprise Modernization Portfolio
            </h1>
            <p className="text-xs sm:text-sm text-[#888] mt-1 max-w-2xl leading-relaxed">
              Understand your estate, structure modernization evidence, identify evidence gaps, and make explainable modernization decisions.
            </p>
          </div>

          <button
            id="import-portfolio-header-btn"
            onClick={onOpenImportModal}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#A88554] hover:bg-[#BCA075] text-black text-xs font-semibold shadow-md shadow-[#A88554]/15 transition-all cursor-pointer self-start sm:self-auto"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Import CSV / JSON</span>
          </button>
        </div>

        {/* Two Prominent Entry Paths: A. Explore Sample Portfolio | B. Bring Your Own Portfolio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {/* Path A: Explore Sample Portfolio */}
          <div
            id="entry-path-sample"
            onClick={() => setActiveTab('sample')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              activeTab === 'sample'
                ? 'bg-[#181512] border-[#A88554]/80 shadow-md ring-1 ring-[#A88554]/40'
                : 'bg-[#111] border-[#242424] hover:border-[#383838] hover:bg-[#141414]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#201A12] border border-[#3E301F] text-[#E5C492] font-bold">
                  Entry Path A
                </span>
                <h3 className="text-xs font-semibold text-white">Explore Sample Portfolio</h3>
              </div>
              <span className="text-[10px] text-[#AAA] font-mono bg-[#1C1C1C] px-2 py-0.5 rounded">3 Workloads</span>
            </div>
            <p className="text-[11px] text-[#777] mt-2 leading-relaxed">
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
                ? 'bg-[#181512] border-[#A88554]/80 shadow-md ring-1 ring-[#A88554]/40'
                : 'bg-[#111] border-[#242424] hover:border-[#383838] hover:bg-[#141414]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#201A12] border border-[#3E301F] text-[#E5C492] font-bold">
                  Entry Path B
                </span>
                <h3 className="text-xs font-semibold text-white">Bring Your Own Portfolio</h3>
              </div>
              <span className="text-[10px] text-[#AAA] font-mono bg-[#1C1C1C] px-2 py-0.5 rounded">
                {importedWorkloads.length} Imported
              </span>
            </div>
            <p className="text-[11px] text-[#777] mt-2 leading-relaxed">
              Import your organization's CSV or JSON inventory with pre-ingestion schema validation, deterministic evidence completeness scoring, and tenant-isolated storage.
            </p>
          </div>
        </div>

        {/* Portfolio Tabs & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-b border-[#222]">
          {/* Segmented Tab Control */}
          <div className="flex items-center space-x-2">
            <button
              id="tab-sample-portfolio"
              onClick={() => setActiveTab('sample')}
              className={`pb-3 px-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'sample'
                  ? 'border-[#A88554] text-white font-semibold'
                  : 'border-transparent text-[#777] hover:text-[#bbb]'
              }`}
            >
              <span>Sample Portfolio</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#222] text-[#AAA]">
                3 Seeded
              </span>
            </button>

            <button
              id="tab-imported-portfolio"
              onClick={() => setActiveTab('imported')}
              className={`pb-3 px-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'imported'
                  ? 'border-[#A88554] text-white font-semibold'
                  : 'border-transparent text-[#777] hover:text-[#bbb]'
              }`}
            >
              <span>My Imported Portfolio</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                  importedWorkloads.length > 0
                    ? 'bg-[#A88554]/20 text-[#A88554] border border-[#A88554]/30'
                    : 'bg-[#222] text-[#666]'
                }`}
              >
                {importedWorkloads.length}
              </span>
            </button>
          </div>

          {/* Search Bar & Clear Action */}
          <div className="flex items-center gap-2 pb-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#666] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search workloads..."
                className="pl-8 pr-3 py-1 bg-[#141414] border border-[#262626] focus:border-[#A88554] rounded-lg text-xs text-white placeholder-[#555] focus:outline-none transition-colors w-44 sm:w-56"
              />
            </div>

            {activeTab === 'imported' && importedWorkloads.length > 0 && onClearImportedPortfolio && (
              <button
                onClick={handleClearAll}
                disabled={isClearing}
                className="px-2.5 py-1 text-[11px] text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded border border-red-900/30 transition-colors disabled:opacity-50"
                title="Clear all imported workloads"
              >
                {isClearing ? 'Clearing...' : 'Clear All'}
              </button>
            )}
          </div>
        </div>

        {/* Governance Disclaimer Notice */}
        <div className="p-3.5 rounded-xl bg-[#121212] border border-[#262626] flex items-start gap-3 text-xs text-[#888]">
          <Info className="w-4 h-4 text-[#A88554] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#CCC]">
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
        <div className="p-10 rounded-2xl bg-[#121212] border border-[#262626] text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#181818] border border-[#333] flex items-center justify-center text-[#A88554]">
            <FolderOpen className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-semibold text-white">No Imported Workloads Yet</h3>
            <p className="text-xs text-[#888] leading-relaxed">
              Import your enterprise portfolio inventory via CSV or JSON to automatically extract structured Enterprise DNA, calculate evidence completeness, and run canonical 6R modernization assessments.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenImportModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#A88554] hover:bg-[#BCA075] text-black text-xs font-semibold shadow-lg shadow-[#A88554]/20 transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Import Enterprise Portfolio</span>
            </button>
            <button
              onClick={onOpenImportModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#181818] hover:bg-[#222] border border-[#333] text-white text-xs font-medium transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#A88554]" />
              <span>Browse Sample Datasets</span>
            </button>
          </div>
        </div>
      )}

      {/* No Search Results */}
      {filteredWorkloads.length === 0 && currentWorkloads.length > 0 && (
        <div className="p-8 text-center bg-[#141414] rounded-xl border border-[#222] text-xs text-[#777]">
          No workloads matching <span className="text-white">"{searchQuery}"</span>. Try a different keyword or clear search.
        </div>
      )}

      {/* Workload Cards Grid */}
      {filteredWorkloads.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {filteredWorkloads.map((workload) => {
            const isApp = workload.type === 'Application';
            const isHighCrit = workload.businessCriticality === 'High';
            const isMediumCrit = workload.businessCriticality === 'Medium';
            const isImported = workload.source === 'imported';

            return (
              <div
                key={workload.id}
                id={`portfolio-card-${workload.id}`}
                className="rounded-2xl bg-[#121212] border border-[#222] hover:border-[#3A3A3A] transition-all flex flex-col justify-between p-5 group shadow-sm hover:shadow-md relative"
              >
                <div className="space-y-4">
                  {/* Header: Type, Source Badge & Criticality */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#1A1A1A] border border-[#2A2A2A] text-[10px] font-medium text-[#AAA]">
                        {isApp ? <Server className="w-3 h-3 text-[#A88554]" /> : <Database className="w-3 h-3 text-[#5A9EED]" />}
                        {workload.type}
                      </span>

                      {isImported && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-[#A88554]/10 text-[#A88554] border border-[#A88554]/30">
                          Imported
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                          isHighCrit
                            ? 'bg-rose-950/40 text-rose-300 border-rose-800/60'
                            : isMediumCrit
                            ? 'bg-amber-950/40 text-amber-300 border-amber-800/60'
                            : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                        }`}
                      >
                        {workload.businessCriticality}
                      </span>

                      {isImported && onDeleteImportedWorkload && (
                        <button
                          onClick={(e) => handleDeleteWorkload(e, workload.id)}
                          disabled={deletingId === workload.id}
                          className="text-[#666] hover:text-red-400 p-1 rounded hover:bg-[#222] transition-colors"
                          title="Remove workload"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Workload Title & Business Capability */}
                  <div>
                    <div className="text-[10px] font-mono text-[#777]">{workload.id}</div>
                    <h3 className="text-base font-semibold text-white group-hover:text-[#E5C492] transition-colors leading-snug">
                      {workload.name}
                    </h3>
                    <p className="text-xs text-[#777] mt-0.5 truncate" title={workload.businessCapability}>
                      Capability: <span className="text-[#AAA] font-medium">{workload.businessCapability}</span>
                    </p>
                  </div>

                  {/* Current Technology Stack & Hosting */}
                  <div className="p-3 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#666]">Current Stack:</span>
                      <span className="font-mono text-[#DDD] text-right font-medium max-w-[140px] truncate" title={workload.currentStack}>
                        {workload.currentStack}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#666]">Hosting:</span>
                      <span className="text-[#AAA] max-w-[140px] truncate" title={workload.hosting}>
                        {workload.hosting}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#666]">Dependencies:</span>
                      <span className="text-[#AAA] font-mono max-w-[140px] truncate" title={workload.knownDependencies}>
                        {workload.knownDependencies}
                      </span>
                    </div>
                  </div>

                  {/* Key Modernization Signals */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-[#666] font-semibold block">
                      Key Modernization Signals:
                    </span>
                    <div className="space-y-1">
                      {workload.modernizationSignals.slice(0, 3).map((sig, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-[11px] text-[#999] leading-tight">
                          <span className="text-[#A88554] mt-0.5">•</span>
                          <span className="line-clamp-1">{sig}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Deterministic Evidence Completeness Indicator */}
                  <div className="pt-2 border-t border-[#1C1C1C] space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#666]">Evidence Completeness:</span>
                      <span className="font-mono font-semibold text-[#E5C492]">{workload.evidenceCompleteness}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#1C1C1C] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#A88554] to-[#E5C492] rounded-full transition-all duration-500"
                        style={{ width: `${workload.evidenceCompleteness}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions: View Enterprise DNA & Assess */}
                <div className="pt-5 mt-4 border-t border-[#1E1E1E] space-y-2">
                  <button
                    id={`view-dna-btn-${workload.id}`}
                    onClick={() => onSelectWorkload(workload)}
                    className="w-full py-2 px-3 rounded-xl bg-[#1A1A1A] hover:bg-[#222] border border-[#333] hover:border-[#444] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm group-hover:border-[#A88554]/50"
                  >
                    <Dna className="w-3.5 h-3.5 text-[#A88554]" />
                    <span>View Enterprise DNA</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#666] group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <button
                    id={`quick-assess-btn-${workload.id}`}
                    onClick={() => onAssessWorkload(workload)}
                    disabled={isProcessing}
                    className="w-full py-1.5 px-3 rounded-xl bg-transparent hover:bg-[#181818] text-[#999] hover:text-[#E5C492] text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Zap className="w-3 h-3 text-[#A88554]" />
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
