import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import InboxPage from './InboxPage';
import { authApi } from '../api/auth';

vi.mock('../api/auth', () => ({
  authApi: {
    getInbox: vi.fn(),
    clearInbox: vi.fn()
  }
}));

describe('InboxPage Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve())
      }
    });
  });

  it('renders empty mailbox state when no emails are present', async () => {
    authApi.getInbox.mockResolvedValueOnce([]);

    render(
      <MemoryRouter initialEntries={['/inbox?email=candidate%40gmail.com']}>
        <InboxPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/your mailbox is empty/i)).toBeTruthy();
    expect(screen.getByText(/candidate secure mailbox/i)).toBeTruthy();
  });

  it('renders received verification email with 6-digit code and 1-click verify links', async () => {
    const mockMessage = {
      id: 'msg-123',
      to: 'candidate@gmail.com',
      from: 'IntervAI Security <security@intervai.com>',
      subject: 'Your IntervAI Verification Code: 998877',
      previewText: 'Your 6-digit security code is 998877.',
      bodyHtml: '<p>Click here to verify</p>',
      code: '998877',
      verificationLink: 'http://localhost:5173/register?email=candidate%40gmail.com&code=998877',
      sentAt: new Date().toISOString(),
      read: false
    };

    authApi.getInbox.mockResolvedValue([mockMessage]);

    render(
      <MemoryRouter initialEntries={['/inbox?email=candidate%40gmail.com']}>
        <InboxPage />
      </MemoryRouter>
    );

    // Verify email subject and code are rendered
    const codeElements = await screen.findAllByText(/998877/);
    expect(codeElements.length).toBeGreaterThanOrEqual(2);

    // Verify copy code button functions
    const copyBtn = screen.getByRole('button', { name: /copy code/i });
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('998877');

    // Verify 1-click verify links exist and point to the verification link
    const verifyLinks = screen.getAllByRole('link', { name: /1-click verify/i });
    expect(verifyLinks.length).toBeGreaterThan(0);
    expect(verifyLinks[0].getAttribute('href')).toContain('code=998877');
  });
});
