// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { ImportPortfolioModal } from '../src/components/ImportPortfolioModal';

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
});
beforeEach(() => window.history.replaceState({}, '', '/app/portfolio'));
afterEach(cleanup);
const content = 'Asset ID,Application Name,Type,Technology,Private note\nw-1,Payments,Application,Java 17,DO_NOT_PERSIST';
function file(text = content, name = 'custom.csv') {
  const value = new File([text], name, { type: name.endsWith('.json') ? 'application/json' : 'text/csv' });
  Object.defineProperty(value, 'text', { configurable: true, value: async () => text });
  return value;
}
const upload = async (value = file()) => {
  fireEvent.change(screen.getByLabelText('Inventory file'), { target: { files: [value] } });
  await screen.findByRole('heading', { name: 'Map source columns' });
};
const props = () => ({ isOpen: true, onClose: vi.fn(), onImportSuccess: vi.fn().mockResolvedValue(undefined), onContinue: vi.fn(), userId: 'alice' });

describe('reviewed intake workflow', () => {
  it('maps and previews before saving only selected fields, then explicitly continues to Discover', async () => {
    const options = props(); render(<ImportPortfolioModal {...options} />);
    expect(screen.getByRole('dialog', { name: 'Import enterprise portfolio' })).toBeInTheDocument();
    await upload();
    expect(screen.getByLabelText('Map column Asset ID')).toHaveValue('workload_id');
    expect(options.onImportSuccess).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Preview workloads' }));
    fireEvent.click(screen.getByRole('button', { name: 'Import 1 workload(s)' }));
    await screen.findByRole('heading', { name: 'Import complete' });
    expect(options.onImportSuccess).toHaveBeenCalledTimes(1);
    const saved = options.onImportSuccess.mock.calls[0][0];
    expect(saved[0]).toMatchObject({ userId: 'alice', id: 'w-1' });
    expect(JSON.stringify(saved)).not.toContain('DO_NOT_PERSIST');
    expect(options.onContinue).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Open imported portfolio' }));
    expect(options.onContinue).toHaveBeenCalledOnce();
  });
  it('requires explicit exclusion of invalid rows', async () => {
    const options = props(); render(<ImportPortfolioModal {...options} />);
    await upload(file(content + '\nw-2,,Application,,'));
    fireEvent.click(screen.getByRole('button', { name: 'Preview workloads' }));
    expect(screen.getByRole('button', { name: 'Import 1 workload(s)' })).toBeDisabled();
    expect(screen.getByText(/Workload name: required value is missing/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', { name: /Exclude 1 invalid/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Import 1 workload(s)' }));
    await screen.findByRole('heading', { name: 'Import complete' });
    expect(options.onImportSuccess.mock.calls[0][0]).toHaveLength(1);
  });
  it('associates duplicate mapping errors with controls and supports recovery', async () => {
    render(<ImportPortfolioModal {...props()} />); await upload();
    const select = screen.getByLabelText('Map column Private note');
    fireEvent.change(select, { target: { value: 'workload_id' } });
    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(select).toHaveAttribute('aria-describedby', 'mapping-errors');
    expect(screen.getByRole('button', { name: 'Preview workloads' })).toBeDisabled();
    fireEvent.change(select, { target: { value: '' } });
    expect(screen.getByRole('button', { name: 'Preview workloads' })).toBeEnabled();
  });
  it('preserves source/mapping when going back and when receiving browser history events', async () => {
    render(<ImportPortfolioModal {...props()} />); await upload();
    const mapState = window.history.state;
    fireEvent.click(screen.getByRole('button', { name: 'Preview workloads' }));
    act(() => { window.history.replaceState(mapState, ''); window.dispatchEvent(new PopStateEvent('popstate')); });
    expect(screen.getByLabelText('Map column Technology')).toHaveValue('runtime');
    fireEvent.click(screen.getByRole('button', { name: 'Preview workloads' }));
    fireEvent.click(screen.getByRole('button', { name: 'Back to Map' }));
    expect(screen.getByLabelText('Map column Asset ID')).toHaveValue('workload_id');
  });
  it('responds to actual history traversal while the parent rerenders on navigation', async () => {
    function Parent() {
      const [revision, setRevision] = React.useState(0);
      React.useEffect(() => {
        const changed = () => setRevision(value => value + 1);
        window.addEventListener('popstate', changed);
        return () => window.removeEventListener('popstate', changed);
      }, []);
      return <ImportPortfolioModal {...props()} onClose={() => {}} />;
    }
    render(<Parent />); await upload();
    fireEvent.click(screen.getByRole('button', { name: 'Preview workloads' }));
    expect(window.location.search).toContain('intake=preview');
    act(() => window.history.back());
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Map source columns' })).toBeInTheDocument());
    expect(window.location.search).toContain('intake=map');
  });
  it('retains exactly the same reviewed payload on save failure and retry', async () => {
    const options = props(); options.onImportSuccess.mockRejectedValueOnce(new Error('Connection unavailable'));
    render(<ImportPortfolioModal {...options} />); await upload();
    fireEvent.click(screen.getByRole('button', { name: 'Preview workloads' }));
    fireEvent.click(screen.getByRole('button', { name: 'Import 1 workload(s)' }));
    await screen.findByRole('alert');
    expect(screen.getByRole('alert')).toHaveFocus();
    expect(screen.queryByRole('heading', { name: 'Import complete' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Import 1 workload(s)' }));
    await screen.findByRole('heading', { name: 'Import complete' });
    expect(options.onImportSuccess.mock.calls[1][0]).toBe(options.onImportSuccess.mock.calls[0][0]);
  });
  it('prevents duplicate submission and closing while a save is pending', async () => {
    const options = props(); let finish!: () => void;
    options.onImportSuccess.mockImplementation(() => new Promise<void>(resolve => { finish = resolve; }));
    render(<ImportPortfolioModal {...options} />); await upload();
    fireEvent.click(screen.getByRole('button', { name: 'Preview workloads' }));
    fireEvent.click(screen.getByRole('button', { name: 'Import 1 workload(s)' }));
    expect(screen.getByRole('button', { name: 'Close import' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Back to Map' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { bubbles: true, cancelable: true }));
    expect(options.onClose).not.toHaveBeenCalled();
    await act(async () => finish());
    expect(options.onImportSuccess).toHaveBeenCalledOnce();
  });
  it('renders HTML and formula text inertly in source examples and preview', async () => {
    const { container } = render(<ImportPortfolioModal {...props()} />);
    await upload(file('Asset ID,Application Name,Type,Technology\nw-1,<img src=x onerror=alert(1)>,Application,=1+1'));
    fireEvent.click(screen.getByRole('button', { name: 'Preview workloads' }));
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getAllByText(/<img src=x onerror=alert\(1\)>/).length).toBeGreaterThan(0);
    expect(screen.getByText("'=1+1")).toBeInTheDocument();
  });
  it('clears private draft when account changes and ignores a stale file read', async () => {
    const options = props(); let finish!: (value: string) => void;
    const value = file(); Object.defineProperty(value, 'text', { configurable: true, value: () => new Promise<string>(resolve => { finish = resolve; }) });
    const app = render(<ImportPortfolioModal {...options} />);
    fireEvent.change(screen.getByLabelText('Inventory file'), { target: { files: [value] } });
    app.rerender(<ImportPortfolioModal {...options} userId="bob" />);
    await act(async () => finish(content));
    expect(screen.getByLabelText('Inventory file')).toBeInTheDocument();
    expect(screen.queryByText('Payments')).not.toBeInTheDocument();
  });
  it('disables intake without a signed-in owner', () => {
    render(<ImportPortfolioModal {...props()} userId="" />);
    expect(screen.getByLabelText('Inventory file')).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent('Sign in');
  });
  it('allows selecting a new file after a source error and blocks existing workload IDs', async () => {
    render(<ImportPortfolioModal {...props()} existingWorkloadIds={['w-1']} />);
    fireEvent.change(screen.getByLabelText('Inventory file'), { target: { files: [file('broken', 'bad.xlsx')] } });
    await screen.findByRole('alert');
    await upload(); fireEvent.click(screen.getByRole('button', { name: 'Preview workloads' }));
    expect(screen.getByText(/already present in this file/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Import 0 workload(s)' })).toBeDisabled();
  });
});
