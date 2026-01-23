import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useInvestorData } from '../hooks/useInvestorData';
import { useInvestorHistory } from '../hooks/useInvestorHistory';
import { KpiCard } from '../components/features/dashboard/KpiCard';
import { Spinner } from '../components/ui/Spinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { UnauthorizedPage } from './UnauthorizedPage';
import { formatName } from '../utils/formatName';
import { formatCurrency } from '../utils/formatCurrency';

const toIsoDate = (value) => {
  const d = value ? new Date(value) : null;
  if (!d || Number.isNaN(d.getTime())) return null;
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const parseIsoDateUtcMs = (isoDate) => {
  if (!isoDate) return null;
  const t = new Date(`${isoDate}T00:00:00.000Z`).getTime();
  return Number.isFinite(t) ? t : null;
};

const PortfolioLineChart = ({ series }) => {
  const width = 900;
  const height = 240;
  const padX = 52;
  const padY = 18;

  const values = series.map((p) => p.total);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = Math.max(1, maxV - minV);

  const formatTick = (v) => {
    const abs = Math.abs(v);
    if (abs >= 1_000_000) return `${Math.round(v / 100_000) / 10}m`;
    if (abs >= 1_000) return `${Math.round(v / 100) / 10}k`;
    return `${Math.round(v)}`;
  };

  const niceStep = (raw) => {
    if (!Number.isFinite(raw) || raw <= 0) return 1;
    const exp = Math.floor(Math.log10(raw));
    const base = 10 ** exp;
    const f = raw / base;
    const n = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
    return n * base;
  };

  const tickValues = (() => {
    const step = niceStep(range / 4);
    const startV = Math.floor(minV / step) * step;
    const endV = Math.ceil(maxV / step) * step;

    const ticks = [];
    for (let v = startV; v <= endV + step * 0.5; v += step) {
      ticks.push(v);
      if (ticks.length > 6) break;
    }

    // Ensure we always show something meaningful
    return ticks.length >= 2 ? ticks : [minV, maxV];
  })();

  const points = useMemo(() => {
    const n = series.length;
    return series.map((p, idx) => {
      const x = padX + (idx / Math.max(1, n - 1)) * (width - padX * 2);
      const yNorm = (p.total - minV) / range;
      const y = padY + (1 - yNorm) * (height - padY * 2);
      return { x, y };
    });
  }, [series, minV, range]);

  const line = points.map((pt) => `${pt.x.toFixed(2)},${pt.y.toFixed(2)}`).join(' ');
  const area = `${padX},${height - padY} ${line} ${width - padX},${height - padY}`;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-56 w-full"
        role="img"
        aria-label="Evolución del portafolio"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="portfolioArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {tickValues.map((v) => {
          const yNorm = (v - minV) / range;
          const y = padY + (1 - yNorm) * (height - padY * 2);

          return (
            <g key={v}>
              <line
                x1={padX}
                y1={y}
                x2={width - padX}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
                opacity="0.6"
              />
              <text x={6} y={y + 3} fontSize="10" fill="#6b7280">
                {formatTick(v)}
              </text>
            </g>
          );
        })}

        <line
          x1={padX}
          y1={height - padY}
          x2={width - padX}
          y2={height - padY}
          stroke="#e5e7eb"
          strokeWidth="1"
        />

        <polyline points={area} fill="url(#portfolioArea)" stroke="none" />
        <polyline
          points={line}
          fill="none"
          stroke="#2563eb"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {points.length > 0 ? (
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r="3"
            fill="#1d4ed8"
          />
        ) : null}
      </svg>

      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>{series[0]?.date}</span>
        <span>{series[series.length - 1]?.date}</span>
      </div>
    </div>
  );
};

const RANGE_OPTIONS = [
  { key: '7D', label: '7 días', kind: 'days', value: 7 },
  { key: '1M', label: '1 mes', kind: 'months', value: 1 },
  { key: '3M', label: '3 meses', kind: 'months', value: 3 },
  { key: '6M', label: '6 meses', kind: 'months', value: 6 },
  { key: '1Y', label: '1 año', kind: 'years', value: 1 },
  { key: 'ALL', label: 'Todo', kind: 'all' },
];

