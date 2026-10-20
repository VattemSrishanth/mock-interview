import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

const { useAuth } = vi.hoisted(() => ({ useAuth: vi.fn() }));
vi.mock('../context/AuthContext', () => ({ useAuth }));

afterEach(() => cleanup());

function renderRoute(auth, requireAdmin = false) {
  useAuth.mockReturnValue(auth);
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route path="/login" element={<p>Login page</p>} />
        <Route path="/dashboard" element={<p>Dashboard page</p>} />
        <Route path="/protected" element={<ProtectedRoute requireAdmin={requireAdmin}><p>Protected page</p></ProtectedRoute>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  it('redirects unauthenticated users to login', () => {
    renderRoute({ loading: false, isAuthenticated: false, isAdmin: false });
    expect(screen.getByText('Login page')).toBeTruthy();
  });

  it('blocks candidate users from admin routes and allows administrators', () => {
    const { unmount } = renderRoute({ loading: false, isAuthenticated: true, isAdmin: false }, true);
    expect(screen.getByText('Dashboard page')).toBeTruthy();
    unmount();

    renderRoute({ loading: false, isAuthenticated: true, isAdmin: true }, true);
    expect(screen.getByText('Protected page')).toBeTruthy();
  });

  it('keeps the route behind the loading state while authentication initializes', () => {
    renderRoute({ loading: true, isAuthenticated: false, isAdmin: false });
    expect(screen.getByText(/authenticating your secure session/i)).toBeTruthy();
  });
});
