import { useState, useEffect, useCallback } from 'react';
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider } from '../../../services/firebase';
import { validateInvestor, loginWithEmailPassword as apiLoginEmail } from '../../../services/api';

import { AuthContext } from './AuthContext';

const SESSION_KEY = 'winbit_session';

const getStoredSession = () => {
  try {
    const raw = globalThis?.localStorage?.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.email && parsed?.authMethod === 'email') return parsed;
    return null;
  } catch {
    return null;
  }
};

const storeSession = (data) => {
  try {
    globalThis?.localStorage?.setItem(SESSION_KEY, JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
};

const clearStoredSession = () => {
  try {
    globalThis?.localStorage?.removeItem(SESSION_KEY);
  } catch {
    // ignore storage errors
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [validationError, setValidationError] = useState(null);
  const [isValidated, setIsValidated] = useState(false);

  useEffect(() => {
    const storedSession = getStoredSession();

    if (storedSession) {
      setUser({ email: storedSession.email, displayName: storedSession.name, authMethod: 'email' });
      setIsValidated(true);
      setLoading(false);
    }

    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          const validation = await validateInvestor(result.user.email);
          if (!validation.valid) {
            await signOut(auth);
          }
        }
      } catch (_error) {
        // Intentionally swallow here; UI handles login errors on demand.
      }
    };

    handleRedirectResult();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        clearStoredSession();
      } else if (!getStoredSession()) {
        setUser(null);
      }
      setLoading(false);
      setIsValidated(true);
    });

    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    setValidationError(null);
    setIsValidated(false);

    try {
      const result = await signInWithPopup(auth, googleProvider);

      const validation = await validateInvestor(result.user.email);

      if (!validation.valid) {
        let errorMessage = 'No estás autorizado para acceder a este portal.';
        if (validation.error === 'Investor not found in database') {
          errorMessage =
            'No estás registrado como inversor. Por favor contacta a winbit.cfds@gmail.com';
        } else if (validation.error === 'Investor account is not active') {
          errorMessage =
            'Tu cuenta de inversor no está activa. Por favor contacta a winbit.cfds@gmail.com';
        } else {
          errorMessage = `Error de validación: ${validation.error}. Contacta a winbit.cfds@gmail.com`;
        }

        setValidationError(errorMessage);
        setIsValidated(true);
        await signOut(auth);

        return {
          user: null,
          error: { code: 'auth/unauthorized', message: errorMessage },
        };
      }

      setValidationError(null);
      setIsValidated(true);
      return { user: result.user, error: null };
    } catch (error) {
      const code = error?.code;

      if (
        code === 'auth/popup-blocked' ||
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request'
      ) {
        await signInWithRedirect(auth, googleProvider);
        return { user: null, error: null };
      }

      return {
        user: null,
        error: {
          code: code ?? 'auth/unknown',
          message: error?.message ?? 'Unknown authentication error',
        },
      };
    }
  };

  const loginWithEmail = async (email, password) => {
    setValidationError(null);
    setIsValidated(false);

    const result = await apiLoginEmail(email, password);

    if (result.error) {
      setValidationError(result.error);
      setIsValidated(true);
      return {
        user: null,
        error: { code: 'auth/invalid-credentials', message: result.error },
      };
    }

    const investorUser = {
      email: result.data.email,
      displayName: result.data.name,
      authMethod: 'email',
    };

    storeSession({ email: result.data.email, name: result.data.name, authMethod: 'email' });
    setUser(investorUser);
    setValidationError(null);
    setIsValidated(true);

    return { user: investorUser, error: null };
  };

  const logout = useCallback(async () => {
    try {
      clearStoredSession();
      setUser(null);
      await signOut(auth);
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  }, []);

  const value = {
    user,
    loading,
    loginWithGoogle,
    loginWithEmail,
    logout,
    validationError,
    clearValidationError: () => setValidationError(null),
    isValidated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
