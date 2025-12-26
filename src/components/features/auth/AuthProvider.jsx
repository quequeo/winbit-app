import { useState, useEffect } from 'react';
import { signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../../../services/firebase';

import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If we used signInWithRedirect, surface any redirect errors.
    getRedirectResult(auth).catch(() => {
      // Intentionally swallow here; UI handles login errors on demand.
    });

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    try {
      // Use redirect flow to avoid popup-related COOP warnings (window.close/window.closed)
      // and improve reliability in PWAs/in-app browsers.
      await signInWithRedirect(auth, googleProvider);
      return { user: null, error: null };
    } catch (error) {
      const code = error?.code;

      return {
        user: null,
        error: {
          code: code ?? 'auth/unknown',
          message: error?.message ?? 'Unknown authentication error',
        },
      };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  };

  const value = {
    user,
    loading,
    loginWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
