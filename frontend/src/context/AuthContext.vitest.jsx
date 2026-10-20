import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { authApi } from '../api/auth';

vi.mock('../api/auth', () => ({ authApi: {
  login: vi.fn(), register: vi.fn(), getProfile: vi.fn()
} }));

function AuthProbe() {
  const { isAuthenticated, isAdmin, login, logout } = useAuth();
  return (
    <div>
      <p>{isAuthenticated ? 'Authenticated' : 'Signed out'}</p>
      <p>{isAdmin ? 'Admin' : 'Candidate'}</p>
      <button onClick={() => login({ email: 'candidate@example.com', password: 'password' })}>Log in</button>
      <button onClick={logout}>Log out</button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  authApi.login.mockResolvedValue({ token: 'jwt-test-token', id: 1, name: 'Candidate', email: 'candidate@example.com', roles: ['ROLE_STUDENT'] });
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('AuthContext', () => {
  it('stores the login token and user, then clears both on logout', async () => {
    render(<AuthProvider><AuthProbe /></AuthProvider>);
    expect(screen.getByText('Signed out')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));
    await waitFor(() => expect(screen.getByText('Authenticated')).toBeTruthy());
    expect(localStorage.getItem('token')).toBe('jwt-test-token');
    expect(JSON.parse(localStorage.getItem('user')).email).toBe('candidate@example.com');
    expect(screen.getByText('Candidate')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Log out' }));
    expect(screen.getByText('Signed out')).toBeTruthy();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});
