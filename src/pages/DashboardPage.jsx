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
import { formatDate } from '../utils/formatDate';

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

const PortfolioLineChart = ({ series, title }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
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
      return { x, y, date: p.date, total: p.total, index: idx };
    });
  }, [series, minV, range]);


  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * width;
    const svgY = ((e.clientY - rect.top) / rect.height) * height;

    // Find the closest point by X coordinate (date), not by distance
    // This ensures we show the balance for the date the user is hovering over
    let closestPoint = null;
    let minDistance = Infinity;
    const hoverRadius = 30; // pixels for Y-axis tolerance

    points.forEach((point) => {
      const xDistance = Math.abs(svgX - point.x);
      const yDistance = Math.abs(svgY - point.y);
      // Prioritize X distance (date), but also check Y is close
      if (xDistance < hoverRadius && yDistance < hoverRadius) {
        const distance = xDistance * 2 + yDistance; // Weight X more heavily
        if (distance < minDistance) {
          minDistance = distance;
          closestPoint = point;
        }
      }
    });
    
    // If no point found by distance, find the closest by X (date) only
    if (!closestPoint && points.length > 0) {
      closestPoint = points.reduce((closest, point) => {
        const xDist = Math.abs(svgX - point.x);
        const closestDist = Math.abs(svgX - closest.x);
        return xDist < closestDist ? point : closest;
      });
    }

    if (closestPoint) {
      setHoveredPoint(closestPoint);
      // Position tooltip near cursor, but adjust if too close to edges
      const tooltipWidth = 150; // approximate tooltip width
      const tooltipHeight = 60; // approximate tooltip height
      let x = e.clientX + 15;
      let y = e.clientY - tooltipHeight - 10;

      // Adjust if tooltip would go off right edge
      if (x + tooltipWidth > window.innerWidth) {
        x = e.clientX - tooltipWidth - 15;
      }
      // Adjust if tooltip would go off left edge
      if (x < 0) {
        x = 10;
      }
      // Adjust if tooltip would go off top edge
      if (y < 0) {
        y = e.clientY + 20;
      }

      setTooltipPosition({ x, y });
    } else {
      setHoveredPoint(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  const line = points.map((pt) => `${pt.x.toFixed(2)},${pt.y.toFixed(2)}`).join(' ');
  const area = `${padX},${height - padY} ${line} ${width - padX},${height - padY}`;

  return (
    <div className="w-full relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-56 w-full"
        role="img"
        aria-label={title}
        preserveAspectRatio="none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
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

        {/* X-axis line */}
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

        {/* Invisible larger circles for hover detection */}
        {points.map((point, idx) => (
          <circle
            key={`hover-${idx}`}
            cx={point.x}
            cy={point.y}
            r="8"
            fill="transparent"
            stroke="none"
            style={{ cursor: 'pointer' }}
          />
        ))}

        {/* Visible circles on points - only show on hover */}
        {hoveredPoint && (
          <circle
            cx={hoveredPoint.x}
            cy={hoveredPoint.y}
            r="5"
            fill="#1e40af"
            style={{ transition: 'r 0.2s, fill 0.2s' }}
          />
        )}

        {/* Vertical line on hover */}
        {hoveredPoint && (
          <line
            x1={hoveredPoint.x}
            y1={padY}
            x2={hoveredPoint.x}
            y2={height - padY}
            stroke="#94a3b8"
            strokeWidth="1"
            strokeDasharray="4,4"
            opacity="0.5"
          />
        )}
      </svg>

      {/* Tooltip */}
      {hoveredPoint && (
        <div
          className="fixed bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg pointer-events-none z-50"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="font-semibold">{formatDate(hoveredPoint.date)}</div>
          <div className="text-blue-300 mt-1">{formatCurrency(hoveredPoint.total)}</div>
        </div>
      )}

      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>{series[0]?.date ? formatDate(series[0].date) : ''}</span>
        <span>{series[series.length - 1]?.date ? formatDate(series[series.length - 1].date) : ''}</span>
      </div>
    </div>
  );
};

const getRangeOptions = (t) => [
  { key: '7D', label: t('dashboard.ranges.7D'), kind: 'days', value: 7 },
  { key: '1M', label: t('dashboard.ranges.1M'), kind: 'months', value: 1 },
  { key: '3M', label: t('dashboard.ranges.3M'), kind: 'months', value: 3 },
  { key: '6M', label: t('dashboard.ranges.6M'), kind: 'months', value: 6 },
  { key: '1Y', label: t('dashboard.ranges.1Y'), kind: 'years', value: 1 },
  { key: 'ALL', label: t('dashboard.ranges.ALL'), kind: 'all' },
];

const rangeStartMs = (endMs, rangeKey, rangeOptions) => {
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

export const DashboardPage = () => {
  const { user } = useAuth();
  const { data, loading, error, unauthorized, refetch } = useInvestorData(user?.email);
  const { data: historyData, loading: historyLoading } = useInvestorHistory(user?.email);
  const { t } = useTranslation();

  const [rangeKey, setRangeKey] = useState('3M');
  const rangeOptions = getRangeOptions(t);

  const fullSeries = useMemo(() => {
    const rows = Array.isArray(historyData) ? historyData : [];

    // Get all points with newBalance, sorted by date
    const allPoints = rows
      .filter((r) => r?.newBalance !== null && r?.newBalance !== undefined && r?.status === 'COMPLETED')
      .map((r) => {
        const date = toIsoDate(r?.date);
        return date ? { date, total: Number(r.newBalance) || 0, timestamp: parseIsoDateUtcMs(date) } : null;
      })
      .filter(Boolean)
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

    if (allPoints.length === 0) return [];

    // For each unique date, use the last balance of that day (latest timestamp)
    const dateMap = new Map();
    allPoints.forEach((point) => {
      const dateKey = point.date; // YYYY-MM-DD
      const existing = dateMap.get(dateKey);
      // Keep the point with the latest timestamp for each date
      if (!existing || (point.timestamp && point.timestamp > (existing.timestamp || 0))) {
        dateMap.set(dateKey, point);
      }
    });

    const points = Array.from(dateMap.values()).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

    if (points.length < 2) return [];

    return points;
  }, [historyData]);

  const series = useMemo(() => {
    if (fullSeries.length < 2) return [];

    const endMs = parseIsoDateUtcMs(fullSeries[fullSeries.length - 1]?.date);
    if (!endMs) return fullSeries;

    const startMs = rangeStartMs(endMs, rangeKey, rangeOptions);
    if (!startMs) return fullSeries;

    const filtered = fullSeries.filter((p) => {
      const t = parseIsoDateUtcMs(p.date);
      return t !== null && t >= startMs;
    });

    // keep at least 2 points, otherwise fallback to full series
    return filtered.length >= 2 ? filtered : fullSeries;
  }, [fullSeries, rangeKey, rangeOptions]);

  const rangeSubtitle = useMemo(() => {
    const opt = rangeOptions.find((r) => r.key === rangeKey);
    if (!opt) return '';
    if (opt.kind === 'all') return t('dashboard.chart.rangeAll');
    return t('dashboard.chart.rangeLast', { label: opt.label });
  }, [rangeKey, rangeOptions, t]);

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
          title={t('dashboard.kpis.strategyReturnYtdUsd')}
          value={data.strategyReturnYtdUsd ?? 0}
          variant="currency"
          showSign={true}
        />
        <KpiCard
          title={t('dashboard.kpis.strategyReturnYtdPct')}
          value={data.strategyReturnYtdPct ?? 0}
          variant="percentage"
        />
      </div>

      {/* No mostramos "Desde" en dashboard (evita confusión). */}

      {/* Tercera línea - Resultado histórico (estrategia) */}
      <div className="grid gap-4 md:grid-cols-2 mb-4">
        <KpiCard
          title={t('dashboard.kpis.strategyReturnAllUsd')}
          value={data.strategyReturnAllUsd ?? 0}
          variant="currency"
          showSign={true}
        />
        <KpiCard
          title={t('dashboard.kpis.strategyReturnAllPct')}
          value={data.strategyReturnAllPct ?? 0}
          variant="percentage"
        />
      </div>

      {/* No mostramos "Desde" en dashboard (evita confusión). */}

      <div className="rounded-lg bg-white p-6 shadow" data-testid="portfolio-evolution">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t('dashboard.chart.title')}</h2>
            <p className="text-sm text-gray-500">{rangeSubtitle}</p>
          </div>
        </div>

        <div
          className="mt-4 flex flex-wrap gap-2"
          role="group"
          aria-label={t('dashboard.chart.title')}
        >
          {rangeOptions.map((opt) => {
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
            <div className="text-sm text-gray-500">{t('dashboard.chart.loading')}</div>
          ) : series.length >= 2 ? (
            <PortfolioLineChart series={series} title={t('dashboard.chart.title')} />
          ) : (
            <div className="rounded-md border border-dashed border-gray-200 p-6 text-sm text-gray-500">
              {t('dashboard.chart.noData')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
