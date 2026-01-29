import { useState, useEffect } from 'react';
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider } from '../../../services/firebase';
import { validateInvestor } from '../../../services/api';

import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [validationError, setValidationError] = useState(null);
  const [isValidated, setIsValidated] = useState(false);

  useEffect(() => {
    // Handle redirect result and validate investor
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);

        // Si hay un resultado de redirect (usuario acaba de loguearse)
        if (result?.user) {
          const validation = await validateInvestor(result.user.email);

          if (!validation.valid) {
            // Hacer logout si el inversor no es válido
            await signOut(auth);
          }
        }
      } catch (_error) {
        // Intentionally swallow here; UI handles login errors on demand.
      }
    };

    handleRedirectResult();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      // Si hay usuario, significa que Firebase mantiene la sesión (refresh de página)
      // Lo marcamos como validado porque ya pasó la validación cuando se logueó
      // Si no hay usuario, también está validado (estado no logueado)
      setIsValidated(true);
    });

    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    // Limpiar error anterior y marcar como no validado mientras valida
    setValidationError(null);
    setIsValidated(false);

    try {
      const result = await signInWithPopup(auth, googleProvider);

      // Validar que el inversor existe en la base de datos
      const validation = await validateInvestor(result.user.email);

      if (!validation.valid) {
        // Preparar mensaje de error
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

        // Guardar el error antes de hacer logout
        setValidationError(errorMessage);

        // Marcar como validado (aunque falló) para que no se ejecuten los hooks
        setIsValidated(true);

        // Hacer logout inmediatamente si el inversor no es válido
        await signOut(auth);

        return {
          user: null,
          error: {
            code: 'auth/unauthorized',
            message: errorMessage,
          },
        };
      }

      // Login exitoso - limpiar cualquier error y marcar como validado
      setValidationError(null);
      setIsValidated(true);
      return { user: result.user, error: null };
    } catch (error) {
      const code = error?.code;

      // Common in production/PWA/in-app browsers: popups blocked → redirect flow works.
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
    validationError,
    clearValidationError: () => setValidationError(null),
    isValidated, // Indica si el usuario ha sido validado contra el backend
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
