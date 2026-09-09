// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LearningCenterPage } from '../src/components/LearningCenterPage';
import {
  getDrivePreviewUrl,
  getDriveViewUrl,
  LEARNING_VIDEOS,
  type LearningVideo,
} from '../src/data/learningVideos';
import { ThemeProvider } from '../src/lib/theme';

const EXPECTED_DRIVE_IDS: Record<string, string> = {
  'EMOS-Beta-Introduction.mp4': '1I5DLsarRnhBbxMUS-GpO5ew7WLZ2Gt6t',
  'F01-sign-in-enter-the-private-workspace.mp4': '1PRAQZP4pQYggRhFAyhWe18A2q55E-0BX',
  'F02-take-the-guided-product-tour.mp4': '1M6IJtGqJ629ovhjdUo_HrxXusIWo_8r3',
  'F03-submit-a-workload-for-a-6r-assessment.mp4': '1ydFW2t4JMMdNjknaqAvZrtWB4tUe92GT',
  'F04-explore-options-generate-an-executive-decision.mp4': '1eu_L9GN7YkdncjOHeNvCqoB2VI3fuev-',
  'F05-refine-an-assessment-with-new-evidence.mp4': '17DflA2QwWNSDup7RO3rkD58nIDumK49T',
  'F06-verify-owner-bound-persistence-privacy.mp4': '14r-JcDRJJ2kOSugSPBMWhS6_BW5yZT47',
  'F07-search-filter-manage-assessment-history.mp4': '1mf5Wu4J2zddYcOYI25CHyfjULn-9Urf0',
  'F08-preserve-cloud-platform-neutrality.mp4': '14MqrVx4ohNT2DoULGq7wNuV8MSdGEb_5',
  'F09-validate-assessment-score-consistency.mp4': '1A-s4cJh5frA_tO7BhAw1C00oG5hnjEUv',
  'F10-explore-the-sample-enterprise-portfolio.mp4': '1thTOicdmNhgKBUbDo_chi49E9K6v3oYe',
  'F11-inspect-enterprise-dna-evidence-gaps.mp4': '1Dzt4Eylca78TNs5h4ADYZ1HAmMSu0I6N',
  'F12-go-from-enterprise-dna-to-assessment-in-one-click.mp4': '1WWd0pDY65tR9w_0TFVK592Vnf7ObpdLY',
  'F13-import-a-csv-or-json-portfolio.mp4': '1cEEOiEqP9nc1-_JFGRjqIiP5YcRa-qeT',
  'F14-download-a-sample-enterprise-dataset.mp4': '13vtt5oLqqkPTQSbVT4EM-_ktlUL6ubX8',
  'F15-assess-manage-imported-workloads.mp4': '17uiUFzV-YAm059DrpxkR0DIlHUCm-DK-',
  'F16-switch-appearance-use-responsive-layouts.mp4': '1uWNSBy0U5hdXE8xup9zXUISnVVioz5Vn',
  'F17-fence-adversarial-prompts-redact-secrets.mp4': '1ngfDnl0APUqLquIFzCoVbfP5smNs7B5I',
  'F18-enforce-canonical-6r-evidence-readiness.mp4': '103c_WhQGhG1ygK_Y8w6E3J3Ca2xRDUBR',
  'F19-plan-mobilize-the-modernization-program.mp4': '1CcbmWr2GPGRc-7BlUiesR7skhcJkXOA9',
};

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

function renderLearningCenter(videos?: readonly LearningVideo[]) {
  return render(
    <ThemeProvider>
      <LearningCenterPage onNavigate={vi.fn()} videos={videos} />
    </ThemeProvider>,
  );
}

describe('EMOS Learning Center embedded video playback', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
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

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('maps every documented filename to its exact verified public Drive file ID', () => {
    expect(Object.fromEntries(LEARNING_VIDEOS.map((video) => [video.fileName, video.driveFileId]))).toEqual(
      EXPECTED_DRIVE_IDS,
    );
    expect(new Set(LEARNING_VIDEOS.map((video) => video.driveFileId)).size).toBe(20);
  });

  it('loads the selected Drive preview only after the user chooses Play', () => {
    renderLearningCenter();

    expect(screen.queryByTitle(/video player/i)).not.toBeInTheDocument();

    const video = LEARNING_VIDEOS[3];
    fireEvent.click(screen.getByRole('button', { name: `Play ${video.sequence}: ${video.title} in EMOS` }));

    const dialog = screen.getByRole('dialog', { name: video.title });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByTitle(`${video.sequence}: ${video.title} video player`)).toHaveAttribute(
      'src',
      getDrivePreviewUrl(video.driveFileId),
    );
    expect(screen.getByRole('link', { name: /Open in Google Drive/i })).toHaveAttribute(
      'href',
      getDriveViewUrl(video.driveFileId),
    );
  });

  it('closes with Escape and restores focus to the originating Play button', () => {
    renderLearningCenter();

    const video = LEARNING_VIDEOS[0];
    const playButton = screen.getByRole('button', {
      name: `Play ${video.sequence}: ${video.title} in EMOS`,
    });
    playButton.focus();
    fireEvent.click(playButton);

    expect(screen.getByRole('button', { name: `Close video: ${video.title}` })).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(playButton).toHaveFocus();
  });

  it('keeps keyboard focus inside the modal', () => {
    renderLearningCenter();

    const video = LEARNING_VIDEOS[1];
    fireEvent.click(
      screen.getByRole('button', { name: `Play ${video.sequence}: ${video.title} in EMOS` }),
    );

    const closeButton = screen.getByRole('button', { name: `Close video: ${video.title}` });
    const driveLink = screen.getByRole('link', { name: /Open in Google Drive/i });
    expect(closeButton).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(driveLink).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Tab' });
    expect(closeButton).toHaveFocus();
  });

  it('offers an explicit full-screen action for the embedded player', () => {
    const requestFullscreen = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', {
      configurable: true,
      value: requestFullscreen,
    });
    renderLearningCenter();

    const video = LEARNING_VIDEOS[2];
    fireEvent.click(
      screen.getByRole('button', { name: `Play ${video.sequence}: ${video.title} in EMOS` }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Full screen' }));

    expect(requestFullscreen).toHaveBeenCalledTimes(1);
  });

  it('marks a video without a verified file ID as unavailable and creates no iframe', () => {
    const unavailableVideo: LearningVideo = {
      ...LEARNING_VIDEOS[0],
      driveFileId: undefined,
    };
    renderLearningCenter([unavailableVideo]);

    expect(
      screen.getByRole('button', {
        name: `Video temporarily unavailable for ${unavailableVideo.sequence}: ${unavailableVideo.title}`,
      }),
    ).toBeDisabled();
    expect(screen.queryByRole('button', { name: /Play .* in EMOS/i })).not.toBeInTheDocument();
    expect(screen.queryByTitle(/video player/i)).not.toBeInTheDocument();
  });
});
