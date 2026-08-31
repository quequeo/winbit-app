export const OperatingKpiMini = ({ icon: Icon, label, value, valueClassName = 'text-success' }) => (
  <div className="kpi-mini-card">
    <div className="flex items-start justify-between gap-2 mb-2">
      <div className="operating-kpi-icon">
        <Icon className="w-4 h-4 text-primary" strokeWidth={1.75} aria-hidden />
      </div>
    </div>
    <p className="text-[11px] text-text-muted leading-tight">{label}</p>
    <p className={`text-base font-bold mt-1 ${valueClassName}`}>{value}</p>
  </div>
);
