import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AuthContext } from '../components/features/auth/AuthContext';
import { useAuth } from './useAuth';

const Consumer = () => {
  const { user } = useAuth();
  return <div>{user?.email ?? 'no-user'}</div>;
};

describe('useAuth', () => {
  it('throws if used outside AuthProvider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Consumer />)).toThrow('useAuth must be used within AuthProvider');
    console.error.mockRestore();
  });

  it('returns context value when inside provider', () => {
    render(
      <AuthContext.Provider value={{ user: { email: 'test@example.com' } }}>
        <Consumer />
      </AuthContext.Provider>,
    );
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });
});
