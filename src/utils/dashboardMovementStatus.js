import { getStatusConfig, getStatusLabel } from './transactionHelpers';

const normalizeMovement = (value) =>
  String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z_]/g, '');

export const getDashboardMovementStatus = (row, t) => {
  const movement = normalizeMovement(row?.movement);
  const statusKey = String(row?.status ?? 'COMPLETED').toUpperCase();
  const configType = movement === 'DEPOSIT' ? 'deposit' : 'default';
  const config = getStatusConfig(statusKey, configType);

  let variant = 'success';
  if (statusKey === 'PENDING') {
    variant = movement === 'DEPOSIT' ? 'info' : 'warning';
  } else if (statusKey === 'REJECTED') {
    variant = 'error';
  } else if (statusKey === 'CANCELLED') {
    variant = 'neutral';
  }

  return {
    label: getStatusLabel(config, t),
    variant,
  };
};
