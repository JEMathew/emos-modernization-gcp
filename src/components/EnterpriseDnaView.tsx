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
  ZoomIn,
  ZoomOut,
  Check,
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
  isProcessing = false,
}) => {
  const [localWorkload, setLocalWorkload] = useState<EnterpriseWorkload>(workload);
  const [viewMode, setViewMode] = useState<'list' | 'spatial'>('list');
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [selectedSpatialNode, setSelectedSpatialNode] = useState<string>('center');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [dimensionFilter, setDimensionFilter] = useState<string>('all');

  React.useEffect(() => {
    setLocalWorkload(workload);
  }, [workload]);

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

  // Controlled Action 1: Verify Critical Evidence (e.g. for Replatform / Refactor / General Readiness)
  const handleVerifyAllCriticalEvidence = (targetPlatform = 'Google Cloud (BigQuery + Cloud Run / GKE)') => {
    const nextDna = structuredClone(localWorkload.dna);
    const defaults: Record<string, string> = {
      d2: 'All interface schemas, owners, and latency SLAs verified',
      e3: '$4.8M verified 3-year TCO baseline',
      dr2: '14 TB verified dataset volume and daily ingestion rate',
      dr3: 'Enterprise compliance, encryption and residency controls verified',
      ts1: targetPlatform,
      ts2: 'Decoupled storage and compute; governed interfaces required',
      ts3: '4-hour weekend cutover window with rollback checkpoint',
      t2: localWorkload.dna.technology.find((f) => f.id === 't2')?.status === 'known'
        ? localWorkload.dna.technology.find((f) => f.id === 't2')!.value
        : 'PostgreSQL / Relational Content Repository',
    };
    Object.values(nextDna).flat().forEach((field) => {
      if (field.status !== 'known' && defaults[field.id]) {
        field.status = 'known';
        field.value = defaults[field.id];
        field.detail = 'Verified via Enterprise DNA evidence review.';
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

  const renderStatusBadge = (status: DnaEvidenceStatus) => {
    switch (status) {
      case 'known':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>VERIFIED</span>
          </span>
        );
      case 'incomplete':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[10px] font-semibold uppercase tracking-wider">
            <HelpCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>INCOMPLETE</span>
          </span>
        );
      case 'missing':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-[10px] font-semibold uppercase tracking-wider">
            <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
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
            : 'bg-[var(--emos-surface-elevated)] border-[var(--emos-accent-border)]'
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
              className="p-1 rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-bg-tertiary)] hover:border-[var(--emos-accent)] text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)] cursor-pointer transition-colors"
            >
              <Edit3 className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="text-sm font-medium text-[var(--emos-text-primary)] break-words">
          {field.value}
        </div>

        {field.detail && (
          <div className="text-[11px] text-[var(--emos-text-secondary)] mt-1.5 leading-relaxed font-sans">
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
                  className="text-left px-2.5 py-1.5 rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)] hover:border-[var(--emos-accent)] text-xs text-[var(--emos-text-primary)] flex items-center justify-between gap-2 cursor-pointer transition-colors"
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

  const spatialDimensions = [
    { id: 'business', title: 'Business Capability', icon: Briefcase, fields: localWorkload.dna.business, angle: -90 },
    { id: 'technology', title: 'Technology Stack', icon: Cpu, fields: localWorkload.dna.technology, angle: -30 },
    { id: 'dependency', title: 'Dependencies & Consumers', icon: Share2, fields: localWorkload.dna.dependency, angle: 30 },
    { id: 'economics', title: 'Cost & Economics', icon: DollarSign, fields: localWorkload.dna.economics, angle: 90 },
    { id: 'dataAndRisk', title: 'Data & Risk', icon: ShieldCheck, fields: localWorkload.dna.dataAndRisk, angle: 150 },
    { id: 'targetState', title: 'Target State Strategy', icon: Compass, fields: localWorkload.dna.targetState, angle: -150 },
  ];

  return (
    <div id="enterprise-dna-view" className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-5xl mx-auto w-full transition-colors">
      {/* Navigation & Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            id="back-to-portfolio-btn"
            onClick={onBackToPortfolio}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] hover:bg-[var(--emos-surface-hover)] text-xs font-medium text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)] transition-colors cursor-pointer min-h-[36px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Enterprise Portfolio</span>
          </button>

          {/* 2D List vs Spatial Relationship View Toggle */}
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[var(--emos-bg-tertiary)] border border-[var(--emos-border-subtle)] text-xs">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-pressed={viewMode === 'list'}
              className={`px-3 py-1.5 rounded-lg font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                viewMode === 'list'
                  ? 'bg-[var(--emos-surface)] text-[var(--emos-accent-text)] border border-[var(--emos-border-strong)] shadow-2xs'
                  : 'text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>2D Structured View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('spatial')}
              aria-pressed={viewMode === 'spatial'}
              className={`px-3 py-1.5 rounded-lg font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                viewMode === 'spatial'
                  ? 'bg-[var(--emos-surface)] text-[var(--emos-accent-text)] border border-[var(--emos-border-strong)] shadow-2xs'
                  : 'text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)]'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Spatial DNA Graph</span>
            </button>
          </div>
        </div>

        <JourneyStage stage="Understand" question="What do we know about this workload, and what evidence is missing?" />

        {/* Workload Hero Banner */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6 shadow-xs">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[var(--emos-bg-tertiary)] border border-[var(--emos-border-subtle)] text-[10px] font-mono text-[var(--emos-text-secondary)]">
                {localWorkload.type}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-[var(--emos-bg-tertiary)] border border-[var(--emos-border-subtle)] text-[10px] font-mono text-[var(--emos-text-secondary)]">
                {localWorkload.businessCriticality} Criticality
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-[var(--emos-bg-tertiary)] border border-[var(--emos-border-subtle)] text-[10px] font-mono text-[var(--emos-text-secondary)]">
                {localWorkload.hosting}
              </span>
              <span className={`px-2.5 py-0.5 rounded-md border text-[10px] font-mono font-bold ${
                readiness.decisionReadiness === 'READY'
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
              }`}>
                Gate: {readiness.decisionReadiness}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif text-[var(--emos-text-primary)] tracking-tight flex items-center gap-2">
              <Dna className="w-6 h-6 text-[var(--emos-accent)]" />
              <span>{localWorkload.name} — Enterprise DNA</span>
              <CapabilityCue cueId="enterprise-dna" />
            </h1>

            <p className="text-xs sm:text-sm text-[var(--emos-text-secondary)] leading-relaxed">
              Structured architectural evidence baseline representing verified enterprise attributes and high-impact missing evidence gaps. Current signal: <strong className="text-[var(--emos-text-primary)]">{derivedRec.plainEnglish} ({derivedRec.recommended6R})</strong>.
            </p>
          </div>

          {/* Evidence Completeness Score Card */}
          <div className="p-4 rounded-xl bg-[var(--emos-bg-tertiary)] border border-[var(--emos-border-subtle)] min-w-[250px] space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-[var(--emos-text-muted)] font-semibold inline-flex items-center gap-1">
                <span>Evidence Completeness</span>
                <CapabilityCue cueId="evidence-readiness" />
              </span>
              <span className="font-mono text-lg font-bold text-[var(--emos-accent-text)]">
                {stats.completeness}%
              </span>
            </div>

            {/* Visual Bar */}
            <div className="w-full h-2 bg-[var(--emos-surface)] rounded-full overflow-hidden border border-[var(--emos-border-subtle)]">
              <div
                className="h-full bg-gradient-to-r from-[#A88554] to-[#E5C492] rounded-full transition-all duration-500"
                style={{ width: `${stats.completeness}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">{stats.knownCount} Verified Known</span>
              <span className="text-rose-600 dark:text-rose-400 font-medium">{stats.missingCount + stats.incompleteCount} Missing/Gaps</span>
            </div>

            <button
              id="assess-from-dna-btn"
              onClick={() => onAssess(localWorkload)}
              disabled={isProcessing}
              className="w-full py-2.5 px-4 rounded-xl bg-[#A88554] hover:bg-[#BCA075] dark:hover:bg-[#E5C492] text-black text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50 active:scale-98 min-h-[40px]"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span>Assess for Modernization</span>
              <ArrowRight className="w-3.5 h-3.5 text-black" />
            </button>
          </div>
        </div>

        {/* Controlled Evidence Verification & Editing Bar (Section F) */}
        <div className="p-4 rounded-2xl bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-[var(--emos-text-primary)]">
              Controlled Evidence Verification & Sensitivity
            </p>
            <p className="text-[11px] text-[var(--emos-text-secondary)]">
              Verify missing critical gaps or click any attribute&apos;s edit icon to see how verified facts update readiness, confidence, and 6R recommendations.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              id="verify-evidence-gcp-btn"
              type="button"
              onClick={() => handleVerifyAllCriticalEvidence('Google Cloud (BigQuery + Cloud Run / GKE)')}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold cursor-pointer transition-colors min-h-[34px]"
            >
              Verify Evidence (Google Cloud Target)
            </button>
            <button
              id="verify-evidence-neutral-btn"
              type="button"
              onClick={() => handleVerifyAllCriticalEvidence('Vendor-Neutral Managed Cloud Platform')}
              className="px-3 py-1.5 rounded-xl bg-[var(--emos-bg-tertiary)] hover:bg-[var(--emos-surface-hover)] border border-[var(--emos-border-strong)] text-[var(--emos-text-primary)] text-xs font-semibold cursor-pointer transition-colors min-h-[34px]"
            >
              Verify Evidence (Vendor Neutral)
            </button>
            <button
              id="reset-sample-dna-btn"
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] hover:bg-[var(--emos-surface-hover)] text-[var(--emos-text-secondary)] text-xs font-medium inline-flex items-center gap-1 cursor-pointer transition-colors min-h-[34px]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Sample</span>
            </button>
          </div>
        </div>
      </div>

      {/* Spatial Enterprise DNA Relationship Topology View (Section N1) */}
      {viewMode === 'spatial' && (
        <section
          aria-label="Spatial Enterprise DNA Relationship Topology"
          className="rounded-3xl border border-[var(--emos-border-strong)] bg-[var(--emos-bg-secondary)] p-5 sm:p-6 space-y-5 shadow-lg"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--emos-border-subtle)] pb-4">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--emos-accent-text)] font-bold">
                Spatial Relationship Graph
              </p>
              <h2 className="font-serif text-xl font-semibold text-[var(--emos-text-primary)]">
                {localWorkload.name} — Central Workload & Architectural Dependencies
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Filter spatial DNA dimensions"
                value={dimensionFilter}
                onChange={(e) => setDimensionFilter(e.target.value)}
                className="rounded-xl border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] px-2.5 py-1.5 text-xs text-[var(--emos-text-primary)]"
              >
                <option value="all">All 6 Dimensions</option>
                {spatialDimensions.map((d) => (
                  <option key={d.id} value={d.id}>{d.title}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.85, Number((z - 0.1).toFixed(2))))}
                aria-label="Zoom out spatial graph"
                className="p-1.5 rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] text-[var(--emos-text-secondary)] cursor-pointer"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(1.2, Number((z + 0.1).toFixed(2))))}
                aria-label="Zoom in spatial graph"
                className="p-1.5 rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] text-[var(--emos-text-secondary)] cursor-pointer"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedSpatialNode('center');
                  setDimensionFilter('all');
                  setZoomLevel(1);
                }}
                className="px-2.5 py-1.5 rounded-lg border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] text-xs text-[var(--emos-text-secondary)] cursor-pointer"
              >
                Reset Focus
              </button>
            </div>
          </div>

          {/* Interactive Spatial Canvas */}
          <div
            className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center transition-transform"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center top' }}
          >
            {/* Left Dimension Nodes */}
            <div className="space-y-3">
              {spatialDimensions
                .slice(0, 3)
                .filter((d) => dimensionFilter === 'all' || dimensionFilter === d.id)
                .map((dim) => {
                  const Icon = dim.icon;
                  const known = dim.fields.filter((f) => f.status === 'known').length;
                  const isFocused = selectedSpatialNode === 'center' || selectedSpatialNode === dim.id;
                  return (
                    <div
                      key={dim.id}
                      onClick={() => setSelectedSpatialNode(selectedSpatialNode === dim.id ? 'center' : dim.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedSpatialNode(selectedSpatialNode === dim.id ? 'center' : dim.id);
                        }
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        selectedSpatialNode === dim.id
                          ? 'bg-[var(--emos-surface-elevated)] border-[var(--emos-accent)] ring-2 ring-[var(--emos-accent-border)] shadow-lg'
                          : isFocused
                          ? 'bg-[var(--emos-surface)] border-[var(--emos-border-subtle)] hover:border-[var(--emos-border-strong)]'
                          : 'bg-[var(--emos-surface)]/45 border-[var(--emos-border-subtle)] opacity-45'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-[var(--emos-accent)]" />
                          <span className="text-xs font-bold">{dim.title}</span>
                        </div>
                        <span className="font-mono text-[11px] text-[var(--emos-accent-text)]">
                          {known}/{dim.fields.length} verified
                        </span>
                      </div>
                      <ul className="mt-2.5 space-y-1 text-[11px] text-[var(--emos-text-secondary)]">
                        {dim.fields.map((f) => (
                          <li key={f.id} className="flex items-center justify-between gap-2">
                            <span className="truncate">{f.label}:</span>
                            <span className={`font-medium truncate max-w-[150px] ${f.status === 'known' ? 'text-[var(--emos-text-primary)]' : 'text-rose-500'}`}>
                              {f.value}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
            </div>

            {/* Center Hero System Node */}
            <div className="flex flex-col items-center justify-center py-4">
              <div
                onClick={() => setSelectedSpatialNode('center')}
                role="button"
                tabIndex={0}
                className="w-full max-w-xs rounded-3xl border-2 border-[var(--emos-accent)] bg-gradient-to-b from-[var(--emos-surface-elevated)] to-[var(--emos-surface)] p-6 text-center shadow-2xl space-y-3 cursor-pointer"
              >
                <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-[#A88554] to-[#E5C492] text-black flex items-center justify-center shadow-md">
                  <Dna className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--emos-accent-text)]">
                    Central System Object
                  </span>
                  <h3 className="text-lg font-serif font-bold text-[var(--emos-text-primary)] mt-0.5">
                    {localWorkload.name}
                  </h3>
                  <p className="text-xs text-[var(--emos-text-secondary)] mt-1">
                    {localWorkload.currentStack} · {localWorkload.hosting}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--emos-border-subtle)] text-xs">
                  <div className="p-2 rounded-xl bg-[var(--emos-bg-tertiary)]">
                    <span className="text-[10px] text-[var(--emos-text-muted)] block">Completeness</span>
                    <strong className="font-mono text-sm text-[var(--emos-accent-text)]">{stats.completeness}%</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-[var(--emos-bg-tertiary)]">
                    <span className="text-[10px] text-[var(--emos-text-muted)] block">Derived 6R</span>
                    <strong className="text-sm text-[var(--emos-text-primary)]">{derivedRec.recommended6R}</strong>
                  </div>
                </div>
                <p className="text-[11px] font-semibold text-[var(--emos-accent-text)]">
                  {derivedRec.plainEnglish}
                </p>
              </div>
            </div>

            {/* Right Dimension Nodes */}
            <div className="space-y-3">
              {spatialDimensions
                .slice(3, 6)
                .filter((d) => dimensionFilter === 'all' || dimensionFilter === d.id)
                .map((dim) => {
                  const Icon = dim.icon;
                  const known = dim.fields.filter((f) => f.status === 'known').length;
                  const isFocused = selectedSpatialNode === 'center' || selectedSpatialNode === dim.id;
                  return (
                    <div
                      key={dim.id}
                      onClick={() => setSelectedSpatialNode(selectedSpatialNode === dim.id ? 'center' : dim.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedSpatialNode(selectedSpatialNode === dim.id ? 'center' : dim.id);
                        }
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        selectedSpatialNode === dim.id
                          ? 'bg-[var(--emos-surface-elevated)] border-[var(--emos-accent)] ring-2 ring-[var(--emos-accent-border)] shadow-lg'
                          : isFocused
                          ? 'bg-[var(--emos-surface)] border-[var(--emos-border-subtle)] hover:border-[var(--emos-border-strong)]'
                          : 'bg-[var(--emos-surface)]/45 border-[var(--emos-border-subtle)] opacity-45'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-[var(--emos-accent)]" />
                          <span className="text-xs font-bold">{dim.title}</span>
                        </div>
                        <span className="font-mono text-[11px] text-[var(--emos-accent-text)]">
                          {known}/{dim.fields.length} verified
                        </span>
                      </div>
                      <ul className="mt-2.5 space-y-1 text-[11px] text-[var(--emos-text-secondary)]">
                        {dim.fields.map((f) => (
                          <li key={f.id} className="flex items-center justify-between gap-2">
                            <span className="truncate">{f.label}:</span>
                            <span className={`font-medium truncate max-w-[150px] ${f.status === 'known' ? 'text-[var(--emos-text-primary)]' : 'text-rose-500'}`}>
                              {f.value}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
            </div>
          </div>
        </section>
      )}

      {/* Structured DNA Sections (6 Sections - Always available in 2D list or below spatial view) */}
      <div className="space-y-6 sm:space-y-8">
        {/* 1. Business DNA */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--emos-border-subtle)]">
            <Briefcase className="w-4 h-4 text-[var(--emos-accent)]" />
            <h2 className="text-sm font-semibold text-[var(--emos-text-primary)] uppercase tracking-wider">
              1. Business DNA
            </h2>
            <span className="text-xs text-[var(--emos-text-muted)] ml-auto hidden sm:inline">Capability, Criticality & Modernization Drivers</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {localWorkload.dna.business.map(renderField)}
          </div>
        </section>

        {/* 2. Technology DNA */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--emos-border-subtle)]">
            <Cpu className="w-4 h-4 text-[var(--emos-accent)]" />
            <h2 className="text-sm font-semibold text-[var(--emos-text-primary)] uppercase tracking-wider">
              2. Technology DNA
            </h2>
            <span className="text-xs text-[var(--emos-text-muted)] ml-auto hidden sm:inline">Runtime, Database, Hosting & Lifecycle Risk</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {localWorkload.dna.technology.map(renderField)}
          </div>
        </section>

        {/* 3. Dependency DNA */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--emos-border-subtle)]">
            <Share2 className="w-4 h-4 text-[var(--emos-accent)]" />
            <h2 className="text-sm font-semibold text-[var(--emos-text-primary)] uppercase tracking-wider">
              3. Dependency DNA
            </h2>
            <span className="text-xs text-[var(--emos-text-muted)] ml-auto hidden sm:inline">Known Integrations & Data Pipelines</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {localWorkload.dna.dependency.map(renderField)}
          </div>
        </section>

        {/* 4. Economics DNA */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--emos-border-subtle)]">
            <DollarSign className="w-4 h-4 text-[var(--emos-accent)]" />
            <h2 className="text-sm font-semibold text-[var(--emos-text-primary)] uppercase tracking-wider">
              4. Economics DNA
            </h2>
            <span className="text-xs text-[var(--emos-text-muted)] ml-auto hidden sm:inline">Infrastructure, Licensing & TCO Baseline</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {localWorkload.dna.economics.map(renderField)}
          </div>
        </section>

        {/* 5. Data & Risk DNA */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--emos-border-subtle)]">
            <ShieldCheck className="w-4 h-4 text-[var(--emos-accent)]" />
            <h2 className="text-sm font-semibold text-[var(--emos-text-primary)] uppercase tracking-wider">
              5. Data & Risk DNA
            </h2>
            <span className="text-xs text-[var(--emos-text-muted)] ml-auto hidden sm:inline">Data Sensitivity, Volume & Regulatory Mandates</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {localWorkload.dna.dataAndRisk.map(renderField)}
          </div>
        </section>

        {/* 6. Target-State DNA */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--emos-border-subtle)]">
            <Compass className="w-4 h-4 text-[var(--emos-accent)]" />
            <h2 className="text-sm font-semibold text-[var(--emos-text-primary)] uppercase tracking-wider">
              6. Target-State DNA
            </h2>
            <span className="text-xs text-[var(--emos-text-muted)] ml-auto hidden sm:inline">Cloud Strategy, Architectural Mandates & Downtime</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {localWorkload.dna.targetState.map(renderField)}
          </div>
        </section>
      </div>

      {/* Bottom Action Footer */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-[var(--emos-text-primary)]">
            Ready to generate the canonical 6R recommendation?
          </div>
          <div className="text-[11px] text-[var(--emos-text-secondary)]">
            EMOS will pass all 18 structured Enterprise DNA attributes ({stats.completeness}% verified) directly into the Modernization Agent reasoning engine.
          </div>
        </div>

        <button
          id="bottom-assess-from-dna-btn"
          onClick={() => onAssess(localWorkload)}
          disabled={isProcessing}
          className="py-2.5 px-5 rounded-xl bg-[#A88554] hover:bg-[#BCA075] dark:hover:bg-[#E5C492] text-black text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50 shrink-0 min-h-[38px]"
        >
          <Sparkles className="w-4 h-4 text-black" />
          <span>Assess for Modernization</span>
        </button>
      </div>
    </div>
  );
};
