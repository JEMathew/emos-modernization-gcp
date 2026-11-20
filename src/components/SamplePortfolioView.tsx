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
  Building2,
  Landmark,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Network,
  List,
  Plug,
} from 'lucide-react';
import type { EnterpriseWorkload, Interaction } from '../types';
import { SAMPLE_PORTFOLIO } from '../data/samplePortfolio';
import {
  ENTERPRISE_ESTATE_PROFILES,
  deriveEvidenceDrivenRecommendation,
  type EnterpriseSampleId,
} from '../data/enterpriseEstates';
import { JourneyStage } from './JourneyStage';
import { CapabilityCue } from './CapabilityCue';

interface SamplePortfolioViewProps {
  onSelectWorkload: (workload: EnterpriseWorkload) => void;
  onAssessWorkload: (workload: EnterpriseWorkload) => void;
  importedWorkloads?: EnterpriseWorkload[];
  activeEstateId?: EnterpriseSampleId;
  onChangeEstate?: (estateId: EnterpriseSampleId) => void;
  estateWorkloads?: EnterpriseWorkload[];
  interactions?: Interaction[];
  onOpenImportModal: () => void;
  onOpenPlan?: () => void;
  onDeleteImportedWorkload?: (workloadId: string) => Promise<void>;
  onClearImportedPortfolio?: () => Promise<void>;
  isProcessing?: boolean;
}

