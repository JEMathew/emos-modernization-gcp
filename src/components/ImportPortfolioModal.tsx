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
  Database,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileCode,
} from 'lucide-react';
import type { ImportValidationResult, EnterpriseWorkload } from '../types';
import { parseAndValidatePortfolioFile } from '../utils/portfolioImporter';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#121212] border border-[#262626] rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#222] flex items-center justify-between bg-[#161616]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-[#A88554]/10 border border-[#A88554]/30 flex items-center justify-center text-[#A88554]">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white tracking-wide flex items-center gap-2">
                Import Enterprise Portfolio
                <span className="text-[11px] font-mono font-normal uppercase tracking-wider px-2 py-0.5 rounded bg-[#222] text-[#A88554] border border-[#333]">
                  CSV / JSON
                </span>
              </h2>
              <p className="text-xs text-[#888]">
                Bring your own enterprise workloads to generate structured Enterprise DNA and run 6R modernization assessments.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-[#666] hover:text-white p-2 rounded-lg hover:bg-[#222] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-6 border-b border-[#222] bg-[#141414] text-xs font-medium">
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'border-[#A88554] text-white font-semibold'
                : 'border-transparent text-[#777] hover:text-[#bbb]'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Upload & Validate Portfolio
          </button>
          <button
            onClick={() => setActiveTab('samples')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'samples'
                ? 'border-[#A88554] text-white font-semibold'
                : 'border-transparent text-[#777] hover:text-[#bbb]'
            }`}
          >
            <Download className="w-4 h-4" />
            Download Sample Datasets (4 Archetypes)
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                    dragOver
                      ? 'border-[#A88554] bg-[#A88554]/5'
                      : 'border-[#333] hover:border-[#555] bg-[#161616]/50'
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
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#222] border border-[#333] flex items-center justify-center text-[#A88554] mb-3">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">
                    Click to browse or drag & drop portfolio file
                  </h3>
                  <p className="text-xs text-[#777] mb-4">
                    Supports <span className="text-[#A88554] font-medium">.csv</span> and{' '}
                    <span className="text-[#A88554] font-medium">.json</span> files up to 2MB (max 50 workloads)
                  </p>
                  <div className="inline-flex items-center gap-2 text-[11px] text-[#555] bg-[#1a1a1a] px-3 py-1.5 rounded-full border border-[#2a2a2a]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
                    Formula injection protection & input sanitization enforced
                  </div>
                </div>
              )}

              {/* Parsing Indicator */}
              {isParsing && (
                <div className="p-8 text-center bg-[#161616] rounded-xl border border-[#262626]">
                  <div className="w-8 h-8 border-2 border-[#A88554] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-white font-medium">Validating file & calculating Enterprise DNA...</p>
                  <p className="text-xs text-[#777] mt-1">Checking required headers, unique keys, and evidence gaps</p>
                </div>
              )}

              {/* Error Banner */}
              {errorMessage && (
                <div className="p-4 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-start gap-3">
                  <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
                  <div>
                    <div className="font-semibold text-red-200">Validation Error</div>
                    <div className="mt-1">{errorMessage}</div>
                  </div>
                </div>
              )}

              {/* Validation Result Preview */}
              {validationResult && (
                <div className="space-y-5">
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 bg-[#171717] rounded-lg border border-[#262626]">
                      <div className="text-[11px] text-[#777] uppercase font-mono tracking-wider">File Name</div>
                      <div className="text-xs font-semibold text-white mt-1 truncate" title={validationResult.fileName}>
                        {validationResult.fileName}
                      </div>
                    </div>

                    <div className="p-3.5 bg-[#171717] rounded-lg border border-[#262626]">
                      <div className="text-[11px] text-[#777] uppercase font-mono tracking-wider">Valid Workloads</div>
                      <div className="text-lg font-bold text-[#22C55E] mt-0.5 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        {validationResult.validRecords.length}
                      </div>
                    </div>

                    <div className="p-3.5 bg-[#171717] rounded-lg border border-[#262626]">
                      <div className="text-[11px] text-[#777] uppercase font-mono tracking-wider">Invalid Rows</div>
                      <div className={`text-lg font-bold mt-0.5 flex items-center gap-1.5 ${
                        validationResult.invalidRecords.length > 0 ? 'text-red-400' : 'text-[#777]'
                      }`}>
                        {validationResult.invalidRecords.length > 0 ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-[#777]" />
                        )}
                        {validationResult.invalidRecords.length}
                      </div>
                    </div>

                    <div className="p-3.5 bg-[#171717] rounded-lg border border-[#262626]">
                      <div className="text-[11px] text-[#777] uppercase font-mono tracking-wider">Evidence Gaps</div>
                      <div className="text-lg font-bold text-[#EAB308] mt-0.5 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        {validationResult.totalEvidenceGaps}
                      </div>
                    </div>
                  </div>

                  {/* Warnings if any */}
                  {validationResult.warnings.length > 0 && (
                    <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/50 text-amber-300 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400" />
                      <span>{validationResult.warnings.join(' ')}</span>
                    </div>
                  )}

                  {/* Invalid rows detail */}
                  {validationResult.invalidRecords.length > 0 && (
                    <div className="p-4 bg-red-950/20 border border-red-900/40 rounded-lg space-y-2">
                      <div className="text-xs font-semibold text-red-300 flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-400" />
                        Invalid Rows Identified ({validationResult.invalidRecords.length})
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-1 text-[11px] text-red-200">
                        {validationResult.invalidRecords.map((inv, idx) => (
                          <div key={idx} className="bg-red-950/40 p-2 rounded border border-red-900/30">
                            <span className="font-mono text-red-400">Row {inv.rowNumber}:</span>{' '}
                            {inv.errors.join('; ')}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Workload Preview Table */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">Workload Preview & DNA Extraction</span>
                      <button
                        onClick={resetState}
                        className="text-[#A88554] hover:underline text-[11px]"
                      >
                        Upload Different File
                      </button>
                    </div>

                    <div className="border border-[#262626] rounded-lg overflow-x-auto max-h-64">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-[#181818] text-[#888] font-mono text-[11px] border-b border-[#262626] sticky top-0">
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
                        <tbody className="divide-y divide-[#222] bg-[#121212]">
                          {validationResult.validRecords.map((w) => (
                            <tr key={w.id} className="hover:bg-[#181818] transition-colors">
                              <td className="p-2.5 font-mono text-[#A88554] font-semibold">{w.id}</td>
                              <td className="p-2.5 font-medium text-white">{w.name}</td>
                              <td className="p-2.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                                  w.type === 'Data Platform'
                                    ? 'bg-purple-950/50 text-purple-300 border border-purple-800/40'
                                    : 'bg-blue-950/50 text-blue-300 border border-blue-800/40'
                                }`}>
                                  {w.type}
                                </span>
                              </td>
                              <td className="p-2.5">
                                <span className={`text-[11px] ${
                                  w.businessCriticality === 'High'
                                    ? 'text-red-400 font-semibold'
                                    : w.businessCriticality === 'Medium'
                                    ? 'text-amber-400'
                                    : 'text-[#888]'
                                }`}>
                                  {w.businessCriticality}
                                </span>
                              </td>
                              <td className="p-2.5 text-[#aaa] max-w-[140px] truncate" title={w.currentStack}>
                                {w.currentStack}
                              </td>
                              <td className="p-2.5 text-[#888] max-w-[120px] truncate" title={w.hosting}>
                                {w.hosting}
                              </td>
                              <td className="p-2.5 text-right">
                                <span className="font-mono font-semibold text-[#A88554]">
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
              <div className="bg-[#181818] p-4 rounded-lg border border-[#262626]">
                <h3 className="text-sm font-semibold text-white mb-1">
                  Ready-to-Use Enterprise Portfolio Datasets
                </h3>
                <p className="text-xs text-[#888]">
                  Each sample dataset is a fictional enterprise portfolio tailored to an industry archetype.
                  Collectively, they contain candidates for all 6 canonical 6R dispositions (Retain, Retire, Rehost, Replatform, Refactor, Repurchase).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {SAMPLE_DATASETS.map((ds) => (
                  <div
                    key={ds.id}
                    className="p-4 bg-[#161616] border border-[#262626] hover:border-[#383838] rounded-xl flex flex-col justify-between transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#A88554] bg-[#A88554]/10 px-2 py-0.5 rounded border border-[#A88554]/20">
                          {ds.industry}
                        </span>
                        <span className="text-xs text-[#777] font-mono">
                          {ds.workloadCount} Workloads
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-white mb-1">{ds.title}</h4>
                      <p className="text-xs text-[#888] leading-relaxed mb-4">{ds.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#222]">
                      <span className="text-[11px] font-mono text-[#666]">{ds.filename}</span>
                      <button
                        onClick={() => handleDownloadSample(ds)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#222] hover:bg-[#2e2e2e] text-white text-xs font-medium transition-colors border border-[#333]"
                      >
                        <Download className="w-3.5 h-3.5 text-[#A88554]" />
                        Download CSV
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Guidance note */}
              <div className="p-3.5 bg-[#141414] rounded-lg border border-[#222] text-xs text-[#888] flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-[#A88554] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-white font-medium">Evaluation Metadata Note:</span> The sample CSVs include{' '}
                  <code className="text-[#A88554] font-mono">expected_6r</code> and{' '}
                  <code className="text-[#A88554] font-mono">expected_reason</code> columns for reference and evaluation.
                  In accordance with strict neutrality and decision fidelity, these fields are{' '}
                  <span className="text-white font-medium">never</span> passed to Gemini or included in the Enterprise DNA assessment payload.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#222] bg-[#161616] flex items-center justify-between">
          <div className="text-xs text-[#777]">
            {validationResult ? (
              <span>
                Ready to import{' '}
                <strong className="text-white">{validationResult.validRecords.length}</strong> validated workloads.
              </span>
            ) : (
              <span>Upload a CSV or JSON file to preview workloads.</span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-xs font-medium text-[#aaa] hover:text-white hover:bg-[#222] transition-colors"
            >
              Cancel
            </button>

            {validationResult && validationResult.validRecords.length > 0 && (
              <button
                onClick={handleConfirmImport}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#A88554] hover:bg-[#BCA075] text-black text-xs font-semibold shadow-lg shadow-[#A88554]/20 transition-all disabled:opacity-50"
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
