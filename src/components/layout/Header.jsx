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
    { path: '/dashboard', label: t('nav.dashboard'), icon: '/icons/dashboard.png' },
    { path: '/wallets', label: t('nav.deposits'), icon: '/icons/depositos.png' },
    { path: '/requests', label: t('nav.withdrawals'), icon: '/icons/retiros.png' },
    { path: '/history', label: t('nav.history'), icon: '/icons/historial.png' },
    { path: '/operational', label: t('nav.operating'), icon: '/icons/operativa.png' },
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
          <Link to="/dashboard" className="flex items-center gap-2 pl-2 md:pl-0 mr-4 md:mr-6">
            <img
              src="/logo-winbit.png"
              alt="Winbit"
              className="h-14 md:h-16"
              style={{
                filter: 'brightness(1.15) drop-shadow(0 0 6px rgba(101,167,165,0.25))',
              }}
            />
          </Link>

          {user && (
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-link flex items-center gap-2 font-medium transition-colors ${
                      isActive
                        ? 'nav-link-active text-primary'
                        : 'text-text-muted hover:text-primary'
                    }`}
                  >
                    <img
                      src={item.icon}
                      alt=""
                      className={`w-[22px] h-[22px] nav-icon ${isActive ? 'nav-icon-active' : ''}`}
                    />
                    {item.label}
                  </Link>
                );
              })}
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
                <img
                  src="/icons/cambiar-contrasena.png"
                  alt=""
                  className="w-[22px] h-[22px] nav-icon"
                />
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
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-primary hover:bg-accent-dim hover:text-primary'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <img
                    src={item.icon}
                    alt=""
                    className={`w-[20px] h-[20px] nav-icon ${isActive ? 'nav-icon-active' : ''}`}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Link
            to="/change-password"
            className={`nav-link flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              location.pathname === '/change-password'
                ? 'bg-primary/10 text-primary'
                : 'text-text-primary hover:bg-accent-dim hover:text-primary'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <img
              src="/icons/cambiar-contrasena.png"
              alt=""
              className={`w-[20px] h-[20px] nav-icon ${location.pathname === '/change-password' ? 'nav-icon-active' : ''}`}
            />
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
