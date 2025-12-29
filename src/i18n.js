import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const LANGUAGE_STORAGE_KEY = 'winbit_language';

// Get current year for dynamic labels
const getCurrentYear = () => new Date().getFullYear();

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
      errors: {
        somethingWentWrong: 'Ocurrió un error',
      },
      sheets: {
        credentialsNotConfigured: 'Google Sheets no está configurado.',
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
        kpis: {
          currentValue: 'Valor actual del portafolio (USD)',
          totalReturnUsd: 'Resultado acumulado desde el inicio (USD)',
          totalReturnPct: 'Resultado acumulado desde el inicio (%)',
          annualReturnUsd: `Resultado acumulado anual ${getCurrentYear()} (USD)`,
          annualReturnPct: `Resultado acumulado anual ${getCurrentYear()} (%)`,
        },
        chart: {
          title: 'Historial de Rendimiento',
          noData: 'No hay datos históricos disponibles',
        },
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
      requests: {
        method: {
          label: 'Método',
          crypto: 'USDT / USDC',
          lemon: 'Lemon Cash',
          cash: 'Efectivo',
          international: 'Transferencia Internacional (SWIFT / IBAN)',
        },
        lemonTag: {
          label: 'Tu Lemontag',
          placeholder: 'Ingresá tu Lemontag',
          winbitLabel: 'Lemontag de Winbit',
        },
        registered: {
          title: 'Solicitud registrada',
          crypto:
            'Tu solicitud fue registrada correctamente. La operación será procesada en el próximo cierre operativo. Una vez ejecutada, recibirás el comprobante correspondiente por correo electrónico.',
          cash: 'Tu solicitud fue registrada correctamente. Las operaciones en efectivo se coordinan de forma personalizada. Un integrante de nuestro equipo se pondrá en contacto para coordinar el ingreso o retiro de los fondos.',
          international:
            'Tu solicitud fue registrada correctamente. Las operaciones mediante transferencia internacional se coordinan de forma personalizada. Nuestro equipo se pondrá en contacto por correo electrónico para continuar con el proceso.',
        },
      },
      history: {
        title: 'Historial',
        subtitle: 'Movimientos y estados de tu cuenta',
        emptyTitle: 'Sin movimientos todavía',
        emptyDescription: 'Cuando haya movimientos, los vas a ver reflejados acá.',
        errors: {
          emailMappingNotConfigured:
            'Falta configurar el mapeo de tu usuario (email) al código de inversor en Google Sheets (solapa CODIGOS o columna EMAIL en DASHBOARD).',
        },
        table: {
          date: 'Fecha',
          movement: 'Movimiento',
          amount: 'Monto',
          previousBalance: 'Saldo previo',
          newBalance: 'Saldo posterior',
          status: 'Estado',
        },
      },
      unauthorized: {
        title: 'Acceso no autorizado',
        currentAccount: 'Cuenta actual',
        message:
          'Tu cuenta de Google no está registrada en el sistema Winbit. Para acceder, necesitás ser un inversor autorizado.',
        contactTitle: 'Contacto para solicitar acceso:',
        logout: 'Cerrar sesión',
        helpText: 'Podés intentar con otra cuenta de Google o contactar al administrador.',
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
      errors: {
        somethingWentWrong: 'Something went wrong',
      },
      sheets: {
        credentialsNotConfigured: 'Google Sheets credentials not configured',
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
        kpis: {
          currentValue: 'Current portfolio value (USD)',
          totalReturnUsd: 'Total return since inception (USD)',
          totalReturnPct: 'Total return since inception (%)',
          annualReturnUsd: `Annual return ${getCurrentYear()} (USD)`,
          annualReturnPct: `Annual return ${getCurrentYear()} (%)`,
        },
        chart: {
          title: 'Performance History',
          noData: 'No historical data available',
        },
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
      requests: {
        method: {
          label: 'Method',
          crypto: 'USDT / USDC',
          lemon: 'Lemon Cash',
          cash: 'Cash',
          international: 'International Transfer (SWIFT / IBAN)',
        },
        lemonTag: {
          label: 'Your Lemontag',
          placeholder: 'Enter your Lemontag',
          winbitLabel: 'Winbit Lemontag',
        },
        registered: {
          title: 'Request registered',
          crypto:
            'Your request was registered successfully. The operation will be processed at the next operational close. Once executed, you will receive the receipt by email.',
          cash: 'Your request was registered successfully. Cash operations are coordinated personally. A member of our team will contact you to coordinate the deposit or withdrawal.',
          international:
            'Your request was registered successfully. International transfers are coordinated personally. Our team will contact you by email to continue the process.',
        },
      },
      history: {
        title: 'History',
        subtitle: 'Account movements and status',
        emptyTitle: 'No movements yet',
        emptyDescription: 'When there are movements, you will see them here.',
        errors: {
          emailMappingNotConfigured:
            'Missing configuration to map your user (email) to the investor code in Google Sheets (CODIGOS sheet or EMAIL column in DASHBOARD).',
        },
        table: {
          date: 'Date',
          movement: 'Movement',
          amount: 'Amount',
          previousBalance: 'Previous balance',
          newBalance: 'New balance',
          status: 'Status',
        },
      },
      unauthorized: {
        title: 'Unauthorized Access',
        currentAccount: 'Current account',
        message:
          'Your Google account is not registered in the Winbit system. To access, you need to be an authorized investor.',
        contactTitle: 'Contact to request access:',
        logout: 'Sign out',
        helpText: 'You can try with another Google account or contact the administrator.',
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
