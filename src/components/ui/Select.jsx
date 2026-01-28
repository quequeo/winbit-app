import { Children, isValidElement, useEffect, useMemo, useRef, useState } from 'react';

const normalizeLabel = (label) => {
  if (label === null || label === undefined) return '';
  return typeof label === 'string' ? label : String(label);
};

const optionsFromChildren = (children) => {
  const out = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    // <option value="...">Label</option>
    if (child.type === 'option') {
      out.push({ value: child.props?.value ?? '', label: child.props?.children ?? '' });
    }
  });
  return out;
};

export const Select = ({
  label,
  id,
  name,
  value,
  onChange,
  options,
  children,
  required = false,
  disabled = false,
  error,
  className = '',
}) => {
  const containerRef = useRef(null);
  const [open, setOpen] = useState(false);

  const items = useMemo(() => {
    if (Array.isArray(options) && options.length) return options;
    if (children) return optionsFromChildren(children);
    return [];
  }, [options, children]);

  const selected = useMemo(() => {
    const found = items.find((it) => String(it?.value) === String(value));
    return found ?? null;
  }, [items, value]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };

    const onMouseDown = (e) => {
      const el = containerRef.current;
      if (!el) return;
      if (!el.contains(e.target)) setOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onMouseDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onMouseDown);
    };
  }, [open]);

  const selectValue = (nextValue) => {
    if (disabled) return;
    setOpen(false);
    onChange?.({
      target: {
        id,
        name,
        value: nextValue,
      },
    });
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div ref={containerRef} className="relative">
        <button
          id={id}
          name={name}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => {
            if (!disabled) setOpen((v) => !v);
          }}
          className={`w-full flex items-center justify-between gap-3 bg-white px-4 py-3 border rounded-lg shadow-sm text-left focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <span className={`truncate ${selected ? 'text-gray-900' : 'text-gray-500'}`}>
            {selected ? normalizeLabel(selected.label) : normalizeLabel(items?.[0]?.label)}
          </span>
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`h-4 w-4 shrink-0 ${disabled ? 'text-gray-300' : 'text-gray-400'}`}
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {open ? (
          <div
            role="listbox"
            aria-labelledby={id}
            className="absolute left-0 right-0 mt-2 max-h-64 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg z-50"
          >
            {items.map((opt) => {
              const isSelected = String(opt?.value) === String(value);
              return (
                <button
                  key={String(opt?.value)}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => selectValue(opt?.value)}
                  className={`w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 ${
                    isSelected ? 'bg-primary/10 text-gray-900 font-semibold' : 'text-gray-700'
                  }`}
                >
                  {normalizeLabel(opt?.label)}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};
