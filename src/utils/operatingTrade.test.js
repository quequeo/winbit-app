import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  buildStrategyByDateForHistory,
  combineStrategyOperations,
  getAssetDisplayName,
  getOperatingContractFilterOptions,
  getOperatingContractLabel,
  getOperatingContractShortLabel,
  indexStrategyOperationsByDate,
  matchesOperatingFilters,
  mergeOperatingWithStrategy,
  normalizeAsset,
  normalizeOperatingContractKey,
  normalizeOperatingDirection,
  filterPublishedOperatingResults,
  formatOperatingDurationLabel,
  formatOperatingResultDateTime,
  formatSettlementLastUpdateLabel,
  getLastSettlementDateKey,
  getOperatingDurationMinutes,
  isOperatingResultPublished,
  operatingDailyPercent,
  operatingDateKey,
  resolveOperatingDirection,
  resolveOperatingTradeDisplay,
  toAssetBadgeKey,
  tradeOpenCloseLabels,
} from './operatingTrade';

describe('operatingTrade', () => {
  it('normalizes contract aliases', () => {
    expect(normalizeOperatingContractKey('btc')).toBe('MBT');
    expect(normalizeOperatingContractKey('nq')).toBe('MNQ');
    expect(normalizeOperatingContractKey('S&P 500')).toBe('MES');
    expect(normalizeOperatingContractKey('dow jones')).toBe('MYM');
    expect(normalizeOperatingContractKey('nasdaq')).toBe('MNQ');
    expect(normalizeOperatingContractKey('MES')).toBe('MES');
    expect(normalizeOperatingContractKey('xbt')).toBe('MBT');
    expect(normalizeOperatingContractKey('es')).toBe('MES');
    expect(normalizeOperatingContractKey('ym')).toBe('MYM');
    expect(normalizeOperatingContractKey('djia')).toBe('MYM');
  });

  it('normalizes raw asset names to badge keys', () => {
    expect(normalizeAsset('MES')).toBe('SP500');
    expect(normalizeAsset('Bitcoin')).toBe('BTC');
    expect(normalizeAsset('XBT')).toBe('BTC');
    expect(normalizeAsset('SPX')).toBe('SP500');
    expect(normalizeAsset('ES')).toBe('SP500');
    expect(normalizeAsset('S&P 500')).toBe('SP500');
    expect(normalizeAsset('Nasdaq')).toBe('NASDAQ');
    expect(normalizeAsset('DJIA')).toBe('DOWJONES');
    expect(normalizeAsset('YM')).toBe('DOWJONES');
  });

  it('returns investor-facing asset display names', () => {
    expect(getAssetDisplayName('BTC')).toBe('Micro Bitcoin');
    expect(getAssetDisplayName('SP500')).toBe('S&P 500');
    expect(getAssetDisplayName('NASDAQ')).toBe('Nasdaq');
    expect(getOperatingContractShortLabel('MES')).toBe('S&P 500');
    expect(getOperatingContractShortLabel('NQ')).toBe('Nasdaq');
    expect(getOperatingContractShortLabel('MYM')).toBe('Dow Jones');
  });

  it('resolves direction only from explicit admin value', () => {
    expect(normalizeOperatingDirection('short')).toBe('SHORT');
    expect(resolveOperatingDirection({ direction: 'SHORT', amount: 10 })).toBe('SHORT');
    expect(resolveOperatingDirection({ amount: -5 })).toBeNull();
    expect(resolveOperatingDirection({ amount: 5 })).toBeNull();
  });

  it('uses Argentina calendar date for operating rows', () => {
    expect(operatingDateKey('2026-06-17')).toBe('2026-06-17');
    expect(operatingDateKey('2026-06-17T21:00:00.000Z')).toBe('2026-06-17');
  });

  it('resolves trade display from merged strategy asset', () => {
    const display = resolveOperatingTradeDisplay({
      asset: 'NQ',
      direction: 'SHORT',
    });
    expect(display.assetLabel).toBe('MNQ — Nasdaq');
    expect(display.badgeKey).toBe('NASDAQ');
    expect(display.direction).toBe('SHORT');
  });

  it('resolves MBT as Micro Bitcoin with contract code', () => {
    const display = resolveOperatingTradeDisplay({
      contract: 'MBT',
      direction: 'LONG',
    });
    expect(display.badgeKey).toBe('BTC');
    expect(display.assetLabel).toBe('MBT — Micro Bitcoin');
  });

  it('computes duration between open and close times', () => {
    expect(getOperatingDurationMinutes('10:39', '11:09')).toBe(30);
    expect(getOperatingDurationMinutes('23:50', '00:20')).toBe(30);
    expect(getOperatingDurationMinutes(null, '11:09')).toBeNull();
  });

  it('formats duration labels', () => {
    const t = (key, opts) => {
      if (key === 'operating.detail.durationMinutes') return `${opts.count} min`;
      if (key === 'operating.detail.durationHours') return `${opts.count} h`;
      if (key === 'operating.detail.durationHoursMinutes') {
        return `${opts.hours} h ${opts.minutes} min`;
      }
      return key;
    };
    expect(formatOperatingDurationLabel(30, t)).toBe('30 min');
    expect(formatOperatingDurationLabel(60, t)).toBe('1 h');
    expect(formatOperatingDurationLabel(75, t)).toBe('1 h 15 min');
    expect(formatOperatingDurationLabel(null, t)).toBe('—');
  });

  it('combines known strategy operations with API data by date', () => {
    const combined = combineStrategyOperations(
      [{ operationDate: '2026-06-17', asset: 'MES', direction: 'LONG' }],
      [{ operationDate: '2026-06-17', asset: 'NQ', direction: 'SHORT' }],
    );
    expect(combined).toHaveLength(1);
    expect(combined[0].asset).toBe('NQ');
  });

  it('synthesizes missing strategy rows in dev for operating history', () => {
    const map = buildStrategyByDateForHistory(
      [
        {
          date: '2026-07-10T17:00:00.000Z',
          movement: 'OPERATING_RESULT',
          amount: 100,
        },
      ],
      [],
    );
    expect(map['2026-07-10']?.asset).toBe('NQ');
    expect(map['2026-07-10']?.direction).toBe('SHORT');
  });

  it('matches contract and result filters', () => {
    const row = { contract: 'MBT', direction: 'LONG', amount: 12, previousBalance: 100 };
    expect(
      matchesOperatingFilters(row, { asset: 'MBT', direction: 'all', result: 'positive' }),
    ).toBe(true);
    expect(matchesOperatingFilters(row, { asset: 'MNQ', direction: 'all', result: 'all' })).toBe(
      false,
    );
  });

  it('returns contract labels with underlying asset', () => {
    const t = (key) =>
      ({
        'operating.contracts.mbt': 'Bitcoin',
        'operating.contracts.mym': 'Dow Jones',
      })[key];
    expect(getOperatingContractLabel('MBT', t)).toBe('MBT — Bitcoin');
    expect(getOperatingContractShortLabel('NQ')).toBe('Nasdaq');
    expect(getOperatingContractShortLabel('MBT')).toBe('Micro Bitcoin');
  });

  it('merges strategy operations by date', () => {
    const strategyByDate = indexStrategyOperationsByDate([
      {
        operationDate: '2026-06-26',
        asset: 'NQ',
        direction: 'SHORT',
        openedAt: '11:19',
        closedAt: '11:26',
        ratio: 1.01,
      },
      {
        operationDate: '2026-06-17',
        asset: 'MES',
        direction: 'LONG',
        openedAt: '11:19',
        closedAt: '11:26',
        ratio: 1.01,
      },
    ]);
    const merged = mergeOperatingWithStrategy(
      [
        { date: '2026-06-26T17:00:00.000Z', amount: -10 },
        { date: '2026-06-17T17:00:00.000Z', amount: 50.06 },
      ],
      strategyByDate,
    );
    expect(merged[0].asset).toBe('NQ');
    expect(merged[0].direction).toBe('SHORT');
    expect(merged[0].ratio).toBe(1.01);
    expect(merged[1].asset).toBe('MES');
    expect(merged[1].direction).toBe('LONG');
  });

  it('builds contract filter options', () => {
    const t = (key) =>
      ({
        'operating.filters.all': 'Todos',
        'operating.contracts.mbt': 'Bitcoin',
        'operating.contracts.mes': 'S&P 500',
        'operating.contracts.mnq': 'NASDAQ',
        'operating.contracts.mym': 'Dow Jones',
      })[key];
    const options = getOperatingContractFilterOptions(t);
    expect(options).toHaveLength(5);
    expect(options[1].label).toBe('MBT — Bitcoin');
  });

  it('maps contract keys to asset badge keys', () => {
    expect(toAssetBadgeKey('MBT')).toBe('BTC');
    expect(toAssetBadgeKey('MES')).toBe('SP500');
    expect(toAssetBadgeKey('NQ')).toBe('NASDAQ');
    expect(toAssetBadgeKey('MYM')).toBe('DOWJONES');
    expect(toAssetBadgeKey('SPX')).toBe('SP500');
  });

  it('formats open/close labels from strategy operation times', () => {
    const labels = tradeOpenCloseLabels({
      date: '2026-06-26T17:00:00.000Z',
      openedAt: '12:08',
      closedAt: '15:30',
    });
    expect(labels.openLabel).toContain('12:08');
    expect(labels.closeLabel).toContain('15:30');
  });

  it('shows placeholder time when open/close hours are missing', () => {
    const labels = tradeOpenCloseLabels({
      date: '2026-06-26T17:00:00.000Z',
    });
    expect(labels.openLabel).toContain('· —');
    expect(labels.closeLabel).toContain('· —');
    expect(labels.openLabel).not.toContain('18:00');
    expect(labels.closeLabel).not.toContain('18:00');
  });

  it('sums daily percent for total result pct', () => {
    expect(operatingDailyPercent({ amount: 10, previousBalance: 100 })).toBe(10);
  });

  it('ignores null operatingResultPercent and derives from amount', () => {
    expect(
      operatingDailyPercent({
        amount: -85.91,
        previousBalance: 14976.24,
        operatingResultPercent: null,
      }),
    ).toBeCloseTo(-0.5736, 3);
  });

  describe('operating result publish window', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    const t = (key, fallback) => fallback ?? key;

    it('hides same-day results before 18:00 Argentina', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-07-13T20:00:00.000Z'));

      expect(isOperatingResultPublished('2026-07-13T17:00:00.000Z')).toBe(false);
      expect(
        filterPublishedOperatingResults([
          { movement: 'OPERATING_RESULT', date: '2026-07-13T17:00:00.000Z' },
          { movement: 'DEPOSIT', date: '2026-07-13T17:00:00.000Z' },
        ]),
      ).toEqual([{ movement: 'DEPOSIT', date: '2026-07-13T17:00:00.000Z' }]);
    });

    it('shows same-day results from 18:00 Argentina onward', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-07-13T22:30:00.000Z'));

      expect(isOperatingResultPublished('2026-07-13T17:00:00.000Z')).toBe(true);
    });

    it('always shows past operating results', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-07-13T22:30:00.000Z'));

      expect(isOperatingResultPublished('2026-07-12T17:00:00.000Z')).toBe(true);
    });

    it('formats operating result datetime at 18:00', () => {
      expect(formatOperatingResultDateTime('2026-07-13T17:00:00.000Z', t)).toBe(
        '13 Jul 2026 · 18:00',
      );
    });

    it('shows previous day 18:00 as last settlement before publish hour', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-07-13T20:00:00.000Z')); // 17:00 AR
      expect(getLastSettlementDateKey()).toBe('2026-07-12');
      expect(formatSettlementLastUpdateLabel()).toBe('12 Jul 2026 · 18:00 · UTC-3');
    });

    it('shows today 18:00 as last settlement after publish hour', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-07-13T22:30:00.000Z')); // 19:30 AR
      expect(getLastSettlementDateKey()).toBe('2026-07-13');
      expect(formatSettlementLastUpdateLabel()).toBe('13 Jul 2026 · 18:00 · UTC-3');
    });
  });
});
