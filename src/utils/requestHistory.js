/**
 * Helpers para correlacionar POST /requests con GET /history.
 * Contrato: docs/REQUESTS_CONTRACT.md
 */

/** @typedef {'DEPOSIT' | 'WITHDRAWAL'} RequestType */
/** @typedef {'PENDING' | 'COMPLETED' | 'REJECTED' | 'CANCELLED'} RequestStatus */

/**
 * @typedef {Object} CreateRequestResponse
 * @property {number} id
 * @property {RequestType} type
 * @property {number} amount
 * @property {string} method
 * @property {RequestStatus} status
 * @property {string} [createdAt]
 */

/**
 * @typedef {Object} HistoryRow
 * @property {string} id
 * @property {string} movement
 * @property {number} amount
 * @property {RequestStatus} status
 * @property {string} date
 * @property {string|null} [method]
 */

/**
 * @typedef {'approved' | 'rejected' | 'cancelled' | 'created'} RequestTransitionKind
 */

/**
 * @typedef {Object} RequestTransition
 * @property {RequestTransitionKind} kind
 * @property {RequestType} type
 * @property {number} amount
 * @property {string} [requestId] - history id, ej. request_42
 * @property {string} [completedId] - id del movimiento COMPLETED post-aprobación
 */

const REQUEST_ID_PREFIX = 'request_';

export const normalizeRequestType = (value) => {
  const raw = String(value ?? '')
    .trim()
    .toUpperCase();
  if (raw === 'DEPOSIT' || raw === 'DEPOSITO') return 'DEPOSIT';
  if (raw === 'WITHDRAWAL' || raw === 'RETIRO') return 'WITHDRAWAL';
  return raw;
};

export const normalizeStatus = (value) =>
  String(value ?? '')
    .trim()
    .toUpperCase();

/** POST id → history id para filas pendientes */
export const pendingHistoryId = (requestId) => `${REQUEST_ID_PREFIX}${requestId}`;

/** history id → POST id (UUID en Rails), o null si no es solicitud */
export const parseRequestIdFromHistoryId = (historyId) => {
  const raw = String(historyId ?? '');
  if (!raw.startsWith(REQUEST_ID_PREFIX)) return null;
  return raw.slice(REQUEST_ID_PREFIX.length) || null;
};

export const isRequestHistoryId = (historyId) => parseRequestIdFromHistoryId(historyId) !== null;

export const isPendingRequestRow = (row) =>
  normalizeStatus(row?.status) === 'PENDING' && isRequestHistoryId(row?.id);

export const isRejectedRequestRow = (row) =>
  normalizeStatus(row?.status) === 'REJECTED' && isRequestHistoryId(row?.id);

export const isCancelledRequestRow = (row) =>
  normalizeStatus(row?.status) === 'CANCELLED' && isRequestHistoryId(row?.id);

/**
 * Solicitud de depósito o retiro que el inversor todavía puede cancelar o corregir:
 * pendiente y con id de solicitud (`request_<uuid>`).
 */
export const isManageablePendingRequest = (row) => {
  if (!isPendingRequestRow(row)) return false;
  const type = normalizeRequestType(row?.movement);
  return type === 'DEPOSIT' || type === 'WITHDRAWAL';
};

/** Param de URL con el id de history (`request_<uuid>`) de la solicitud a corregir. */
export const CORRECTION_PARAM = 'correct';

/** Formulario que corrige la solicitud: depósitos en /wallets, retiros en /requests. */
export const buildCorrectionHref = (row) => {
  const base = normalizeRequestType(row?.movement) === 'DEPOSIT' ? '/wallets' : '/requests';
  return `${base}?${CORRECTION_PARAM}=${encodeURIComponent(String(row?.id ?? ''))}`;
};

/**
 * Busca en history la solicitud pendiente a corregir (por id), del tipo indicado.
 * Devuelve null si no existe o si ya no está pendiente.
 * @param {HistoryRow[]} rows
 * @param {string|null} historyId
 * @param {RequestType} type
 */
