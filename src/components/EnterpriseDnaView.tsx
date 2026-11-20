import React, { useState } from 'react';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Dna,
  Briefcase,
  Cpu,
  Share2,
  DollarSign,
  ShieldCheck,
  Compass,
  ArrowRight,
  RotateCcw,
  Edit3,
  Network,
  List,
  Check,
  ChevronDown,
  AlertTriangle,
} from 'lucide-react';
import type { EnterpriseWorkload, DnaField, DnaEvidenceStatus } from '../types';
import { calculateDnaCompleteness } from '../data/samplePortfolio';
import { evaluateEvidenceReadiness } from '../lib/readiness';
import { deriveEvidenceDrivenRecommendation } from '../data/enterpriseEstates';
import { JourneyStage } from './JourneyStage';
import { CapabilityCue } from './CapabilityCue';

interface EnterpriseDnaViewProps {
  workload: EnterpriseWorkload;
  onBackToPortfolio: () => void;
  onAssess: (workload: EnterpriseWorkload) => void;
  onUpdateWorkloadDna?: (updatedWorkload: EnterpriseWorkload) => void;
  onResetSampleWorkload?: (workloadId: string) => void;
  onAskAgent?: (question: string) => void;
  isProcessing?: boolean;
}

const CONTROLLED_EVIDENCE_PRESETS: Record<string, { label: string; options: string[] }> = {
  b1: { label: 'Business Capability', options: ['Customer Analytics', 'Enterprise Analytics', 'Core Transaction Processing', 'Legacy Archival Utility'] },
  b2: { label: 'Business Criticality', options: ['High', 'Medium', 'Low'] },
  b3: { label: 'Modernization Drivers', options: ['Cost reduction, Scalability, Faster analytics', 'Duplicate capability superseded by modern ERP; zero active users', 'Data center colocation lease expiring in 90 days', 'Sub-5ms deterministic shop-floor PLC latency'] },
  t1: { label: 'Runtime', options: ['Java 8 Monolith', 'Java 17 LTS', 'C++ / Industrial Real-Time Runtime', 'Legacy PHP 5.6 / Python 2.7'] },
  t2: { label: 'Database', options: ['Oracle 19c', 'Legacy on-premises enterprise data warehouse', 'PostgreSQL 15', 'MySQL 5.5 (EOL)'] },
  t3: { label: 'Hosting', options: ['On-premises Data Center', 'On-premises Colocation (Lease Expiring)', 'On-premises Air-Gapped Plant Edge'] },
  t4: { label: 'Technology Lifecycle Risk', options: ['Critical End-of-Life', 'Elevated', 'Low — Current LTS Support'] },
  d1: { label: 'Known Dependencies', options: ['7 downstream integrations', 'Multiple upstream and downstream data pipelines', '2 downstream nightly CSV exports (superseded)', '22 shop-floor automation cells via OPC-UA'] },
  d2: { label: 'Dependency Details', options: ['All interface schemas, owners, and latency SLAs verified', 'Both consumers migrated to central ERP; zero active traffic verified', 'Standard REST & SFTP interfaces mapped and tested'] },
  e1: { label: 'Infrastructure Cost', options: ['High ($1.4M/yr)', 'Moderate ($420K/yr)', 'Low ($95K/yr)', 'Amortized hardware'] },
  e2: { label: 'Licensing Cost', options: ['High proprietary licensing ($900K/yr)', 'Moderate ($180K/yr)', 'Low open-source licensing'] },
  e3: { label: 'Detailed TCO Baseline', options: ['$4.8M verified 3-year TCO baseline', '$3.4M verified 3-year EDW baseline (38% savings on cloud lakehouse)', '$555K verified 3-year run cost (100% savable via retirement)'] },
  dr1: { label: 'Customer Data / Sensitivity', options: ['Yes — Regulated Customer & Analytics Data', 'Internal operational telemetry only', 'Historical static archive records'] },
  dr2: { label: 'Data Volume & Velocity', options: ['18 TB storage / 50K events/sec', '4.5 TB relational database', '85 GB static archive'] },
  dr3: { label: 'Compliance Constraints', options: ['SOX, GDPR & Data Residency verified', 'AS9100 / FAA validated configuration freeze', '3-year cold archive retention verified'] },
  ts1: { label: 'Target Cloud / Platform Strategy', options: ['Google Cloud (BigQuery + Cloud Run / GKE)', 'Vendor-Neutral Managed Cloud Platform', 'Decommission & Cold Archive Storage', 'Retain On-Premises at Edge Tier', 'Commercial Enterprise SaaS Platform'] },
  ts2: { label: 'Target Architecture Constraints', options: ['Decoupled storage/compute lakehouse & governed APIs', 'Containerized microservices with managed database', 'Read-only cold Parquet archive; no compute required', 'Lift-and-shift VM image without code rewrite'] },
  ts3: { label: 'Migration Downtime Tolerance', options: ['4-hour weekend cutover window with rollback checkpoint', 'Full downtime allowed after consumer cutover', 'Zero unplanned downtime (active-active canary)'] },
};

