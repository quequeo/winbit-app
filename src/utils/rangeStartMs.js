/**
 * Calcula el timestamp de inicio para un rango de fechas
 * @param {number} endMs - Timestamp de fin (ms)
 * @param {string} rangeKey - Clave del rango ('7D', '1M', '3M', '6M', '1Y', 'ALL')
 * @param {Array<{key: string, kind: string, value?: number}>} rangeOptions - Opciones de rango
 * @returns {number | null} - Timestamp de inicio o null
 */
export const rangeStartMs = (endMs, rangeKey, rangeOptions) => {
  const opt = rangeOptions.find((r) => r.key === rangeKey);
  if (!opt || !Number.isFinite(endMs)) return null;
  if (opt.kind === 'all') return null;

  if (opt.kind === 'days') {
    return endMs - opt.value * 24 * 60 * 60 * 1000;
  }

  const d = new Date(endMs);
  if (opt.kind === 'months') {
    d.setUTCMonth(d.getUTCMonth() - opt.value);
    return d.getTime();
  }

  if (opt.kind === 'years') {
    d.setUTCFullYear(d.getUTCFullYear() - opt.value);
    return d.getTime();
  }

  return null;
};
