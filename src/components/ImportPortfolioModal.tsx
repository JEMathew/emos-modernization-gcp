import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Download,
  X,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import type { ImportValidationResult, EnterpriseWorkload } from '../types';
import { MAX_FILE_SIZE_LABEL, MAX_IMPORT_WORKLOADS, parseAndValidatePortfolioFile } from '../utils/portfolioImporter';
import { SAMPLE_DATASETS, type SampleCsvDataset } from '../data/sampleCsvs';

interface ImportPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (workloads: EnterpriseWorkload[]) => Promise<void>;
  userId: string;
}

export const ImportPortfolioModal: React.FC<ImportPortfolioModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  userId,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'samples'>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const resetState = () => {
    setErrorMessage(null);
    setValidationResult(null);
    setIsParsing(false);
    setIsSubmitting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileProcess = async (file: File) => {
    setErrorMessage(null);
    setValidationResult(null);
    setIsParsing(true);

    try {
      const result = await parseAndValidatePortfolioFile(file, userId);
      setValidationResult(result);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to parse and validate file.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleConfirmImport = async () => {
    if (!validationResult || validationResult.validRecords.length === 0) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await onImportSuccess(validationResult.validRecords);
      handleClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save imported workloads.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadSample = (dataset: SampleCsvDataset) => {
    const blob = new Blob([dataset.csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', dataset.filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[var(--emos-surface-modal)] border border-[var(--emos-border-subtle)] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-[var(--emos-border-subtle)] flex items-center justify-between bg-[var(--emos-bg-secondary)]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--emos-accent-subtle)] border border-[var(--emos-accent-border)] flex items-center justify-center text-[var(--emos-accent)]">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-[var(--emos-text-primary)] tracking-wide flex items-center gap-2">
                Import Enterprise Portfolio
                <span className="text-[11px] font-mono font-normal uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--emos-bg-tertiary)] text-[var(--emos-accent-text)] border border-[var(--emos-border-subtle)]">
                  CSV / JSON
                </span>
              </h2>
              <p className="text-xs text-[var(--emos-text-secondary)]">
                Bring your own enterprise workloads to generate structured Enterprise DNA and run 6R modernization assessments.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-[var(--emos-text-muted)] hover:text-[var(--emos-text-primary)] p-2 rounded-lg hover:bg-[var(--emos-surface-hover)] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-4 sm:px-6 border-b border-[var(--emos-border-subtle)] bg-[var(--emos-bg-tertiary)] text-xs font-medium overflow-x-auto">
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-3 sm:px-4 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'upload'
                ? 'border-[var(--emos-accent)] text-[var(--emos-text-primary)] font-semibold'
                : 'border-transparent text-[var(--emos-text-muted)] hover:text-[var(--emos-text-secondary)]'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Upload & Validate Portfolio
          </button>
          <button
            onClick={() => setActiveTab('samples')}
            className={`py-3 px-3 sm:px-4 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'samples'
                ? 'border-[var(--emos-accent)] text-[var(--emos-text-primary)] font-semibold'
                : 'border-transparent text-[var(--emos-text-muted)] hover:text-[var(--emos-text-secondary)]'
            }`}
          >
            <Download className="w-4 h-4" />
            Download Sample Datasets (4 Archetypes)
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6">
          {activeTab === 'upload' && (
            <>
              {/* File Dropzone */}
              {!validationResult && (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer ${
                    dragOver
                      ? 'border-[var(--emos-accent)] bg-[var(--emos-accent-subtle)]'
                      : 'border-[var(--emos-border-subtle)] hover:border-[var(--emos-border-strong)] bg-[var(--emos-surface)]'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv, .json, text/csv, application/json"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <div className="w-12 h-12 mx-auto rounded-full bg-[var(--emos-bg-tertiary)] border border-[var(--emos-border-subtle)] flex items-center justify-center text-[var(--emos-accent)] mb-3">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-[var(--emos-text-primary)] mb-1">
                    Click to browse or drag & drop portfolio file
                  </h3>
                  <p className="text-xs text-[var(--emos-text-secondary)] mb-4">
                    Supports <span className="text-[var(--emos-accent-text)] font-medium">.csv</span> and{' '}
                    <span className="text-[var(--emos-accent-text)] font-medium">.json</span> files up to {MAX_FILE_SIZE_LABEL} and {MAX_IMPORT_WORKLOADS} workloads. Files exceeding either limit are rejected.
                  </p>
                  <div className="inline-flex items-center gap-2 text-[11px] text-[var(--emos-text-muted)] bg-[var(--emos-bg-tertiary)] px-3 py-1.5 rounded-full border border-[var(--emos-border-subtle)]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    Formula injection protection & input sanitization enforced
                  </div>
                </div>
              )}

              {/* Parsing Indicator */}
              {isParsing && (
                <div className="p-8 text-center bg-[var(--emos-surface)] rounded-xl border border-[var(--emos-border-subtle)]">
                  <div className="w-8 h-8 border-2 border-[var(--emos-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-[var(--emos-text-primary)] font-medium">Validating file & calculating Enterprise DNA...</p>
                  <p className="text-xs text-[var(--emos-text-muted)] mt-1">Checking required headers, unique keys, and evidence gaps</p>
                </div>
              )}

              {/* Error Banner */}
              {errorMessage && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-3">
                  <XCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
                  <div>
                    <div className="font-semibold text-rose-800 dark:text-rose-200">Validation Error</div>
                    <div className="mt-1">{errorMessage}</div>
                  </div>
                </div>
              )}

              {/* Validation Result Preview */}
              {validationResult && (
                <div className="space-y-5">
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 bg-[var(--emos-surface)] rounded-xl border border-[var(--emos-border-subtle)]">
                      <div className="text-[11px] text-[var(--emos-text-muted)] uppercase font-mono tracking-wider">File Name</div>
                      <div className="text-xs font-semibold text-[var(--emos-text-primary)] mt-1 truncate" title={validationResult.fileName}>
                        {validationResult.fileName}
                      </div>
                    </div>

                    <div className="p-3.5 bg-[var(--emos-surface)] rounded-xl border border-[var(--emos-border-subtle)]">
                      <div className="text-[11px] text-[var(--emos-text-muted)] uppercase font-mono tracking-wider">Valid Workloads</div>
                      <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        {validationResult.validRecords.length}
                      </div>
                    </div>

                    <div className="p-3.5 bg-[var(--emos-surface)] rounded-xl border border-[var(--emos-border-subtle)]">
                      <div className="text-[11px] text-[var(--emos-text-muted)] uppercase font-mono tracking-wider">Invalid Rows</div>
                      <div className={`text-lg font-bold mt-0.5 flex items-center gap-1.5 ${
                        validationResult.invalidRecords.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-[var(--emos-text-muted)]'
                      }`}>
                        {validationResult.invalidRecords.length > 0 ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-[var(--emos-text-muted)]" />
                        )}
                        {validationResult.invalidRecords.length}
                      </div>
                    </div>

                    <div className="p-3.5 bg-[var(--emos-surface)] rounded-xl border border-[var(--emos-border-subtle)]">
                      <div className="text-[11px] text-[var(--emos-text-muted)] uppercase font-mono tracking-wider">Evidence Gaps</div>
                      <div className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        {validationResult.totalEvidenceGaps}
                      </div>
                    </div>
                  </div>

                  {/* Warnings if any */}
                  {validationResult.warnings.length > 0 && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                      <span>{validationResult.warnings.join(' ')}</span>
                    </div>
                  )}

                  {/* Invalid rows detail */}
                  {validationResult.invalidRecords.length > 0 && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-2">
                      <div className="text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-rose-500" />
                        Invalid Rows Identified ({validationResult.invalidRecords.length})
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-1 text-[11px] text-rose-800 dark:text-rose-200">
                        {validationResult.invalidRecords.map((inv, idx) => (
                          <div key={idx} className="bg-[var(--emos-surface)] p-2 rounded-lg border border-rose-500/20">
                            <span className="font-mono text-rose-600 dark:text-rose-400">Row {inv.rowNumber}:</span>{' '}
                            {inv.errors.join('; ')}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Workload Preview Table */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[var(--emos-text-primary)]">Workload Preview & DNA Extraction</span>
                      <button
                        onClick={resetState}
                        className="text-[var(--emos-accent)] hover:underline text-[11px] cursor-pointer"
                      >
                        Upload Different File
                      </button>
                    </div>

                    <div className="border border-[var(--emos-border-subtle)] rounded-xl overflow-x-auto max-h-64">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-[var(--emos-bg-tertiary)] text-[var(--emos-text-muted)] font-mono text-[11px] border-b border-[var(--emos-border-subtle)] sticky top-0">
                          <tr>
                            <th className="p-2.5">Workload ID</th>
                            <th className="p-2.5">Name</th>
                            <th className="p-2.5">Type</th>
                            <th className="p-2.5">Criticality</th>
                            <th className="p-2.5">Stack</th>
                            <th className="p-2.5">Hosting</th>
                            <th className="p-2.5 text-right">DNA Completeness</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--emos-border-subtle)] bg-[var(--emos-surface)]">
                          {validationResult.validRecords.map((w) => (
                            <tr key={w.id} className="hover:bg-[var(--emos-surface-hover)] transition-colors">
                              <td className="p-2.5 font-mono text-[var(--emos-accent-text)] font-semibold">{w.id}</td>
                              <td className="p-2.5 font-medium text-[var(--emos-text-primary)]">{w.name}</td>
                              <td className="p-2.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                                  w.type === 'Data Platform'
                                    ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                                    : 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/30'
                                }`}>
                                  {w.type}
                                </span>
                              </td>
                              <td className="p-2.5">
                                <span className={`text-[11px] ${
                                  w.businessCriticality === 'High'
                                    ? 'text-rose-600 dark:text-rose-400 font-semibold'
                                    : w.businessCriticality === 'Medium'
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-[var(--emos-text-muted)]'
                                }`}>
                                  {w.businessCriticality}
                                </span>
                              </td>
                              <td className="p-2.5 text-[var(--emos-text-secondary)] max-w-[140px] truncate" title={w.currentStack}>
                                {w.currentStack}
                              </td>
                              <td className="p-2.5 text-[var(--emos-text-muted)] max-w-[120px] truncate" title={w.hosting}>
                                {w.hosting}
                              </td>
                              <td className="p-2.5 text-right">
                                <span className="font-mono font-semibold text-[var(--emos-accent-text)]">
                                  {w.evidenceCompleteness}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'samples' && (
            <div className="space-y-4">
              <div className="bg-[var(--emos-surface)] p-4 rounded-xl border border-[var(--emos-border-subtle)]">
                <h3 className="text-sm font-semibold text-[var(--emos-text-primary)] mb-1">
                  Ready-to-Use Enterprise Portfolio Datasets
                </h3>
                <p className="text-xs text-[var(--emos-text-secondary)]">
                  Each sample dataset is a fictional enterprise portfolio tailored to an industry archetype.
                  Collectively, they contain candidates for all 6 canonical 6R dispositions (Retain, Retire, Rehost, Replatform, Refactor, Repurchase).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {SAMPLE_DATASETS.map((ds) => (
                  <div
                    key={ds.id}
                    className="p-4 bg-[var(--emos-surface)] border border-[var(--emos-border-subtle)] hover:border-[var(--emos-border-strong)] rounded-xl flex flex-col justify-between transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--emos-accent-text)] bg-[var(--emos-accent-subtle)] px-2 py-0.5 rounded border border-[var(--emos-accent-border)]">
                          {ds.industry}
                        </span>
                        <span className="text-xs text-[var(--emos-text-muted)] font-mono">
                          {ds.workloadCount} Workloads
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-[var(--emos-text-primary)] mb-1">{ds.title}</h4>
                      <p className="text-xs text-[var(--emos-text-secondary)] leading-relaxed mb-4">{ds.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[var(--emos-border-subtle)]">
                      <span className="text-[11px] font-mono text-[var(--emos-text-muted)]">{ds.filename}</span>
                      <button
                        onClick={() => handleDownloadSample(ds)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--emos-surface-elevated)] hover:bg-[var(--emos-surface-hover)] text-[var(--emos-text-primary)] text-xs font-medium transition-colors border border-[var(--emos-border-subtle)] cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-[var(--emos-accent)]" />
                        Download CSV
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Guidance note */}
              <div className="p-3.5 bg-[var(--emos-surface)] rounded-xl border border-[var(--emos-border-subtle)] text-xs text-[var(--emos-text-secondary)] flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-[var(--emos-accent)] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[var(--emos-text-primary)] font-medium">Evaluation Metadata Note:</span> The sample CSVs include{' '}
                  <code className="text-[var(--emos-accent-text)] font-mono">expected_6r</code> and{' '}
                  <code className="text-[var(--emos-accent-text)] font-mono">expected_reason</code> columns for reference and evaluation.
                  In accordance with strict neutrality and decision fidelity, these fields are{' '}
                  <span className="text-[var(--emos-text-primary)] font-medium">never</span> passed to Gemini or included in the Enterprise DNA assessment payload.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-6 py-4 border-t border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)] flex items-center justify-between">
          <div className="text-xs text-[var(--emos-text-secondary)]">
            {validationResult ? (
              <span>
                Ready to import{' '}
                <strong className="text-[var(--emos-text-primary)]">{validationResult.validRecords.length}</strong> validated workloads.
              </span>
            ) : (
              <span>Upload a CSV or JSON file to preview workloads.</span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)] hover:bg-[var(--emos-surface-hover)] transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {validationResult && validationResult.validRecords.length > 0 && (
              <button
                onClick={handleConfirmImport}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#A88554] hover:bg-[#BCA075] dark:hover:bg-[#E5C492] text-black text-xs font-semibold shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Saving to Portfolio...
                  </>
                ) : (
                  <>
                    Import Portfolio ({validationResult.validRecords.length})
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
