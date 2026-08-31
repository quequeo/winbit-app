import { useState, useEffect, useCallback } from 'react';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../../../services/firebase';
import { validateInvestor, loginWithEmailPassword as apiLoginEmail } from '../../../services/api';
import { getDevBypassUser, isDevBypassEnabled } from '../../../config/devAuth';
import { i18n } from '../../../i18n';

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

const validateAndReject = async (email) => {
  const validation = await validateInvestor(email);
  if (validation.valid) return null;

  if (validation.error === 'Investor not found in database') {
    return i18n.t('auth.validation.notRegistered');
  }
  if (validation.error === 'Investor account is not active') {
    return i18n.t('auth.validation.inactive');
  }
  if (validation.error) {
    return i18n.t('auth.validation.generic', { error: validation.error });
  }
  return i18n.t('auth.validation.unauthorized');
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [validationError, setValidationError] = useState(null);
  const [isValidated, setIsValidated] = useState(false);

  useEffect(() => {
    if (isDevBypassEnabled()) {
      setUser(getDevBypassUser());
      setIsValidated(true);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    const bootstrapStoredSession = async () => {
      const storedSession = getStoredSession();
      if (!storedSession) return;

      const errorMessage = await validateAndReject(storedSession.email);
      if (cancelled) return;

      if (errorMessage) {
        clearStoredSession();
        setUser(null);
        setValidationError(errorMessage);
        setIsValidated(true);
        setLoading(false);
        return;
      }

      setUser({
        email: storedSession.email,
        displayName: storedSession.name,
        authMethod: 'email',
      });
      setIsValidated(true);
      setLoading(false);
    };

    bootstrapStoredSession();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (cancelled) return;

      if (currentUser) {
        const session = getStoredSession();
        if (!session || session.authMethod !== 'email') {
          setUser(currentUser);
          clearStoredSession();
        }
      } else if (!getStoredSession()) {
        setUser((prev) => {
          if (prev?.authMethod === 'email') return prev;
          return null;
        });
      }

      if (!cancelled) {
        setLoading(false);
        setIsValidated(true);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const loginWithGoogle = async () => {
    setValidationError(null);
    setIsValidated(false);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const errorMessage = await validateAndReject(result.user.email);
      if (errorMessage) {
        setValidationError(errorMessage);
        setIsValidated(true);
        await signOut(auth);
        return { user: null, error: { code: 'auth/unauthorized', message: errorMessage } };
      }
      setUser(result.user);
      setIsValidated(true);
      return { user: result.user, error: null };
    } catch (error) {
      return {
        user: null,
        error: {
          code: error?.code ?? 'auth/unknown',
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

  const loginWithDevBypass = useCallback(() => {
    if (!isDevBypassEnabled()) {
      return { user: null, error: { message: 'Dev bypass not available' } };
    }
    const devUser = getDevBypassUser();
    setUser(devUser);
    setValidationError(null);
    setIsValidated(true);
    return { user: devUser, error: null };
  }, []);

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

  // Para email/password: user tiene { email, displayName, authMethod }
  // Para Google: user es Firebase User con .email o .providerData[0].email
  const userEmail =
    user?.email ?? user?.providerData?.[0]?.email ?? getStoredSession()?.email ?? null;

  const value = {
    user,
    userEmail,
    loading,
    loginWithGoogle,
    loginWithEmail,
    loginWithDevBypass,
    logout,
    validationError,
    clearValidationError: () => setValidationError(null),
    isValidated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
