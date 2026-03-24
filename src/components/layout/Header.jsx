import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { useTranslation } from 'react-i18next';

export const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    {
      path: '/dashboard',
      label: t('nav.dashboard'),
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
          />
        </svg>
      ),
    },
    {
      path: '/wallets',
      label: t('nav.deposits'),
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
          />
        </svg>
      ),
    },
    {
      path: '/requests',
      label: t('nav.withdrawals'),
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
          />
        </svg>
      ),
    },
    {
      path: '/history',
      label: t('nav.history'),
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      ),
    },
    {
      path: '/operational',
      label: t('nav.operating'),
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
          />
        </svg>
      ),
    },
  ];

  const handleLanguageChange = (lng) => {
    i18n.changeLanguage(lng);
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="bg-dark-card border-b border-border-dark">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img src="/logo-winbit.png" alt="Winbit" className="h-8" />
          </Link>

          {user && (
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'text-primary'
                      : 'text-text-muted hover:text-primary'
                  }`}
                >
                  <span className="opacity-50">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          {user && (
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="md:hidden inline-flex items-center justify-center rounded-lg border border-border-dark p-2 text-text-primary hover:text-primary hover:border-primary transition-colors"
                aria-label={isMobileMenuOpen ? t('common.closeMenu') : t('common.openMenu')}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              >
                <span className="sr-only">
                  {isMobileMenuOpen ? t('common.closeMenu') : t('common.openMenu')}
                </span>
                {isMobileMenuOpen ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  </svg>
                )}
              </button>
              <div className="hidden md:flex items-center gap-1 rounded-lg border border-border-dark p-1">
                <button
                  type="button"
                  onClick={() => handleLanguageChange('es')}
                  className={`px-2 py-1 text-xs font-medium rounded-md ${
                    i18n.language === 'es'
                      ? 'bg-primary text-white'
                      : 'text-text-muted hover:text-primary'
                  }`}
                >
                  ES
                </button>
                <button
                  type="button"
                  onClick={() => handleLanguageChange('en')}
                  className={`px-2 py-1 text-xs font-medium rounded-md ${
                    i18n.language === 'en'
                      ? 'bg-primary text-white'
                      : 'text-text-muted hover:text-primary'
                  }`}
                >
                  EN
                </button>
              </div>
              <button
                type="button"
                onClick={() => navigate('/change-password')}
                className="hidden md:inline-flex items-center justify-center rounded-lg border border-border-dark p-2 text-text-muted hover:text-primary hover:border-primary transition-colors"
                title={t('auth.changePassword.title')}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"
                  />
                </svg>
              </button>
              <Button
                onClick={logout}
                variant="outline"
                className="hidden md:inline-flex text-sm py-2"
              >
                {t('auth.logout')}
              </Button>
            </div>
          )}
        </div>
      </div>

      {user && (
        <div
          id="mobile-menu"
          className={`md:hidden border-t border-border-dark px-4 py-3 ${
            isMobileMenuOpen ? 'block' : 'hidden'
          }`}
        >
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-primary hover:bg-accent-dim hover:text-primary'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="opacity-50">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            to="/change-password"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              location.pathname === '/change-password'
                ? 'bg-primary/10 text-primary'
                : 'text-text-primary hover:bg-accent-dim hover:text-primary'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {t('auth.changePassword.title')}
          </Link>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1 rounded-lg border border-border-dark p-1">
              <button
                type="button"
                onClick={() => handleLanguageChange('es')}
                className={`px-2 py-1 text-xs font-medium rounded-md ${
                  i18n.language === 'es'
                    ? 'bg-primary text-white'
                    : 'text-text-muted hover:text-primary'
                }`}
              >
                ES
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('en')}
                className={`px-2 py-1 text-xs font-medium rounded-md ${
                  i18n.language === 'en'
                    ? 'bg-primary text-white'
                    : 'text-text-muted hover:text-primary'
                }`}
              >
                EN
              </button>
            </div>

            <Button
              onClick={() => {
                setIsMobileMenuOpen(false);
                logout();
              }}
              variant="outline"
              className="text-sm py-2"
            >
              {t('auth.logout')}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
