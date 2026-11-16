/**
 * API Service - Comunicación con winbit-rails backend
 * Reemplaza el antiguo servicio de Google Sheets
 */

import { normalizeOperatingDirection } from '../utils/operatingTrade';

const getApiUrl = () => {
  // En dev, usar rutas relativas: Vite proxya /api al backend (evita CORS si el puerto no es 5173).
  if (import.meta.env.DEV) {
    return '';
  }

  const apiUrl = import.meta.env?.VITE_API_URL ?? globalThis?.process?.env?.VITE_API_URL;
  return apiUrl || 'http://localhost:3000';
};

const API_BASE_URL = getApiUrl();
const PUBLIC_API_PREFIX = '/api/public/v1';

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
    const url = `${API_BASE_URL}${PUBLIC_API_PREFIX}/investor/${encodedEmail}`;

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

    // Strategy return (main metric): TWR-based, independent of deposits/withdrawals.
    // Fallbacks keep the app usable even if backend hasn't been updated.
    const derivedReturnUsd = balance - totalInvested;
    const hasDerivedReturn =
      Number.isFinite(derivedReturnUsd) && Math.abs(derivedReturnUsd) > 0.0001;

    const strategyReturnYtdUsd = portfolio?.strategyReturnYtdUSD ?? 0;
    const strategyReturnYtdPct = portfolio?.strategyReturnYtdPercent ?? 0;
    const strategyReturnYtdFrom = portfolio?.strategyReturnYtdFrom ?? null;

    const apiAllUsd = portfolio?.strategyReturnAllUSD;
    const apiAllPct = portfolio?.strategyReturnAllPercent;

    const legacyAllUsd = portfolio?.accumulatedReturnUSD ?? 0;
    const legacyAllPct = portfolio?.accumulatedReturnPercent ?? 0;

    const strategyReturnAllUsd =
      apiAllUsd !== undefined && apiAllUsd !== null
        ? apiAllUsd
        : legacyAllUsd === 0 && hasDerivedReturn
          ? derivedReturnUsd
          : legacyAllUsd;

    const strategyReturnAllPct =
      apiAllPct !== undefined && apiAllPct !== null
        ? apiAllPct
        : legacyAllPct === 0 && hasDerivedReturn && totalInvested > 0
          ? (derivedReturnUsd / totalInvested) * 100
          : legacyAllPct;

    const strategyReturnAllFrom = portfolio?.strategyReturnAllFrom ?? null;

    // Net of the service cost, from the same calculation as the monthly PDF
    // report and the admin. Falls back to the older fields only if the
    // backend doesn't send them.
    const netContributedUsd = portfolio?.netContributedUSD ?? totalInvested;
    const monthReturnNetUsd = portfolio?.monthReturnNetUSD ?? null;
    const monthReturnNetPct = portfolio?.monthReturnNetPercent ?? null;
    const strategyReturnYtdNetUsd = portfolio?.strategyReturnYtdNetUSD ?? strategyReturnYtdUsd;
    const strategyReturnYtdNetPct = portfolio?.strategyReturnYtdNetPercent ?? strategyReturnYtdPct;
    const strategyReturnAllNetUsd = portfolio?.strategyReturnAllNetUSD ?? strategyReturnAllUsd;
    const strategyReturnAllNetPct = portfolio?.strategyReturnAllNetPercent ?? strategyReturnAllPct;

    // Mapear la respuesta de la API al formato esperado por la aplicación
    const mappedData = {
      email: investor.email,
      name: investor.name,
      balance,
      totalInvested,
      netContributedUsd,
      monthReturnNetUsd,
      monthReturnNetPct,
      strategyReturnYtdNetUsd,
      strategyReturnYtdNetPct,
      strategyReturnAllNetUsd,
      strategyReturnAllNetPct,
      strategyReturnYtdUsd,
      strategyReturnYtdPct,
      strategyReturnYtdFrom,
      strategyReturnAllUsd,
      strategyReturnAllPct,
      strategyReturnAllFrom,
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
    const url = `${API_BASE_URL}${PUBLIC_API_PREFIX}/investor/${encodedEmail}/history`;

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
    const mappedHistory = result.data.map((item) => {
      const strategyOp = item.strategyOperation ?? item.strategy_operation ?? null;
      return {
        id: item.id,
        code: item.investorId?.toString() ?? '',
        date: item.date,
        movement: item.event,
        amount: item.amount,
        previousBalance: item.previousBalance ?? item.previous_balance ?? null,
        newBalance: item.newBalance ?? item.new_balance ?? null,
        status: item.status,
        method: item.method ?? null,
        network: item.network ?? null,
        walletAddress: item.walletAddress ?? item.wallet_address ?? null,
        lemontag: item.lemontag ?? null,
        cancelledAt: item.cancelledAt ?? item.cancelled_at ?? null,
        tradingFeePeriodLabel: item.tradingFeePeriodLabel ?? null,
        tradingFeePercentage: item.tradingFeePercentage ?? null,
        tradingFeeSource: item.tradingFeeSource ?? null,
        tradingFeeWithdrawalAmount: item.tradingFeeWithdrawalAmount ?? null,
        attachmentUrl: item.attachmentUrl ?? null,
        asset: item.asset ?? item.operatingAsset ?? item.tradeAsset ?? strategyOp?.asset ?? null,
        contract:
          item.contract ??
          item.asset ??
          item.operatingAsset ??
          item.tradeAsset ??
          strategyOp?.asset ??
          null,
        direction: normalizeOperatingDirection(item.direction ?? strategyOp?.direction ?? null),
        openedAt:
          item.openedAt ?? item.opened_at ?? strategyOp?.openedAt ?? strategyOp?.opened_at ?? null,
        closedAt:
          item.closedAt ?? item.closed_at ?? strategyOp?.closedAt ?? strategyOp?.closed_at ?? null,
        ratio: item.ratio ?? strategyOp?.ratio ?? null,
        timeframe: item.timeframe ?? strategyOp?.timeframe ?? null,
        resultLabel: item.resultLabel ?? item.result_label ?? strategyOp?.resultLabel ?? null,
        entryPrice: item.entryPrice ?? item.entry_price ?? strategyOp?.entryPrice ?? null,
        exitPrice: item.exitPrice ?? item.exit_price ?? strategyOp?.exitPrice ?? null,
        operatingResultPercent:
          item.operatingResultPercent ?? item.operating_result_percent ?? null,
        operatingResultPartial:
          item.operatingResultPartial ?? item.operating_result_partial ?? null,
        strategyOperation: strategyOp,
      };
    });

    return { data: mappedHistory, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

/**
 * Obtiene operaciones de estrategia (detalle diario cargado en admin).
 * @returns {Promise<{data: array | null, error: string | null}>}
 */
export const getStrategyOperations = async ({ from, to } = {}) => {
  try {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const qs = params.toString();
    const url = `${API_BASE_URL}${PUBLIC_API_PREFIX}/strategy_operations${qs ? `?${qs}` : ''}`;
    const response = await silentFetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        return { data: [], error: null };
      }
      throw new Error(`API Error: ${response.status}`);
    }

    const result = await response.json();
    const mapped = (result.data || []).map((item) => ({
      id: item.id,
      operationDate: item.operationDate ?? item.operation_date,
      asset: item.asset,
      contract: item.asset,
      direction: item.direction ?? null,
      openedAt: item.openedAt ?? item.opened_at ?? null,
      closedAt: item.closedAt ?? item.closed_at ?? null,
      ratio: item.ratio ?? null,
      timeframe: item.timeframe ?? null,
      resultLabel: item.resultLabel ?? item.result_label ?? null,
      entryPrice: item.entryPrice ?? item.entry_price ?? null,
      exitPrice: item.exitPrice ?? item.exit_price ?? null,
    }));

    return { data: mapped, error: null };
  } catch (error) {
    return { data: [], error: error.message };
  }
};