export const findCorrectableRequest = (rows, historyId, type) => {
  if (!historyId || !Array.isArray(rows)) return null;
  const row = rows.find((r) => String(r?.id) === String(historyId));
  if (!row || !isManageablePendingRequest(row)) return null;
  return normalizeRequestType(row.movement) === type ? row : null;
};

const indexById = (rows) => {
  const map = new Map();
  for (const row of rows ?? []) {
    if (row?.id != null) map.set(String(row.id), row);
  }
  return map;
};

/**
 * Detecta transiciones relevantes para notificaciones in-app.
 * - rejected: mismo request_N, PENDING → REJECTED
 * - cancelled: mismo request_N, PENDING → CANCELLED (lo cancela el inversor o una corrección)
 * - approved: request_N desaparece y aparece COMPLETED nuevo (otro id)
 * - created: aparece request_N PENDING (útil tras POST + refetch)
 *
 * @param {HistoryRow[]} prevRows
 * @param {HistoryRow[]} nextRows
 * @returns {RequestTransition[]}
 */
export const detectRequestTransitions = (prevRows, nextRows) => {
  const prev = indexById(prevRows);
  const next = indexById(nextRows);
  const transitions = [];

  for (const [id, prevRow] of prev.entries()) {
    if (!isRequestHistoryId(id)) continue;

    const nextRow = next.get(id);
    const prevStatus = normalizeStatus(prevRow.status);
    const nextStatus = normalizeStatus(nextRow?.status);

    // Cancelada por el propio inversor (o reemplazada por una corrección):
    // se informa aparte para que no se confunda con un rechazo.
    if (prevStatus === 'PENDING' && nextStatus === 'CANCELLED') {
      transitions.push({
        kind: 'cancelled',
        type: normalizeRequestType(prevRow.movement),
        amount: Number(prevRow.amount),
        requestId: id,
      });
    }

    if (prevStatus === 'PENDING' && nextStatus === 'REJECTED') {
      transitions.push({
        kind: 'rejected',
        type: normalizeRequestType(prevRow.movement),
        amount: Number(prevRow.amount),
        requestId: id,
      });
    }

    if (prevStatus === 'PENDING' && !nextRow) {
      const type = normalizeRequestType(prevRow.movement);
      const amount = Number(prevRow.amount);
      const match = (nextRows ?? []).find((r) => {
        if (normalizeStatus(r?.status) !== 'COMPLETED') return false;
        if (normalizeRequestType(r?.movement) !== type) return false;
        if (Number(r?.amount) !== amount) return false;
        if (isRequestHistoryId(r?.id)) return false;
        return true;
      });

      if (match) {
        transitions.push({
          kind: 'approved',
          type,
          amount,
          requestId: id,
          completedId: String(match.id),
        });
      }
    }
  }

  for (const [id, nextRow] of next.entries()) {
    if (!isRequestHistoryId(id)) continue;
    if (!prev.has(id) && normalizeStatus(nextRow.status) === 'PENDING') {
      transitions.push({
        kind: 'created',
        type: normalizeRequestType(nextRow.movement),
        amount: Number(nextRow.amount),
        requestId: id,
      });
    }
  }

  return transitions;
};

/**
 * Foto de las solicitudes pendientes que se guarda en el dispositivo para que,
 * al volver a abrir la app, se pueda avisar lo que se aprobó o rechazó mientras
 * estaba cerrada (se compara con `detectRequestTransitions`).
 * @param {HistoryRow[]} rows
 * @returns {HistoryRow[]}
 */
export const buildPendingSnapshot = (rows) =>
  (rows ?? [])
    .filter((row) => isPendingRequestRow(row))
    .map(({ id, movement, amount, status, date }) => ({ id, movement, amount, status, date }));

/** Filas pendientes de depósito o retiro */
export const getPendingRequests = (rows) =>
  (rows ?? []).filter(isPendingRequestRow).sort((a, b) => {
    const aT = a?.date ? new Date(a.date).getTime() : 0;
    const bT = b?.date ? new Date(b.date).getTime() : 0;
    return bT - aT;
  });
