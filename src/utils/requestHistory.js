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
 * @typedef {'approved' | 'rejected' | 'created'} RequestTransitionKind
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

/** history id → POST id numérico, o null si no es solicitud */
export const parseRequestIdFromHistoryId = (historyId) => {
  const raw = String(historyId ?? '');
  if (!raw.startsWith(REQUEST_ID_PREFIX)) return null;
  const n = Number.parseInt(raw.slice(REQUEST_ID_PREFIX.length), 10);
  return Number.isFinite(n) ? n : null;
};

export const isRequestHistoryId = (historyId) => parseRequestIdFromHistoryId(historyId) !== null;

export const isPendingRequestRow = (row) =>
  normalizeStatus(row?.status) === 'PENDING' && isRequestHistoryId(row?.id);

export const isRejectedRequestRow = (row) =>
  normalizeStatus(row?.status) === 'REJECTED' && isRequestHistoryId(row?.id);

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

/** Filas pendientes de depósito o retiro */
export const getPendingRequests = (rows) =>
  (rows ?? []).filter(isPendingRequestRow).sort((a, b) => {
    const aT = a?.date ? new Date(a.date).getTime() : 0;
    const bT = b?.date ? new Date(b.date).getTime() : 0;
    return bT - aT;
  });
