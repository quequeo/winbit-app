const getEnv = (key) => {
  // In the Vite build, import.meta.env is available.
  // In tests (node), we fall back to globalThis.process.env so we can stub values.
  return import.meta.env?.[key] ?? globalThis?.process?.env?.[key];
};

const DASHBOARD_SHEET_NAME = 'DASHBOARD';
const HISTORIAL_SHEET_NAME = 'HISTORIAL';
const INVERSORES_SHEET_NAME = 'INVERSORES';
const CORREOS_SHEET_NAME = 'CORREOS';

const normalizeHeader = (value) => {
  return String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ');
};

const isThousandsGrouping = (value) => {
  // e.g. "53.272" (thousands) or "1.234.567"
  const parts = String(value).split('.');
  return parts.length > 1 && parts.slice(1).every((p) => p.length === 3);
};

const parseNumber = (value) => {
  if (value === null || value === undefined) {
    return 0;
  }
  const raw = String(value).trim();
  if (!raw) {
    return 0;
  }

  const noPct = raw.replace('%', '').trim();
  const stripped = noPct.replace(/[^\d.,+-]/g, '');

  // Handle Spanish formatting: thousands "." and decimal ","
  let cleaned = stripped;
  if (cleaned.includes(',') && cleaned.includes('.')) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (cleaned.includes(',')) {
    cleaned = cleaned.replace(',', '.');
  } else if (cleaned.includes('.') && isThousandsGrouping(cleaned)) {
    cleaned = cleaned.replace(/\./g, '');
  }

  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
};

const findEmailColumnIndex = (headers) => {
  const candidates = new Set([
    'EMAIL',
    'MAIL',
    'CORREO',
    'CORREO ELECTRONICO',
    'CORREO ELECTRÓNICO',
    'CORREOS ELECTRONICOS',
    'CORREOS ELECTRÓNICOS',
  ]);

  return headers.findIndex((h) => candidates.has(normalizeHeader(h)));
};

const findCodeColumnIndex = (headers) => {
  const candidates = new Set(['CODIGO', 'CÓDIGO', 'INVERSORES', 'INVERSOR', 'ID', 'CLIENTE']);
  return headers.findIndex((h) => candidates.has(normalizeHeader(h)));
};

const findRowForEmail = (rows, headers, email) => {
  const emailLower = String(email ?? '')
    .toLowerCase()
    .trim();
  if (!emailLower) {
    return null;
  }

  const emailCol = findEmailColumnIndex(headers);
  if (emailCol >= 0) {
    return (
      rows.find(
        (row) =>
          String(row[emailCol] ?? '')
            .toLowerCase()
            .trim() === emailLower,
      ) ?? null
    );
  }

  // Fallback: search any cell for email match (if the sheet doesn't have an explicit email column)
  return (
    rows.find((row) =>
      row?.some(
        (cell) =>
          String(cell ?? '')
            .toLowerCase()
            .trim() === emailLower,
      ),
    ) ?? null
  );
};

const findRowForCode = (rows, headers, code) => {
  const codeNormalized = String(code ?? '').trim();
  if (!codeNormalized) {
    return null;
  }
  const codeCol = findCodeColumnIndex(headers);
  if (codeCol < 0) {
    return null;
  }
  return rows.find((row) => String(row?.[codeCol] ?? '').trim() === codeNormalized) ?? null;
};

const parseDashboardSheet = async ({ values, email, investorCode, apiKey, sheetId }) => {
  if (!values || values.length === 0) {
    throw new Error('No data found in sheet');
  }

  const headers = values[0] ?? [];
  const rows = values.slice(1);

  let investorRow = findRowForEmail(rows, headers, email);
  if (!investorRow && investorCode) {
    investorRow = findRowForCode(rows, headers, investorCode);
  }
  if (!investorRow) {
    throw new Error('Investor not found in database');
  }

  const idxInvestor = headers.findIndex((h) => normalizeHeader(h) === 'INVERSORES');
  const idxCapital = headers.findIndex((h) => normalizeHeader(h) === 'CAPITAL ACTUAL');
  const idxTotalUsd = headers.findIndex(
    (h) => normalizeHeader(h) === 'REND ACUMULADO DESDE EL INICIO',
  );
  const idxTotalPct = headers.findIndex(
    (h) => normalizeHeader(h).includes('R.A.') && normalizeHeader(h).includes('%'),
  );
  const idxAnnualUsd = headers.findIndex(
    (h) => normalizeHeader(h) === 'RENDIMIENTO ACUMULADO ANUAL',
  );
  const idxAnnualPct = headers.findIndex(
    (h) => normalizeHeader(h).includes('R.A.A') && normalizeHeader(h).includes('%'),
  );

  if (
    idxCapital < 0 ||
    idxTotalUsd < 0 ||
    idxTotalPct < 0 ||
    idxAnnualUsd < 0 ||
    idxAnnualPct < 0
  ) {
    throw new Error('Dashboard sheet columns not configured');
  }

  const capitalActual = parseNumber(investorRow[idxCapital]);
  const totalReturnUsd = parseNumber(investorRow[idxTotalUsd]);
  const totalReturnPct = parseNumber(investorRow[idxTotalPct]);
  const annualReturnUsd = parseNumber(investorRow[idxAnnualUsd]);
  const annualReturnPct = parseNumber(investorRow[idxAnnualPct]);

  const investorId = idxInvestor >= 0 ? String(investorRow[idxInvestor] ?? '').trim() : '';

  // Get investor name from INVERSORES sheet
  const investorName = await getInvestorNameFromInversoresSheet({
    apiKey,
    sheetId,
    email,
    investorCode: investorId,
  });

  // Get last updated date from HISTORIAL sheet
  const lastUpdated = await getLastUpdatedDateFromHistorial({
    apiKey,
    sheetId,
    investorCode: investorId,
  });

  return {
    email,
    name: investorName || investorId || email,
    balance: capitalActual,
    totalReturnUsd,
    totalReturnPct,
    annualReturnUsd,
    annualReturnPct,
    historicalData: [],
    lastUpdated,
  };
};