/**
 * Obtiene las wallets disponibles para depósitos
 * @returns {Promise<{data: array | null, error: string | null}>}
 */
export const getWallets = async () => {
  try {
    const url = `${API_BASE_URL}${PUBLIC_API_PREFIX}/wallets`;
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
 * Obtiene las opciones de depósito activas desde el backend
 * @returns {Promise<{data: array | null, error: string | null}>}
 */
export const getDepositOptions = async () => {
  try {
    const url = `${API_BASE_URL}${PUBLIC_API_PREFIX}/deposit_options`;
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
 * Obtiene métodos de pago habilitados para depósito o retiro
 * @param {'deposit'|'withdrawal'} flow
 * @returns {Promise<{data: array | null, error: string | null}>}
 */
export const getPaymentMethods = async (flow = 'withdrawal') => {
  try {
    const url = `${API_BASE_URL}${PUBLIC_API_PREFIX}/payment_methods?flow=${encodeURIComponent(flow)}`;
    const response = await silentFetch(url);

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
 * Calcula la comisión estimada de trading para un retiro (preview, sin crear nada)
 * @param {string} email - Email del inversor
 * @param {number} amount - Monto a retirar
 * @returns {Promise<{data: object | null, error: string | null}>}
 */
export const getWithdrawalFeePreview = async (email, amount) => {
  try {
    const encodedEmail = encodeURIComponent(email);
    const url = `${API_BASE_URL}${PUBLIC_API_PREFIX}/investor/${encodedEmail}/withdrawal_fee_preview?amount=${amount}`;

    const response = await silentFetch(url);

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

/** Acepta el id de la solicitud (UUID) o el id de history (`request_<uuid>`). */
const toRequestId = (value) => {
  const raw = String(value ?? '').trim();
  return raw.startsWith('request_') ? raw.slice('request_'.length) : raw;
};

/**
 * Crea una solicitud de depósito o retiro.
 * Con `replacesRequestId`, el backend crea la nueva y cancela la original (pendiente)
 * en la misma operación. Si la original ya fue procesada responde 422 y no crea nada.
 * @param {object} requestData - email, type, amount, method, network, walletAddress,
 *   lemontag, transactionHash, attachmentUrl y, opcional, replacesRequestId
 * @returns {Promise<{data: object | null, error: string | null}>}
 */
export const createInvestorRequest = async (requestData) => {
  try {
    const url = `${API_BASE_URL}${PUBLIC_API_PREFIX}/requests`;
    const { replacesRequestId, ...rest } = requestData ?? {};
    const payload = replacesRequestId
      ? { ...rest, replacesRequestId: toRequestId(replacesRequestId) }
      : rest;

    const response = await silentFetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
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
 * Cancela una solicitud pendiente del inversor.
 * @param {string} email - Email del inversor
 * @param {string} requestId - Id de la solicitud (acepta también `request_<id>`)
 * @returns {Promise<{data: object | null, error: string | null, status: number | null}>}
 *   status 422: la solicitud ya fue procesada. 404: no existe.
 */
export const cancelInvestorRequest = async (email, requestId) => {
  try {
    if (!email) {
      throw new Error('Email is required');
    }
    const id = toRequestId(requestId);
    if (!id) {
      throw new Error('Request id is required');
    }

    const url = `${API_BASE_URL}${PUBLIC_API_PREFIX}/requests/${encodeURIComponent(id)}/cancel`;
    const response = await silentFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        data: null,
        error: errorData.error || `API Error: ${response.status}`,
        status: response.status,
      };
    }

    const result = await response.json();
    return { data: result.data, error: null, status: response.status };
  } catch (error) {
    return { data: null, error: error.message, status: null };
  }
};

/**
 * Avisos al celular (Web Push): si están configurados en el servidor y la clave pública.
 * @returns {Promise<{data: {enabled: boolean, publicKey: string|null} | null, error: string | null}>}
 */
export const getPushConfig = async () => {
  try {
    const response = await silentFetch(`${API_BASE_URL}${PUBLIC_API_PREFIX}/push/config`);
    if (!response.ok) return { data: null, error: `API Error: ${response.status}` };
    const result = await response.json();
    return { data: result.data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

/**
 * Registra este dispositivo para recibir avisos.
 * @param {string} email
 * @param {{endpoint: string, keys: {p256dh: string, auth: string}}} subscription - PushSubscription.toJSON()
 */
export const savePushSubscription = async (email, subscription) => {
  try {
    const response = await silentFetch(`${API_BASE_URL}${PUBLIC_API_PREFIX}/push/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        endpoint: subscription?.endpoint,
        keys: { p256dh: subscription?.keys?.p256dh, auth: subscription?.keys?.auth },
      }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { data: null, error: errorData.error || `API Error: ${response.status}` };
    }
    const result = await response.json();
    return { data: result.data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

/** Desactiva los avisos de este dispositivo. */
export const deletePushSubscription = async (endpoint) => {
  try {
    const response = await silentFetch(`${API_BASE_URL}${PUBLIC_API_PREFIX}/push/subscriptions`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint }),
    });
    return { error: response.ok ? null : `API Error: ${response.status}` };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Login con email y contraseña
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{data: object | null, error: string | null}>}
 */
export const loginWithEmailPassword = async (email, password) => {
  try {
    const url = `${API_BASE_URL}${PUBLIC_API_PREFIX}/auth/login`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { data: null, error: errorData.error || `Error: ${response.status}` };
    }

    const result = await response.json();
    return { data: result.investor, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

/**
 * Cambiar contraseña del inversor
 * @param {string} email
 * @param {string} currentPassword
 * @param {string} newPassword
 * @returns {Promise<{success: boolean, error: string | null}>}
 */
export const changeInvestorPassword = async (email, currentPassword, newPassword) => {
  try {
    const url = `${API_BASE_URL}${PUBLIC_API_PREFIX}/auth/change_password`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { success: false, error: errorData.error || `Error: ${response.status}` };
    }

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
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
    const url = `${API_BASE_URL}${PUBLIC_API_PREFIX}/investor/${encodedEmail}`;

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

const parseFilenameFromContentDisposition = (header) => {
  if (!header) return null;
  const utf8Match = /filename\*=(?:UTF-8''|utf-8'')([^;]+)/i.exec(header);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].trim().replace(/^"|"$/g, ''));
    } catch {
      return utf8Match[1].trim();
    }
  }
  const plainMatch = /filename="([^"]+)"|filename=([^;]+)/i.exec(header);
  const raw = plainMatch?.[1] ?? plainMatch?.[2];
  return raw ? raw.trim() : null;
};

/**
 * Descarga el PDF de reporte mensual del inversor.
 * Sin `month` el backend usa el último mes cerrado.
 * @param {string} email
 * @param {string} [month] - YYYY-MM opcional
 * @returns {Promise<{data: {blob: Blob, filename: string} | null, error: string | null}>}
 */
export const downloadInvestorMonthlyReport = async (email, month) => {
  try {
    if (!email) {
      throw new Error('Email is required');
    }

    const encodedEmail = encodeURIComponent(email);
    const query = month ? `?month=${encodeURIComponent(month)}` : '';
    const url = `${API_BASE_URL}${PUBLIC_API_PREFIX}/investor/${encodedEmail}/monthly_report${query}`;

    const response = await silentFetch(url);

    if (response.status === 404) {
      return { data: null, error: 'REPORT_NOT_FOUND' };
    }
    if (response.status === 403) {
      throw new Error('Investor account is not active');
    }
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const blob = await response.blob();
    const filename =
      parseFilenameFromContentDisposition(response.headers.get('content-disposition')) ||
      (month ? `reporte-${month}.pdf` : 'reporte-mensual.pdf');

    return { data: { blob, filename }, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};
