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
  const [authMode, setAuthMode] = useState('google');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-dark-card rounded-lg border border-border-dark p-8 backdrop-blur-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Winbit</h1>
          <p className="text-text-muted">{t('auth.login.subtitle')}</p>
        </div>

        <div className="flex rounded-lg border border-border-dark p-1 mb-6">
          <button
            type="button"
            onClick={() => {
              setAuthMode('email');
              setError(null);
            }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              authMode === 'email' ? 'bg-primary text-white' : 'text-text-muted hover:text-primary'
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
              authMode === 'google' ? 'bg-primary text-white' : 'text-text-muted hover:text-primary'
            }`}
          >
            {t('auth.signInWithGoogle')}
          </button>
        </div>

        <div className="space-y-4">
          {authMode === 'email' ? (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-sm font-medium text-text-primary mb-1"
                >
                  {t('auth.email')}
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-border-dark px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  placeholder={t('auth.emailPlaceholder')}
                  autoComplete="email"
                />
              </div>
              <div>
                <label
                  htmlFor="login-password"
                  className="block text-sm font-medium text-text-primary mb-1"
                >
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-border-dark px-4 py-2.5 pr-10 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    placeholder={t('auth.passwordPlaceholder')}
                    minLength={6}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text-muted"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
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
            <div className="p-4 bg-[rgba(239,83,80,0.15)] text-error rounded-lg text-sm text-center">
              {displayError}
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-border-dark">
          <p className="text-xs text-text-muted text-center">{t('auth.login.disclaimer')}</p>
          <p className="text-xs text-text-dim text-center mt-3">{t('footer.copyright')}</p>
        </div>
      </div>
    </div>
  );
};
