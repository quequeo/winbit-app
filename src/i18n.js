import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const LANGUAGE_STORAGE_KEY = 'winbit_language';

const getInitialLanguage = () => {
  const stored = globalThis?.localStorage?.getItem(LANGUAGE_STORAGE_KEY);
  if (stored === 'es' || stored === 'en') {
    return stored;
  }
  return 'es';
};

const resources = {
  es: {
    translation: {
      app: {
        name: 'Winbit',
      },
      common: {
        important: 'Importante',
        retry: 'Reintentar',
        loading: 'Cargando...',
      },
      nav: {
        dashboard: 'Dashboard',
        deposits: 'Depósitos',
        withdrawals: 'Retiros',
        history: 'Historial',
      },
      auth: {
        logout: 'Salir',
        signInWithGoogle: 'Ingresar con Google',
        signingIn: 'Ingresando...',
        failedToSignIn: 'No se pudo iniciar sesión. Intentá de nuevo.',
        unauthorizedDomain: 'Este dominio no está autorizado para iniciar sesión.',
        operationNotAllowed: 'El inicio de sesión con Google está deshabilitado.',
      },
      footer: {
        rights: 'Todos los derechos reservados.',
        portfolioUpdates:
          'Las actualizaciones del portafolio se realizan una vez por día, luego del cierre operativo.',
      },
      dashboard: {
        welcomeBack: 'Hola, {{name}}',
        subtitle: 'Resumen de tu portafolio',
      },
      deposits: {
        title: 'Depósitos',
        subtitle: 'Usá estas direcciones para depositar fondos en tu portafolio',
        warningTitle: 'Importante:',
        warningText:
          'Verificá siempre la red antes de enviar fondos. Enviar a una red incorrecta puede resultar en pérdida de fondos.',
        noWalletsTitle: 'No hay wallets disponibles',
        noWalletsMessage: 'No hay direcciones de depósito configuradas todavía.',
        copy: 'Copiar',
        copied: '✓ ¡Copiado!',
      },
      withdrawals: {
        title: 'Retiros',
        formTitle: 'Solicitar retiro',
        subtitle: 'Solicitá un retiro parcial o total',
        processingHoursTitle: '⏰ Horario de procesamiento:',
        processingHoursLine1:
          'Las solicitudes se reciben hasta las 17:00 (GMT-3) y se ejecutan a las 18:00 (GMT-3).',
        processingHoursLine2:
          'Las solicitudes ingresadas luego de las 17:00 (GMT-3) se procesan al día siguiente.',
      },
      history: {
        title: 'Historial',
        comingSoon: 'Próximamente',
      },
    },
  },
  en: {
    translation: {
      app: {
        name: 'Winbit',
      },
      common: {
        important: 'Important',
        retry: 'Retry',
        loading: 'Loading...',
      },
      nav: {
        dashboard: 'Dashboard',
        deposits: 'Deposits',
        withdrawals: 'Withdrawals',
        history: 'History',
      },
      auth: {
        logout: 'Logout',
        signInWithGoogle: 'Sign in with Google',
        signingIn: 'Signing in...',
        failedToSignIn: 'Failed to sign in. Please try again.',
        unauthorizedDomain: 'This domain is not authorized for sign-in.',
        operationNotAllowed: 'Google sign-in is disabled for this project.',
      },
      footer: {
        rights: 'All rights reserved.',
        portfolioUpdates:
          'Portfolio updates are processed once per business day after the operational close.',
      },
      dashboard: {
        welcomeBack: 'Welcome back, {{name}}',
        subtitle: 'Here is your portfolio overview',
      },
      deposits: {
        title: 'Deposits',
        subtitle: 'Use these addresses to deposit funds to your portfolio',
        warningTitle: 'Important:',
        warningText:
          'Always verify the network before sending funds. Sending to the wrong network may result in loss of funds.',
        noWalletsTitle: 'No wallets available',
        noWalletsMessage: 'No deposit addresses have been configured yet.',
        copy: 'Copy',
        copied: '✓ Copied!',
      },
      withdrawals: {
        title: 'Withdrawals',
        formTitle: 'Request withdrawal',
        subtitle: 'Request a partial or full withdrawal',
        processingHoursTitle: '⏰ Processing hours:',
        processingHoursLine1:
          'Requests are received until 17:00 (GMT-3) and executed at 18:00 (GMT-3).',
        processingHoursLine2: 'Requests submitted after 17:00 (GMT-3) are processed the next day.',
      },
      history: {
        title: 'History',
        comingSoon: 'Coming soon',
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (lng) => {
  try {
    globalThis?.localStorage?.setItem(LANGUAGE_STORAGE_KEY, lng);
  } catch {
    // ignore storage errors
  }
});

export { i18n, LANGUAGE_STORAGE_KEY };
