import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { useTranslation } from 'react-i18next';

export const LoginPage = () => {
  const { user, loading, loginWithGoogle, loginWithEmail, validationError, clearValidationError } =
    useAuth();
  const [error, setError] = useState(null);
  const [loggingIn, setLoggingIn] = useState(false);
  const [authMode, setAuthMode] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    setError(null);
  }, []);

  const displayError = validationError || error;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleGoogleLogin = async () => {
    setLoggingIn(true);
    setError(null);
    if (clearValidationError) clearValidationError();

    const result = await loginWithGoogle();

    if (result.error) {
      const code = result.error?.code;

      if (code === 'auth/unauthorized') {
        setError(result.error.message);
        setLoggingIn(false);
        return;
      }

      let message = t('auth.failedToSignIn');
      if (code === 'auth/unauthorized-domain') {
        message = t('auth.unauthorizedDomain');
      } else if (code === 'auth/operation-not-allowed') {
        message = t('auth.operationNotAllowed');
      }

      setError(code ? `${message} (${code})` : message);
      setLoggingIn(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    setError(null);
    if (clearValidationError) clearValidationError();

    const result = await loginWithEmail(email, password);

    if (result.error) {
      setError(result.error.message);
    }
    setLoggingIn(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/20 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Winbit</h1>
          <p className="text-gray-600">{t('auth.login.subtitle')}</p>
        </div>

        <div className="flex rounded-lg border border-gray-200 p-1 mb-6">
          <button
            type="button"
            onClick={() => {
              setAuthMode('email');
              setError(null);
            }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              authMode === 'email' ? 'bg-primary text-white' : 'text-gray-600 hover:text-primary'
            }`}
          >
            {t('auth.emailPassword')}
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('google');
              setError(null);
            }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              authMode === 'google' ? 'bg-primary text-white' : 'text-gray-600 hover:text-primary'
            }`}
          >
            Google
          </button>
        </div>

        <div className="space-y-4">
          {authMode === 'email' ? (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t('auth.email')}
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  placeholder={t('auth.emailPlaceholder')}
                  autoComplete="email"
                />
              </div>
              <div>
                <label
                  htmlFor="login-password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t('auth.password')}
                </label>
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  placeholder={t('auth.passwordPlaceholder')}
                  minLength={6}
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" disabled={loggingIn} className="w-full">
                {loggingIn ? (
                  <>
                    <Spinner size="sm" />
                    <span className="ml-2">{t('auth.signingIn')}</span>
                  </>
                ) : (
                  t('auth.signIn')
                )}
              </Button>
            </form>
          ) : (
            <Button
              onClick={handleGoogleLogin}
              disabled={loggingIn}
              className="w-full flex items-center justify-center gap-3"
            >
              {loggingIn ? (
                <>
                  <Spinner size="sm" />
                  <span>{t('auth.signingIn')}</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>{t('auth.signInWithGoogle')}</span>
                </>
              )}
            </Button>
          )}

          {displayError && (
            <div className="p-4 bg-red-50 text-red-800 rounded-lg text-sm text-center">
              {displayError}
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">{t('auth.login.disclaimer')}</p>
        </div>
      </div>
    </div>
  );
};
