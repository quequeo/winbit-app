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
import { rangeStartMs } from '../utils/rangeStartMs';

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const AR_TZ = 'America/Argentina/Buenos_Aires';

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

const getLastUpdateDate = () => {
  const now = new Date();
  const arFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: AR_TZ,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });
  const parts = {};
  for (const { type, value } of arFormatter.formatToParts(now)) {
    parts[type] = value;
  }

  const currentHour = parseInt(parts.hour, 10);
  const day = parseInt(parts.day, 10);
  const month = parseInt(parts.month, 10);
  const year = parseInt(parts.year, 10);

  if (currentHour >= 18) {
    return `${day} ${MONTHS_SHORT[month - 1]} ${year} - 18:00 (UTC-3)`;
  }

  const yesterday = new Date(Date.UTC(year, month - 1, day - 1));
  const yDay = yesterday.getUTCDate();
  const yMonth = yesterday.getUTCMonth();
  const yYear = yesterday.getUTCFullYear();
  return `${yDay} ${MONTHS_SHORT[yMonth]} ${yYear} - 18:00 (UTC-3)`;
};

const formatChartAxisDate = (isoDate) => {
  if (!isoDate) return '';
  const d = new Date(`${isoDate}T12:00:00.000Z`);
  if (isNaN(d.getTime())) return '';
  return `${d.getUTCDate()} ${MONTHS_SHORT[d.getUTCMonth()]}`;
};

const PortfolioLineChart = ({ series, title }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const width = 900;
  const height = 240;
  const padX = 60;
  const padY = 18;

  const values = series.map((p) => p.total);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = Math.max(1, maxV - minV);

  const formatTick = (v) => {
    const abs = Math.abs(v);
    if (abs >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000) return `$${(v / 1_000).toFixed(1)}k`;
    return `$${Math.round(v)}`;
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

    let closestPoint = null;
    let minDistance = Infinity;
    const hoverRadius = 30;

    points.forEach((point) => {
      const xDistance = Math.abs(svgX - point.x);
      const yDistance = Math.abs(svgY - point.y);
      if (xDistance < hoverRadius && yDistance < hoverRadius) {
        const distance = xDistance * 2 + yDistance;
        if (distance < minDistance) {
          minDistance = distance;
          closestPoint = point;
        }
      }
    });

    if (!closestPoint && points.length > 0) {
      closestPoint = points.reduce((closest, point) => {
        const xDist = Math.abs(svgX - point.x);
        const closestDist = Math.abs(svgX - closest.x);
        return xDist < closestDist ? point : closest;
      });
    }

    if (closestPoint) {
      setHoveredPoint(closestPoint);
      const tooltipWidth = 150;
      const tooltipHeight = 60;
      let x = e.clientX + 15;
      let y = e.clientY - tooltipHeight - 10;

      if (x + tooltipWidth > window.innerWidth) {
        x = e.clientX - tooltipWidth - 15;
      }
      if (x < 0) {
        x = 10;
      }
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
            <stop offset="0%" stopColor="#65a7a5" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#65a7a5" stopOpacity="0.02" />
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
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
              />
              <text x={6} y={y + 3} fontSize="10" fill="#888888">
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
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />

        <polyline points={area} fill="url(#portfolioArea)" stroke="none" />
        <polyline
          points={line}
          fill="none"
          stroke="#65a7a5"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

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

        {hoveredPoint && (
          <circle
            cx={hoveredPoint.x}
            cy={hoveredPoint.y}
            r="5"
            fill="#65a7a5"
            style={{ transition: 'r 0.2s, fill 0.2s' }}
          />
        )}

        {hoveredPoint && (
          <line
            x1={hoveredPoint.x}
            y1={padY}
            x2={hoveredPoint.x}
            y2={height - padY}
            stroke="#65a7a5"
            strokeWidth="1"
            strokeDasharray="4,4"
            opacity="0.5"
          />
        )}
      </svg>

      {hoveredPoint && (
        <div
          className="fixed bg-[#181818] text-text-primary text-xs rounded-lg px-3 py-2 pointer-events-none z-50"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translate(-50%, -100%)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.7)',
          }}
        >
          <div className="font-semibold">{formatDate(hoveredPoint.date)}</div>
          <div className="text-primary mt-1">{formatCurrency(hoveredPoint.total)}</div>
        </div>
      )}

      <div className="mt-2 flex items-center justify-between text-xs text-text-muted">
        <span>{series[0]?.date ? formatChartAxisDate(series[0].date) : ''}</span>
        <span>
          {series[series.length - 1]?.date
            ? formatChartAxisDate(series[series.length - 1].date)
            : ''}
        </span>
      </div>
    </div>
  );
};

const RANGE_OPTIONS = [
  { key: '7D', label: '7D', kind: 'days', value: 7 },
  { key: '1M', label: '1M', kind: 'months', value: 1 },
  { key: '3M', label: '3M', kind: 'months', value: 3 },
  { key: '6M', label: '6M', kind: 'months', value: 6 },
  { key: '1Y', label: '1A', kind: 'years', value: 1 },
  { key: 'ALL', label: 'Máx', kind: 'all' },
];

