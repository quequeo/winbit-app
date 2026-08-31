export const FilterChips = ({ filters, activeId, onChange }) => (
  <div className="flex flex-wrap gap-2" role="tablist">
    {filters.map(({ id, label, icon: Icon, dotCls, iconCircled }) => (
      <button
        key={id}
        type="button"
        role="tab"
        aria-selected={activeId === id}
        onClick={() => onChange(id)}
        className={`filter-button flex items-center gap-1.5 ${activeId === id ? 'active' : ''}`}
      >
        {Icon ? (
          iconCircled ? (
            <span
              className={`filter-button__icon-circle filter-button__icon-circle--${id}`}
              aria-hidden
            >
              <Icon strokeWidth={2} />
            </span>
          ) : (
            <Icon className="filter-button__icon" strokeWidth={1.75} aria-hidden />
          )
        ) : null}
        {dotCls ? <span className={`w-2 h-2 rounded-full ${dotCls}`} aria-hidden /> : null}
        {label}
      </button>
    ))}
  </div>
);
