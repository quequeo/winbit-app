import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const OperatingFilterSelect = ({ label, value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const listId = useId();
  const selected = options.find((opt) => opt.id === value) ?? options[0];

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className={`operating-filter-chip w-full ${open ? 'operating-filter-chip--open' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] uppercase tracking-wide text-text-dim">{label}</span>
          <span className="block text-sm font-semibold text-text-primary truncate">
            {selected?.label}
          </span>
        </span>
        <ChevronDown className="w-3.5 h-3.5 shrink-0" aria-hidden />
      </button>

      {open ? (
        <ul id={listId} role="listbox" className="operating-filter-menu" aria-label={label}>
          {options.map((opt) => (
            <li key={opt.id} role="option" aria-selected={opt.id === value}>
              <button
                type="button"
                className={`operating-filter-menu__item ${opt.id === value ? 'operating-filter-menu__item--active' : ''}`}
                onClick={() => {
                  onChange(opt.id);
                  setOpen(false);
                }}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};
