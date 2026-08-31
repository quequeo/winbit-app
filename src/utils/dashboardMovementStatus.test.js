import { describe, it, expect } from 'vitest';
import { getDashboardMovementStatus } from './dashboardMovementStatus';

const t = (key, fallback) => fallback ?? key;

describe('getDashboardMovementStatus', () => {
  it('maps completed deposits to Acreditado with success variant', () => {
    const status = getDashboardMovementStatus({ movement: 'DEPOSIT', status: 'COMPLETED' }, t);

    expect(status.label).toBe('Acreditado');
    expect(status.variant).toBe('success');
  });

  it('maps pending deposits to En revisión with info variant', () => {
    const status = getDashboardMovementStatus({ movement: 'DEPOSIT', status: 'PENDING' }, t);

    expect(status.label).toBe('En revisión');
    expect(status.variant).toBe('info');
  });

  it('maps completed withdrawals to Completado with success variant', () => {
    const status = getDashboardMovementStatus({ movement: 'WITHDRAWAL', status: 'COMPLETED' }, t);

    expect(status.label).toBe('Completado');
    expect(status.variant).toBe('success');
  });

  it('maps pending withdrawals to Pendiente with warning variant', () => {
    const status = getDashboardMovementStatus({ movement: 'WITHDRAWAL', status: 'PENDING' }, t);

    expect(status.label).toBe('Pendiente');
    expect(status.variant).toBe('warning');
  });

  it('maps rejected movements to Rechazado with error variant', () => {
    const status = getDashboardMovementStatus({ movement: 'WITHDRAWAL', status: 'REJECTED' }, t);

    expect(status.label).toBe('Rechazado');
    expect(status.variant).toBe('error');
  });
});
