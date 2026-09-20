// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ModernizationLifecycle } from '../src/components/ModernizationLifecycle';
import { MODERNIZATION_PHASES } from '../src/config/productFacts';

describe('ModernizationLifecycle', () => {
  it('keeps every stage and sub-stage discoverable with honest delivery states', () => {
    render(<ModernizationLifecycle currentStage="Understand" />);

    expect(screen.getByText('15 stages + Mobilize')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /View entire lifecycle/i }));

    const lifecycle = screen.getByRole('region', { name: /Enterprise modernization lifecycle/i });
    for (const phase of MODERNIZATION_PHASES) {
      expect(within(lifecycle).getAllByText(new RegExp(phase.name, 'i')).length).toBeGreaterThan(0);
      for (const stage of phase.stages) {
        expect(within(lifecycle).getByText(new RegExp(`${stage.handoff ? 'Handoff' : stage.number}\\. ${stage.name}`, 'i'))).toBeInTheDocument();
        for (const subStage of stage.subStages) {
          expect(within(lifecycle).getAllByText((content) => content.replace(/^•\s*/, '') === subStage).length).toBeGreaterThan(0);
        }
      }
    }

    expect(within(lifecycle).getByText(/Unavailable stages remain visible/i)).toBeInTheDocument();
    expect(within(lifecycle).getByText(/10\. Execute/i).closest('[aria-disabled="true"]')).toBeInTheDocument();
    expect(within(lifecycle).getByText(/6\. Govern/i).closest('[aria-disabled="true"]')).toBeInTheDocument();
    expect(within(lifecycle).getByText(/3\. Understand/i).closest('[aria-current="step"]')).toBeInTheDocument();
  });

  it('only makes available stages navigable', () => {
    const onSelectStage = vi.fn();
    render(<ModernizationLifecycle onSelectStage={onSelectStage} defaultExpanded />);

    fireEvent.click(screen.getByRole('button', { name: /2\. Discover/i }));
    expect(onSelectStage).toHaveBeenCalledWith(expect.objectContaining({ name: 'Discover', delivery: 'available' }));
    expect(screen.queryByRole('button', { name: /10\. Execute/i })).not.toBeInTheDocument();
  });
});