export const EnterpriseDnaView: React.FC<EnterpriseDnaViewProps> = ({
  workload,
  onBackToPortfolio,
  onAssess,
  onUpdateWorkloadDna,
  onResetSampleWorkload,
  onAskAgent,
  isProcessing = false,
}) => {
  const [localWorkload, setLocalWorkload] = useState<EnterpriseWorkload>(workload);
  const [viewMode, setViewMode] = useState<'spatial' | 'list'>('spatial');
  const [focusedNode, setFocusedNode] = useState<'hub' | 'capability' | 'ownership' | 'economics' | 'risks' | 'dependencies'>('hub');
  const [showDetailedAttributes, setShowDetailedAttributes] = useState<boolean>(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);

  React.useEffect(() => {
    setLocalWorkload(workload);
    setFocusedNode('hub');
    setEditingFieldId(null);
  }, [workload]);

  const toggleNodeFocus = (node: typeof focusedNode) =>
    setFocusedNode((prev) => (prev === node ? 'hub' : node));

  const nodeClass = (node: Exclude<typeof focusedNode, 'hub'>, tone: 'neutral' | 'risk' = 'neutral') => {
    const isSelected = focusedNode === node;
    const isReceded = focusedNode !== 'hub' && !isSelected;
    return [
      'relative z-10 p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4648D4]',
      isSelected
        ? 'bg-[var(--emos-surface)] border-[#4648D4] ring-2 ring-indigo-500/15 shadow-md scale-[1.01]'
        : tone === 'risk'
        ? 'bg-rose-50/70 dark:bg-rose-500/10 border-rose-200/80 dark:border-rose-500/30 hover:border-rose-300'
        : 'bg-[var(--emos-bg)] border-[var(--emos-border-subtle)] hover:border-[var(--emos-border-strong)]',
      isReceded ? 'opacity-50' : 'opacity-100',
    ].join(' ');
  };

  const stats = calculateDnaCompleteness(localWorkload.dna);
  const readiness = evaluateEvidenceReadiness(localWorkload.dna);
  const derivedRec = deriveEvidenceDrivenRecommendation(localWorkload);

  const commitWorkloadUpdate = (nextDna: EnterpriseWorkload['dna'], nextCrit?: 'High' | 'Medium' | 'Low') => {
    const nextStats = calculateDnaCompleteness(nextDna);
    const updated: EnterpriseWorkload = {
      ...localWorkload,
      businessCriticality: nextCrit || localWorkload.businessCriticality,
      evidenceCompleteness: nextStats.completeness,
      dna: nextDna,
    };
    setLocalWorkload(updated);
    onUpdateWorkloadDna?.(updated);
  };

  // Controlled Demo Action: Load Synthetic Sample Evidence (Vendor-Neutral default; never silently implies external verification)
  const handleVerifyAllCriticalEvidence = (targetPlatform = 'Vendor-Neutral Managed Cloud Platform') => {
    const nextDna = structuredClone(localWorkload.dna);
    const defaults: Record<string, string> = {
      d2: 'Sample interface schemas, owners, and latency SLAs (Demo)',
      e3: '$4.8M sample 3-year TCO baseline (Demo)',
      dr2: '14 TB sample dataset volume and daily ingestion rate (Demo)',
      dr3: 'Sample enterprise compliance, encryption and residency controls (Demo)',
      ts1: targetPlatform,
      ts2: 'Decoupled storage and compute; governed interfaces required (Demo)',
      ts3: '4-hour weekend cutover window with rollback checkpoint (Demo)',
      t2: localWorkload.dna.technology.find((f) => f.id === 't2')?.status === 'known'
        ? localWorkload.dna.technology.find((f) => f.id === 't2')!.value
        : 'PostgreSQL / Relational Content Repository (Demo)',
    };
    Object.values(nextDna).flat().forEach((field) => {
      if (field.status !== 'known' && defaults[field.id]) {
        field.status = 'known';
        field.value = defaults[field.id];
        field.detail = 'Synthetic sample evidence loaded in Demo mode (not independently audited).';
      }
    });
    commitWorkloadUpdate(nextDna);
  };

  // Controlled Action 2: Edit Selected Evidence Field
  const handleUpdateSingleField = (fieldId: string, newValue: string, newStatus: DnaEvidenceStatus = 'known') => {
    const nextDna = structuredClone(localWorkload.dna);
    let nextCrit: 'High' | 'Medium' | 'Low' | undefined;
    Object.values(nextDna).flat().forEach((field) => {
      if (field.id === fieldId) {
        field.value = newValue;
        field.status = newStatus;
        field.detail = newStatus === 'known' ? 'Verified by architect in Enterprise DNA.' : field.detail;
        if (fieldId === 'b2' && (newValue === 'High' || newValue === 'Medium' || newValue === 'Low')) {
          nextCrit = newValue;
        }
      }
    });
    commitWorkloadUpdate(nextDna, nextCrit);
    setEditingFieldId(null);
  };

  const handleReset = () => {
    onResetSampleWorkload?.(localWorkload.id);
    setEditingFieldId(null);
  };

  const getField = (group: keyof EnterpriseWorkload['dna'], id: string) =>
    localWorkload.dna[group].find((f) => f.id === id);

  const lifecycleRiskField = getField('technology', 't4');
  const infraCostField = getField('economics', 'e1');
  const licenseCostField = getField('economics', 'e2');
  const tcoField = getField('economics', 'e3');
  const depDetailField = getField('dependency', 'd2');
  const complianceField = getField('dataAndRisk', 'dr3');
  const driversField = getField('business', 'b3');

  // SVG Radial Ring geometry for Readiness KPI
  const ringRadius = 18;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - stats.completeness / 100);

  const renderStatusBadge = (status: DnaEvidenceStatus) => {
    switch (status) {
      case 'known':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30 text-[10px] font-semibold uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3" />
            <span>VERIFIED</span>
          </span>
        );
      case 'incomplete':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30 text-[10px] font-semibold uppercase tracking-wider">
            <HelpCircle className="w-3 h-3" />
            <span>INCOMPLETE</span>
          </span>
        );
      case 'missing':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30 text-[10px] font-semibold uppercase tracking-wider">
            <AlertCircle className="w-3 h-3" />
            <span>MISSING</span>
          </span>
        );
    }
  };

  const renderField = (field: DnaField) => {
    const isKnown = field.status === 'known';
    const isEditing = editingFieldId === field.id;
    const preset = CONTROLLED_EVIDENCE_PRESETS[field.id];

    return (
      <div
        key={field.id}
        className={`p-3.5 rounded-xl border transition-all ${
          isKnown
            ? 'bg-[var(--emos-surface)] border-[var(--emos-border-subtle)]'
            : 'bg-amber-50/40 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/30'
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <span className="text-xs font-semibold text-[var(--emos-text-muted)]">{field.label}</span>
          <div className="flex items-center gap-1.5">
            {renderStatusBadge(field.status)}
            <button
              type="button"
              onClick={() => setEditingFieldId(isEditing ? null : field.id)}
              aria-label={`Edit evidence for ${field.label}`}
              title={`Edit or verify ${field.label}`}
              className="p-1 rounded-md border border-[var(--emos-border-subtle)] bg-[var(--emos-bg)] hover:border-[#4648D4] text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)] cursor-pointer transition-colors"
            >
              <Edit3 className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="text-sm font-medium text-[var(--emos-text-primary)] break-words">
          {field.value}
        </div>

        {field.detail && (
          <div className="text-[11px] text-[var(--emos-text-secondary)] mt-1.5 leading-relaxed">
            {field.detail}
          </div>
        )}

        {isEditing && preset && (
          <div className="mt-3 pt-2.5 border-t border-[var(--emos-border-subtle)] space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--emos-accent-text)]">
              Select Verified Evidence Value:
            </p>
            <div className="flex flex-col gap-1.5">
              {preset.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleUpdateSingleField(field.id, opt, 'known')}
                  className="text-left px-2.5 py-1.5 rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] hover:border-[#4648D4] text-xs text-[var(--emos-text-primary)] flex items-center justify-between gap-2 cursor-pointer transition-colors"
                >
                  <span className="truncate">{opt}</span>
                  <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const isAttributesVisible = viewMode === 'list' || showDetailedAttributes;

  return (
    <div id="enterprise-dna-view" className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 max-w-[1600px] mx-auto w-full space-y-6 transition-colors">
      {/* Top Bar: Back + Journey Stage + View Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="back-to-portfolio-btn"
            onClick={onBackToPortfolio}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] hover:bg-[var(--emos-surface-hover)] text-xs font-medium text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Portfolio</span>
          </button>
          <JourneyStage stage="Understand" question="What do we know about this workload, and what evidence is missing?" />
        </div>

        {/* Spatial DNA Mesh vs 2D Structured List Toggle */}
        <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-[var(--emos-bg-tertiary)] border border-[var(--emos-border-subtle)] text-xs">
          <button
            type="button"
            onClick={() => setViewMode('spatial')}
            aria-pressed={viewMode === 'spatial'}
            className={`px-2.5 py-1 rounded-md font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
              viewMode === 'spatial'
                ? 'bg-[var(--emos-surface)] text-[var(--emos-accent-text)] shadow-2xs'
                : 'text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)]'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Spatial DNA Graph</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setViewMode('list');
              setShowDetailedAttributes(true);
            }}
            aria-pressed={viewMode === 'list'}
            className={`px-2.5 py-1 rounded-md font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
              viewMode === 'list'
                ? 'bg-[var(--emos-surface)] text-[var(--emos-accent-text)] shadow-2xs'
                : 'text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)]'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>2D Structured View</span>
          </button>
        </div>
      </div>

      {/* Stitch Workload Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
            <span className="uppercase tracking-wider text-[var(--emos-text-muted)]">{localWorkload.type}</span>
            <span className="text-[var(--emos-text-muted)]">·</span>
            <span className="px-2 py-0.5 rounded bg-[var(--emos-accent-subtle)] text-[var(--emos-accent-text)] font-semibold">
              {localWorkload.id}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30 font-semibold">
              {localWorkload.businessCriticality} Criticality
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full border font-bold ${
                readiness.decisionReadiness === 'READY'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30'
                  : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30'
              }`}
            >
              Gate: {readiness.decisionReadiness}
            </span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--emos-text-primary)] tracking-tight flex items-center gap-2">
            <span>{localWorkload.name}</span>
            <CapabilityCue cueId="enterprise-dna" />
          </h1>
        </div>

        {/* State-Aware CTA Hierarchy: Resolve Evidence Gaps is Primary when NEEDS EVIDENCE; Assess for Modernization is Primary when READY */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {readiness.decisionReadiness !== 'READY' ? (
            <>
              <button
                id="resolve-evidence-gaps-primary-btn"
                type="button"
                onClick={() => handleVerifyAllCriticalEvidence('Vendor-Neutral Managed Cloud Platform')}
                className="h-9 px-4 rounded-lg bg-[#4648D4] hover:bg-[#3B3DC2] text-white text-xs font-semibold inline-flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Load Sample Evidence (Demo)</span>
              </button>
              <button
                id="assess-from-dna-btn"
                onClick={() => onAssess(localWorkload)}
                disabled={isProcessing}
                className="h-9 px-3.5 rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] hover:bg-[var(--emos-surface-hover)] text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Assess for Modernization</span>
              </button>
            </>
          ) : (
            <button
              id="assess-from-dna-btn"
              onClick={() => onAssess(localWorkload)}
              disabled={isProcessing}
              className="h-9 px-4 rounded-lg bg-[#4648D4] hover:bg-[#3B3DC2] text-white text-xs font-semibold inline-flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Assess for Modernization</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
          {onAskAgent && (
            <button
              type="button"
              onClick={() => onAskAgent('What evidence is missing?')}
              className="px-2 py-1 text-xs font-medium text-[var(--emos-accent-text)] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>What&apos;s missing? ↗</span>
            </button>
          )}
        </div>
      </div>

      {/* Compact Readiness & Derived Signal Header Strip (eliminates 4 duplicated KPI boxes) */}
      <div className="stitch-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <svg className="w-11 h-11 shrink-0 -rotate-90" viewBox="0 0 44 44" aria-hidden="true">
            <circle cx="22" cy="22" r={ringRadius} fill="none" stroke="var(--emos-border-subtle)" strokeWidth="4" />
            <circle
              cx="22"
              cy="22"
              r={ringRadius}
              fill="none"
              stroke={readiness.decisionReadiness === 'READY' ? '#10B981' : '#4648D4'}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={ringCircumference}
              strokeDashoffset={ringOffset}
              className="transition-all duration-300"
            />
          </svg>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-xl font-bold text-[var(--emos-text-primary)] tabular-nums">
                {stats.completeness}%
              </span>
              <span className="text-xs text-[var(--emos-text-secondary)]">
                Evidence Readiness ({stats.knownCount}/{stats.totalCount} verified)
              </span>
              <CapabilityCue cueId="evidence-readiness" />
            </div>
            <p className="text-xs text-[var(--emos-text-muted)]">
              {readiness.decisionReadiness === 'READY'
                ? '70% threshold and all critical gaps cleared for 6R review.'
                : `${stats.missingCount + stats.incompleteCount} attribute gap(s) remain before READY status.`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs border-t sm:border-t-0 pt-3 sm:pt-0 border-[var(--emos-border-subtle)]">
          <div className="px-3 py-1.5 rounded-lg bg-[var(--emos-bg)] border border-[var(--emos-border-subtle)]">
            <span className="text-[11px] text-[var(--emos-text-muted)] mr-1.5">Derived 6R:</span>
            <strong className="text-[#4648D4] dark:text-[#818CF8]">{derivedRec.recommended6R}</strong>
            <span className="font-mono text-[11px] text-[var(--emos-text-secondary)] ml-1">({derivedRec.confidenceScore}% confidence)</span>
          </div>
          {focusedNode !== 'hub' && (
            <button
              type="button"
              onClick={() => setFocusedNode('hub')}
              className="px-2.5 py-1.5 rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] text-xs font-medium text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)] cursor-pointer"
            >
              Reset Focus
            </button>
          )}
        </div>
      </div>

      {/* DOMINANT VISUAL OBJECT: Connected Spatial Workload DNA Mesh */}
      <section
        aria-label="Spatial Enterprise DNA Relationship Topology"
        className="stitch-card p-5 sm:p-6 space-y-5 relative overflow-hidden"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Dna className="w-4 h-4 text-[#4648D4] dark:text-[#818CF8]" />
            <h2 className="font-display text-sm font-bold text-[var(--emos-text-primary)]">
              Workload DNA Mesh
            </h2>
            <span className="text-xs text-[var(--emos-text-muted)] hidden sm:inline">
              Select any connected node to focus its relationship
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-[var(--emos-text-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4648D4]" /> Central Workload
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Critical Risks &amp; Gaps
            </span>
          </div>
        </div>

        {/* Connected Topology Canvas with Restrained SVG Hairline Connectors */}
        <div className="relative space-y-4">
          <svg
            className="hidden lg:block pointer-events-none absolute inset-0 w-full h-full z-0"
            viewBox="0 0 1000 460"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {/* Top Capability -> Center Hub */}
            <line
              x1="500" y1="84" x2="500" y2="148"
              stroke={focusedNode === 'capability' ? '#4648D4' : 'var(--emos-border-strong)'}
              strokeWidth={focusedNode === 'capability' ? '2.5' : '1.5'}
              strokeDasharray={focusedNode === 'capability' ? undefined : '4 4'}
            />
            {/* Left Ownership -> Center Hub */}
            <line
              x1="245" y1="225" x2="295" y2="225"
              stroke={focusedNode === 'ownership' ? '#4648D4' : 'var(--emos-border-strong)'}
              strokeWidth={focusedNode === 'ownership' ? '2.5' : '1.5'}
            />
            {/* Center Hub -> Right Economics */}
            <line
              x1="705" y1="225" x2="755" y2="225"
              stroke={focusedNode === 'economics' ? '#4648D4' : 'var(--emos-border-strong)'}
              strokeWidth={focusedNode === 'economics' ? '2.5' : '1.5'}
            />
            {/* Center Hub -> Bottom-Left Risks */}
            <line
              x1="430" y1="305" x2="310" y2="355"
              stroke={focusedNode === 'risks' ? '#E11D48' : 'var(--emos-border-strong)'}
              strokeWidth={focusedNode === 'risks' ? '2.5' : '1.5'}
            />
            {/* Center Hub -> Bottom-Right Dependencies */}
            <line
              x1="570" y1="305" x2="690" y2="355"
              stroke={focusedNode === 'dependencies' ? '#4648D4' : 'var(--emos-border-strong)'}
              strokeWidth={focusedNode === 'dependencies' ? '2.5' : '1.5'}
            />
          </svg>

          {/* Top Node: Business Capability */}
          <div className="max-w-xl mx-auto">
            <button
              type="button"
              onClick={() => toggleNodeFocus('capability')}
              aria-pressed={focusedNode === 'capability'}
              className={`w-full flex items-center justify-between gap-3 ${nodeClass('capability')}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-9 h-9 rounded-lg bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--emos-text-muted)] block">
                    Business Capability
                  </span>
                  <p className="font-display text-sm font-bold text-[var(--emos-text-primary)] truncate">
                    {localWorkload.businessCapability}
                  </p>
                  {driversField && (
                    <p className="text-xs text-[var(--emos-text-secondary)] truncate">
                      {driversField.value}
                    </p>
                  )}
                </div>
              </div>
              <ShieldCheck className="w-4 h-4 text-[var(--emos-text-muted)] shrink-0" />
            </button>
          </div>

          {/* Middle Row: Ownership/Domain ↔ Flat Indigo Asset Hub ↔ Economic Burden */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            <button
              type="button"
              onClick={() => toggleNodeFocus('ownership')}
              aria-pressed={focusedNode === 'ownership'}
              className={`lg:col-span-3 space-y-2 ${nodeClass('ownership')}`}
            >
              <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--emos-accent-text)] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>Ownership &amp; Domain</span>
              </span>
              <p className="font-display text-sm font-bold text-[var(--emos-text-primary)]">
                {localWorkload.type} · {localWorkload.businessCriticality}
              </p>
              <p className="text-xs text-[var(--emos-text-secondary)]">{localWorkload.hosting}</p>
              {complianceField && (
                <p className="text-[11px] text-[var(--emos-text-muted)] pt-1.5 border-t border-[var(--emos-border-subtle)]">
                  Compliance: <span className="text-[var(--emos-text-primary)] font-medium">{complianceField.value}</span>
                </p>
              )}
            </button>

            {/* Center: Restrained Solid Indigo Asset Hub (Focal Anchor) */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setFocusedNode('hub')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setFocusedNode('hub');
                }
              }}
              className="relative z-10 lg:col-span-6 p-5 sm:p-6 rounded-xl bg-[#4648D4] text-white shadow-sm space-y-3.5 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="px-2 py-0.5 rounded bg-white/15 text-[11px] font-mono uppercase tracking-wider font-semibold">
                  Central System Object
                </span>
                <span className="px-2 py-0.5 rounded bg-white/15 text-[11px] font-mono font-semibold">
                  {localWorkload.id}
                </span>
              </div>

              <div>
                <h3 className="font-display text-xl sm:text-2xl font-bold tracking-tight">
                  {localWorkload.name}
                </h3>
                <p className="text-xs sm:text-sm text-indigo-100 mt-1">
                  {localWorkload.currentStack} · {localWorkload.hosting}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3 border-t border-white/15 text-xs">
                <div className="p-2 rounded-lg bg-white/10">
                  <span className="text-[11px] text-indigo-100 block">Evidence DNA</span>
                  <strong className="font-mono text-sm">{stats.completeness}% Verified</strong>
                </div>
                <div className="p-2 rounded-lg bg-white/10">
                  <span className="text-[11px] text-indigo-100 block">Derived 6R</span>
                  <strong className="text-sm">{derivedRec.recommended6R}</strong>
                </div>
                <div className="p-2 rounded-lg bg-white/10 col-span-2 sm:col-span-1">
                  <span className="text-[11px] text-indigo-100 block">Lifecycle Risk</span>
                  <strong className="text-xs line-clamp-1">{lifecycleRiskField?.value || 'Monitored'}</strong>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toggleNodeFocus('economics')}
              aria-pressed={focusedNode === 'economics'}
              className={`lg:col-span-3 space-y-2 ${nodeClass('economics')}`}
            >
              <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--emos-accent-text)] flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" />
                <span>Economic Burden</span>
              </span>
              <p className="font-display text-sm font-bold text-[var(--emos-text-primary)]">
                {infraCostField?.value || 'Unverified'}
              </p>
              <p className="text-xs text-[var(--emos-text-secondary)]">
                Licensing: {licenseCostField?.value || 'Unverified'}
              </p>
              <p className="text-[11px] font-mono text-[var(--emos-accent-text)] pt-1.5 border-t border-[var(--emos-border-subtle)]">
                TCO: {tcoField?.value || 'Missing'}
              </p>
            </button>
          </div>

          {/* Bottom Row: Top Critical Risks & Gaps | Top Dependencies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <button
              type="button"
              onClick={() => toggleNodeFocus('risks')}
              aria-pressed={focusedNode === 'risks'}
              className={`space-y-2 ${nodeClass('risks', 'risk')}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 inline-flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Critical Risks &amp; Evidence Gaps</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-500/20 text-[11px] font-semibold text-rose-700 dark:text-rose-300">
                  {derivedRec.criticalGaps.length > 0 ? `${derivedRec.criticalGaps.length} Blocking` : 'Monitored'}
                </span>
              </div>
              <ol className="space-y-1.5 text-xs text-[var(--emos-text-primary)] list-decimal list-inside">
                {(derivedRec.criticalGaps.length > 0
                  ? derivedRec.criticalGaps.map((g) => `Missing critical evidence: ${g}`)
                  : derivedRec.keyRisks
                )
                  .slice(0, 3)
                  .map((item, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {item}
                    </li>
                  ))}
              </ol>
            </button>

            <button
              type="button"
              onClick={() => toggleNodeFocus('dependencies')}
              aria-pressed={focusedNode === 'dependencies'}
              className={`space-y-2 ${nodeClass('dependencies')}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--emos-accent-text)] inline-flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Dependencies &amp; Consumers</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] text-[11px] font-semibold text-[var(--emos-text-secondary)]">
                  Blast Radius
                </span>
              </div>
              <ul className="space-y-1.5 text-xs text-[var(--emos-text-primary)]">
                <li className="leading-relaxed">
                  <strong>Interfaces:</strong> {localWorkload.knownDependencies}
                </li>
                {depDetailField && (
                  <li className="leading-relaxed text-[var(--emos-text-secondary)]">
                    <strong>Verification:</strong> {depDetailField.value}
                    {depDetailField.detail ? ` — ${depDetailField.detail}` : ''}
                  </li>
                )}
              </ul>
            </button>
          </div>
        </div>
      </section>

      {/* Controlled Evidence Verification Toolbar */}
      <section className="stitch-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <p className="text-xs font-semibold text-[var(--emos-text-primary)]">
            Controlled Evidence Verification &amp; Sensitivity
          </p>
          <p className="text-[11px] text-[var(--emos-text-secondary)]">
            Verify missing critical gaps or expand the 18-attribute inspector to test how verified facts update readiness and 6R scoring.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            id="verify-evidence-neutral-btn"
            type="button"
            onClick={() => handleVerifyAllCriticalEvidence('Vendor-Neutral Managed Cloud Platform')}
            className="h-8 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold cursor-pointer transition-colors"
          >
            Load Sample Evidence (Vendor-Neutral Demo)
          </button>
          <button
            id="verify-evidence-gcp-btn"
            type="button"
            onClick={() => handleVerifyAllCriticalEvidence('Google Cloud (BigQuery + Cloud Run / GKE)')}
            className="h-8 px-3 rounded-lg bg-[var(--emos-bg)] hover:bg-[var(--emos-surface-hover)] border border-[var(--emos-border-strong)] text-[var(--emos-text-primary)] text-xs font-semibold cursor-pointer transition-colors"
          >
            Load Sample Evidence (Google Cloud Demo)
          </button>
          <button
            id="reset-sample-dna-btn"
            type="button"
            onClick={handleReset}
            className="h-8 px-3 rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] hover:bg-[var(--emos-surface-hover)] text-[var(--emos-text-secondary)] text-xs font-medium inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Sample</span>
          </button>
        </div>
      </section>

      {/* Progressive Disclosure Accordion: 18 Detailed Enterprise DNA Attributes */}
      <section className="stitch-card overflow-hidden">
        <button
          id="toggle-dna-attributes-btn"
          type="button"
          onClick={() => setShowDetailedAttributes((prev) => !prev)}
          aria-expanded={isAttributesVisible}
          className="w-full px-5 py-4 flex items-center justify-between gap-4 hover:bg-[var(--emos-surface-elevated)] transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-8 h-8 rounded-lg bg-[var(--emos-accent-subtle)] text-[var(--emos-accent-text)] flex items-center justify-center shrink-0">
              <Cpu className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-sm font-bold text-[var(--emos-text-primary)]">
                Inspect All 18 Structured Enterprise DNA Attributes (6 Dimensions)
              </p>
              <p className="text-xs text-[var(--emos-text-secondary)]">
                Progressive 60/90-second forensic evidence view — edit or verify individual attributes inline.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--emos-bg)] border border-[var(--emos-border-subtle)] text-[11px] font-mono text-[var(--emos-text-secondary)]">
              {stats.knownCount}/{stats.totalCount} Verified
            </span>
            <ChevronDown
              className={`w-4 h-4 text-[var(--emos-text-muted)] transition-transform ${
                isAttributesVisible ? 'rotate-180' : ''
              }`}
            />
          </div>
        </button>

        {isAttributesVisible && (
          <div className="p-5 border-t border-[var(--emos-border-subtle)] space-y-6 bg-[var(--emos-bg)]/50">
            {[
              { title: '1. Business DNA', subtitle: 'Capability, Criticality & Modernization Drivers', icon: Briefcase, fields: localWorkload.dna.business, cols: 'lg:grid-cols-3' },
              { title: '2. Technology DNA', subtitle: 'Runtime, Database, Hosting & Lifecycle Risk', icon: Cpu, fields: localWorkload.dna.technology, cols: 'lg:grid-cols-4' },
              { title: '3. Dependency DNA', subtitle: 'Known Integrations & Data Pipelines', icon: Share2, fields: localWorkload.dna.dependency, cols: 'lg:grid-cols-2' },
              { title: '4. Economics DNA', subtitle: 'Infrastructure, Licensing & TCO Baseline', icon: DollarSign, fields: localWorkload.dna.economics, cols: 'lg:grid-cols-3' },
              { title: '5. Data & Risk DNA', subtitle: 'Data Sensitivity, Volume & Regulatory Mandates', icon: ShieldCheck, fields: localWorkload.dna.dataAndRisk, cols: 'lg:grid-cols-3' },
              { title: '6. Target-State DNA', subtitle: 'Cloud Strategy, Architectural Mandates & Downtime', icon: Compass, fields: localWorkload.dna.targetState, cols: 'lg:grid-cols-3' },
            ].map(({ title, subtitle, icon: Icon, fields, cols }) => (
              <div key={title} className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-[var(--emos-border-subtle)]">
                  <Icon className="w-4 h-4 text-[#4648D4] dark:text-[#818CF8]" />
                  <h3 className="text-xs font-bold text-[var(--emos-text-primary)] uppercase tracking-wider">
                    {title}
                  </h3>
                  <span className="text-xs text-[var(--emos-text-muted)] ml-auto hidden sm:inline">
                    {subtitle}
                  </span>
                </div>
                <div className={`grid grid-cols-1 sm:grid-cols-2 ${cols} gap-3`}>
                  {fields.map(renderField)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Bottom Action Footer */}
      <div className="stitch-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="text-xs font-semibold text-[var(--emos-text-primary)]">
            Ready to generate the canonical 6R recommendation?
          </div>
          <div className="text-[11px] text-[var(--emos-text-secondary)]">
            EMOS passes all 18 structured Enterprise DNA attributes ({stats.completeness}% verified) directly into the Modernization Agent reasoning engine.
          </div>
        </div>

        <button
          id="bottom-assess-from-dna-btn"
          onClick={() => onAssess(localWorkload)}
          disabled={isProcessing}
          className="h-9 px-4 rounded-lg bg-[#4648D4] hover:bg-[#3B3DC2] text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50 shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Assess for Modernization</span>
        </button>
      </div>
    </div>
  );
};
