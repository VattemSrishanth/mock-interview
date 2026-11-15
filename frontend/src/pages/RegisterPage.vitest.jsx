import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from './RegisterPage';
import { authApi } from '../api/auth';

const mockRegister = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    register: mockRegister,
    user: null,
    token: null
  })
}));

vi.mock('../api/auth', () => ({
  authApi: {
    sendVerificationCode: vi.fn()
  }
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('RegisterPage - Email Verification & Explicit Login Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => cleanup());

  it('renders registration form with email verification inputs', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/alex chen/i)).toBeTruthy();
    expect(screen.getByPlaceholderText(/alex@example.com/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /send code/i })).toBeTruthy();
    expect(screen.getByPlaceholderText(/enter 6-digit code/i)).toBeTruthy();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeTruthy();
  });

  it('validates email format before sending verification code', async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText(/alex@example.com/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email-no-domain' } });

    const sendCodeBtn = screen.getByRole('button', { name: /send code/i });
    fireEvent.click(sendCodeBtn);

    expect(
      await screen.findByText(/please enter a valid email address with a domain/i)
    ).toBeTruthy();
    expect(authApi.sendVerificationCode).not.toHaveBeenCalled();
  });

  it('sends verification code securely without exposing the code on screen', async () => {
    authApi.sendVerificationCode.mockResolvedValueOnce({
      success: true,
      message: 'Verification code sent to candidate@example.com'
    });

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText(/alex@example.com/i);
    fireEvent.change(emailInput, { target: { value: 'candidate@example.com' } });

    const sendCodeBtn = screen.getByRole('button', { name: /send code/i });
    fireEvent.click(sendCodeBtn);

    await waitFor(() => {
      expect(authApi.sendVerificationCode).toHaveBeenCalledWith('candidate@example.com');
    });

    expect(
      await screen.findByText(/verification code sent to candidate@example.com/i)
    ).toBeTruthy();

    // Security: Ensure no 'Fill: ' button exists
    expect(screen.queryByText(/fill:/i)).toBeNull();
  });

  it('shows error if duplicate email is rejected by the server', async () => {
    authApi.sendVerificationCode.mockRejectedValueOnce({
      response: {
        data: {
          message: 'An account with this email already exists. Please log in instead.'
        }
      }
    });

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText(/alex@example.com/i);
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });

    const sendCodeBtn = screen.getByRole('button', { name: /send code/i });
    fireEvent.click(sendCodeBtn);

    expect(
      await screen.findByText(/an account with this email already exists/i)
    ).toBeTruthy();
  });

  it('submits registration with verification code and redirects to /login (requires explicit login)', async () => {
    authApi.sendVerificationCode.mockResolvedValueOnce({
      success: true,
      message: 'Verification code sent'
    });

    mockRegister.mockResolvedValueOnce({
      requiresLogin: true,
      message: 'Registration successful'
    });

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    // Fill form
    fireEvent.change(screen.getByPlaceholderText(/alex chen/i), { target: { value: 'Alex Morgan' } });
    fireEvent.change(screen.getByPlaceholderText(/alex@example.com/i), { target: { value: 'alex.morgan@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'SecurePass123!' } });

    // Send code
    fireEvent.click(screen.getByRole('button', { name: /send code/i }));
    await screen.findByText(/verification code sent/i);

    // Enter verification code manually
    const codeInput = screen.getByPlaceholderText(/enter 6-digit code/i);
    fireEvent.change(codeInput, { target: { value: '654321' } });

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /create account & verify/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Alex Morgan',
          email: 'alex.morgan@test.com',
          verificationCode: '654321'
        })
      );
    });

    // Verify navigation strictly redirected to /login with state, NOT /dashboard
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login', {
        state: {
          registeredEmail: 'alex.morgan@test.com',
          message: 'Account created successfully! For security, please sign in with your email and password.'
        }
      });
    });
  });

  it('restores draft form data from localStorage so candidate details are not lost', () => {
    localStorage.setItem(
      'intervai_reg_draft_v1',
      JSON.stringify({
        name: 'Sarah Connor',
        email: 'sarah.connor@sky.net',
        targetRole: 'Full Stack Engineer'
      })
    );

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    const nameInput = screen.getByPlaceholderText(/alex chen/i);
    const emailInput = screen.getByPlaceholderText(/alex@example.com/i);
    expect(nameInput.value).toBe('Sarah Connor');
    expect(emailInput.value).toBe('sarah.connor@sky.net');
  });

  it('applies email and verification code when visiting via one-click link params', async () => {
    render(
      <MemoryRouter initialEntries={['/register?email=candidate%40mail.com&code=123456']}>
        <RegisterPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText(/alex@example.com/i);
    const codeInput = screen.getByPlaceholderText(/enter 6-digit code/i);

    expect(emailInput.value).toBe('candidate@mail.com');
    expect(codeInput.value).toBe('123456');
    expect(await screen.findByText(/verification code applied from your email link/i)).toBeTruthy();
  });
});
