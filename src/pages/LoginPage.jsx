import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Spinner } from '../components/ui/Spinner';
import { useTranslation } from 'react-i18next';

const ShieldCheckIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      fill="currentColor"
      fillOpacity="0.15"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M9 12l2 2 4-4"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronRightIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M9 6l6 6-6 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const GoogleIcon = () => (
  <svg className="login-google-icon shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      fillOpacity="0.85"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      fillOpacity="0.7"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      fillOpacity="0.78"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

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
      <div className="login-page min-h-screen flex items-center justify-center">
        <div className="login-page__overlay absolute inset-0" aria-hidden="true" />
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

  const switchToEmail = () => {
    setAuthMode('email');
    setError(null);
    if (clearValidationError) clearValidationError();
  };

  const switchToGoogle = () => {
    setAuthMode('google');
    setError(null);
    if (clearValidationError) clearValidationError();
  };

  return (
    <div className="login-page relative min-h-screen flex flex-col items-center justify-center px-4 py-8 sm:py-10">
      <div
        className="login-page__overlay absolute inset-0 pointer-events-none"
        aria-hidden="true"
      />

      <div className="login-page__content relative z-10 w-full max-w-[480px] flex flex-col items-stretch">
        <header className="login-header">
          <img
            src="/images/login/logo-winbit.png"
            alt="Winbit"
            className="login-logo"
            width={1000}
            height={290}
          />
        </header>

        <div className="login-card-stage">
          <div className="winbit-card login-panel">
            <div className="login-panel__headline">
              <h1 className="login-panel__line1">{t('auth.login.platformLine1')}</h1>
              <p className="login-panel__line2">{t('auth.login.platformLine2')}</p>
            </div>

            <p className="login-panel__subtitle">{t('auth.login.exclusiveAccess')}</p>
            <span className="login-panel__accent" aria-hidden="true" />

            {authMode === 'google' ? (
              <div className="login-panel__actions">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loggingIn}
                  className="login-google-btn w-full flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loggingIn ? (
                    <>
                      <Spinner size="sm" />
                      <span>{t('auth.signingIn')}</span>
                    </>
                  ) : (
                    <>
                      <span className="login-google-icon-wrap">
                        <GoogleIcon />
                      </span>
                      <span>{t('auth.signInWithGoogle')}</span>
                    </>
                  )}
                </button>

                <div className="login-divider" aria-hidden="true">
                  <span className="login-divider__line" />
                  <span className="login-divider__label">{t('auth.login.dividerOr')}</span>
                  <span className="login-divider__line" />
                </div>

                <button
                  type="button"
                  onClick={switchToEmail}
                  disabled={loggingIn}
                  className="login-link-email w-full disabled:opacity-60"
                >
                  <span>{t('auth.login.useEmailPassword')}</span>
                  <ChevronRightIcon className="login-link-email__chevron" />
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleEmailLogin}
                className="login-panel__actions login-email-form space-y-4"
              >
                <div className="login-email-form__header">
                  <p className="login-email-form__title">{t('auth.emailPassword')}</p>
                  <span className="login-email-form__divider" aria-hidden="true" />
                </div>

                <div>
                  <label htmlFor="login-email" className="sr-only">
                    {t('auth.email')}
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                    placeholder={t('auth.emailPlaceholder')}
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label htmlFor="login-password" className="sr-only">
                    {t('auth.password')}
                  </label>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pr-10"
                      placeholder={t('auth.passwordPlaceholder')}
                      minLength={6}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text-muted"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
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

                <button
                  type="submit"
                  disabled={loggingIn}
                  className="login-submit-btn w-full px-4 py-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loggingIn ? (
                    <>
                      <Spinner size="sm" />
                      <span>{t('auth.signingIn')}</span>
                    </>
                  ) : (
                    t('auth.signIn')
                  )}
                </button>

                <button
                  type="button"
                  onClick={switchToGoogle}
                  disabled={loggingIn}
                  className="login-link-email w-full text-center text-sm disabled:opacity-60"
                >
                  {t('auth.login.backToGoogle')}
                </button>
              </form>
            )}

            {displayError && (
              <div
                role="alert"
                className="login-panel__error p-3 bg-[rgba(239,83,80,0.15)] text-error rounded-lg text-sm text-center"
              >
                {displayError}
              </div>
            )}

            <div className="login-security-panel">
              <ShieldCheckIcon className="login-security-panel__icon" />
              <p className="login-security-panel__text">{t('auth.login.securityNote')}</p>
            </div>
          </div>
        </div>

        <footer className="login-footer">
          <p className="login-copyright">{t('footer.copyright')}</p>
        </footer>
      </div>
    </div>
  );
};
