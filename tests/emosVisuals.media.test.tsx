// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { reducedMotion } = vi.hoisted(() => ({ reducedMotion: vi.fn(() => false) }));
vi.mock('motion/react', () => ({ useReducedMotion: reducedMotion }));

import { EmosHeroVisual, hasConstrainedNetwork } from '../src/components/EmosVisuals';

function setMatchMedia(matches = false) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn(() => ({
      matches,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
}

function setConnection(connection: { saveData?: boolean; effectiveType?: string } | undefined) {
  Object.defineProperty(navigator, 'connection', { configurable: true, value: connection });
}

describe('EMOS landing media', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setMatchMedia(false);
    setConnection(undefined);
    reducedMotion.mockReturnValue(false);
    Object.defineProperty(HTMLMediaElement.prototype, 'play', { configurable: true, value: vi.fn(() => Promise.resolve()) });
    Object.defineProperty(HTMLMediaElement.prototype, 'pause', { configurable: true, value: vi.fn() });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders the optimized poster before it loads the walkthrough', () => {
    render(<EmosHeroVisual />);
    expect(screen.getByRole('img')).toHaveAttribute('src', '/assets/emos/emos-product-hero-production-v2.png');
    expect(screen.getByRole('img').parentElement?.querySelector('source')).toHaveAttribute('srcset', '/assets/emos/emos-product-hero-production-v2-performance.webp');
    expect(screen.queryByTestId('emos-hero-video')).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(800));
    expect(screen.getByTestId('emos-hero-video')).toHaveAttribute('preload', 'metadata');
  });

  it('keeps the static poster for reduced-motion users', () => {
    reducedMotion.mockReturnValue(true);
    render(<EmosHeroVisual />);
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.queryByTestId('emos-hero-video')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /walkthrough/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Motion is disabled/i)).toBeInTheDocument();
  });

  it('holds autoplay on constrained connections but permits an explicit user request', () => {
    setConnection({ saveData: true, effectiveType: '2g' });
    render(<EmosHeroVisual />);
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.queryByTestId('emos-hero-video')).not.toBeInTheDocument();
    expect(screen.getByText(/data-saving or slow-network preference/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Play walkthrough' }));
    expect(screen.getByTestId('emos-hero-video')).toBeInTheDocument();
  });

  it('falls back cleanly to the poster when the video fails', () => {
    render(<EmosHeroVisual />);
    act(() => vi.advanceTimersByTime(800));
    fireEvent.error(screen.getByTestId('emos-hero-video'));
    expect(screen.queryByTestId('emos-hero-video')).not.toBeInTheDocument();
    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Play walkthrough' })).toBeInTheDocument();
  });

  it('offers a keyboard-accessible Play/Pause control', () => {
    setMatchMedia(true);
    render(<EmosHeroVisual />);
    const control = screen.getByRole('button', { name: 'Play walkthrough' });
    expect(control).toHaveAttribute('aria-pressed', 'false');
    control.focus();
    fireEvent.keyDown(control, { key: 'Enter' });
    fireEvent.click(control);
    expect(screen.getByRole('button', { name: 'Pause walkthrough' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('pauses playback when the landing media leaves the viewport', () => {
    let visible = true;
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => ({
      bottom: visible ? 300 : -1,
      height: 300,
      left: 0,
      right: 500,
      top: visible ? 0 : -301,
      width: 500,
      x: 0,
      y: visible ? 0 : -301,
      toJSON: () => ({}),
    }));
    const pause = vi.spyOn(HTMLMediaElement.prototype, 'pause');
    render(<EmosHeroVisual />);
    act(() => vi.advanceTimersByTime(800));
    visible = false;
    act(() => window.dispatchEvent(new Event('scroll')));
    expect(pause).toHaveBeenCalled();
  });

  it('preserves the synthetic-data disclosure', () => {
    render(<EmosHeroVisual />);
    expect(screen.getByText(/Captured from the live EMOS public evaluation sandbox using synthetic enterprise data/i)).toBeInTheDocument();
  });

  it('recognizes Data Saver, 2G and slow 2G connections', () => {
    expect(hasConstrainedNetwork({ saveData: true })).toBe(true);
    expect(hasConstrainedNetwork({ effectiveType: '2g' })).toBe(true);
    expect(hasConstrainedNetwork({ effectiveType: 'slow-2g' })).toBe(true);
    expect(hasConstrainedNetwork({ effectiveType: '3g' })).toBe(false);
  });
});
