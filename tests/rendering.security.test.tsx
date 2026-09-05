// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { SafeMarkdown } from '../src/components/SafeMarkdown';
import { ReflectionWorkspace } from '../src/components/ReflectionWorkspace';
import type { Interaction } from '../src/types';

describe('safe assessment rendering', () => {
  const writeText = vi.fn();

  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
  });

  it('does not render raw HTML, executable links, or remote images', () => {
    const { container } = render(
      <SafeMarkdown>{[
        '<script>window.pwned=true</script>',
        '<img src=x onerror="window.pwned=true">',
        '[unsafe](javascript:alert(1))',
        '![tracker](https://tracker.invalid/pixel.gif)',
        '[safe](https://example.com/report)',
      ].join('\n\n')}</SafeMarkdown>,
    );

    expect(container.querySelector('script')).not.toBeInTheDocument();
    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(container.querySelector('a[href^="javascript:"]')).not.toBeInTheDocument();
    expect(container.querySelector('a[href="https://example.com/report"]')).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders canonical persisted metrics consistently with canonical response text', () => {
    const interaction: Interaction = {
      id: 'assessment-1',
      userId: 'owner-1',
      title: 'Payments',
      category: 'Legacy Application',
      mode: 'assess',
      content: 'Java 8 workload',
      geminiResponse: [
        '**Recommended 6R Disposition:** Refactor',
        '**Confidence Score:** 65%',
        '**Evidence Completeness:** 20%',
        '**Decision Readiness:** NEEDS EVIDENCE',
      ].join('\n'),
      turns: [],
      createdAt: new Date(0).toISOString(),
      updatedAt: new Date(0).toISOString(),
      recommended6R: 'Refactor',
      confidenceScore: 65,
      evidenceCompleteness: 20,
      decisionReadiness: 'NEEDS EVIDENCE',
    };

    const { container } = render(<ReflectionWorkspace
      activeInteraction={interaction}
      onSaveNew={async () => undefined}
      onSendFollowUp={async () => undefined}
      onRetrySave={async () => undefined}
      onOpenPortfolio={() => undefined}
      onOpenDna={() => undefined}
      onToggleMobileHistory={() => undefined}
      isProcessing={false}
      saveStatus="saved"
      errorMessage={null}
    />);

    expect(screen.getAllByText('Refactor').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('20%').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/NEEDS EVIDENCE/).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText(/Rebuild|99%|READY$/)).not.toBeInTheDocument();

    fireEvent.click(container.querySelector('#copy-assessment-btn')!);
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('**Evidence Completeness:** 20%'));
    expect(writeText).not.toHaveBeenCalledWith(expect.stringMatching(/Rebuild|99%|Decision Readiness:\*\* READY/));
  });
});
