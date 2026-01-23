/**
 * API Service - Comunicación con winbit-rails backend
 * Reemplaza el antiguo servicio de Google Sheets
 */

const getApiUrl = () => {
  // Obtener URL base de la API desde variables de entorno
  const apiUrl = import.meta.env?.VITE_API_URL ?? globalThis?.process?.env?.VITE_API_URL;

  // Default para desarrollo local
  return apiUrl || 'http://localhost:3000';
};

const API_BASE_URL = getApiUrl();

/**
 * Fetch wrapper que silencia errores 404 en la consola
 * Los 404 son esperados cuando un inversor no existe o está inactivo
 */
const silentFetch = async (url, options = {}) => {
  const response = await fetch(url, options);
  return response;
};

/**
 * Obtiene los datos del inversor (balance, retornos, etc.)
 * @param {string} email - Email del inversor
 * @returns {Promise<{data: object | null, error: string | null}>}
 */
export const getInvestorData = async (email) => {
  try {
    if (!email) {
      throw new Error('Email is required');
    }

    const encodedEmail = encodeURIComponent(email);
    const url = `${API_BASE_URL}/api/public/investor/${encodedEmail}`;

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Investor not found in database');
      }
      if (response.status === 403) {
        throw new Error('Investor account is not active');
      }
      throw new Error(`API Error: ${response.status}`);
    }

    const result = await response.json();
    const { investor, portfolio } = result.data;

    const balance = portfolio?.currentBalance ?? 0;
    const totalInvested = portfolio?.totalInvested ?? 0;

    // Rails keeps accumulated return fields, but during manual testing they can be 0 while balance already includes PROFIT.
    // Fallback: derive the return from balances so the dashboard reflects the investor's gain/loss.
    const derivedReturnUsd = balance - totalInvested;
    const hasDerivedReturn =
      Number.isFinite(derivedReturnUsd) && Math.abs(derivedReturnUsd) > 0.0001;

    const apiTotalReturnUsd = portfolio?.accumulatedReturnUSD ?? 0;
    const apiTotalReturnPct = portfolio?.accumulatedReturnPercent ?? 0;

    const totalReturnUsd =
      apiTotalReturnUsd === 0 && hasDerivedReturn ? derivedReturnUsd : apiTotalReturnUsd;
    const totalReturnPct =
      apiTotalReturnPct === 0 && hasDerivedReturn && totalInvested > 0
        ? (derivedReturnUsd / totalInvested) * 100
        : apiTotalReturnPct;

    // Mapear la respuesta de la API al formato esperado por la aplicación
    const mappedData = {
      email: investor.email,
      name: investor.name,
      balance,
      totalInvested,
      totalReturnUsd,
      totalReturnPct,
      annualReturnUsd: portfolio?.annualReturnUSD ?? 0,
      annualReturnPct: portfolio?.annualReturnPercent ?? 0,
      lastUpdated: portfolio?.updatedAt ?? new Date().toISOString(),
      historicalData: [], // Se obtiene por separado con getInvestorHistory
    };

    return { data: mappedData, error: null };
  } catch (error) {
    return {
      data: null,
      error: error.message,
    };
  }
};

/**
 * Obtiene el historial de movimientos del inversor
 * @param {string} email - Email del inversor
 * @returns {Promise<{data: array | null, error: string | null}>}
 */
export const getInvestorHistory = async (email) => {
  try {
    if (!email) {
      throw new Error('Email is required');
    }

    const encodedEmail = encodeURIComponent(email);
    const url = `${API_BASE_URL}/api/public/investor/${encodedEmail}/history`;

    const response = await silentFetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Investor not found in database');
      }
      if (response.status === 403) {
        throw new Error('Investor account is not active');
      }
      throw new Error(`API Error: ${response.status}`);
    }

    const result = await response.json();

    // Mapear la respuesta de la API al formato esperado por la aplicación
    const mappedHistory = result.data.map((item) => ({
      id: item.id,
      code: item.investorId?.toString() ?? '',
      date: item.date,
      movement: item.event,
      amount: item.amount,
      previousBalance: item.previousBalance,
      newBalance: item.newBalance,
      status: item.status,
      tradingFeePeriodLabel: item.tradingFeePeriodLabel ?? null,
      tradingFeePercentage: item.tradingFeePercentage ?? null,
    }));

    return { data: mappedHistory, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

/**
 * Obtiene las wallets disponibles para depósitos
 * @returns {Promise<{data: array | null, error: string | null}>}
 */
export const getWallets = async () => {
  try {
    const url = `${API_BASE_URL}/api/public/wallets`;
    const response = await silentFetch(url);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const result = await response.json();
    return { data: result.data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

/**
 * Crea una solicitud de depósito o retiro
 * @param {object} requestData - Datos de la solicitud
 * @param {string} requestData.investorEmail - Email del inversor
 * @param {string} requestData.requestType - Tipo: 'DEPOSITO', 'RETIRO_PARCIAL', 'RETIRO_TOTAL'
 * @param {number} requestData.amount - Monto (0 para retiro total)
 * @param {string} requestData.walletType - Tipo de wallet (para depósitos)
 * @param {string} requestData.notes - Notas adicionales
 * @returns {Promise<{data: object | null, error: string | null}>}
 */
export const createInvestorRequest = async (requestData) => {
  try {
    const url = `${API_BASE_URL}/api/public/requests`;

    const response = await silentFetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API Error: ${response.status}`);
    }

    const result = await response.json();
    return { data: result.data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

/**
 * Valida si un inversor existe y está activo
 * @param {string} email - Email del inversor
 * @returns {Promise<{valid: boolean, investor: object | null, error: string | null}>}
 */
export const validateInvestor = async (email) => {
  try {
    if (!email) {
      return { valid: false, investor: null, error: 'Email is required' };
    }

    const encodedEmail = encodeURIComponent(email);
    const url = `${API_BASE_URL}/api/public/investor/${encodedEmail}`;

    const response = await silentFetch(url);

    if (response.status === 404) {
      // 404 es esperado cuando el inversor no existe - no es un error
      return {
        valid: false,
        investor: null,
        error: 'Investor not found in database',
      };
    }

    if (response.status === 403) {
      // 403 es esperado cuando el inversor está inactivo
      return {
        valid: false,
        investor: null,
        error: 'Investor account is not active',
      };
    }

    if (!response.ok) {
      console.error(`API Error validating investor: ${response.status} - ${url}`);
      throw new Error(`API Error: ${response.status}`);
    }

    const result = await response.json();
    return {
      valid: true,
      investor: result.data.investor,
      error: null,
    };
  } catch (error) {
    return {
      valid: false,
      investor: null,
      error: error.message,
    };
  }
};
