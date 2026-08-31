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
  icon: Icon,
  leadingAdornment,
  controlClassName = '',
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

  const layoutStyles =
    'w-full flex items-center justify-between gap-3 text-left transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const baseControl = controlClassName
    ? `${layoutStyles} ${controlClassName}`
    : `${layoutStyles} min-h-[52px] bg-[#121514] px-4 py-3.5 border rounded-[12px] focus:ring-2 focus:ring-[rgba(57,131,109,0.35)] focus:border-[#39836D] border-[#28312D] text-text-primary`;

  const hasLeading = Boolean(Icon || leadingAdornment);
  const triggerCls = `${baseControl} ${hasLeading ? 'pl-12' : ''} ${error ? 'border-error' : ''}`;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-text-primary mb-2">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <div ref={containerRef} className="relative">
        {leadingAdornment ? (
          <span className="pointer-events-none absolute left-4 top-1/2 z-[1] flex h-5 w-5 -translate-y-1/2 items-center justify-center">
            {leadingAdornment}
          </span>
        ) : Icon ? (
          <Icon
            className="pointer-events-none absolute left-4 top-1/2 z-[1] h-[18px] w-[18px] -translate-y-1/2 text-primary"
            strokeWidth={1.75}
            aria-hidden
          />
        ) : null}
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
          className={triggerCls}
        >
          <span
            className={`min-w-0 flex-1 truncate text-left leading-none ${
              selected ? 'text-text-primary' : 'text-text-dim'
            }`}
          >
            {selected ? normalizeLabel(selected.label) : normalizeLabel(items?.[0]?.label)}
          </span>
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`ml-2 h-4 w-4 shrink-0 ${disabled ? 'text-text-dim' : 'text-text-muted'}`}
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
            className="absolute left-0 right-0 mt-2 max-h-64 overflow-auto rounded-[12px] border border-[#28312D] bg-[#141716] z-50 shadow-none"
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
                  className={`w-full px-4 py-2.5 text-sm text-left transition-colors hover:bg-[rgba(71, 151, 133,0.10)] hover:text-text-primary ${
                    isSelected
                      ? 'bg-[rgba(71, 151, 133,0.10)] text-text-primary font-semibold'
                      : 'text-text-primary/[0.88]'
                  }`}
                >
                  {normalizeLabel(opt?.label)}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
};