const parseDateToIso = (value) => {
  const raw = String(value ?? '').trim();
  if (!raw) {
    return '';
  }

  // dd/mm or dd/mm/yyyy
  const m = raw.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
  if (m) {
    const day = Number(m[1]);
    const month = Number(m[2]);
    const year = m[3] ? Number(m[3].length === 2 ? `20${m[3]}` : m[3]) : new Date().getFullYear();
    const d = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    return Number.isFinite(d.getTime()) ? d.toISOString() : '';
  }

  const d = new Date(raw);
  return Number.isFinite(d.getTime()) ? d.toISOString() : '';
};

const getSheetValues = async ({ sheetId, apiKey, range }) => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(
    range,
  )}?key=${apiKey}`;
  const response = await fetch(url);
  if (!response.ok) {
    const err = new Error('Failed to fetch investor data');
    err.status = response.status;
    throw err;
  }
  const result = await response.json();
  return result.values || [];
};

const getInvestorNameFromInversoresSheet = async ({ apiKey, sheetId, email, investorCode }) => {
  try {
    const values = await getSheetValues({ sheetId, apiKey, range: `${INVERSORES_SHEET_NAME}!A:Z` });
    if (!values.length) {
      return '';
    }

    const headers = values[0] ?? [];
    const rows = values.slice(1);

    const emailCol = findEmailColumnIndex(headers);
    const codeCol = findCodeColumnIndex(headers);
    const nameCol = headers.findIndex((h) => normalizeHeader(h) === 'NOMBRE');

    if (nameCol < 0) {
      return '';
    }

    // Try to find by email first
    if (emailCol >= 0 && email) {
      const emailLower = String(email).toLowerCase().trim();
      const row = rows.find(
        (r) =>
          String(r?.[emailCol] ?? '')
            .toLowerCase()
            .trim() === emailLower,
      );
      if (row) {
        return String(row[nameCol] ?? '').trim();
      }
    }

    // Try to find by code if email didn't work
    if (codeCol >= 0 && investorCode) {
      const row = rows.find((r) => String(r?.[codeCol] ?? '').trim() === investorCode);
      if (row) {
        return String(row[nameCol] ?? '').trim();
      }
    }

    return '';
  } catch (err) {
    // If INVERSORES sheet doesn't exist or has issues, return empty name
    return '';
  }
};

const getLastUpdatedDateFromHistorial = async ({ apiKey, sheetId, investorCode }) => {
  try {
    const values = await getSheetValues({
      sheetId,
      apiKey,
      range: `${HISTORIAL_SHEET_NAME}!A:Z`,
    });

    if (!values.length) {
      return new Date().toISOString(); // Fallback to current date
    }

    const headers = values[0] ?? [];
    const rows = values.slice(1);

    const codeCol = headers.findIndex((h) => normalizeHeader(h) === 'CODIGO');
    const dateCol = headers.findIndex((h) => normalizeHeader(h) === 'FECHA');

    if (codeCol < 0 || dateCol < 0) {
      return new Date().toISOString(); // Fallback to current date
    }

    // Filter rows for this investor and get all dates
    const investorRows = rows.filter(
      (row) => String(row?.[codeCol] ?? '').trim() === String(investorCode).trim(),
    );

    if (investorRows.length === 0) {
      return new Date().toISOString(); // Fallback to current date
    }

    // Get all dates and find the most recent one
    const dates = investorRows
      .map((row) => parseDateToIso(row?.[dateCol]))
      .filter((date) => date) // Remove empty dates
      .sort((a, b) => new Date(b) - new Date(a)); // Sort descending (most recent first)

    if (dates.length === 0) {
      return new Date().toISOString(); // Fallback to current date
    }

    return dates[0]; // Return the most recent date
  } catch (err) {
    // If HISTORIAL sheet doesn't exist or has issues, return current date
    return new Date().toISOString();
  }
};

const resolveInvestorCode = async ({ apiKey, sheetId, email }) => {
  // Try to resolve from DASHBOARD (requires EMAIL column).
  const dashboardValues = await getSheetValues({
    sheetId,
    apiKey,
    range: `${DASHBOARD_SHEET_NAME}!A:Z`,
  });

  const headers = dashboardValues[0] ?? [];
  const rows = dashboardValues.slice(1);

  const investorRow = findRowForEmail(rows, headers, email);
  const idxInvestor = headers.findIndex((h) => normalizeHeader(h) === 'INVERSORES');
  if (investorRow && idxInvestor >= 0) {
    const code = String(investorRow[idxInvestor] ?? '').trim();
    if (code) {
      return code;
    }
  }

  const resolveFromMappingSheet = async (sheetName) => {
    const values = await getSheetValues({ sheetId, apiKey, range: `${sheetName}!A:Z` });
    if (!values.length) {
      return '';
    }

    const sheetHeaders = values[0] ?? [];
    const sheetRows = values.slice(1);
    const emailCol = findEmailColumnIndex(sheetHeaders);
    const codeCol = findCodeColumnIndex(sheetHeaders);

    if (emailCol < 0 || codeCol < 0) {
      return '';
    }

    const emailLower = String(email ?? '')
      .toLowerCase()
      .trim();
    const row =
      sheetRows.find(
        (r) =>
          String(r?.[emailCol] ?? '')
            .toLowerCase()
            .trim() === emailLower,
      ) ?? null;

    return row ? String(row?.[codeCol] ?? '').trim() : '';
  };

  // Fallback 1: INVERSORES mapping (EMAIL -> CODIGO)
  try {
    const code = await resolveFromMappingSheet(INVERSORES_SHEET_NAME);
    if (code) {
      return code;
    }
  } catch (err) {
    // ignore and try next fallback unless the sheet is missing
    if (!(err?.status === 400 || err?.status === 404)) {
      // Some other error (network, auth). Bubble up.
      throw err;
    }
  }

  // Fallback 2: CORREOS mapping (EMAIL -> CODIGO/INVERSORES/etc.)
  let correosValues;
  try {
    correosValues = await getSheetValues({ sheetId, apiKey, range: `${CORREOS_SHEET_NAME}!A:Z` });
  } catch (err) {
    if (err?.status === 400 || err?.status === 404) {
      throw new Error('Investor email mapping not configured');
    }
    throw err;
  }

  if (!correosValues.length) {
    throw new Error('Investor email mapping not configured');
  }

  const correosHeaders = correosValues[0] ?? [];
  const correosRows = correosValues.slice(1);
  const emailCol = findEmailColumnIndex(correosHeaders);
  const codeCol = findCodeColumnIndex(correosHeaders);

  if (emailCol < 0 || codeCol < 0) {
    throw new Error('Investor email mapping not configured');
  }

  const emailLower = String(email ?? '')
    .toLowerCase()
    .trim();
  const row =
    correosRows.find(
      (r) =>
        String(r?.[emailCol] ?? '')
          .toLowerCase()
          .trim() === emailLower,
    ) ?? null;

  const code = row ? String(row?.[codeCol] ?? '').trim() : '';
  if (!code) {
    throw new Error('Investor email mapping not configured');
  }

  return code;
};

export const getInvestorHistory = async (email) => {
  try {
    const API_KEY = getEnv('VITE_GOOGLE_SHEETS_API_KEY');
    const SHEET_ID = getEnv('VITE_GOOGLE_SHEETS_ID');

    if (!API_KEY || !SHEET_ID || SHEET_ID === 'PENDING_FROM_CHUECO') {
      throw new Error('Google Sheets credentials not configured');
    }

    const investorCode = await resolveInvestorCode({ apiKey: API_KEY, sheetId: SHEET_ID, email });

    const values = await getSheetValues({
      sheetId: SHEET_ID,
      apiKey: API_KEY,
      range: `${HISTORIAL_SHEET_NAME}!A:Z`,
    });

    if (!values.length) {
      throw new Error('No data found in sheet');
    }

    const headers = values[0] ?? [];
    const rows = values.slice(1);

    const idxCodigo = headers.findIndex((h) => normalizeHeader(h) === 'CODIGO');
    const idxFecha = headers.findIndex((h) => normalizeHeader(h) === 'FECHA');
    const idxMovimiento = headers.findIndex((h) => normalizeHeader(h) === 'MOVIMIENTO');
    const idxMonto = headers.findIndex((h) => normalizeHeader(h) === 'MONTO');
    const idxPrev = headers.findIndex((h) => normalizeHeader(h) === 'SALDO PREVIO');
    const idxPost = headers.findIndex((h) => normalizeHeader(h) === 'SALDO POSTERIOR');
    const idxEstado = headers.findIndex((h) => normalizeHeader(h) === 'ESTADO');

    if (
      idxCodigo < 0 ||
      idxFecha < 0 ||
      idxMovimiento < 0 ||
      idxMonto < 0 ||
      idxPrev < 0 ||
      idxPost < 0 ||
      idxEstado < 0
    ) {
      throw new Error('History sheet columns not configured');
    }

    const history = rows
      .filter((row) => String(row?.[idxCodigo] ?? '').trim() === String(investorCode).trim())
      .map((row) => ({
        code: String(row?.[idxCodigo] ?? '').trim(),
        date: parseDateToIso(row?.[idxFecha]),
        movement: String(row?.[idxMovimiento] ?? '').trim(),
        amount: parseNumber(row?.[idxMonto]),
        previousBalance: parseNumber(row?.[idxPrev]),
        newBalance: parseNumber(row?.[idxPost]),
        status: String(row?.[idxEstado] ?? '').trim(),
      }))
      .sort((a, b) => {
        const aT = a.date ? new Date(a.date).getTime() : 0;
        const bT = b.date ? new Date(b.date).getTime() : 0;
        return bT - aT;
      });

    return { data: history, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const getInvestorData = async (email) => {
  try {
    const API_KEY = getEnv('VITE_GOOGLE_SHEETS_API_KEY');
    const SHEET_ID = getEnv('VITE_GOOGLE_SHEETS_ID');

    if (!API_KEY || !SHEET_ID || SHEET_ID === 'PENDING_FROM_CHUECO') {
      throw new Error('Google Sheets credentials not configured');
    }

    // Prefer the new DASHBOARD sheet when present.
    let result;
    try {
      const values = await getSheetValues({
        sheetId: SHEET_ID,
        apiKey: API_KEY,
        range: `${DASHBOARD_SHEET_NAME}!A:Z`,
      });
      result = { values };
    } catch (err) {
      // Only fallback when the sheet/tab is missing (Google Sheets API typically returns 400/404).
      if (err?.status === 400 || err?.status === 404) {
        const values = await getSheetValues({ sheetId: SHEET_ID, apiKey: API_KEY, range: 'A:Z' });
        result = { values };
      } else {
        throw err;
      }
    }

    const values = result.values || [];

    // Detect whether the first row looks like the new dashboard header.
    const firstRow = values[0] || [];
    const looksLikeNewDashboard = firstRow.some(
      (cell) => normalizeHeader(cell) === 'CAPITAL ACTUAL',
    );

    if (looksLikeNewDashboard) {
      try {
        const data = await parseDashboardSheet({
          values,
          email,
          apiKey: API_KEY,
          sheetId: SHEET_ID,
        });
        return { data, error: null };
      } catch (err) {
        if (err?.message === 'Investor not found in database') {
          const headers = values[0] ?? [];
          const hasEmailHeader = findEmailColumnIndex(headers) >= 0;
          if (hasEmailHeader) {
            throw err;
          }

          const investorCode = await resolveInvestorCode({
            apiKey: API_KEY,
            sheetId: SHEET_ID,
            email,
          });
          const data = await parseDashboardSheet({
            values,
            email,
            investorCode,
            apiKey: API_KEY,
            sheetId: SHEET_ID,
          });
          return { data, error: null };
        }
        throw err;
      }
    }

    // Legacy parsing (email in col A)
    const rows = values;

    if (rows.length === 0) {
      throw new Error('No data found in sheet');
    }

    const investorRow = rows.find((row) => row[0]?.toLowerCase() === email.toLowerCase());

    if (!investorRow) {
      throw new Error('Investor not found in database');
    }

    const historicalData = investorRow
      .slice(5)
      .map((value, index) => ({
        date: `Day ${index + 1}`,
        balance: parseFloat(value) || 0,
      }))
      .filter((item) => item.balance > 0);

    return {
      data: {
        email: investorRow[0],
        name: investorRow[1],
        balance: parseFloat(investorRow[2]) || 0,
        totalInvested: parseFloat(investorRow[3]) || 0,
        returns: parseFloat(investorRow[4]) || 0,
        historicalData,
        lastUpdated: new Date().toISOString(),
      },
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error.message,
    };
  }
};
