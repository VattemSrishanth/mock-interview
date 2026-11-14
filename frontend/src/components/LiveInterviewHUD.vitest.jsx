import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import LiveAudioWave from './LiveAudioWave';
import InterviewerPersonaSelector from './InterviewerPersonaSelector';
import SpeechTelemetryWidget from './SpeechTelemetryWidget';

describe('LiveInterviewHUD and Dynamic Audio Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('LiveAudioWave', () => {
    it('renders idle standby state when neither mic nor AI is speaking', () => {
      render(<LiveAudioWave isActive={false} isAiSpeaking={false} />);
      const region = screen.getByRole('region');
      expect(region.getAttribute('aria-label')).toContain('AUDIO STANDBY');
      expect(screen.getByText('AUDIO STANDBY')).toBeTruthy();
    });

    it('displays active candidate microphone state and live meter indicator', () => {
      render(<LiveAudioWave isActive={true} isAiSpeaking={false} />);
      const region = screen.getByRole('region');
      expect(region.getAttribute('aria-label')).toContain('CANDIDATE MIC ACTIVE');
      expect(screen.getByText('CANDIDATE MIC ACTIVE')).toBeTruthy();
    });

    it('displays interviewer speaking status when AI audio is narrating', () => {
      render(<LiveAudioWave isActive={false} isAiSpeaking={true} />);
      const region = screen.getByRole('region');
      expect(region.getAttribute('aria-label')).toContain('INTERVIEWER SPEAKING');
      expect(screen.getByText('INTERVIEWER SPEAKING')).toBeTruthy();
    });
  });

  describe('InterviewerPersonaSelector', () => {
    it('renders interviewer personas and updates selection dynamically', () => {
      const handleSelect = vi.fn();
      render(
        <InterviewerPersonaSelector
          compact
          selectedPersonaId="sarah"
          onSelectPersona={handleSelect}
        />
      );

      expect(screen.getByText('Sarah')).toBeTruthy();
      expect(screen.getByText('Elena')).toBeTruthy();

      const elenaBtn = screen.getByText('Elena').closest('button');
      fireEvent.click(elenaBtn);
      expect(handleSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'elena' }));
    });

    it('shows real-time speaking activity indicator when activeVoiceStatus is speaking', () => {
      render(
        <InterviewerPersonaSelector
          selectedPersonaId="sarah"
          activeVoiceStatus="speaking"
        />
      );

      expect(screen.getByText('Speaking')).toBeTruthy();
    });
  });

  describe('SpeechTelemetryWidget', () => {
    it('returns null when there is no text and recording is inactive', () => {
      const { container } = render(<SpeechTelemetryWidget text="" durationSeconds={0} isRecording={false} />);
      expect(container.firstChild).toBeNull();
    });

    it('dynamically computes WPM, filler metrics, and renders breakdown toggle', () => {
      const sampleText = 'Um, in my last project, I basically designed a distributed caching service using Redis.';
      render(<SpeechTelemetryWidget text={sampleText} durationSeconds={10} isRecording={true} />);

      expect(screen.getByText('Live Speech & Cadence Telemetry')).toBeTruthy();
      expect(screen.getByText('RECORDING')).toBeTruthy();
      expect(screen.getByText('Pacing Rate')).toBeTruthy();
      expect(screen.getByText('Filler Words')).toBeTruthy();

      // Toggle details
      const toggleBtn = screen.getByRole('button', { name: /telemetry/i });
      fireEvent.click(toggleBtn);
      expect(screen.getByText('Detected Verbal Fillers:')).toBeTruthy();
    });
  });
});
