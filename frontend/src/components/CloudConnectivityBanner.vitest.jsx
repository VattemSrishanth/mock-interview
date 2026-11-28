import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import CloudConnectivityBanner from './CloudConnectivityBanner';

vi.mock('../hooks/useSystemHealth', () => ({
  useSystemHealth: vi.fn(),
}));

import { useSystemHealth } from '../hooks/useSystemHealth';

describe('CloudConnectivityBanner Component', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders nothing when backend is online', () => {
    useSystemHealth.mockReturnValue({
      isOnline: true,
      isChecking: false,
      checkHealth: vi.fn(),
    });

    const { container } = render(<CloudConnectivityBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('renders alert ribbon when backend is offline/waking', () => {
    const mockCheckHealth = vi.fn();
    useSystemHealth.mockReturnValue({
      isOnline: false,
      isChecking: false,
      checkHealth: mockCheckHealth,
    });

    render(<CloudConnectivityBanner />);
    expect(screen.getByText(/Backend Cloud Container Waking/i)).toBeDefined();

    const checkBtn = screen.getByRole('button', { name: /Check Status/i });
    expect(checkBtn).toBeDefined();
    fireEvent.click(checkBtn);
    expect(mockCheckHealth).toHaveBeenCalled();
  });

  it('can be dismissed by clicking the close button', () => {
    useSystemHealth.mockReturnValue({
      isOnline: false,
      isChecking: false,
      checkHealth: vi.fn(),
    });

    render(<CloudConnectivityBanner />);
    const dismissBtn = screen.getByRole('button', { name: /Dismiss cloud alert/i });
    fireEvent.click(dismissBtn);

    expect(screen.queryByText(/Backend Cloud Container Waking/i)).toBeNull();
  });

  it('shows Checking state and disables retry button while actively polling', () => {
    useSystemHealth.mockReturnValue({
      isOnline: false,
      isChecking: true,
      checkHealth: vi.fn(),
    });

    render(<CloudConnectivityBanner />);
    const btn = screen.getByRole('button', { name: /Checking\.\.\./i });
    expect(btn.disabled).toBe(true);
  });
});
