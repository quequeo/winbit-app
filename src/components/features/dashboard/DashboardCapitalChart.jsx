import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { rangeStartMs } from '../../../utils/rangeStartMs';
import { formatUsdDisplay } from '../../../utils/formatUsdDisplay';

const MONTH_ABBR = [
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

const RANGE_OPTIONS = [
  { key: '7D', labelKey: 'dashboard.ranges.7D', kind: 'days', value: 7 },
  { key: '1M', labelKey: 'dashboard.ranges.1M', kind: 'months', value: 1 },
  { key: '3M', labelKey: 'dashboard.ranges.3M', kind: 'months', value: 3 },
  { key: '6M', labelKey: 'dashboard.ranges.6M', kind: 'months', value: 6 },
  { key: '1Y', labelKey: 'dashboard.ranges.1Y', kind: 'years', value: 1 },
  { key: 'ALL', labelKey: 'dashboard.ranges.ALL', kind: 'all' },
];

const formatAxisDate = (isoDate) => {
  const d = new Date(`${isoDate}T12:00:00.000Z`);
  if (isNaN(d.getTime())) return '';
  return `${d.getUTCDate()} ${MONTH_ABBR[d.getUTCMonth()]}`;
};

const formatTick = (v) => {
  const abs = Math.abs(v);
  if (abs >= 1000) return `${(v / 1000).toFixed(1)}K`;
  return String(Math.round(v));
};

export const DashboardCapitalChart = ({ series, periodLabel }) => {
  const { t } = useTranslation();
  const [rangeKey, setRangeKey] = useState('3M');
  const [hovered, setHovered] = useState(null);

  const filtered = useMemo(() => {
    if (!series?.length) return [];
    if (rangeKey === 'ALL') return series;
    const endMs = new Date(`${series[series.length - 1].date}T12:00:00.000Z`).getTime();
    const startMs = rangeStartMs(endMs, rangeKey, RANGE_OPTIONS);
    if (!startMs) return series;
    return series.filter((p) => new Date(`${p.date}T12:00:00.000Z`).getTime() >= startMs);
  }, [series, rangeKey]);

  const display = filtered.length >= 2 ? filtered : series;

  const width = 900;
  const height = 190;
  const padX = 52;
  const padY = 14;
  const values = display.map((p) => p.total);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = Math.max(1, maxV - minV);

  const points = display.map((p, idx) => {
    const x = padX + (idx / Math.max(1, display.length - 1)) * (width - padX * 2);
    const y = padY + (1 - (p.total - minV) / range) * (height - padY * 2);
    return { x, y, ...p };
  });

  const linePoints = points.map((p) => `${p.x},${p.y}`).join(' ');
  const baselineY = height - padY;
  const areaPath = [
    `M ${padX} ${baselineY}`,
    ...points.map((p) => `L ${p.x} ${p.y}`),
    `L ${width - padX} ${baselineY}`,
    'Z',
  ].join(' ');
  const tickSteps = [0, 0.33, 0.66, 1];
  const gradientId = 'dashboardCapitalArea';

  return (
    <div className="winbit-card dashboard-panel-card dashboard-chart-card">
      <div className="dashboard-chart-card__header">
        <h2 className="dashboard-section-title">{t('dashboard.chart.title')}</h2>
        <div className="segment-control flex-wrap">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setRangeKey(opt.key)}
              className={`segment-control__btn ${rangeKey === opt.key ? 'segment-control__btn--active' : ''}`}
            >
              {opt.key === '1Y' ? String(new Date().getFullYear()) : t(opt.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {display.length >= 2 ? (
        <div className="relative">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full dashboard-chart-card__svg"
            role="img"
            aria-label={t('dashboard.chart.title')}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#479785" stopOpacity="0.34" />
                <stop offset="45%" stopColor="#479785" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#479785" stopOpacity="0" />
              </linearGradient>
            </defs>
            {tickSteps.map((f) => {
              const v = minV + range * f;
              const y = padY + (1 - f) * (height - padY * 2);
              return (
                <g key={f}>
                  <line
                    x1={padX}
                    y1={y}
                    x2={width - padX}
                    y2={y}
                    stroke="#A7AAA2"
                    strokeOpacity="0.18"
                    strokeWidth="1"
                    strokeDasharray="3 5"
                  />
                  <text
                    x={4}
                    y={y + 4}
                    className="dashboard-chart-card__tick"
                    fontSize="13"
                    fontFamily="IBM Plex Sans Condensed, IBM Plex Sans, sans-serif"
                    fontWeight="600"
                    fill="#A7AAA2"
                  >
                    {formatTick(v)}
                  </text>
                </g>
              );
            })}
            <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
            <polyline
              points={linePoints}
              fill="none"
              stroke="#479785"
              strokeWidth="2.25"
              strokeLinejoin="round"
              strokeLinecap="round"
              filter="none"
            />
            {points.map((p) => (
              <circle
                key={p.date}
                cx={p.x}
                cy={p.y}
                r="7"
                fill="transparent"
                onMouseEnter={() => setHovered(p)}
                onMouseLeave={() => setHovered(null)}
              />
            ))}
            {hovered ? <circle cx={hovered.x} cy={hovered.y} r="3.5" fill="#479785" /> : null}
          </svg>
          {hovered ? (
            <div className="dashboard-chart-tooltip absolute top-2 right-2 text-xs rounded-lg px-2.5 py-1.5 tabular-nums">
              {formatAxisDate(hovered.date)} · {formatUsdDisplay(hovered.total)}
            </div>
          ) : null}
          <div className="dashboard-chart-card__x-axis">
            <span>{formatAxisDate(display[0]?.date)}</span>
            <span>{formatAxisDate(display[display.length - 1]?.date)}</span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-[#A7AAA2] py-6 text-center">{t('dashboard.chart.noData')}</p>
      )}

      {periodLabel ? (
        <p className="dashboard-chart-card__period">
          {t('dashboard.chart.period')}: {periodLabel}
        </p>
      ) : null}
    </div>
  );
};
