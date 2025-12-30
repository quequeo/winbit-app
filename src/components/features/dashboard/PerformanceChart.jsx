import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../ui/Card';
import { formatCurrency } from '../../../utils/formatCurrency';

const normalize = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase();

const isDepositMovement = (movement) => {
  const m = normalize(movement);
  return m === 'depósito' || m === 'deposito' || m === 'deposit';
};

const isWithdrawalMovement = (movement) => {
  const m = normalize(movement);
  return m === 'retiro' || m === 'withdrawal' || m === 'withdraw';
};

const isCompletedStatus = (status) => {
  const s = normalize(status);
  return s === 'completado' || s === 'completed';
};

const toDayKey = (iso) => {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) {
    return '';
  }
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const toMonthKey = (iso) => {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) {
    return '';
  }
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

export const PerformanceChart = ({ data, historyRows, historyLoading }) => {
  const { t, i18n } = useTranslation();
  const [range, setRange] = useState('YTD');

  const locale = i18n.language === 'en' ? 'en-US' : 'es-AR';

  const chart = useMemo(() => {
    const rows = Array.isArray(historyRows) ? historyRows : [];
    if (!rows.length) {
      return { type: 'fallback' };
    }

    const rowsWithDates = rows
      .filter((r) => r?.date && Number.isFinite(new Date(r.date).getTime()))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (!rowsWithDates.length) {
      return { type: 'fallback' };
    }

    // Prefer completed rows (avoid counting pending movements). If none are completed, use all.
    const completed = rowsWithDates.filter((r) => isCompletedStatus(r.status));
    const sourceRows = completed.length ? completed : rowsWithDates;

    const latestDate = new Date(sourceRows[sourceRows.length - 1].date);
    const endMs = latestDate.getTime();

    const startMs = (() => {
      if (!Number.isFinite(endMs)) {
        return 0;
      }
      if (range === '7D') {
        return endMs - 7 * 24 * 60 * 60 * 1000;
      }
      if (range === '30D') {
        return endMs - 30 * 24 * 60 * 60 * 1000;
      }
      if (range === 'YTD') {
        const y = latestDate.getUTCFullYear();
        return Date.UTC(y, 0, 1, 0, 0, 0);
      }
      return 0; // ALL
    })();

    const filtered = sourceRows.filter((r) => {
      const ms = new Date(r.date).getTime();
      return Number.isFinite(ms) && ms >= startMs && ms <= endMs;
    });

    if (!filtered.length) {
      return { type: 'gains', points: [], total: 0, granularity: 'month' };
    }

    // Mobile-friendly: for short ranges show daily bars; for longer ranges show monthly aggregation.
    const granularity = range === '7D' || range === '30D' ? 'day' : 'month';
    const groupKey = granularity === 'day' ? toDayKey : toMonthKey;

    const byKey = new Map();
    for (const r of filtered) {
      const key = groupKey(r.date);
      if (!key) {
        continue;
      }

      const prev = Number(r.previousBalance ?? 0);
      const next = Number(r.newBalance ?? 0);
      const delta = next - prev;

      const cashFlow =
        isDepositMovement(r.movement) || isWithdrawalMovement(r.movement)
          ? Number(r.amount ?? 0)
          : 0;

      const gain = delta - cashFlow;
      byKey.set(key, (byKey.get(key) ?? 0) + gain);
    }

    const points = Array.from(byKey.entries())
      .sort((a, b) => String(a[0]).localeCompare(String(b[0])))
      .map(([key, gain]) => {
        const label = (() => {
          if (granularity === 'day') {
            const d = new Date(`${key}T00:00:00.000Z`);
            return new Intl.DateTimeFormat(locale, { month: 'short', day: '2-digit' }).format(d);
          }
          const d = new Date(`${key}-01T00:00:00.000Z`);
          return new Intl.DateTimeFormat(locale, { month: 'short', year: '2-digit' }).format(d);
        })();

        return { key, label, gain };
      });

    const total = points.reduce((acc, p) => acc + (Number(p.gain) || 0), 0);
    return { type: 'gains', points, total, granularity };
  }, [historyRows, range, locale]);

  const showFallbackLineChart = chart.type === 'fallback';

  if (historyLoading) {
    return (
      <Card title={t('dashboard.chart.title')}>
        <div className="h-64 flex items-center justify-center text-gray-500">
          {t('common.loading')}
        </div>
      </Card>
    );
  }

  if (showFallbackLineChart && (!data || data.length === 0)) {
    return (
      <Card title={t('dashboard.chart.title')}>
        <div className="h-64 flex items-center justify-center text-gray-500">
          {t('dashboard.chart.noData')}
        </div>
      </Card>
    );
  }

  const ranges = [
    { key: '7D', label: t('dashboard.chart.range.7d') },
    { key: '30D', label: t('dashboard.chart.range.30d') },
    { key: 'YTD', label: t('dashboard.chart.range.ytd') },
    { key: 'ALL', label: t('dashboard.chart.range.all') },
  ];

  return (
    <Card title={t('dashboard.chart.title')}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {ranges.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRange(r.key)}
              className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                range === r.key
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-primary/40'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {chart.type === 'gains' && (
          <div className="text-right">
            <div className="text-xs text-gray-500">{t('dashboard.chart.totalGain')}</div>
            <div className="text-sm font-semibold text-gray-900">
              {formatCurrency(chart.total, true)}
            </div>
          </div>
        )}
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {showFallbackLineChart ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#888" style={{ fontSize: '12px' }} />
              <YAxis
                stroke="#888"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `$${Number(value ?? 0).toLocaleString()}`}
              />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#58b098"
                strokeWidth={2}
                dot={{ fill: '#58b098', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          ) : (
            <BarChart data={chart.points}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" stroke="#888" style={{ fontSize: '12px' }} minTickGap={12} />
              <YAxis
                stroke="#888"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => formatCurrency(Number(value ?? 0))}
              />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value ?? 0), true)}
                labelStyle={{ color: '#111827' }}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="gain" radius={[6, 6, 0, 0]} maxBarSize={28}>
                {chart.points.map((p) => (
                  <Cell key={p.key} fill={p.gain >= 0 ? '#58b098' : '#ef4444'} fillOpacity={0.9} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