const rangeStartMs = (endMs, rangeKey) => {
  const opt = RANGE_OPTIONS.find((r) => r.key === rangeKey);
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

export const DashboardPage = () => {
  const { user } = useAuth();
  const { data, loading, error, unauthorized, refetch } = useInvestorData(user?.email);
  const { data: historyData, loading: historyLoading } = useInvestorHistory(user?.email);
  const { t } = useTranslation();

  const [rangeKey, setRangeKey] = useState('3M');

  const fullSeries = useMemo(() => {
    const rows = Array.isArray(historyData) ? historyData : [];

    const points = rows
      .filter((r) => r?.newBalance !== null && r?.newBalance !== undefined)
      .map((r) => {
        const date = toIsoDate(r?.date);
        return date ? { date, total: Number(r.newBalance) || 0 } : null;
      })
      .filter(Boolean);

    if (points.length < 2) return [];

    points.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    return points;
  }, [historyData]);

  const series = useMemo(() => {
    if (fullSeries.length < 2) return [];

    const endMs = parseIsoDateUtcMs(fullSeries[fullSeries.length - 1]?.date);
    if (!endMs) return fullSeries;

    const startMs = rangeStartMs(endMs, rangeKey);
    if (!startMs) return fullSeries;

    const filtered = fullSeries.filter((p) => {
      const t = parseIsoDateUtcMs(p.date);
      return t !== null && t >= startMs;
    });

    // keep at least 2 points, otherwise fallback to full series
    return filtered.length >= 2 ? filtered : fullSeries;
  }, [fullSeries, rangeKey]);

  const stats = useMemo(() => {
    if (!series || series.length < 2) return null;
    const first = series[0].total;
    const last = series[series.length - 1].total;
    const delta = last - first;
    const deltaPct = first > 0 ? (delta / first) * 100 : 0;

    return { first, last, delta, deltaPct };
  }, [series]);

  const rangeSubtitle = useMemo(() => {
    const opt = RANGE_OPTIONS.find((r) => r.key === rangeKey);
    if (!opt) return '';
    if (opt.kind === 'all') return 'Todo desde el inicio';
    return `Últimos ${opt.label}`;
  }, [rangeKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (unauthorized) {
    return <UnauthorizedPage />;
  }

  if (error) {
    const message =
      error === 'Google Sheets credentials not configured'
        ? t('sheets.credentialsNotConfigured')
        : error;
    return <ErrorMessage message={message} onRetry={refetch} />;
  }

  if (!data) {
    return <ErrorMessage message={t('dashboard.noDataForAccount')} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {t('dashboard.welcomeBack', { name: formatName(data.name) })}
        </h1>
        <p className="text-gray-600 mt-1">{t('dashboard.subtitle')}</p>
      </div>

      {/* Primera línea - Valor actual + Total invertido */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <KpiCard
          title={t('dashboard.kpis.currentValue')}
          value={data.balance}
          variant="currency"
          highlighted={true}
        />
        <KpiCard
          title={t('dashboard.kpis.totalInvested')}
          value={data.totalInvested ?? 0}
          variant="currency"
          tone="neutral"
        />
      </div>

      {/* Segunda línea - Resultado desde el inicio */}
      <div className="grid gap-4 md:grid-cols-2 mb-4">
        <KpiCard
          title={t('dashboard.kpis.totalReturnUsd')}
          value={data.totalReturnUsd ?? 0}
          variant="currency"
          showSign={true}
        />
        <KpiCard
          title={t('dashboard.kpis.totalReturnPct')}
          value={data.totalReturnPct ?? 0}
          variant="percentage"
        />
      </div>

      <div className="rounded-lg bg-white p-6 shadow" data-testid="portfolio-evolution">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Evolución del portafolio</h2>
            <p className="text-sm text-gray-500">{rangeSubtitle}</p>
          </div>

          {stats ? (
            <div className="text-sm text-gray-700">
              <span className="font-medium">{formatCurrency(stats.first)}</span>
              <span className="mx-2 text-gray-300">→</span>
              <span className="font-medium">{formatCurrency(stats.last)}</span>
              <span
                className={`ml-3 font-semibold ${stats.delta >= 0 ? 'text-green-700' : 'text-red-700'}`}
                title="Variación del período"
              >
                {stats.delta >= 0 ? '+' : ''}
                {formatCurrency(stats.delta)}
                {stats.first > 0 ? ` (${stats.deltaPct.toFixed(2)}%)` : ''}
              </span>
            </div>
          ) : null}
        </div>

        <div
          className="mt-4 flex flex-wrap gap-2"
          role="group"
          aria-label="Rango de tiempo del gráfico"
        >
          {RANGE_OPTIONS.map((opt) => {
            const isActive = opt.key === rangeKey;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setRangeKey(opt.key)}
                className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-primary hover:text-primary'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          {historyLoading ? (
            <div className="text-sm text-gray-500">Cargando evolución…</div>
          ) : series.length >= 2 ? (
            <PortfolioLineChart series={series} />
          ) : (
            <div className="rounded-md border border-dashed border-gray-200 p-6 text-sm text-gray-500">
              Sin datos históricos todavía.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
