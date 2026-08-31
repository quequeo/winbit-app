import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Spinner } from '../components/ui/Spinner';
import { isDevBypassEnabled } from '../config/devAuth';
import { useTranslation } from 'react-i18next';

/** Mark Winbit W con fondo transparente (para zona crema). */
const WINBIT_MARK_SRC = '/images/login/logo-winbit-w-clear.png';

/** G monocromo (blanco sobre verde), como en el mock. */
const GoogleMark = () => (
  <svg className="login-cta-google__mark" viewBox="0 0 24 24" aria-hidden="true">
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
);

/** Escudo + check completo (stroke visible en mobile). */
const SecurityShield = ({ className = '' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M12 3.2 19.5 6v5.3c0 4.55-3.05 8.55-7.5 9.8C7.55 19.85 4.5 15.85 4.5 11.3V6L12 3.2Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <path
      d="m8.8 12.1 2.25 2.25 4.35-4.5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const WinbitMark = ({ className = '' }) => (
  <img
    src={WINBIT_MARK_SRC}
    alt=""
    className={className}
    width={120}
    height={120}
    decoding="async"
  />
);

const LoginBrand = ({ t }) => (
  <div className="login-brand">
    <WinbitMark className="login-brand__mark" />
    <div className="login-brand__copy">
      <p className="login-brand__name">WINBIT</p>
      <p className="login-brand__tagline">{t('auth.login.tagline')}</p>
    </div>
  </div>
);

const LoginTrustBlock = ({ t }) => (
  <div className="login-trust">
    <SecurityShield className="login-trust__icon" />
    <p className="login-trust__detail">{t('auth.login.securityDetail')}</p>
  </div>
);

export const LoginPage = () => {
  const {
    user,
    loading,
    loginWithGoogle,
    loginWithEmail,
    loginWithDevBypass,
    validationError,
    clearValidationError,
  } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loggingIn, setLoggingIn] = useState(false);
  const [authMode, setAuthMode] = useState('google');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();
  const devBypassActive = isDevBypassEnabled();

  useEffect(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [loading, user, navigate]);

  const displayError = validationError || error;

  if (loading) {
    return (
      <div className="login-page login-page--loading min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleDevBypassLogin = () => {
    setLoggingIn(true);
    setError(null);
    if (clearValidationError) clearValidationError();
    const result = loginWithDevBypass();
    if (result.error) {
      setError(result.error.message);
      setLoggingIn(false);
      return;
    }
    navigate('/dashboard', { replace: true });
    setLoggingIn(false);
  };

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
      return;
    }

    navigate('/dashboard', { replace: true });
    setLoggingIn(false);
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    setError(null);
    if (clearValidationError) clearValidationError();

    const result = await loginWithEmail(email, password);

    if (result.error) {
      setError(result.error.message);
      setLoggingIn(false);
      return;
    }

    navigate('/dashboard', { replace: true });
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
    <div className="login-page">
      <div className="login-page__cream" aria-hidden="true">
        <WinbitMark className="login-page__watermark login-page__watermark--a" />
        <WinbitMark className="login-page__watermark login-page__watermark--b" />
        <WinbitMark className="login-page__watermark login-page__watermark--c" />
      </div>
      <div className="login-page__bars" aria-hidden="true" />

      <div className="login-page__inner">
        <LoginBrand t={t} />

        <div className="login-page__content">
          {devBypassActive ? (
            <div className="login-dev">
              <p className="login-dev__hint">{t('auth.login.devModeHint')}</p>
              <button
                type="button"
                onClick={handleDevBypassLogin}
                disabled={loggingIn}
                className="login-cta login-cta--outline disabled:opacity-60"
              >
                <span className="login-cta__shape login-cta__shape--stroke">
                  <span className="login-cta__inner">
                    {loggingIn ? <Spinner size="sm" /> : null}
                    {t('auth.login.devModeEnter', {
                      name:
                        import.meta.env.VITE_DEV_USER_NAME || import.meta.env.VITE_DEV_USER_EMAIL,
                    })}
                  </span>
                </span>
              </button>
            </div>
          ) : null}

          <header className="login-panel__header">
            <span className="login-panel__accent" aria-hidden="true" />
            <h1 className="login-panel__title">{t('auth.login.title')}</h1>
            <p className="login-panel__subtitle">{t('auth.login.exclusiveAccess')}</p>
          </header>

          {authMode === 'google' ? (
            <div className="login-panel__body">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loggingIn}
                className="login-cta login-cta--google disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className="login-cta__shape login-cta__shape--fill">
                  <span className="login-cta-google__side" aria-hidden="true">
                    {loggingIn ? <Spinner size="sm" /> : <GoogleMark />}
                  </span>
                  <span className="login-cta-google__label">
                    {loggingIn ? t('auth.signingIn') : t('auth.signInWithGoogle')}
                  </span>
                </span>
              </button>

              <div className="login-separator" aria-hidden="true">
                <span className="login-separator__line" />
                <span className="login-separator__label">{t('auth.login.orSeparator')}</span>
                <span className="login-separator__line" />
              </div>

              <button
                type="button"
                onClick={switchToEmail}
                disabled={loggingIn}
                className="login-cta login-cta--outline disabled:opacity-60"
              >
                <span className="login-cta__shape login-cta__shape--stroke">
                  <span className="login-cta__inner">
                    <User className="login-cta__icon" strokeWidth={1.75} aria-hidden />
                    <span>{t('auth.login.useEmailPassword')}</span>
                  </span>
                </span>
              </button>

              <LoginTrustBlock t={t} />
            </div>
          ) : (
            <form onSubmit={handleEmailLogin} className="login-panel__body login-panel__form">
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
                  className="login-input"
                  placeholder={t('auth.emailPlaceholder')}
                  autoComplete="email"
                />
              </div>

              <div>
                <label htmlFor="login-password" className="sr-only">
                  {t('auth.password')}
                </label>
                <div className="login-input-wrap">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="login-input login-input--password"
                    placeholder={t('auth.passwordPlaceholder')}
                    minLength={6}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="login-input-toggle"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                className="login-cta login-cta--google disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className="login-cta__shape login-cta__shape--fill">
                  <span className="login-cta-google__side" aria-hidden="true">
                    {loggingIn ? <Spinner size="sm" /> : <User strokeWidth={1.75} aria-hidden />}
                  </span>
                  <span className="login-cta-google__label">
                    {loggingIn ? t('auth.signingIn') : t('auth.signIn')}
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={switchToGoogle}
                disabled={loggingIn}
                className="login-link-back disabled:opacity-60"
              >
                {t('auth.login.backToGoogle')}
              </button>

              <LoginTrustBlock t={t} />
            </form>
          )}

          {displayError ? (
            <div role="alert" className="login-panel__error">
              {displayError}
            </div>
          ) : null}
        </div>

        <p className="login-copyright">{t('footer.copyright')}</p>
      </div>
    </div>
  );
};
