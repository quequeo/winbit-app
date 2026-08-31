export const PageTabs = ({ tabs, activeId, onChange }) => (
  <div className="page-tabs">
    <nav className="page-tabs__nav" role="tablist">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={activeId === id}
          onClick={() => onChange(id)}
          className={`page-tabs__btn ${activeId === id ? 'page-tabs__btn--active' : ''}`}
        >
          {Icon ? <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} aria-hidden /> : null}
          {label}
        </button>
      ))}
    </nav>
  </div>
);
