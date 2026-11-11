import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import HistoryPage from './HistoryPage';
import { interviewApi } from '../api/interview';

vi.mock('../api/interview', () => ({
  interviewApi: {
    getAll: vi.fn(),
    delete: vi.fn()
  }
}));

const sampleHistory = [
  {
    id: 101,
    jobRole: 'Backend Engineer',
    interviewType: 'Technical',
    difficulty: 'Hard',
    status: 'COMPLETED',
    overallScore: 92,
    createdAt: '2026-11-10T10:00:00Z',
    questions: [{ id: 1 }, { id: 2 }, { id: 3 }]
  },
  {
    id: 102,
    jobRole: 'Frontend Developer',
    interviewType: 'Behavioral',
    difficulty: 'Easy',
    status: 'IN_PROGRESS',
    overallScore: null,
    createdAt: null,
    questions: [{ id: 4 }]
  }
];

function renderHistory() {
  return render(
    <MemoryRouter initialEntries={['/history']}>
      <Routes>
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/create" element={<p>Create interview page</p>} />
        <Route path="/interviews/:id/result" element={<p>Result view</p>} />
        <Route path="/interviews/:id" element={<p>Session view</p>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => cleanup());

describe('HistoryPage', () => {
  it('renders sessions, counts, safe dates, and supports search clear & filter reset', async () => {
    interviewApi.getAll.mockResolvedValueOnce(sampleHistory);
    const user = userEvent.setup();
    renderHistory();

    expect(await screen.findByText('Backend Engineer')).toBeTruthy();
    expect(screen.getByText('Frontend Developer')).toBeTruthy();
    expect(screen.getByText('Date unavailable')).toBeTruthy();
    expect(screen.getByText((_, node) => node?.tagName === 'SPAN' && node?.textContent === 'Showing 2 of 2 interviews')).toBeTruthy();

    const searchInput = screen.getByPlaceholderText(/search by role or category/i);
    await user.type(searchInput, 'Backend');
    expect(screen.queryByText('Frontend Developer')).toBeNull();
    expect(screen.getByText((_, node) => node?.tagName === 'SPAN' && node?.textContent === 'Showing 1 of 2 interviews')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /clear search/i }));
    expect(screen.getByText('Frontend Developer')).toBeTruthy();

    await user.selectOptions(screen.getByTitle(/filter by difficulty/i), 'Medium');
    expect(screen.getByText(/no interview records found matching your filters/i)).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /reset filters/i }));
    expect(screen.getByText('Backend Engineer')).toBeTruthy();
    expect(screen.getByText('Frontend Developer')).toBeTruthy();
  });

  it('shows zero-history CTA when user has no sessions and surfaces inline delete errors', async () => {
    interviewApi.getAll.mockResolvedValueOnce([]);
    const { unmount } = renderHistory();
    expect(await screen.findByText(/no mock interviews recorded yet/i)).toBeTruthy();
    expect(screen.getByRole('link', { name: /start your first interview/i })).toBeTruthy();
    unmount();

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    interviewApi.getAll.mockResolvedValueOnce(sampleHistory);
    interviewApi.delete.mockRejectedValueOnce(new Error('Server unavailable'));

    const user = userEvent.setup();
    renderHistory();
    await screen.findByText('Backend Engineer');

    await user.click(screen.getByRole('button', { name: /delete backend engineer session/i }));
    expect(await screen.findByText(/failed to delete interview record/i)).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /dismiss error/i }));
    await waitFor(() => expect(screen.queryByText(/failed to delete interview record/i)).toBeNull());
    confirmSpy.mockRestore();
  });
});

