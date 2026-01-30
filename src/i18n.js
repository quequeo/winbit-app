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
        sending: 'Enviando...',
        sendRequest: 'Enviar solicitud',
        openMenu: 'Abrir menú',
        closeMenu: 'Cerrar menú',
        previous: 'Anterior',
        next: 'Siguiente',
        pageOf: 'Página {{page}} de {{total}}',
        rowsPerPage: 'Filas por página',
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
        operating: 'Operativa',
      },
      auth: {
        logout: 'Salir',
        signInWithGoogle: 'Ingresar con Google',
        signingIn: 'Ingresando...',
        failedToSignIn: 'No se pudo iniciar sesión. Intentá de nuevo.',
        unauthorizedDomain: 'Este dominio no está autorizado para iniciar sesión.',
        operationNotAllowed: 'El inicio de sesión con Google está deshabilitado.',
        login: {
          subtitle: 'Gestión de Portafolio',
          disclaimer:
            'Al iniciar sesión, aceptás acceder a tu información de forma segura. Solo inversores registrados pueden acceder a la plataforma.',
        },
      },
      footer: {
        rights: 'Todos los derechos reservados.',
        portfolioUpdates:
          'Las actualizaciones del portafolio se realizan una vez por día, luego del cierre operativo.',
      },
      dashboard: {
        welcomeBack: 'Hola, {{name}}',
        subtitle: 'Resumen de tu portafolio',
        noDataForAccount: 'No hay datos disponibles para tu cuenta',
        kpis: {
          currentValue: 'Valor actual del portafolio (USD)',
          totalInvested: 'Total invertido (USD)',
          strategyReturnYtdUsd: `Resultado estrategia ${getCurrentYear()} (USD)`,
          strategyReturnYtdPct: `Resultado estrategia ${getCurrentYear()} (%)`,
          strategyReturnAllUsd: 'Resultado estrategia histórico (USD)',
          strategyReturnAllPct: 'Resultado estrategia histórico (%)',
          annualReturnUsd: `Resultado acumulado anual ${getCurrentYear()} (USD)`,
          annualReturnPct: `Resultado acumulado anual ${getCurrentYear()} (%)`,
        },
        chart: {
          title: 'Evolución del portafolio',
          loading: 'Cargando evolución…',
          noData: 'Sin datos históricos todavía.',
          rangeAll: 'Todo desde el inicio',
          rangeLast: 'Últimos {{label}}',
        },
        ranges: {
          '7D': '7 días',
          '1M': '1 mes',
          '3M': '3 meses',
          '6M': '6 meses',
          '1Y': '1 año',
          ALL: 'Todo',
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
        processingHoursTitle: '⏰ Horario de procesamiento:',
        processingHoursLine1:
          'Las solicitudes se reciben hasta las 16:00 y se ejecutan a las 18:00.',
        processingHoursLine2:
          'Las solicitudes ingresadas luego de las 16:00 se procesan a las 10:00 del día siguiente.',
        requestForm: {
          title: 'Registrar depósito',
          amount: {
            label: 'Monto',
            placeholder: 'Ingresá el monto en USD',
          },
          network: {
            label: 'Red',
            placeholder: 'Seleccioná una red',
          },
          transactionHash: {
            label: 'Hash de transacción (opcional)',
            placeholder: 'Ingresá el hash o ID',
          },
          attachment: {
            label: 'Comprobante (opcional)',
            description: 'Adjuntá una captura del comprobante de pago (JPG, PNG o WEBP, máx 5MB)',
            upload: 'Subir comprobante',
          },
          validation: {
            invalidAmount: 'Ingresá un monto válido',
            selectNetwork: 'Seleccioná una red',
          },
          submit: 'Enviar solicitud',
          submitting: 'Enviando...',
        },
      },
      withdrawals: {
        title: 'Retiros',
        formTitle: 'Solicitar retiro',
        subtitle: 'Solicitá un retiro parcial o total',
        processingHoursTitle: '⏰ Horario de procesamiento:',
        processingHoursLine1:
          'Las solicitudes se reciben hasta las 16:00 y se ejecutan a las 18:00.',
        processingHoursLine2:
          'Las solicitudes ingresadas luego de las 16:00 se procesan a las 10:00 del día siguiente.',
        form: {
          type: {
            label: 'Tipo de retiro',
            partial: 'Parcial',
            full: 'Total',
          },
          amount: {
            label: 'Monto',
            placeholder: 'Ingresá el monto en USD',
          },
          validation: {
            invalidAmount: 'Ingresá un monto válido',
            exceedsBalance: 'El monto supera el saldo actual',
            lemonTagRequired: 'Ingresá tu Lemontag',
          },
        },
      },
      requests: {
        errors: {
          sendFailed: 'No se pudo enviar la solicitud. Intentá de nuevo.',
        },
        method: {
          label: 'Método',
          cash_ars: 'Efectivo ARS',
          cash_usd: 'Efectivo USD',
          transfer_ars: 'Transferencia ARS',
          swift: 'Transferencia SWIFT',
          crypto: 'Cripto USDT/USDC',
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
        movement: {
          deposit: 'Depósito',
          withdrawal: 'Retiro',
          trading_fee: 'Comisión de Trading',
          operating_result: 'Resultado Operativo',
          referral_commission: 'Comisión por referido',
          toDate: 'a la fecha',
        },
        status: {
          completed: 'Completado',
          pending: 'Pendiente',
          rejected: 'Rechazado',
          cancelled: 'Cancelado',
        },
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
      operating: {
        title: 'Operativa',
        subtitle: 'Detalle diario de los resultados operativos.',
        emptyTitle: 'Sin operativas todavía',
        emptyDescription: 'Cuando haya resultados operativos, los vas a ver acá.',
        movement: {
          operatingResult: 'Resultado Operativo',
        },
        table: {
          date: 'Fecha',
          movement: 'Movimiento',
          amount: 'Monto',
          previousBalance: 'Saldo previo',
          newBalance: 'Saldo posterior',
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
        sending: 'Sending...',
        sendRequest: 'Send request',
        openMenu: 'Open menu',
        closeMenu: 'Close menu',
        previous: 'Previous',
        next: 'Next',
        pageOf: 'Page {{page}} of {{total}}',
        rowsPerPage: 'Rows per page',
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
        operating: 'Operating',
      },
      auth: {
        logout: 'Logout',
        signInWithGoogle: 'Sign in with Google',
        signingIn: 'Signing in...',
        failedToSignIn: 'Failed to sign in. Please try again.',
        unauthorizedDomain: 'This domain is not authorized for sign-in.',
        operationNotAllowed: 'Google sign-in is disabled for this project.',
        login: {
          subtitle: 'Portfolio Management',
          disclaimer:
            'By signing in, you agree to access your information securely. Only registered investors can access the platform.',
        },
      },
      footer: {
        rights: 'All rights reserved.',
        portfolioUpdates:
          'Portfolio updates are processed once per business day after the operational close.',
      },
      dashboard: {
        welcomeBack: 'Welcome back, {{name}}',
        subtitle: 'Here is your portfolio overview',
        noDataForAccount: 'No data available for your account',
        kpis: {
          currentValue: 'Current portfolio value (USD)',
          totalInvested: 'Total invested (USD)',
          strategyReturnYtdUsd: `Strategy return ${getCurrentYear()} (USD)`,
          strategyReturnYtdPct: `Strategy return ${getCurrentYear()} (%)`,
          strategyReturnAllUsd: 'Strategy return since inception (USD)',
          strategyReturnAllPct: 'Strategy return since inception (%)',
          annualReturnUsd: `Annual return ${getCurrentYear()} (USD)`,
          annualReturnPct: `Annual return ${getCurrentYear()} (%)`,
        },
        chart: {
          title: 'Portfolio Evolution',
          loading: 'Loading evolution…',
          noData: 'No historical data yet.',
          rangeAll: 'All since inception',
          rangeLast: 'Last {{label}}',
        },
        ranges: {
          '7D': '7 days',
          '1M': '1 month',
          '3M': '3 months',
          '6M': '6 months',
          '1Y': '1 year',
          ALL: 'All',
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
        processingHoursTitle: '⏰ Processing hours:',
        processingHoursLine1: 'Requests are received until 16:00 and executed at 18:00.',
        processingHoursLine2: 'Requests submitted after 16:00 are processed at 10:00 the next day.',
        requestForm: {
          title: 'Register deposit',
          amount: {
            label: 'Amount',
            placeholder: 'Enter amount in USD',
          },
          network: {
            label: 'Network',
            placeholder: 'Select a network',
          },
          transactionHash: {
            label: 'Transaction hash (optional)',
            placeholder: 'Enter hash or ID',
          },
          attachment: {
            label: 'Receipt (optional)',
            description: 'Attach a screenshot of the payment receipt (JPG, PNG or WEBP, max 5MB)',
            upload: 'Upload receipt',
          },
          validation: {
            invalidAmount: 'Enter a valid amount',
            selectNetwork: 'Select a network',
          },
          submit: 'Send request',
          submitting: 'Sending...',
        },
      },
      withdrawals: {
        title: 'Withdrawals',
        formTitle: 'Request withdrawal',
        subtitle: 'Request a partial or full withdrawal',
        processingHoursTitle: '⏰ Processing hours:',
        processingHoursLine1: 'Requests are received until 16:00 and executed at 18:00.',
        processingHoursLine2: 'Requests submitted after 16:00 are processed at 10:00 the next day.',
        form: {
          type: {
            label: 'Withdrawal type',
            partial: 'Partial',
            full: 'Full',
          },
          amount: {
            label: 'Amount',
            placeholder: 'Enter amount in USD',
          },
          validation: {
            invalidAmount: 'Enter a valid amount',
            exceedsBalance: 'Amount exceeds current balance',
            lemonTagRequired: 'Enter your Lemontag',
          },
        },
      },
      requests: {
        errors: {
          sendFailed: 'Could not send the request. Please try again.',
        },
        method: {
          label: 'Method',
          cash_ars: 'Cash ARS',
          cash_usd: 'Cash USD',
          transfer_ars: 'Bank transfer ARS',
          swift: 'SWIFT transfer',
          crypto: 'Crypto USDT/USDC',
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
        movement: {
          deposit: 'Deposit',
          withdrawal: 'Withdrawal',
          trading_fee: 'Trading Fee',
          operating_result: 'Operating Result',
          referral_commission: 'Referral commission',
          toDate: 'to date',
        },
        status: {
          completed: 'Completed',
          pending: 'Pending',
          rejected: 'Rejected',
          cancelled: 'Cancelled',
        },
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
      operating: {
        title: 'Operating',
        subtitle: 'Daily detail of operating results.',
        emptyTitle: 'No operating results yet',
        emptyDescription: 'When there are operating results, you will see them here.',
        movement: {
          operatingResult: 'Operating Result',
        },
        table: {
          date: 'Date',
          movement: 'Movement',
          amount: 'Amount',
          previousBalance: 'Previous balance',
          newBalance: 'New balance',
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
