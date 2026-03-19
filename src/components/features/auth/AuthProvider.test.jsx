import { useContext } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider } from './AuthProvider';
import { AuthContext } from './AuthContext';

import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

vi.mock('firebase/auth', () => ({
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

vi.mock('../../../services/firebase', () => ({
  auth: { name: 'auth' },
  googleProvider: { name: 'provider' },
}));

vi.mock('../../../services/api', () => ({
  validateInvestor: vi.fn(() => Promise.resolve({ valid: true })),
  loginWithEmailPassword: vi.fn(),
}));

import { validateInvestor } from '../../../services/api';

const ContextConsumer = () => {
  const { user, loading, loginWithGoogle, loginWithEmail, logout, validationError } =
    useContext(AuthContext);
  return (
    <div>
      <div>{loading ? 'loading' : 'ready'}</div>
      <div>{user?.email ?? 'no-user'}</div>
      {validationError && <div data-testid="validation-error">{validationError}</div>}
      <button onClick={loginWithGoogle}>loginGoogle</button>
      <button onClick={() => loginWithEmail('a@b.com', 'pass123')}>loginEmail</button>
      <button onClick={logout}>logout</button>
    </div>
  );
};

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.localStorage?.clear();
  });

  it('sets user from onAuthStateChanged and stops loading', async () => {
    onAuthStateChanged.mockImplementation((_auth, cb) => {
      cb({ email: 'test@example.com' });
      return () => {};
    });

    render(
      <AuthProvider>
        <ContextConsumer />
      </AuthProvider>,
    );

    expect(await screen.findByText('ready')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('loginWithGoogle calls signInWithPopup and validates investor', async () => {
    onAuthStateChanged.mockImplementation((_auth, cb) => {
      cb(null);
      return () => {};
    });
    signInWithPopup.mockResolvedValueOnce({ user: { email: 'a@b.com' } });

    render(
      <AuthProvider>
        <ContextConsumer />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByText('loginGoogle'));

    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalledTimes(1);
    });
    expect(validateInvestor).toHaveBeenCalledWith('a@b.com');
  });

  it('loginWithEmail stores session and sets user on success', async () => {
    const { loginWithEmailPassword } = await import('../../../services/api');
    loginWithEmailPassword.mockResolvedValueOnce({
      data: { email: 'a@b.com', name: 'Test User' },
      error: null,
    });
    onAuthStateChanged.mockImplementation((_auth, cb) => {
      cb(null);
      return () => {};
    });

    render(
      <AuthProvider>
        <ContextConsumer />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByText('loginEmail'));

    await waitFor(() => {
      expect(screen.getByText('a@b.com')).toBeInTheDocument();
    });
    expect(loginWithEmailPassword).toHaveBeenCalledWith('a@b.com', 'pass123');
  });

  it('loginWithEmail sets validationError on API error', async () => {
    const { loginWithEmailPassword } = await import('../../../services/api');
    loginWithEmailPassword.mockResolvedValueOnce({
      data: null,
      error: 'Credenciales inválidas',
    });
    onAuthStateChanged.mockImplementation((_auth, cb) => {
      cb(null);
      return () => {};
    });

    render(
      <AuthProvider>
        <ContextConsumer />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByText('loginEmail'));

    await waitFor(() => {
      expect(screen.getByTestId('validation-error')).toHaveTextContent('Credenciales inválidas');
    });
  });

  it('logout calls signOut', async () => {
    onAuthStateChanged.mockImplementation((_auth, cb) => {
      cb({ email: 'test@example.com' });
      return () => {};
    });
    signOut.mockResolvedValueOnce();

    render(
      <AuthProvider>
        <ContextConsumer />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByText('logout'));
    await waitFor(() => {
      expect(signOut).toHaveBeenCalledTimes(1);
    });
  });

  it('restores user from stored session on mount', async () => {
    const session = { email: 'stored@example.com', name: 'Stored', authMethod: 'email' };
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify(session));
    onAuthStateChanged.mockImplementation((_auth, cb) => {
      cb(null);
      return () => {};
    });

    render(
      <AuthProvider>
        <ContextConsumer />
      </AuthProvider>,
    );

    expect(await screen.findByText('stored@example.com')).toBeInTheDocument();
    expect(screen.getByText('ready')).toBeInTheDocument();
  });

  it('loginWithGoogle sets validationError when investor not found', async () => {
    validateInvestor.mockResolvedValueOnce({
      valid: false,
      error: 'Investor not found in database',
    });
    signInWithPopup.mockResolvedValueOnce({ user: { email: 'new@example.com' } });
    onAuthStateChanged.mockImplementation((_auth, cb) => {
      cb(null);
      return () => {};
    });

    render(
      <AuthProvider>
        <ContextConsumer />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByText('loginGoogle'));

    await waitFor(() => {
      expect(screen.getByTestId('validation-error')).toHaveTextContent(
        /No estás registrado como inversor/,
      );
    });
    expect(signOut).toHaveBeenCalled();
  });

  it('loginWithGoogle sets validationError when account inactive', async () => {
    validateInvestor.mockResolvedValueOnce({
      valid: false,
      error: 'Investor account is not active',
    });
    signInWithPopup.mockResolvedValueOnce({ user: { email: 'inactive@example.com' } });
    onAuthStateChanged.mockImplementation((_auth, cb) => {
      cb(null);
      return () => {};
    });

    render(
      <AuthProvider>
        <ContextConsumer />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByText('loginGoogle'));

    await waitFor(() => {
      expect(screen.getByTestId('validation-error')).toHaveTextContent(
        /Tu cuenta de inversor no está activa/,
      );
    });
  });

  it('logout returns error when signOut throws', async () => {
    onAuthStateChanged.mockImplementation((_auth, cb) => {
      cb({ email: 'test@example.com' });
      return () => {};
    });
    signOut.mockRejectedValueOnce(new Error('Sign out failed'));

    render(
      <AuthProvider>
        <ContextConsumer />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByText('logout'));
    await waitFor(() => {
      expect(signOut).toHaveBeenCalledTimes(1);
    });
  });

  it('loginWithGoogle sets validationError for generic validation error', async () => {
    validateInvestor.mockResolvedValueOnce({
      valid: false,
      error: 'Custom validation error',
    });
    signInWithPopup.mockResolvedValueOnce({ user: { email: 'custom@example.com' } });
    onAuthStateChanged.mockImplementation((_auth, cb) => {
      cb(null);
      return () => {};
    });

    render(
      <AuthProvider>
        <ContextConsumer />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByText('loginGoogle'));

    await waitFor(() => {
      expect(screen.getByTestId('validation-error')).toHaveTextContent(
        /Error de validación: Custom validation error/,
      );
    });
  });

  it('loginWithGoogle returns error when popup throws', async () => {
    signInWithPopup.mockRejectedValueOnce(new Error('Network error'));
    onAuthStateChanged.mockImplementation((_auth, cb) => {
      cb(null);
      return () => {};
    });

    render(
      <AuthProvider>
        <ContextConsumer />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByText('loginGoogle'));

    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalledTimes(1);
    });
  });
});