export const DashboardPage = () => {
  const { userEmail } = useAuth();
  const { data, loading, error, unauthorized, refetch } = useInvestorData(userEmail);
  const { data: historyData, loading: historyLoading } = useInvestorHistory(userEmail);
  const { t } = useTranslation();

  const [rangeKey, setRangeKey] = useState('3M');

  const fullSeries = useMemo(() => {
    const rows = Array.isArray(historyData) ? historyData : [];

    const allPoints = rows
      .filter(
        (r) => r?.newBalance !== null && r?.newBalance !== undefined && r?.status === 'COMPLETED',
      )
      .map((r) => {
        const date = toIsoDate(r?.date);
        return date
          ? { date, total: Number(r.newBalance) || 0, timestamp: parseIsoDateUtcMs(date) }
          : null;
      })
      .filter(Boolean)
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

    if (allPoints.length === 0) return [];

    const dateMap = new Map();
    allPoints.forEach((point) => {
      const dateKey = point.date;
      const existing = dateMap.get(dateKey);
      if (!existing || (point.timestamp && point.timestamp > (existing.timestamp || 0))) {
        dateMap.set(dateKey, point);
      }
    });

    const points = Array.from(dateMap.values()).sort((a, b) =>
      a.date < b.date ? -1 : a.date > b.date ? 1 : 0,
    );

    if (points.length < 2) return [];

    return points;
  }, [historyData]);

  const series = useMemo(() => {
    if (fullSeries.length < 2) return [];

    const endMs = parseIsoDateUtcMs(fullSeries[fullSeries.length - 1]?.date);
    if (!endMs) return fullSeries;

    const startMs = rangeStartMs(endMs, rangeKey, RANGE_OPTIONS);
    if (!startMs) return fullSeries;

    const filtered = fullSeries.filter((p) => {
      const t = parseIsoDateUtcMs(p.date);
      return t !== null && t >= startMs;
    });

    return filtered.length >= 2 ? filtered : fullSeries;
  }, [fullSeries, rangeKey]);

  const lastUpdate = useMemo(() => getLastUpdateDate(), []);

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
        <h1 className="text-3xl font-bold text-text-primary">
          {t('dashboard.welcomeBack', { name: formatName(data.name) })}
        </h1>
        <p className="text-text-muted mt-1">{t('dashboard.subtitle')}</p>
      </div>

      {/* Row 1: Capital invertido + Valor del portafolio */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <KpiCard
          title={t('dashboard.kpis.totalInvested')}
          value={data.totalInvested ?? 0}
          variant="currency"
          tone="neutral"
        />
        <KpiCard
          title={t('dashboard.kpis.currentValue')}
          value={data.balance}
          variant="currency"
          highlighted={true}
        />
      </div>

      {/* Row 2: Resultado histórico (%) + Resultado histórico (USD) */}
      <div className="grid gap-4 md:grid-cols-2 mb-4">
        <KpiCard
          title={t('dashboard.kpis.strategyReturnAllPct')}
          value={data.strategyReturnAllPct ?? 0}
          variant="percentage"
        />
        <KpiCard
          title={t('dashboard.kpis.strategyReturnAllUsd')}
          value={data.strategyReturnAllUsd ?? 0}
          variant="currency"
          showSign={true}
        />
      </div>

      {/* Row 3: Resultado 2026 (%) + Resultado 2026 (USD) */}
      <div className="grid gap-4 md:grid-cols-2 mb-4">
        <KpiCard
          title={t('dashboard.kpis.strategyReturnYtdPct')}
          value={data.strategyReturnYtdPct ?? 0}
          variant="percentage"
        />
        <KpiCard
          title={t('dashboard.kpis.strategyReturnYtdUsd')}
          value={data.strategyReturnYtdUsd ?? 0}
          variant="currency"
          showSign={true}
        />
      </div>

      <div
        className="rounded-lg bg-dark-card border border-border-dark p-6"
        data-testid="portfolio-evolution"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              {t('dashboard.chart.title')}
            </h2>
          </div>
        </div>

        <div
          className="mt-4 flex flex-wrap gap-2"
          role="group"
          aria-label={t('dashboard.chart.title')}
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
                    : 'bg-dark-section text-text-muted border-border-dark hover:border-primary hover:text-primary'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          {historyLoading ? (
            <div className="text-sm text-text-muted">{t('dashboard.chart.loading')}</div>
          ) : series.length >= 2 ? (
            <PortfolioLineChart series={series} title={t('dashboard.chart.title')} />
          ) : (
            <div className="rounded-md border border-dashed border-border-dark p-6 text-sm text-text-muted">
              {t('dashboard.chart.noData')}
            </div>
          )}
        </div>

        <div className="mt-4 text-center text-xs text-text-muted">
          Última actualización: {lastUpdate}
        </div>
      </div>
    </div>
  );
};
