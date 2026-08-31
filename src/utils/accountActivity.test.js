import { describe, it, expect } from 'vitest';
import {
  formatActivityDateTime,
  formatActivityUsd,
  getActivityBalanceImpact,
  getActivityBriefDescription,
  getActivityCardTitle,
  getActivityDetailLine,
  getActivityFeePeriodLine,
  getActivitySecondaryAction,
  getMovementCategory,
  matchesActivityFilter,
} from './accountActivity';

const t = (key, fallback) => {
  const map = {
    'history.monthsShort.3': 'Abr',
    'history.monthsFull.3': 'abril',
    'history.monthsFull.5': 'junio',
    'history.cardTitle.depositApproved': 'Depósito aprobado',
    'history.cardTitle.depositRejected': 'Depósito rechazado',
    'history.cardTitle.withdrawalRequested': 'Retiro solicitado',
    'history.cardTitle.operatingRegistered': 'Resultado operativo diario',
    'history.cardTitle.tradingFeeDebited': 'Comisión de gestión',
    'history.description.tradingFeeGeneric': 'Comisión sobre rendimiento generado',
    'history.detail.dailyReturn': 'Rentabilidad diaria: {{pct}}',
    'history.detail.period': 'Período: {{period}}',
    'history.detail.feeMotiveWithdrawalLabel': 'Motivo: Retiro',
    'history.detail.feeMotivePeriodicLabel': 'Motivo: Comisión del período',
    'history.actions.viewCalculation': 'Ver cálculo',
    'history.balanceImpact.pending': 'Impacto pendiente de confirmación',
    'history.balanceImpact.unchanged': 'Saldo sin cambios',
    'history.balanceImpact.notApplied': 'Sin impacto en saldo',
    'history.balanceImpact.range': 'Saldo: {{from}} → {{to}}',
  };

  if (key === 'history.balanceImpact.range') {
    return `Saldo: ${fallback.from} → ${fallback.to}`;
  }
  if (key === 'history.detail.dailyReturn') {
    return `Rentabilidad diaria: ${fallback.pct}`;
  }
  if (key === 'history.detail.period') {
    return `Período: ${fallback.period}`;
  }

  return map[key] ?? fallback ?? key;
};

