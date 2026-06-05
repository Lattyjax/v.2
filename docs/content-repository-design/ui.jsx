// ── UI primitives: icons, badges, buttons, type glyphs ──
const { useState, useEffect, useRef } = React;

// Stroke icon set (1.6 stroke, 24 box)
const I = {
  link: "M9 15l6-6M11 6l1-1a4 4 0 0 1 6 6l-1 1M13 18l-1 1a4 4 0 0 1-6-6l1-1",
  file: "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5",
  video: "M4 6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM15 10l5-3v10l-5-3",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3",
  plus: "M12 5v14M5 12h14",
  check: "M20 6L9 17l-5-5",
  x: "M18 6L6 18M6 6l12 12",
  chevDown: "M6 9l6 6 6-6",
  chevRight: "M9 6l6 6-6 6",
  chevLeft: "M15 6l-6 6 6 6",
  copy: "M9 9h10v10H9zM5 15V5h10",
  external: "M14 5h5v5M19 5l-8 8M11 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4",
  sliders: "M4 8h10M18 8h2M4 16h2M10 16h10M14 6v4M6 14v4",
  layers: "M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5",
  calendar: "M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z",
  globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3.5 9h17M3.5 15h17M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  sparkle: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z",
  upload: "M12 16V4M7 9l5-5 5 5M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2",
  trash: "M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13",
  edit: "M4 20h4L18 10l-4-4L4 16v4zM14 6l4 4",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2",
  dots: "M12 6h.01M12 12h.01M12 18h.01",
  filter: "M4 5h16l-6 8v6l-4-2v-4z",
  doc: "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h6",
  pdf: "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5",
  arrowUp: "M12 19V6M6 12l6-6 6 6",
  inbox: "M4 13h4l1.5 3h5L16 13h4M4 13l2.5-8h11L20 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  list: "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01",
  branch: "M6 4v12M6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM6 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 8c0 4-6 2-6 8",
};

function Icon({ name, size = 18, stroke = 1.6, className = "", style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round"
      strokeLinejoin="round" className={className} style={style} aria-hidden="true">
      {(I[name] || "").split("M").filter(Boolean).map((d, i) => <path key={i} d={"M" + d} />)}
    </svg>
  );
}

const TYPE_ICON = { link: "link", pdf: "pdf", doc: "doc", video: "video" };
function TypeGlyph({ type, size = 18 }) {
  const cls = { link: "tg-navy", pdf: "tg-rust", doc: "tg-gold", video: "tg-teal" }[type];
  return (
    <span className={"type-glyph " + cls}>
      <Icon name={TYPE_ICON[type]} size={size} stroke={1.7} />
    </span>
  );
}

function Button({ children, variant = "primary", size = "md", icon, iconRight, onClick, disabled, type = "button", className = "" }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`btn btn-${variant} btn-${size} ${className}`}>
      {icon && <Icon name={icon} size={size === "sm" ? 15 : 17} />}
      {children && <span>{children}</span>}
      {iconRight && <Icon name={iconRight} size={size === "sm" ? 15 : 17} />}
    </button>
  );
}

function StatusBadge({ status }) {
  const map = {
    published: { label: "Published", cls: "st-pub", dot: true },
    draft: { label: "Draft", cls: "st-draft", dot: true },
    scheduled: { label: "Scheduled", cls: "st-sched", dot: true },
  };
  const s = map[status] || map.draft;
  return (
    <span className={"status-badge " + s.cls}>
      <span className="st-dot" />
      {s.label}
    </span>
  );
}

function Pill({ children, className = "", onClick, active }) {
  return (
    <button type="button" onClick={onClick}
      className={`pill ${active ? "pill-active" : ""} ${className}`}>
      {children}
    </button>
  );
}

// Custom select
function Select({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const sel = options.find((o) => o.id === value);
  return (
    <div className="sel" ref={ref}>
      <button type="button" className={"sel-btn " + (open ? "sel-open" : "")} onClick={() => setOpen(!open)}>
        <span className={sel ? "" : "sel-ph"}>{sel ? sel.label : (placeholder || "Select…")}</span>
        <Icon name="chevDown" size={16} />
      </button>
      {open && (
        <div className="sel-menu">
          {options.map((o) => (
            <button key={o.id} type="button"
              className={"sel-item " + (o.id === value ? "sel-item-active" : "")}
              onClick={() => { onChange(o.id); setOpen(false); }}>
              {o.label}
              {o.id === value && <Icon name="check" size={15} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className="toast" key={toast.id}>
      <span className="toast-ic"><Icon name="check" size={16} stroke={2.2} /></span>
      <span>{toast.msg}</span>
    </div>
  );
}

// Latimore wordmark (CSS rendering of the brand lockup for chrome)
function Wordmark({ compact }) {
  return (
    <div className={"wordmark " + (compact ? "wm-compact" : "")}>
      <div className="wm-roof"><Icon name="arrowUp" size={compact ? 13 : 15} stroke={2.4} /></div>
      <div className="wm-text">
        <div className="wm-name">LATIMORE</div>
        {!compact && <div className="wm-sub">LIFE &amp; LEGACY</div>}
      </div>
    </div>
  );
}

Object.assign(window, { Icon, TypeGlyph, Button, StatusBadge, Pill, Select, Toast, Wordmark });
