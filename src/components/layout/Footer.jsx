import { useTranslation } from 'react-i18next';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <footer className="winbit-footer">
      <p>
        © {currentYear} Winbit. {t('footer.rights')}
      </p>
    </footer>
  );
};
