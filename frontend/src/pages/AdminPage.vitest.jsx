import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminPage from './AdminPage';
import { adminApi } from '../api/admin';

vi.mock('../api/admin', () => ({
  adminApi: {
    getStats: vi.fn(),
    getUsers: vi.fn(),
    getInterviews: vi.fn()
  }
}));

const sampleStats = {
  totalUsers: 12,
  totalInterviews: 34,
  platformAverageScore: 84,
  activeToday: 5
};

const sampleUsers = [
  {
    id: 1,
    name: 'V Srishanth',
    email: 'srishanth@intervai.com',
    targetRole: 'Backend Developer',
    experience: 'Mid-Level',
    interviewStreak: 6,
    roles: ['ROLE_USER']
  },
  {
    id: 2,
    name: 'Platform Admin',
    email: 'admin@intervai.com',
    targetRole: 'System Architect',
    experience: 'Senior',
    interviewStreak: 2,
    roles: ['ROLE_ADMIN']
  }
];

const sampleInterviews = [
  {
    id: 501,
    jobRole: 'Distributed Systems Engineer',
    interviewType: 'System Design',
    difficulty: 'Hard',
    overallScore: 89,
    status: 'COMPLETED',
    createdAt: '2026-11-12T10:00:00Z'
  },
  {
    id: 502,
    jobRole: 'Frontend Engineer',
    interviewType: 'Technical',
    difficulty: 'Easy',
    overallScore: null,
    status: 'CREATED',
    createdAt: null
  }
];

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => cleanup());

describe('AdminPage', () => {
  it('renders platform metrics, supports candidate search & reset, and switches to interviews tab', async () => {
    adminApi.getStats.mockResolvedValueOnce(sampleStats);
    adminApi.getUsers.mockResolvedValueOnce(sampleUsers);
    adminApi.getInterviews.mockResolvedValueOnce(sampleInterviews);

    const user = userEvent.setup();
    render(<AdminPage />);

    expect(await screen.findByText('Administrator Console')).toBeTruthy();
    expect(screen.getByText('12')).toBeTruthy();
    expect(screen.getByText('34')).toBeTruthy();
    expect(screen.getByText('84%')).toBeTruthy();
    expect(screen.getByText('Showing 2 of 2 candidates')).toBeTruthy();
    expect(screen.getByText('V Srishanth')).toBeTruthy();

    const searchInput = screen.getByPlaceholderText(/search records/i);
    await user.type(searchInput, 'Admin');
    expect(screen.queryByText('V Srishanth')).toBeNull();
    expect(screen.getByText('Showing 1 of 2 candidates')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /clear search/i }));
    expect(screen.getByText('V Srishanth')).toBeTruthy();

    await user.type(searchInput, 'no-match-query');
    expect(screen.getByText(/no candidate records match/i)).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /clear search filter/i }));
    expect(screen.getByText('V Srishanth')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /all platform interviews/i }));
    expect(screen.getByText('Showing 2 of 2 interviews')).toBeTruthy();
    expect(screen.getByText('Distributed Systems Engineer')).toBeTruthy();
    expect(screen.getByText('89%')).toBeTruthy();
    expect(screen.getByText('N/A')).toBeTruthy();
    expect(screen.getByText('Date unavailable')).toBeTruthy();
  });

  it('handles rejected admin API requests gracefully without crashing', async () => {
    adminApi.getStats.mockRejectedValueOnce(new Error('Network error'));
    adminApi.getUsers.mockRejectedValueOnce(new Error('Network error'));
    adminApi.getInterviews.mockRejectedValueOnce(new Error('Network error'));

    render(<AdminPage />);

    expect(await screen.findByText('Administrator Console')).toBeTruthy();
    expect(screen.getByText('No registered candidates found.')).toBeTruthy();
  });
});

