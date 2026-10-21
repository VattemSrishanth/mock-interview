import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import LiveInterviewPage from './LiveInterviewPage';
import { interviewApi } from '../api/interview';

vi.mock('../api/interview', () => ({ interviewApi: {
  getById: vi.fn(), submitAnswer: vi.fn(), complete: vi.fn()
} }));

let recognition;
class MockRecognition {
  constructor() { recognition = this; }
  start() { this.onstart?.(); }
  stop() { this.onend?.(); }
  emit(transcripts) {
    this.onresult?.({ results: transcripts.map(([transcript, isFinal]) => Object.assign([{ transcript }], { isFinal })) });
  }
}

function LocationProbe() {
  return <p data-testid="route">{useLocation().pathname}</p>;
}

function renderLive() {
  return render(
    <MemoryRouter initialEntries={['/interviews/42/live']}>
      <LocationProbe />
      <Routes>
        <Route path="/interviews/:id/live" element={<LiveInterviewPage />} />
        <Route path="/interviews/:id/result" element={<p>Result page</p>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  recognition = null;
  interviewApi.getById.mockResolvedValue({
    id: 42, status: 'IN_PROGRESS', jobRole: 'Backend Engineer', interviewType: 'Technical', difficulty: 'Medium',
    questions: [
      { id: 1, questionText: 'Explain transactions.', targetSkill: 'Java', difficulty: 'Medium', isAnswered: false },
      { id: 2, questionText: 'Explain indexing.', targetSkill: 'SQL', difficulty: 'Medium', isAnswered: false }
    ]
  });
  interviewApi.submitAnswer.mockImplementation(async (_id, payload) => ({
    id: payload.questionId,
    questionText: payload.questionId === 1 ? 'Explain transactions.' : 'Explain indexing.',
    isAnswered: true,
    feedback: { evaluationSource: 'HEURISTIC', strengths: ['Answer saved'], weaknesses: [], suggestions: [] }
  }));
  interviewApi.complete.mockResolvedValue({});
  Object.defineProperty(window, 'SpeechRecognition', { configurable: true, value: MockRecognition });
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: { cancel: vi.fn(), speak: vi.fn() } });
  globalThis.SpeechSynthesisUtterance = class { };
});

afterEach(() => cleanup());

describe('LiveInterviewPage', () => {
  it('preserves typed input, appends finalized speech, and submits the combined answer', async () => {
    const user = userEvent.setup();
    renderLive();
    const textarea = await screen.findByRole('textbox');
    await user.type(textarea, 'My typed thought.');
    await user.click(screen.getByRole('button', { name: /voice input/i }));
    act(() => recognition.emit([['Recognized explanation.', true]]));

    expect(textarea.value).toBe('My typed thought.');
    await waitFor(() => expect(document.body.textContent).toContain('Recognized explanation.'));
    expect(document.body.textContent).toContain('Combined answer preview: My typed thought.\nRecognized explanation.');

    await user.click(screen.getByRole('button', { name: /submit & evaluate answer/i }));
    await waitFor(() => expect(interviewApi.submitAnswer).toHaveBeenCalledWith('42', {
      questionId: 1,
      answerText: 'My typed thought.\nRecognized explanation.',
      isSkipped: false
    }));
  }, 15000);

  it('keeps manual submission available without browser speech recognition and reports API errors', async () => {
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    Object.defineProperty(window, 'SpeechRecognition', { configurable: true, value: undefined });
    interviewApi.submitAnswer.mockRejectedValueOnce({ response: { data: { message: 'Try again later.' } } });
    const user = userEvent.setup();
    renderLive();
    const textarea = await screen.findByRole('textbox');
    await user.type(textarea, 'Manual answer remains supported.');
    await user.click(screen.getByRole('button', { name: /submit & evaluate answer/i }));

    await waitFor(() => expect(interviewApi.submitAnswer).toHaveBeenCalledWith('42', expect.objectContaining({
      answerText: 'Manual answer remains supported.'
    })));
    expect(alert).toHaveBeenCalledWith('Try again later.');
    alert.mockRestore();
  });

  it('navigates through questions and completes the interview to the results page', async () => {
    const user = userEvent.setup();
    renderLive();
    await user.type(await screen.findByRole('textbox'), 'First answer');
    await user.click(screen.getByRole('button', { name: /submit & evaluate answer/i }));
    await user.click(await screen.findByRole('button', { name: /next question/i }));
    expect(await screen.findByText('"Explain indexing."')).toBeTruthy();

    await user.type(screen.getByRole('textbox'), 'Second answer');
    await user.click(screen.getByRole('button', { name: /submit & evaluate answer/i }));
    await user.click(await screen.findByRole('button', { name: /finish & view comprehensive scorecard/i }));

    await waitFor(() => expect(interviewApi.complete).toHaveBeenCalledWith('42'));
    expect(await screen.findByText('Result page')).toBeTruthy();
  });
});
