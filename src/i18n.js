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
        sendRequest: 'Solicitar retiro',
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
        signIn: 'Ingresar',
        signInWithGoogle: 'Acceder con Google',
        signingIn: 'Ingresando...',
        failedToSignIn: 'No se pudo iniciar sesión. Intentá de nuevo.',
        unauthorizedDomain: 'Este dominio no está autorizado para iniciar sesión.',
        operationNotAllowed: 'El inicio de sesión con Google está deshabilitado.',
        emailPassword: 'Email y contraseña',
        email: 'Correo electrónico',
        emailPlaceholder: 'tu@email.com',
        password: 'Contraseña',
        passwordPlaceholder: 'Tu contraseña',
        login: {
          subtitle: 'Plataforma de inversores',
          disclaimer:
            'Acceso restringido a inversores registrados. La información se encuentra protegida mediante protocolos de seguridad.',
        },
        changePassword: {
          title: 'Cambiar contraseña',
          subtitle: 'Actualizá tu contraseña de acceso a la plataforma.',
          current: 'Contraseña actual',
          new: 'Nueva contraseña',
          confirm: 'Confirmar nueva contraseña',
          submit: 'Cambiar contraseña',
          success: 'Tu contraseña fue actualizada correctamente.',
          mismatch: 'Las contraseñas no coinciden.',
          tooShort: 'La contraseña debe tener al menos 6 caracteres.',
          googleInfo:
            'Iniciaste sesión con Google. Si querés usar contraseña, pedile al administrador que te configure una.',
        },
      },
      footer: {
        rights: 'Todos los derechos reservados.',
        copyright: '© 2026 Winbit. Todos los derechos reservados.',
        portfolioUpdates:
          'Las actualizaciones del portafolio se realizan una vez por día, luego del cierre operativo.',
      },
      dashboard: {
        welcomeBack: '{{name}}',
        subtitle: 'Resumen del portafolio',
        hideBalances: 'Ocultar saldos',
        showBalances: 'Mostrar saldos',
        noDataForAccount: 'No hay datos disponibles para tu cuenta',
        kpis: {
          currentValue: 'Valor del portafolio (USD)',
          totalInvested: 'Capital invertido (USD)',
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
          noData: 'Aún no hay datos históricos disponibles.',
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
        subtitle:
          'Realizá tu transferencia o depósito utilizando alguno de los siguientes métodos.',
        warningTitle: 'Importante:',
        warningText:
          'Verificá siempre los datos antes de enviar fondos. Enviar a una dirección o cuenta incorrecta puede resultar en la pérdida de fondos.',
        noWalletsTitle: 'No hay wallets disponibles',
        noWalletsMessage: 'No hay direcciones de depósito configuradas todavía.',
        noOptionsTitle: 'No hay opciones disponibles',
        noOptionsMessage: 'No hay opciones de depósito configuradas todavía.',
        categories: {
          CASH_USD: 'Efectivo USD',
          LEMON: 'Lemon Cash',
          CRYPTO: 'Cripto',
          SWIFT: 'Transferencia internacional',
        },
        detailLabels: {
          bank_name: 'Banco',
          holder: 'Titular',
          cbu_cvu: 'CBU / CVU',
          alias: 'Alias',
          lemon_tag: 'Lemon Tag',
          address: 'Dirección',
          network: 'Red',
          swift_code: 'Código SWIFT',
          account_number: 'Nº de cuenta',
          routing_number: 'Routing number',
          bank_address: 'Dirección del banco',
          instructions: 'Instrucciones',
        },
        copy: 'Copiar',
        copied: '✓ ¡Copiado!',
        processingHoursTitle: 'Horario de procesamiento:',
        processingHoursLine1: 'Solicitudes hasta 16:00 h → se procesan a las 18:00 h.',
        processingHoursLine2: 'Solicitudes posteriores → 08:00 h del día hábil siguiente.',
        depositButton: '¿Ya realizaste tu depósito?',
        depositButtonAction: 'Informar depósito',
        requestForm: {
          title: 'Informar depósito',
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
            label: 'Comprobante',
            description:
              'Adjuntá el comprobante de la transferencia o depósito. (JPG, PNG, WEBP o PDF · máx. 5 MB)',
            upload: 'Subir comprobante',
            tooLarge: 'El archivo es demasiado grande. Máximo 5 MB.',
          },
          validation: {
            emailRequired: 'Debes iniciar sesión para enviar una solicitud.',
            invalidAmount: 'Ingresá un monto válido',
            selectNetwork: 'Seleccioná una red',
            attachmentRequired: 'El comprobante es obligatorio excepto para depósitos en efectivo.',
          },
          submit: 'Registrar depósito',
          uploading: 'Subiendo comprobante...',
          submitting: 'Enviando...',
        },
      },
      withdrawals: {
        title: 'Retiros',
        formTitle: 'Solicitar retiro',
        subtitle: '',
        tabs: {
          newRequest: 'Nueva solicitud',
          history: 'Historial de retiros',
        },
        processingHoursTitle: 'Horario de procesamiento:',
        processingHoursLine1: 'Solicitudes hasta 16:00 h → se procesan el mismo día.',
        processingHoursLine2: 'Solicitudes posteriores → 08:00 h del siguiente día hábil.',
        processingHoursLine3:
          'El comprobante se enviará por correo electrónico una vez completado el retiro.',
        form: {
          type: {
            label: 'Tipo de retiro',
            partial: 'Parcial',
            full: 'Total',
          },
          amount: {
            label: 'Monto',
            placeholder: '1,000.00',
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
          cash_usd: 'Efectivo USD',
          lemon: 'Lemon Cash',
          swift: 'Transferencia SWIFT',
          crypto: 'Cripto USDT/USDC',
        },
        lemonTag: {
          label: 'Tu Lemontag',
          placeholder: 'Ingresá tu Lemontag',
          winbitLabel: 'Lemontag de Winbit',
        },
        registered: {
          title: 'Depósito informado',
          crypto:
            'El depósito fue registrado correctamente.\n\nLa operación será procesada en el próximo cierre operativo.\nUna vez acreditado, recibirás el comprobante correspondiente por correo electrónico.',
          cash: 'Tu solicitud fue registrada correctamente. Las operaciones en efectivo se coordinan de forma personalizada. Un integrante de nuestro equipo se pondrá en contacto para coordinar el ingreso o retiro de los fondos.',
          international:
            'Tu solicitud fue registrada correctamente. Las operaciones mediante transferencia internacional se coordinan de forma personalizada. Nuestro equipo se pondrá en contacto por correo electrónico para continuar con el proceso.',
          withdrawalTitle: 'Retiro solicitado',
          withdrawal:
            'La solicitud de retiro fue registrada correctamente.\n\nEl retiro será procesado en el próximo cierre operativo.\nUna vez completado, recibirás el comprobante correspondiente por correo electrónico.',
        },
      },
      history: {
        monthsShort: [
          'Ene',
          'Feb',
          'Mar',
          'Abr',
          'May',
          'Jun',
          'Jul',
          'Ago',
          'Sep',
          'Oct',
          'Nov',
          'Dic',
        ],
        title: 'Historial',
        subtitle: 'Historial de movimientos de tu cuenta',
        emptyTitle: 'Sin movimientos todavía',
        emptyDescription: 'Cuando haya movimientos, los vas a ver reflejados acá.',
        movement: {
          deposit: 'Depósito',
          withdrawal: 'Retiro',
          trading_fee: 'Comisión de trading',
          trading_fee_withdrawal: 'Trading Fee por retiro',
          trading_fee_adjustment: 'Comisión de trading - Ajuste',
          operating_result: 'Resultado operativo',
          referral_commission: 'Comisión por referido',
          withdrawalAmount: 'Retiro: {{amount}}',
          withdrawalAmountShort: 'Retiro {{amount}}',
          toDate: 'a la fecha',
        },
        status: {
          completed: 'Completado',
          pending: 'Pendiente',
          rejected: 'Rechazado',
          cancelled: 'Cancelado',
          depositCompleted: 'Acreditado',
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
        subtitle: 'Resultados operativos diarios',
        emptyTitle: 'Sin operativas todavía',
        emptyDescription: 'Cuando haya resultados operativos, los vas a ver acá.',
        movement: {
          operatingResult: 'Resultado operativo',
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
        sendRequest: 'Request withdrawal',
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
        signIn: 'Sign in',
        signInWithGoogle: 'Sign in with Google',
        signingIn: 'Signing in...',
        failedToSignIn: 'Failed to sign in. Please try again.',
        unauthorizedDomain: 'This domain is not authorized for sign-in.',
        operationNotAllowed: 'Google sign-in is disabled for this project.',
        emailPassword: 'Email & password',
        email: 'Email address',
        emailPlaceholder: 'your@email.com',
        password: 'Password',
        passwordPlaceholder: 'Your password',
        login: {
          subtitle: 'Investor platform',
          disclaimer:
            'Access restricted to registered investors. Your information is protected by security protocols.',
        },
        changePassword: {
          title: 'Change password',
          subtitle: 'Update your platform access password.',
          current: 'Current password',
          new: 'New password',
          confirm: 'Confirm new password',
          submit: 'Change password',
          success: 'Your password has been updated successfully.',
          mismatch: 'Passwords do not match.',
          tooShort: 'Password must be at least 6 characters.',
          googleInfo:
            'You signed in with Google. If you want to use a password, ask the administrator to set one up for you.',
        },
      },
      footer: {
        rights: 'All rights reserved.',
        copyright: '© 2026 Winbit. All rights reserved.',
        portfolioUpdates:
          'Portfolio updates are processed once per business day after the operational close.',
      },
      dashboard: {
        welcomeBack: '{{name}}',
        subtitle: 'Portfolio overview',
        hideBalances: 'Hide balances',
        showBalances: 'Show balances',
        noDataForAccount: 'No data available for your account',
        kpis: {
          currentValue: 'Portfolio value (USD)',
          totalInvested: 'Invested capital (USD)',
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
          noData: 'No historical data available yet.',
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
        subtitle: 'Make your transfer or deposit using one of the following methods.',
        warningTitle: 'Important:',
        warningText:
          'Always verify the details before sending funds. Sending to the wrong address or account may result in loss of funds.',
        noWalletsTitle: 'No wallets available',
        noWalletsMessage: 'No deposit addresses have been configured yet.',
        noOptionsTitle: 'No options available',
        noOptionsMessage: 'No deposit options have been configured yet.',
        categories: {
          CASH_USD: 'Cash USD',
          LEMON: 'Lemon Cash',
          CRYPTO: 'Crypto',
          SWIFT: 'International transfer',
        },
        detailLabels: {
          bank_name: 'Bank',
          holder: 'Account holder',
          cbu_cvu: 'CBU / CVU',
          alias: 'Alias',
          lemon_tag: 'Lemon Tag',
          address: 'Address',
          network: 'Network',
          swift_code: 'SWIFT code',
          account_number: 'Account number',
          routing_number: 'Routing number',
          bank_address: 'Bank address',
          instructions: 'Instructions',
        },
        copy: 'Copy',
        copied: '✓ Copied!',
        processingHoursTitle: 'Processing hours:',
        processingHoursLine1: 'Requests until 16:00 h → processed at 18:00 h.',
        processingHoursLine2: 'Requests after that → 08:00 h the next business day.',
        depositButton: 'Already made your deposit?',
        depositButtonAction: 'Report deposit',
        requestForm: {
          title: 'Report deposit',
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
            label: 'Receipt',
            description:
              'Attach the transfer or deposit receipt. (JPG, PNG, WEBP or PDF · max. 5 MB)',
            upload: 'Upload receipt',
            tooLarge: 'File is too large. Maximum 5 MB.',
          },
          validation: {
            emailRequired: 'You must be logged in to submit a request.',
            invalidAmount: 'Enter a valid amount',
            selectNetwork: 'Select a network',
            attachmentRequired: 'Receipt is required except for cash deposits.',
          },
          submit: 'Register deposit',
          uploading: 'Uploading attachment...',
          submitting: 'Sending...',
        },
      },
      withdrawals: {
        title: 'Withdrawals',
        formTitle: 'Request withdrawal',
        subtitle: '',
        tabs: {
          newRequest: 'New request',
          history: 'Withdrawal history',
        },
        processingHoursTitle: 'Processing hours:',
        processingHoursLine1: 'Requests until 16:00 h → processed the same day.',
        processingHoursLine2: 'Requests after that → 08:00 h the next business day.',
        processingHoursLine3: 'The receipt will be sent by email once the withdrawal is completed.',
        form: {
          type: {
            label: 'Withdrawal type',
            partial: 'Partial',
            full: 'Full',
          },
          amount: {
            label: 'Amount',
            placeholder: '1,000.00',
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
          cash_usd: 'Cash USD',
          lemon: 'Lemon Cash',
          swift: 'SWIFT transfer',
          crypto: 'Crypto USDT/USDC',
        },
        lemonTag: {
          label: 'Your Lemontag',
          placeholder: 'Enter your Lemontag',
          winbitLabel: 'Winbit Lemontag',
        },
        registered: {
          title: 'Deposit reported',
          crypto:
            'The deposit was registered successfully.\n\nThe operation will be processed at the next operational close.\nOnce credited, you will receive the receipt by email.',
          cash: 'Your request was registered successfully. Cash operations are coordinated personally. A member of our team will contact you to coordinate the deposit or withdrawal.',
          international:
            'Your request was registered successfully. International transfers are coordinated personally. Our team will contact you by email to continue the process.',
          withdrawalTitle: 'Withdrawal requested',
          withdrawal:
            'The withdrawal request was registered successfully.\n\nThe withdrawal will be processed at the next operational close.\nOnce completed, you will receive the receipt by email.',
        },
      },
      history: {
        monthsShort: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ],
        title: 'History',
        subtitle: 'Account movement history',
        emptyTitle: 'No movements yet',
        emptyDescription: 'When there are movements, you will see them here.',
        movement: {
          deposit: 'Deposit',
          withdrawal: 'Withdrawal',
          trading_fee: 'Trading fee',
          trading_fee_withdrawal: 'Trading Fee on withdrawal',
          trading_fee_adjustment: 'Trading Fee - Adjustment',
          operating_result: 'Operating result',
          referral_commission: 'Referral commission',
          withdrawalAmount: 'Withdrawal: {{amount}}',
          withdrawalAmountShort: 'Withdrawal {{amount}}',
          toDate: 'to date',
        },
        status: {
          completed: 'Completed',
          pending: 'Pending',
          rejected: 'Rejected',
          cancelled: 'Cancelled',
          depositCompleted: 'Credited',
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
        subtitle: 'Daily operating results',
        emptyTitle: 'No operating results yet',
        emptyDescription: 'When there are operating results, you will see them here.',
        movement: {
          operatingResult: 'Operating result',
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
