import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import InterviewTimerBadge from './InterviewTimerBadge';
import KeyboardShortcutsHint from './KeyboardShortcutsHint';

describe('InterviewTimerBadge and KeyboardShortcutsHint Components', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders Introductory, Optimal Pacing, and Wrap-up stages cleanly', () => {
    const { rerender } = render(<InterviewTimerBadge elapsedSeconds={20} isRecording={false} />);
    expect(screen.getByText('00:20')).toBeDefined();
    expect(screen.getByText('Introductory')).toBeDefined();
    expect(screen.queryByText('REC LIVE')).toBeNull();

    rerender(<InterviewTimerBadge elapsedSeconds={95} isRecording={true} />);
    expect(screen.getByText('01:35')).toBeDefined();
    expect(screen.getByText('Optimal Pacing')).toBeDefined();
    expect(screen.getByText('REC LIVE')).toBeDefined();

    rerender(<InterviewTimerBadge elapsedSeconds={195} isRecording={false} />);
    expect(screen.getByText('03:15')).toBeDefined();
    expect(screen.getByText('Wrap-up Suggested')).toBeDefined();
  });

  it('toggles keyboard shortcuts dialog open and closed', () => {
    render(<KeyboardShortcutsHint />);
    const toggleBtn = screen.getByRole('button', { name: /Toggle keyboard shortcuts/i });
    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.click(toggleBtn);
    expect(screen.getByRole('dialog', { name: /Interview keyboard shortcuts/i })).toBeDefined();
    expect(screen.getByText(/Submit current response/i)).toBeDefined();

    const closeBtn = screen.getByRole('button', { name: /Close shortcuts/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
