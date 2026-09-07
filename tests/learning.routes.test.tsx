// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../src/App';
import { LearningCenterPage } from '../src/components/LearningCenterPage';
import {
  CANONICAL_DRIVE_LIBRARY_URL,
  LEARNING_CATEGORIES,
  LEARNING_VIDEOS,
} from '../src/data/learningVideos';
import { ThemeProvider } from '../src/lib/theme';

const expectedTitles = [
  'EMOS Beta Introduction',
  'Sign in and enter the private workspace',
  'Take the guided product tour',
  'Submit a workload for a 6R assessment',
  'Explore options and generate an executive decision',
  'Refine an assessment with new evidence',
  'Verify owner-bound persistence and privacy',
  'Search, filter, and manage assessment history',
  'Preserve cloud-platform neutrality',
  'Validate assessment-score consistency',
  'Explore the sample enterprise portfolio',
  'Inspect Enterprise DNA and evidence gaps',
  'Go from Enterprise DNA to assessment in one click',
  'Import a CSV or JSON portfolio',
  'Download a sample enterprise dataset',
  'Assess and manage imported workloads',
  'Switch appearance and use responsive layouts',
  'Fence adversarial prompts and redact secrets',
  'Enforce canonical 6R and evidence readiness',
  'Plan and mobilize the modernization program',
];

function renderLearningCenter(onNavigate = vi.fn()) {
  return render(
    <ThemeProvider>
      <LearningCenterPage onNavigate={onNavigate} />
    </ThemeProvider>,
  );
}

describe('Public EMOS Learning Center (/learn)', () => {
  beforeAll(() => {
    window.scrollTo = vi.fn();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  beforeEach(() => {
    window.history.pushState({}, '', '/');
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders /learn immediately without an authentication gate or redirect', () => {
    window.history.pushState({}, '', '/learn');
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: 'Learn EMOS' })).toBeInTheDocument();
    expect(screen.getByText(/No EMOS sign-in required/i)).toBeInTheDocument();
    expect(screen.queryByText(/Initializing secure authentication/i)).not.toBeInTheDocument();
    expect(window.location.pathname).toBe('/learn');
    expect(document.title).toBe('Learning Center — EMOS');
  });

  it('renders the introduction and F01 through F19 exactly once', () => {
    renderLearningCenter();

    expect(LEARNING_VIDEOS).toHaveLength(20);
    expect(LEARNING_VIDEOS.map((video) => video.sequence)).toEqual([
      '00',
      ...Array.from({ length: 19 }, (_, index) => `F${String(index + 1).padStart(2, '0')}`),
    ]);
    const videoCards = screen.getAllByTestId(/^video-/);
    expect(videoCards).toHaveLength(20);
    for (const card of videoCards) {
      expect(within(card).getByText('Beta v1.0', { exact: true })).toBeInTheDocument();
    }
  });

  it('keeps every title and video filename aligned with docs/LEARN.md', () => {
    renderLearningCenter();

    expect(LEARNING_VIDEOS.map((video) => video.title)).toEqual(expectedTitles);
    for (const video of LEARNING_VIDEOS) {
      expect(screen.getByRole('heading', { name: video.title })).toBeInTheDocument();
      expect(screen.getByText(`File: ${video.fileName}`)).toBeInTheDocument();
    }
  });

  it('uses the six documented categories with F18 and F19 in the correct groups', () => {
    const members = Object.fromEntries(
      LEARNING_CATEGORIES.map((category) => [
        category,
        LEARNING_VIDEOS.filter((video) => video.category === category).map((video) => video.sequence),
      ]),
    );

    expect(members).toEqual({
      'Start Here': ['00', 'F01', 'F02'],
      'Assess and Decide': ['F03', 'F04', 'F05'],
      'Trust and Governance': ['F06', 'F07', 'F08', 'F09'],
      'Portfolio and Enterprise DNA': ['F10', 'F11', 'F12', 'F13', 'F14', 'F15'],
      'Product Experience and Security': ['F16', 'F17', 'F18'],
      'Plan and Mobilize': ['F19'],
    });
  });

  it('provides secure, accurately labelled links to the canonical video library', () => {
    renderLearningCenter();

    const videoLinks = screen.getAllByRole('link', { name: /Open video library for/i });
    expect(videoLinks).toHaveLength(20);
    for (const link of videoLinks) {
      expect(link).toHaveAttribute('href', CANONICAL_DRIVE_LIBRARY_URL);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(link).toHaveTextContent('Open video library');
    }
  });

  it('filters the catalogue by search text', () => {
    renderLearningCenter();

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search learning videos' }), {
      target: { value: 'persistence' },
    });

    expect(screen.getByTestId('video-f06')).toBeInTheDocument();
    expect(screen.queryByTestId('video-f03')).not.toBeInTheDocument();
  });

  it('filters the catalogue by category and exposes the selected state', () => {
    renderLearningCenter();

    const trustTab = screen.getByRole('tab', { name: 'Trust and Governance' });
    fireEvent.click(trustTab);

    expect(trustTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getAllByTestId(/^video-/)).toHaveLength(4);
    expect(screen.getByTestId('video-f06')).toBeInTheDocument();
    expect(screen.getByTestId('video-f09')).toBeInTheDocument();
    expect(screen.queryByTestId('video-f10')).not.toBeInTheDocument();
  });

  it('exposes accessible headings, filters, thumbnail descriptions, and navigation', () => {
    renderLearningCenter();

    expect(screen.getByRole('tablist', { name: 'Filter videos by category' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Search learning videos' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'F11: Inspect Enterprise DNA and evidence gaps' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Learning Center footer' })).toBeInTheDocument();
  });

  it('clearly separates implemented beta capabilities from future scope', () => {
    renderLearningCenter();

    expect(screen.getByRole('heading', { name: 'Implemented in Beta v1.0' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Future EMOS roadmap' })).toBeInTheDocument();
    expect(
      screen.getByText(/not claimed as implemented in this beta/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Disposition-specific governed execution agents')).toBeInTheDocument();
  });

  it('navigates to public and home routes through the supplied client router', () => {
    const onNavigate = vi.fn();
    renderLearningCenter(onNavigate);

    fireEvent.click(screen.getByRole('link', { name: 'Privacy Policy' }));
    expect(onNavigate).toHaveBeenCalledWith('/privacy');

    fireEvent.click(screen.getByRole('link', { name: 'Terms of Service' }));
    expect(onNavigate).toHaveBeenCalledWith('/terms');

    fireEvent.click(screen.getByRole('link', { name: 'Return to EMOS home' }));
    expect(onNavigate).toHaveBeenCalledWith('/');
  });
});
