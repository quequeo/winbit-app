import { useTranslation } from 'react-i18next';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <footer className="bg-dark-card border-t border-border-dark mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-sm text-text-muted">
          <p>
            © {currentYear} Winbit. {t('footer.rights')}
          </p>
          <p className="mt-2 text-xs">{t('footer.portfolioUpdates')}</p>
        </div>
      </div>
    </footer>
  );
};