describe('accountActivity', () => {
  it('maps movement types to activity categories', () => {
    expect(getMovementCategory('DEPOSIT')).toBe('capital_in');
    expect(getMovementCategory('WITHDRAWAL')).toBe('withdrawal');
    expect(getMovementCategory('OPERATING_RESULT')).toBe('operating');
    expect(getMovementCategory('TRADING_FEE')).toBe('trading_fee');
    expect(getMovementCategory('TRADING_FEE_ADJUSTMENT')).toBe('admin');
    expect(getMovementCategory('REFERRAL_COMMISSION')).toBe('referral');
    expect(getMovementCategory('DEPOSIT_REVERSAL')).toBe('admin');
  });

  it('matches filter all for any movement', () => {
    expect(matchesActivityFilter('DEPOSIT', 'all')).toBe(true);
    expect(matchesActivityFilter('WITHDRAWAL', 'all')).toBe(true);
  });

  it('matches specific filters', () => {
    expect(matchesActivityFilter('DEPOSIT', 'capital_in')).toBe(true);
    expect(matchesActivityFilter('DEPOSIT', 'withdrawal')).toBe(false);
    expect(matchesActivityFilter('OPERATING_RESULT', 'operating')).toBe(true);
  });

  it('formats signed card amounts in USD', () => {
    expect(formatActivityUsd(500)).toBe('+USD 500,00');
    expect(formatActivityUsd(-1200.5)).toBe('-USD 1.200,50');
  });

  it('formats activity date time with middle dot separator', () => {
    expect(formatActivityDateTime('2024-04-15T19:29:00.000Z', t)).toMatch(/·/);
    expect(formatActivityDateTime('2024-04-15T19:29:00.000Z', t)).toMatch(/Abr 2024/);
  });

  it('builds card titles from movement and status', () => {
    expect(getActivityCardTitle({ movement: 'DEPOSIT', status: 'COMPLETED' }, t)).toBe(
      'Depósito aprobado',
    );
    expect(getActivityCardTitle({ movement: 'WITHDRAWAL', status: 'PENDING' }, t)).toBe(
      'Retiro solicitado',
    );
    expect(getActivityCardTitle({ movement: 'OPERATING_RESULT', status: 'COMPLETED' }, t)).toBe(
      'Resultado operativo diario',
    );
  });

  it('omits deposit and operating descriptions', () => {
    expect(getActivityBriefDescription({ movement: 'DEPOSIT', method: 'cash_usd' }, t)).toBeNull();
    expect(getActivityBriefDescription({ movement: 'OPERATING_RESULT' }, t)).toBeNull();
    expect(getActivityBriefDescription({ movement: 'TRADING_FEE' }, t)).toBe(
      'Comisión sobre rendimiento generado',
    );
  });

  it('builds detail lines for operating and trading fee rows', () => {
    expect(
      getActivityDetailLine({ movement: 'OPERATING_RESULT', operatingResultPercent: 0.42 }, t),
    ).toBe('Rentabilidad diaria: +0,42%');
    expect(
      getActivityDetailLine(
        {
          movement: 'TRADING_FEE',
          tradingFeeSource: 'WITHDRAWAL',
          tradingFeePeriodLabel: 'Retiro',
        },
        t,
      ),
    ).toBe('Motivo: Retiro');
    expect(
      getActivityDetailLine({ movement: 'TRADING_FEE', tradingFeeSource: 'PERIODIC' }, t),
    ).toBe('Motivo: Comisión del período');
    expect(
      getActivityFeePeriodLine(
        {
          movement: 'TRADING_FEE',
          tradingFeeSource: 'PERIODIC',
          tradingFeePeriodLabel: '2026-04/2026-06',
        },
        t,
      ),
    ).toBe('Período: abril–junio 2026');
    expect(
      getActivityFeePeriodLine(
        {
          movement: 'TRADING_FEE',
          tradingFeeSource: 'WITHDRAWAL',
          tradingFeePeriodLabel: 'Retiro',
        },
        t,
      ),
    ).toBeNull();
  });

  it('does not expose operating detail action on activity cards', () => {
    expect(getActivitySecondaryAction({ movement: 'OPERATING_RESULT' }, t)).toBeNull();
    expect(getActivitySecondaryAction({ movement: 'TRADING_FEE' }, t)?.href).toBe('/operational');
  });

  it('shows unchanged balance for rejected deposits', () => {
    expect(
      getActivityBalanceImpact(
        {
          movement: 'DEPOSIT',
          status: 'REJECTED',
          previousBalance: 1000,
          newBalance: 1500,
        },
        t,
      ),
    ).toBe('Saldo sin cambios');
  });

  it('shows unchanged balance for rejected withdrawals', () => {
    expect(
      getActivityBalanceImpact(
        {
          movement: 'WITHDRAWAL',
          status: 'REJECTED',
          previousBalance: 1000,
          newBalance: 1000,
        },
        t,
      ),
    ).toBe('Saldo sin cambios');
  });

  it('reconstructs completed withdrawal range when balances are missing', () => {
    expect(
      getActivityBalanceImpact(
        {
          movement: 'WITHDRAWAL',
          status: 'COMPLETED',
          amount: 200,
          previousBalance: 1000,
          newBalance: null,
        },
        t,
      ),
    ).toBe('Saldo: USD 1.000,00 → USD 800,00');
  });

  it('reconstructs completed deposit range when balances are equal but amount exists', () => {
    expect(
      getActivityBalanceImpact(
        {
          movement: 'DEPOSIT',
          status: 'COMPLETED',
          amount: 500,
          previousBalance: 1000,
          newBalance: 1000,
        },
        t,
      ),
    ).toBe('Saldo: USD 1.000,00 → USD 1.500,00');
  });

  it('does not claim unchanged for completed capital flows without balances', () => {
    expect(
      getActivityBalanceImpact(
        {
          movement: 'WITHDRAWAL',
          status: 'COMPLETED',
          amount: 1200,
          previousBalance: null,
          newBalance: null,
        },
        t,
      ),
    ).toBe('—');
  });

  it('returns pending balance impact when balances are missing', () => {
    expect(
      getActivityBalanceImpact({ previousBalance: null, newBalance: null, status: 'PENDING' }, t),
    ).toBe('Impacto pendiente de confirmación');
  });

  it('returns balance range when both balances exist', () => {
    expect(
      getActivityBalanceImpact({ previousBalance: 7500, newBalance: 8000, status: 'COMPLETED' }, t),
    ).toBe('Saldo: USD 7.500,00 → USD 8.000,00');
  });
});