export const SamplePortfolioView: React.FC<SamplePortfolioViewProps> = ({
  onSelectWorkload,
  onAssessWorkload,
  importedWorkloads = [],
  activeEstateId = 'apex-aerospace',
  onChangeEstate,
  estateWorkloads,
  interactions = [],
  onOpenImportModal,
  onOpenPlan,
  onDeleteImportedWorkload,
  onClearImportedPortfolio,
  isProcessing = false,
}) => {
  const [activeTab, setActiveTab] = useState<'sample' | 'imported'>('sample');
  const [selectedEnterprise, setSelectedEnterprise] = useState<'apex-aerospace' | 'financial-services'>(
    activeEstateId === 'financial-services' ? 'financial-services' : 'apex-aerospace'
  );
  const [portfolioTopologyView, setPortfolioTopologyView] = useState<'registry' | 'spatial'>('registry');
  const [showFullEstateScope, setShowFullEstateScope] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  const activeProfile = ENTERPRISE_ESTATE_PROFILES[selectedEnterprise];

  // For default Apex Aerospace view, show the 3 core SAMPLE_PORTFOLIO items by default (preserving existing tests),
  // or all 6 full-scope items when toggled or when viewing Financial Services.
  const defaultSampleList = selectedEnterprise === 'financial-services'
    ? (estateWorkloads && activeEstateId === 'financial-services' ? estateWorkloads : activeProfile.workloads)
    : showFullEstateScope
    ? (estateWorkloads && activeEstateId === 'apex-aerospace' ? estateWorkloads : activeProfile.workloads)
    : (estateWorkloads && activeEstateId === 'apex-aerospace' ? estateWorkloads.slice(0, 3) : SAMPLE_PORTFOLIO);

  const currentWorkloads = activeTab === 'sample' ? defaultSampleList : importedWorkloads;

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

  // Command Center Metrics (4 KPIs maximum per Section L & T)
  const avgCompleteness = currentWorkloads.length > 0
    ? Math.round(currentWorkloads.reduce((acc, w) => acc + w.evidenceCompleteness, 0) / currentWorkloads.length)
    : 0;
  const decisionsRequiringAttention = currentWorkloads.filter((w) => w.evidenceCompleteness < 70).length;
  const readyForTransformation = currentWorkloads.length - decisionsRequiringAttention;

  const handleSelectEnterprise = (entId: 'apex-aerospace' | 'financial-services') => {
    setSelectedEnterprise(entId);
    setActiveTab('sample');
    if (entId === 'financial-services') {
      setShowFullEstateScope(true);
    }
    onChangeEstate?.(entId);
  };

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
    <div id="sample-portfolio-view" className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-7 max-w-5xl mx-auto w-full transition-colors">
      {/* Top Banner & Title */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <JourneyStage stage="Discover" question="What workloads are in scope for modernization?" />
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[var(--emos-bg-tertiary)] border border-[var(--emos-border-subtle)] text-xs">
            <button
              type="button"
              onClick={() => setPortfolioTopologyView('registry')}
              aria-pressed={portfolioTopologyView === 'registry'}
              className={`px-2.5 py-1 rounded-lg font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
                portfolioTopologyView === 'registry'
                  ? 'bg-[var(--emos-surface)] text-[var(--emos-accent-text)] border border-[var(--emos-border-strong)]'
                  : 'text-[var(--emos-text-secondary)]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Portfolio Registry</span>
            </button>
            <button
              type="button"
              onClick={() => setPortfolioTopologyView('spatial')}
              aria-pressed={portfolioTopologyView === 'spatial'}
              className={`px-2.5 py-1 rounded-lg font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
                portfolioTopologyView === 'spatial'
                  ? 'bg-[var(--emos-surface)] text-[var(--emos-accent-text)] border border-[var(--emos-border-strong)]'
                  : 'text-[var(--emos-text-secondary)]'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Spatial Topology</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif text-[var(--emos-text-primary)] tracking-tight">
              Enterprise Modernization Portfolio
            </h1>
            <p className="text-xs sm:text-sm text-[var(--emos-text-secondary)] mt-1 max-w-2xl leading-relaxed">
              Understand your estate, structure modernization evidence, identify evidence gaps, and execute governed 6R modernization decisions.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 self-start sm:self-auto">
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

        {/* COMMAND CENTER: What Needs My Attention? (Section T - 4 Primary KPIs) */}
        <section
          aria-label="Command Center Attention Summary"
          className="rounded-2xl border border-[var(--emos-border-strong)] bg-[var(--emos-surface)] p-4 sm:p-5 space-y-3.5 shadow-xs"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[var(--emos-accent)]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--emos-accent-text)]">
                Command Center · What Needs My Attention?
              </h2>
            </div>
            <span className="text-[11px] font-mono text-[var(--emos-text-muted)]">
              Active Estate: <strong className="text-[var(--emos-text-primary)]">{activeTab === 'imported' ? 'Uploaded Enterprise Portfolio' : activeProfile.name}</strong>
              {activeTab === 'sample' && ` (${activeProfile.totalAssetsRepresented.toLocaleString()}+ representative assets)`}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-[var(--emos-bg-tertiary)] border border-[var(--emos-border-subtle)]">
              <p className="text-[10px] font-mono uppercase text-[var(--emos-text-muted)]">Portfolio Health</p>
              <p className="text-lg sm:text-xl font-bold font-mono text-[var(--emos-accent-text)] mt-0.5">{avgCompleteness}% DNA</p>
              <p className="text-[10px] text-[var(--emos-text-secondary)] mt-0.5">Average verified evidence</p>
            </div>

            <div className="p-3 rounded-xl bg-[var(--emos-bg-tertiary)] border border-[var(--emos-border-subtle)]">
              <p className="text-[10px] font-mono uppercase text-[var(--emos-text-muted)]">Decisions Needing Evidence</p>
              <p className="text-lg sm:text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                {decisionsRequiringAttention}
              </p>
              <p className="text-[10px] text-[var(--emos-text-secondary)] mt-0.5">Gated below 70% or missing critical DNA</p>
            </div>

            <div className="p-3 rounded-xl bg-[var(--emos-bg-tertiary)] border border-[var(--emos-border-subtle)]">
              <p className="text-[10px] font-mono uppercase text-[var(--emos-text-muted)]">Ready / Active Transforms</p>
              <p className="text-lg sm:text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {readyForTransformation}
              </p>
              <p className="text-[10px] text-[var(--emos-text-secondary)] mt-0.5">Ready for governance & execution</p>
            </div>

            <div className="p-3 rounded-xl bg-[var(--emos-bg-tertiary)] border border-[var(--emos-border-subtle)]">
              <p className="text-[10px] font-mono uppercase text-[var(--emos-text-muted)]">Governed Assessments</p>
              <p className="text-lg sm:text-xl font-bold font-mono text-[var(--emos-text-primary)] mt-0.5">
                {interactions.length}
              </p>
              <p className="text-[10px] text-[var(--emos-text-secondary)] mt-0.5">Persisted across 6R lifecycle</p>
            </div>
          </div>
        </section>

        {/* HOW WOULD YOU LIKE TO START? (Section D - 4 Entry Paths) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--emos-text-muted)] font-semibold">
              How Would You Like to Start?
            </span>
            {activeTab === 'sample' && selectedEnterprise === 'apex-aerospace' && (
              <button
                type="button"
                onClick={() => setShowFullEstateScope((prev) => !prev)}
                className="text-xs font-semibold text-[var(--emos-accent-text)] hover:underline cursor-pointer"
              >
                {showFullEstateScope ? 'Show Core 3 Workloads' : 'Show All 6 Apex 6R Archetypes (Retain/Retire/Rehost/Replatform/Refactor/Repurchase)'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-0.5">
            {/* Path 1: Explore Apex Aerospace (Primary Sample) */}
            <div
              id="entry-path-sample"
              onClick={() => handleSelectEnterprise('apex-aerospace')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                activeTab === 'sample' && selectedEnterprise === 'apex-aerospace'
                  ? 'bg-[var(--emos-surface-elevated)] border-[var(--emos-accent)] shadow-sm ring-1 ring-[var(--emos-accent-border)]'
                  : 'bg-[var(--emos-surface)] border-[var(--emos-border-subtle)] hover:border-[var(--emos-border-strong)] hover:bg-[var(--emos-surface-hover)]'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--emos-accent-subtle)] border border-[var(--emos-accent-border)] text-[var(--emos-accent-text)] font-bold">
                  Primary Sample
                </span>
                <span className="text-[10px] text-[var(--emos-text-secondary)] font-mono">10,420+ Assets</span>
              </div>
              <h3 className="text-xs font-semibold text-[var(--emos-text-primary)] mt-2 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[var(--emos-accent)] shrink-0" />
                <span>Explore Apex Aerospace</span>
              </h3>
              <p className="text-[11px] text-[var(--emos-text-secondary)] mt-1 leading-snug">
                Global aircraft manufacturer spanning Engineering, PLM, Shop-Floor MES, Supply Chain, and Enterprise Analytics.
              </p>
            </div>

            {/* Path 2: Explore Financial Services (Secondary Sample) */}
            <div
              id="entry-path-financial"
              onClick={() => handleSelectEnterprise('financial-services')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                activeTab === 'sample' && selectedEnterprise === 'financial-services'
                  ? 'bg-[var(--emos-surface-elevated)] border-[var(--emos-accent)] shadow-sm ring-1 ring-[var(--emos-accent-border)]'
                  : 'bg-[var(--emos-surface)] border-[var(--emos-border-subtle)] hover:border-[var(--emos-border-strong)] hover:bg-[var(--emos-surface-hover)]'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--emos-bg-tertiary)] border border-[var(--emos-border-subtle)] text-[var(--emos-text-secondary)] font-bold">
                  Secondary Sample
                </span>
                <span className="text-[10px] text-[var(--emos-text-secondary)] font-mono">6,850+ Assets</span>
              </div>
              <h3 className="text-xs font-semibold text-[var(--emos-text-primary)] mt-2 flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-[var(--emos-accent)] shrink-0" />
                <span>Explore Financial Services</span>
              </h3>
              <p className="text-[11px] text-[var(--emos-text-secondary)] mt-1 leading-snug">
                Global banking & payments estate covering Fixed Income Clearing, Basel III Risk EDW, AML, SWIFT, and HSM Vaults.
              </p>
            </div>

            {/* Path 3: Upload Your Portfolio (CSV / JSON) */}
            <div
              id="entry-path-byop"
              onClick={() => {
                setActiveTab('imported');
                if (importedWorkloads.length === 0) {
                  onOpenImportModal();
                }
              }}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                activeTab === 'imported'
                  ? 'bg-[var(--emos-surface-elevated)] border-[var(--emos-accent)] shadow-sm ring-1 ring-[var(--emos-accent-border)]'
                  : 'bg-[var(--emos-surface)] border-[var(--emos-border-subtle)] hover:border-[var(--emos-border-strong)] hover:bg-[var(--emos-surface-hover)]'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--emos-accent-subtle)] border border-[var(--emos-accent-border)] text-[var(--emos-accent-text)] font-bold">
                  CSV / JSON
                </span>
                <span className="text-[10px] text-[var(--emos-text-secondary)] font-mono">
                  {importedWorkloads.length} Imported
                </span>
              </div>
              <h3 className="text-xs font-semibold text-[var(--emos-text-primary)] mt-2 flex items-center gap-1.5">
                <UploadCloud className="w-3.5 h-3.5 text-[var(--emos-accent)] shrink-0" />
                <span>Upload Your Portfolio</span>
              </h3>
              <p className="text-[11px] text-[var(--emos-text-secondary)] mt-1 leading-snug">
                Import your organization&apos;s CSV or JSON inventory with schema validation and automatic Enterprise DNA extraction.
              </p>
            </div>

            {/* Path 4: Connect Enterprise Sources (Coming Soon / Future) */}
            <div
              id="entry-path-connectors"
              className="p-3.5 rounded-xl border border-dashed border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)]/70 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--emos-bg-tertiary)] border border-[var(--emos-border-subtle)] text-[var(--emos-text-muted)] font-bold">
                    Coming Soon / Future
                  </span>
                </div>
                <h3 className="text-xs font-semibold text-[var(--emos-text-primary)] mt-2 flex items-center gap-1.5">
                  <Plug className="w-3.5 h-3.5 text-[var(--emos-text-muted)] shrink-0" />
                  <span>Connect Enterprise Sources</span>
                </h3>
                <p className="text-[11px] text-[var(--emos-text-muted)] mt-1 leading-snug">
                  Automated connectors for ServiceNow CMDB, LeanIX, Apptio, GitHub, and cloud billing telemetry.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Spatial Portfolio Intelligence View (Section N2: Enterprise -> Domain -> Capability -> System -> DNA) */}
        {portfolioTopologyView === 'spatial' && activeTab === 'sample' && (
          <section
            aria-label="Spatial Portfolio Domain Topology"
            className="rounded-3xl border border-[var(--emos-border-strong)] bg-[var(--emos-bg-secondary)] p-5 sm:p-6 space-y-5 shadow-lg"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--emos-border-subtle)] pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--emos-accent-text)] font-bold">
                  Enterprise → Domain → Capability → System → Enterprise DNA
                </span>
                <h2 className="font-serif text-xl font-semibold text-[var(--emos-text-primary)] mt-0.5">
                  {activeProfile.name} — {activeProfile.totalAssetsRepresented.toLocaleString()}+ Asset Domain Topology
                </h2>
              </div>
              <span className="text-xs font-mono text-[var(--emos-text-secondary)]">
                Baseline Spend: <strong>{activeProfile.annualTechSpendBaseline}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {activeProfile.domains.map((domain) => (
                <div
                  key={domain.id}
                  className="p-4 rounded-2xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] hover:border-[var(--emos-accent)] transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs font-bold text-[var(--emos-text-primary)] leading-snug">
                      {domain.name}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${
                      domain.hotspotRisk === 'High'
                        ? 'bg-rose-500/10 text-rose-600 border border-rose-500/30'
                        : domain.hotspotRisk === 'Medium'
                        ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                    }`}>
                      {domain.hotspotRisk} Hotspot
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center bg-[var(--emos-bg-tertiary)] p-2 rounded-xl text-[11px]">
                    <div>
                      <span className="text-[9px] text-[var(--emos-text-muted)] block">Assets</span>
                      <strong className="font-mono">{domain.assetCount.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-[var(--emos-text-muted)] block">Tier-1 Crit</span>
                      <strong className="font-mono">{domain.criticalCount}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-[var(--emos-text-muted)] block">Avg DNA</span>
                      <strong className="font-mono text-[var(--emos-accent-text)]">{domain.avgCompleteness}%</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-[var(--emos-text-muted)]">Dominant Signal:</span>
                    <span className="font-semibold text-[var(--emos-accent-text)]">{domain.dominantDisposition}</span>
                  </div>

                  <div className="text-[10px] text-[var(--emos-text-secondary)]">
                    Systems: {domain.representativeSystems.join(' · ')}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

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
              <span>Sample Portfolio ({activeProfile.name})</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[var(--emos-bg-tertiary)] text-[var(--emos-text-muted)] border border-[var(--emos-border-subtle)]">
                {defaultSampleList.length} Seeded
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
              activeProfile.disclaimer
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
          No workloads matching <span className="text-[var(--emos-text-primary)] font-semibold">&quot;{searchQuery}&quot;</span>. Try a different keyword or clear search.
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
            const derived = deriveEvidenceDrivenRecommendation(workload);

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

                  {/* Derived Plain-English Signal Pill */}
                  <div className="px-3 py-2 rounded-xl bg-[var(--emos-accent-subtle)] border border-[var(--emos-accent-border)] flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0">
                      <span className="text-[9px] uppercase tracking-wider font-mono text-[var(--emos-text-muted)] block">
                        Evidence Signal
                      </span>
                      <span className="font-semibold text-[var(--emos-text-primary)] truncate block">
                        {derived.plainEnglish} ({derived.recommended6R})
                      </span>
                    </div>
                    <CapabilityCue cueId={derived.recommended6R.toLowerCase()} />
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
                      {workload.modernizationSignals.slice(0, 2).map((sig, idx) => (
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
