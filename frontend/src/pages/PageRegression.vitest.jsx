import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CreateInterviewPage from './CreateInterviewPage';
import InterviewResultPage from './InterviewResultPage';
import AnalyticsPage from './AnalyticsPage';
import { interviewApi } from '../api/interview';
import { analyticsApi } from '../api/analytics';

const { useAuth } = vi.hoisted(() => ({ useAuth: vi.fn() }));
vi.mock('../context/AuthContext', () => ({ useAuth }));
vi.mock('../api/interview', () => ({ interviewApi: {
  create: vi.fn(), getResult: vi.fn()
} }));
vi.mock('../api/analytics', () => ({ analyticsApi: { getAnalytics: vi.fn() } }));
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

afterEach(() => cleanup());

globalThis.ResizeObserver = class {
  observe() { }
  unobserve() { }
  disconnect() { }
};

describe('interview setup and reporting pages', () => {
  it('submits the interview setup and opens the created interview lobby', async () => {
    useAuth.mockReturnValue({ user: { targetRole: 'Backend Developer', experience: 'Mid' } });
    interviewApi.create.mockResolvedValue({ id: 99 });
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/create']}>
        <Routes>
          <Route path="/create" element={<CreateInterviewPage />} />
          <Route path="/interviews/:id/lobby" element={<p>Interview lobby</p>} />
        </Routes>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /generate & launch interview simulation/i }));
    await waitFor(() => expect(interviewApi.create).toHaveBeenCalledWith(expect.objectContaining({
      jobRole: 'Backend Developer',
      experience: 'Mid',
      interviewType: 'Technical',
      skills: expect.arrayContaining(['Java', 'Spring Boot'])
    })));
    expect(await screen.findByText('Interview lobby')).toBeTruthy();
  });

  it('renders provider-backed results and analytics from mocked API data', async () => {
    interviewApi.getResult.mockResolvedValue({
      jobRole: 'Backend Engineer', interviewType: 'Technical', evaluationSource: 'AI_PROVIDER',
      overallScore: 86, technicalKnowledgeScore: 88, communicationScore: 84, relevanceScore: 86,
      clarityScore: 85, confidenceScore: 87, status: 'COMPLETED', strengths: [], weaknesses: [],
      suggestions: [], questions: [], skillBreakdown: {}
    });
    analyticsApi.getAnalytics.mockResolvedValue({
      totalInterviews: 4, completedInterviews: 3, averageScore: 82,
      skillWisePerformance: [{ skill: 'Java', score: 82, evaluated: 3 }],
      performanceOverTime: [{ date: '2026-10-20', score: 82, technical: 83, communication: 80 }],
      topStrengths: [], weakestAreas: [], recommendedPractice: []
    });

    const { unmount } = render(
      <MemoryRouter initialEntries={['/interviews/7/result']}>
        <Routes><Route path="/interviews/:id/result" element={<InterviewResultPage />} /></Routes>
      </MemoryRouter>
    );
    expect(await screen.findByText('Backend Engineer Performance Scorecard')).toBeTruthy();
    expect(screen.getAllByText('86%').length).toBeGreaterThan(0);
    unmount();

    render(<MemoryRouter><AnalyticsPage /></MemoryRouter>);
    expect(await screen.findByRole('heading', { name: /performance & readiness analytics/i })).toBeTruthy();
    expect(screen.getAllByText(/82%/).length).toBeGreaterThan(0);
  });
});
