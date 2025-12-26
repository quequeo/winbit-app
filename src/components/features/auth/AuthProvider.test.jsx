import { useContext } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider } from './AuthProvider';
import { AuthContext } from './AuthContext';

import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

vi.mock('firebase/auth', () => ({
  signInWithPopup: vi.fn(),
  signInWithRedirect: vi.fn(),
  getRedirectResult: vi.fn(() => Promise.resolve(null)),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

vi.mock('../../../services/firebase', () => ({
  auth: { name: 'auth' },
  googleProvider: { name: 'provider' },
}));

const ContextConsumer = () => {
  const { user, loading, loginWithGoogle, logout } = useContext(AuthContext);
  return (
    <div>
      <div>{loading ? 'loading' : 'ready'}</div>
      <div>{user?.email ?? 'no-user'}</div>
      <button onClick={loginWithGoogle}>login</button>
      <button onClick={logout}>logout</button>
    </div>
  );
};

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it('loginWithGoogle calls signInWithPopup and returns user', async () => {
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

    fireEvent.click(screen.getByText('login'));

    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalledTimes(1);
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
});
