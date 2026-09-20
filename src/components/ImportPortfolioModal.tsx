import React, { useEffect, useRef, useState } from 'react';
import { X, UploadCloud } from 'lucide-react';
import type { EnterpriseWorkload } from '../types';
import { IMPORT_FIELDS, mappingErrors, previewPortfolio, readPortfolioSource, suggestColumnMapping, type ColumnMapping, type IntakePreview, type PortfolioSource } from '../utils/portfolioImporter';
import { redactSecrets } from '../lib/guardrails';
import { EMOS_TEMPLATE_CSV, SAMPLE_DATASETS } from '../data/sampleCsvs';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (workloads: EnterpriseWorkload[]) => Promise<void>;
  onContinue?: () => void;
  existingWorkloadIds?: string[];
  userId: string;
}
type Step = 'Source' | 'Map' | 'Preview' | 'Result';
const steps: Step[] = ['Source', 'Map', 'Preview', 'Result'];
const control = 'min-h-11 rounded-lg border border-[var(--emos-border-strong)] bg-[var(--emos-surface)] px-3 py-2 text-sm disabled:opacity-50';
const primary = control + ' bg-[#A88554]! text-black! font-semibold';

export const ImportPortfolioModal: React.FC<Props> = ({ isOpen, onClose, onImportSuccess, onContinue, existingWorkloadIds = [], userId }) => {
  const dialog = useRef<HTMLDialogElement>(null), heading = useRef<HTMLHeadingElement>(null);
  const errorSummary = useRef<HTMLDivElement>(null);
  const focusBefore = useRef<HTMLElement | null>(null);
  const session = useRef(''), generation = useRef(0), busy = useRef(false);
  const [step, setStep] = useState<Step>('Source');
  const [source, setSource] = useState<PortfolioSource | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>([]);
  const [preview, setPreview] = useState<IntakePreview | null>(null);
  const [excludeInvalid, setExcludeInvalid] = useState(false);
  const [error, setError] = useState(''), [isBusy, setIsBusy] = useState(false), [page, setPage] = useState(0);
  const historyView = useRef({ step, preview, onClose });
  historyView.current = { step, preview, onClose };
  const close = () => {
    if (busy.current) return;
    generation.current++;
    const url = new URL(window.location.href); url.searchParams.delete('intake');
    window.history.replaceState({}, '', url.pathname + url.search);
    onClose();
  };
  const writeStep = (next: Step) => {
    const url = new URL(window.location.href); url.searchParams.set('intake', next.toLowerCase());
    window.history.pushState({ ...window.history.state, emosIntake: { session: session.current, step: next } }, '', url.pathname + url.search);
  };
  const go = (next: Step) => {
    setError(''); setStep(next);
    writeStep(next);
  };
  useEffect(() => {
    generation.current++;
    if (!isOpen) { if (dialog.current?.open) dialog.current.close(); return; }
    session.current = crypto.randomUUID();
    setStep('Source'); setSource(null); setMapping([]); setPreview(null); setError(''); setExcludeInvalid(false); setPage(0);
    busy.current = false; setIsBusy(false);
    focusBefore.current = document.activeElement as HTMLElement;
    dialog.current?.showModal(); heading.current?.focus();
    writeStep('Source');
    return () => { generation.current++; if (dialog.current?.open) dialog.current.close(); focusBefore.current?.focus(); };
  }, [isOpen, userId]);
  useEffect(() => {
    if (!isOpen) return;
    const back = () => {
      const { step, preview, onClose } = historyView.current;
      const state = window.history.state?.emosIntake;
      if (busy.current) { writeStep(step); return; }
      if (step === 'Result') { onClose(); return; }
      if (state?.session === session.current && steps.includes(state.step) && state.step !== 'Result') {
        setStep(state.step === 'Preview' && !preview ? 'Map' : state.step); setError('');
      } else onClose();
    };
    window.addEventListener('popstate', back);
    return () => window.removeEventListener('popstate', back);
  }, [isOpen]);
  useEffect(() => { if (isOpen) heading.current?.focus(); }, [step, isOpen]);
  useEffect(() => { if (error) { errorSummary.current?.focus(); errorSummary.current?.scrollIntoView({ block: 'center' }); } }, [error]);

  const read = async (file?: File) => {
    if (!file || busy.current || !userId) return;
    const version = ++generation.current;
    busy.current = true; setIsBusy(true); setError('');
    try {
      const parsed = await readPortfolioSource(file);
      if (version !== generation.current) return;
      setSource(parsed); setMapping(suggestColumnMapping(parsed.columns)); setPreview(null); setExcludeInvalid(false); setPage(0); go('Map');
    } catch (error) {
      if (version === generation.current) setError(error instanceof Error ? redactSecrets(error.message) : 'The file could not be read. Export it as CSV or JSON and try again.');
    } finally { if (version === generation.current) { busy.current = false; setIsBusy(false); } }
  };
  const review = () => {
    if (!source) return;
    try { setPreview(previewPortfolio(source, mapping, userId, existingWorkloadIds)); setExcludeInvalid(false); setPage(0); go('Preview'); }
    catch (error) { setError((error as Error).message); }
  };
  const save = async () => {
    if (!preview?.validRecords.length || busy.current || !userId || (preview.invalidRecords.length > 0 && !excludeInvalid)) return;
    const version = generation.current;
    busy.current = true; setIsBusy(true); setError('');
    try { await onImportSuccess(preview.validRecords); if (version === generation.current) go('Result'); }
    catch (error) { if (version === generation.current) setError(error instanceof Error ? redactSecrets(error.message) : 'The save could not be confirmed. Retry this preview after checking your connection.'); }
    finally { if (version === generation.current) { busy.current = false; setIsBusy(false); } }
  };
  const download = (content: string, name: string) => {
    const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = name; link.click(); URL.revokeObjectURL(url);
  };
  const mapErrors = source ? mappingErrors(source.columns, mapping) : [];
  const warningRows = preview?.rows.filter(row => row.warnings.length).length ?? 0;
  return <dialog ref={dialog} aria-labelledby="intake-title" aria-describedby="intake-description"
    onCancel={event => { event.preventDefault(); close(); }}
    onKeyDown={event => {
      if (event.key !== 'Tab') return;
      const targets = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), summary, a[href]')].filter(target => target.getClientRects().length > 0);
      const first = targets[0], last = targets[targets.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === heading.current)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }}
    className="emos-app m-auto max-h-[94dvh] w-[calc(100%_-_1rem)] max-w-4xl overflow-y-auto rounded-2xl border border-[var(--emos-border-strong)] bg-[var(--emos-surface)] p-0 text-[var(--emos-text-primary)] shadow-2xl backdrop:bg-black/70">
    {isOpen && <div className="min-w-0">
      <header className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)] p-4 sm:p-6">
        <div className="min-w-0"><h2 id="intake-title" ref={heading} tabIndex={-1} className="text-lg font-semibold outline-none">{step === 'Result' ? 'Import complete' : 'Import enterprise portfolio'}</h2>
          <p id="intake-description" className="mt-1 text-sm text-[var(--emos-text-secondary)]">Review your inventory before adding it to Discover.</p></div>
        <button className={control + ' shrink-0'} aria-label="Close import" disabled={isBusy} onClick={close}><X className="h-4 w-4" /></button>
      </header>
      <div className="space-y-5 p-4 sm:p-6">
        <ol aria-label="Import steps" className="grid grid-cols-4 gap-1 text-xs">
          {steps.map((label, index) => <li key={label} aria-current={step === label ? 'step' : undefined} className={`rounded-lg border px-1 py-3 text-center ${step === label ? 'border-[var(--emos-accent)] bg-[var(--emos-accent-subtle)] font-semibold' : 'border-[var(--emos-border-subtle)] text-[var(--emos-text-secondary)]'}`}>{index + 1}. {label}</li>)}
        </ol>
        {!userId && <p role="alert">Sign in before importing a portfolio.</p>}
        {error && <div ref={errorSummary} role="alert" tabIndex={-1} className="rounded-lg border border-rose-500/50 p-3 text-sm text-rose-700 dark:text-rose-300"><strong>{step === 'Preview' ? 'Save not confirmed' : 'Review needed'}</strong><p className="mt-1 break-words">{error}</p></div>}
        {isBusy && <p role="status" className="text-sm">{step === 'Source' ? 'Reading and checking file…' : 'Saving reviewed workloads…'}</p>}
        {step === 'Source' && <>
          <section className="space-y-4 rounded-xl border border-dashed border-[var(--emos-border-strong)] p-4" onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); void read(event.dataTransfer.files[0]); }}>
            <UploadCloud className="h-6 w-6 text-[var(--emos-accent-text)]" aria-hidden="true" />
            <h3 className="font-semibold">Choose a CSV or JSON inventory</h3>
            <p id="source-help" className="text-sm leading-6 text-[var(--emos-text-secondary)]">Maximum 5 MB, 200 workloads and 40 columns per file. Map your own column names next. Workload ID, name and type are required. Type must be Application or Data Platform.</p>
            <label className="block text-sm font-medium" htmlFor="portfolio-file">Inventory file</label>
            <input id="portfolio-file" type="file" accept=".csv,.json" disabled={isBusy || !userId} aria-describedby="source-help"
              className="block min-h-11 w-full min-w-0 max-w-full text-xs file:mr-2 file:min-h-11 file:rounded-lg file:border-0 file:bg-[#A88554] file:px-3 file:text-black"
              onChange={event => { void read(event.target.files?.[0]); event.target.value = ''; }} />
          </section>
          {source && <button className={control} onClick={() => go('Map')}>Resume mapping for {source.fileName}</button>}
          <p className="text-xs leading-5 text-[var(--emos-text-secondary)]">File contents stay in this page until you confirm the import. Refreshing or closing discards the unsaved preview. Only mapped, validated values are saved; importing does not run an AI assessment.</p>
          <details className="rounded-xl border border-[var(--emos-border-subtle)] p-4"><summary className="min-h-11 cursor-pointer text-sm font-medium">Templates and synthetic examples</summary>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <button className={control} onClick={() => download(EMOS_TEMPLATE_CSV, 'emos-portfolio-template.csv')}>Download CSV template</button>
              {SAMPLE_DATASETS.map(dataset => <button key={dataset.id} className={control + ' text-left'} onClick={() => download(dataset.csvContent, dataset.filename)}>{dataset.title} · Synthetic CSV</button>)}
            </div>
          </details>
          <p className="text-xs text-[var(--emos-text-secondary)]">XLSX and live connectors are planned. Export a flat CSV or JSON file to begin.</p>
        </>}
        {step === 'Map' && source && <>
          <div><h3 className="font-semibold">Map source columns</h3><p className="mt-1 break-words text-sm text-[var(--emos-text-secondary)]">{source.fileName} · {source.rows.length} rows. Suggestions need your review. Unmapped columns are excluded.</p></div>
          {mapErrors.length > 0 && <div role="alert" id="mapping-errors" className="rounded-lg border border-amber-500/50 p-3 text-sm"><ul className="list-inside list-disc">{mapErrors.map(message => <li key={message}>{message}</li>)}</ul></div>}
          <div className="grid gap-3 sm:grid-cols-2">
            {source.columns.map((column, index) => {
              const duplicate = Boolean(mapping[index] && mapping.filter(value => value === mapping[index]).length > 1);
              const sample = source.rows.find(row => row.values[index] != null)?.values[index];
              const sampleText = typeof sample === 'object' ? '[Nested value — unsupported if mapped]' : redactSecrets(String(sample ?? ''));
              return <div key={column} className="min-w-0 rounded-xl border border-[var(--emos-border-subtle)] p-3">
                <label htmlFor={`map-${index}`} className="block break-words text-sm font-semibold">{column}</label>
                <p className="my-2 break-all text-xs text-[var(--emos-text-secondary)]">Source example: {sampleText.slice(0, 160) || '(empty)'}{sampleText.length > 160 ? '… (first 160 characters)' : ''}</p>
                <select id={`map-${index}`} aria-label={`Map column ${column}`} aria-invalid={duplicate || undefined} aria-describedby={duplicate ? 'mapping-errors' : undefined}
                  className={control + ' w-full min-w-0 max-w-full'} value={mapping[index] ?? ''}
                  onChange={event => { setMapping(values => values.map((value, i) => i === index ? event.target.value as ColumnMapping[number] : value)); setPreview(null); setError(''); }}>
                  <option value="">Do not import</option>
                  {IMPORT_FIELDS.map(field => <option key={field.key} value={field.key}>{field.label}{field.required ? ' (required)' : ' (optional)'}</option>)}
                </select>
              </div>;
            })}
          </div>
          <p className="text-xs leading-5 text-[var(--emos-text-secondary)]">Missing optional fields become evidence gaps. Criticality accepts High, Medium or Low; other evidence fields accept bounded text. Evaluation columns are kept separate from AI evidence.</p>
        </>}
        {step === 'Preview' && preview && <>
          <div><h3 className="font-semibold">Review normalized workloads</h3><p className="mt-1 text-sm text-[var(--emos-text-secondary)]">Validation checks format and completeness. Your team still verifies the evidence.</p></div>
          <dl className="grid grid-cols-3 gap-2">{[['Valid', preview.validRecords.length], ['Invalid', preview.invalidRecords.length], ['With warnings', warningRows]].map(([label, count]) => <div key={label} className="rounded-lg border border-[var(--emos-border-subtle)] p-2"><dt className="text-xs">{label}</dt><dd className="mt-1 text-xl font-semibold">{count}</dd></div>)}</dl>
          <p className="text-sm text-[var(--emos-text-secondary)]">{mapping.filter(value => !value).length} unmapped columns excluded. Normalized fields below are the values to be saved. Instruction-like text remains untrusted; later AI requests may reject it.</p>
          <div className="space-y-3">{preview.rows.slice(page * 10, page * 10 + 10).map(row => <article key={row.rowNumber} className="min-w-0 space-y-2 rounded-xl border border-[var(--emos-border-subtle)] p-3" aria-label={`Source row ${row.rowNumber}`}>
            <h4 className="break-words font-semibold">Row {row.rowNumber}: {row.fields.workload_name || 'Unnamed workload'}</h4>
            <p className="text-sm">{row.errors.length ? 'Invalid — excluded only with your confirmation' : 'Valid'} · {row.fields.workload_type || 'Type missing'}</p>
            {row.errors.length > 0 && <ul className="list-inside list-disc space-y-1 text-sm text-rose-700 dark:text-rose-300">{row.errors.map((message, i) => <li key={i}>{message}</li>)}</ul>}
            {row.warnings.length > 0 && <details><summary className="min-h-11 cursor-pointer text-sm text-amber-800 dark:text-amber-300">Review {row.warnings.length} warning(s)</summary><ul className="list-inside list-disc space-y-1 text-xs leading-5">{row.warnings.map((message, i) => <li key={i}>{message}</li>)}</ul></details>}
            <details><summary className="min-h-11 cursor-pointer text-sm">Normalized fields and source mapping</summary><dl className="grid gap-3 text-xs sm:grid-cols-2">{Object.entries(row.fields).map(([key, value]) => <div key={key} className="min-w-0"><dt className="break-words font-semibold">{IMPORT_FIELDS.find(field => field.key === key)?.label} ← {source?.columns[mapping.indexOf(key as ColumnMapping[number])]}</dt><dd className="mt-1 whitespace-pre-wrap break-all text-[var(--emos-text-secondary)]">{value || '(missing)'}</dd></div>)}</dl></details>
          </article>)}</div>
          {preview.rows.length > 10 && <div className="flex flex-wrap items-center gap-3"><button className={control} disabled={page === 0} onClick={() => setPage(value => value - 1)}>Previous rows</button><span className="text-xs">Page {page + 1} of {Math.ceil(preview.rows.length / 10)}</span><button className={control} disabled={(page + 1) * 10 >= preview.rows.length} onClick={() => setPage(value => value + 1)}>Next rows</button></div>}
          {preview.invalidRecords.length > 0 && <label className="flex min-h-11 items-start gap-3 rounded-lg border border-amber-500/50 p-3 text-sm"><input type="checkbox" className="mt-1 h-5 w-5 shrink-0" disabled={isBusy} checked={excludeInvalid} onChange={event => setExcludeInvalid(event.target.checked)} />Exclude {preview.invalidRecords.length} invalid row(s) and import only the {preview.validRecords.length} valid workload(s).</label>}
          <p className="text-xs leading-5 text-[var(--emos-text-secondary)]">Existing IDs are not overwritten. The reviewed set saves together. Keep this preview open if a retry is needed.</p>
        </>}
        {step === 'Result' && preview && <section role="status" className="space-y-3 rounded-xl border border-emerald-500/40 p-4">
          <h3 className="text-lg font-semibold">{preview.validRecords.length} workload(s) imported</h3>
          <p className="text-sm">{preview.invalidRecords.length} invalid row(s) excluded by your choice. {warningRows} source row(s) carried warnings.</p>
          <p className="text-sm text-[var(--emos-text-secondary)]">Source filename, row number and selected column mappings were saved for reference. Open Discover to inspect your portfolio and evidence gaps.</p>
        </section>}
      </div>
      <footer className="flex flex-wrap justify-between gap-3 border-t border-[var(--emos-border-subtle)] bg-[var(--emos-bg-secondary)] p-4 sm:px-6">
        {step === 'Source' ? <button className={control} disabled={isBusy} onClick={close}>Cancel</button> : step !== 'Result' ? <button className={control} disabled={isBusy} onClick={() => go(step === 'Map' ? 'Source' : 'Map')}>Back to {step === 'Map' ? 'Source' : 'Map'}</button> : null}
        {step === 'Map' && <button className={primary} disabled={!!mapErrors.length || isBusy} onClick={review}>Preview workloads</button>}
        {step === 'Preview' && <button className={primary} disabled={isBusy || !userId || !preview?.validRecords.length || (!!preview.invalidRecords.length && !excludeInvalid)} onClick={() => void save()}>{isBusy ? 'Saving…' : `Import ${preview?.validRecords.length ?? 0} workload(s)`}</button>}
        {step === 'Result' && <button className={primary} onClick={() => { close(); onContinue?.(); }}>Open imported portfolio</button>}
      </footer>
    </div>}
  </dialog>;
};
