import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { useTranslation } from 'react-i18next';

export const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', label: t('nav.dashboard') },
    { path: '/wallets', label: t('nav.deposits') },
    { path: '/requests', label: t('nav.withdrawals') },
    { path: '/history', label: t('nav.history') },
    { path: '/operational', label: t('nav.operating') },
  ];

  const handleLanguageChange = (lng) => {
    i18n.changeLanguage(lng);
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">Winbit</span>
          </Link>

          {user && (
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'text-primary'
                      : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          {user && (
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="md:hidden inline-flex items-center justify-center rounded-lg border border-gray-200 p-2 text-gray-700 hover:text-primary hover:border-primary transition-colors"
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
              <div className="hidden md:flex items-center gap-1 rounded-lg border border-gray-200 p-1">
                <button
                  type="button"
                  onClick={() => handleLanguageChange('es')}
                  className={`px-2 py-1 text-xs font-medium rounded-md ${
                    i18n.language === 'es'
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:text-primary'
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
                      : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  EN
                </button>
              </div>
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
          className={`md:hidden border-t border-gray-200 px-4 py-3 ${
            isMobileMenuOpen ? 'block' : 'hidden'
          }`}
        >
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-1">
              <button
                type="button"
                onClick={() => handleLanguageChange('es')}
                className={`px-2 py-1 text-xs font-medium rounded-md ${
                  i18n.language === 'es'
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:text-primary'
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
                    : 'text-gray-600 hover:text-primary'
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
