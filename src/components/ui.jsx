import React, { useState } from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import { initials } from "../utils/format";
import { LogoMark } from "./Logo";

export function Button({
  children,
  variant = "primary", // primary | soft | outline | ghost | danger
  size = "md", // sm | md | lg
  icon = null,
  trailingIcon = null,
  loading = false,
  block = false,
  className = "",
  type = "button",
  disabled,
  ...rest
}) {
  return (
    <button
      type={type}
      className={`btn btn--${variant} btn--${size} ${block ? "btn--block" : ""} ${className}`.trim()}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner size={16} /> : icon}
      {children ? <span>{children}</span> : null}
      {!loading && trailingIcon ? <span className="btn__trail">{trailingIcon}</span> : null}
    </button>
  );
}

export function IconButton({ label, children, variant = "ghost", size = "md", className = "", type = "button", ...rest }) {
  return (
    <button type={type} className={`icon-btn icon-btn--${variant} icon-btn--${size} ${className}`.trim()} aria-label={label} title={label} {...rest}>
      {children}
    </button>
  );
}

export function Spinner({ size = 24 }) {
  return <span className="spinner" style={{ width: size, height: size }} aria-hidden="true" />;
}

export function Loader({ label = "Loading" }) {
  return (
    <div className="loader" role="status" aria-live="polite">
      <span className="loader__mark" aria-hidden="true">
        <LogoMark size={40} />
      </span>
      <span className="loader__label">{label}</span>
    </div>
  );
}

export function Skeleton({ width = "100%", height = 16, radius = 10, className = "", style }) {
  return <span className={`skeleton ${className}`.trim()} style={{ width, height, borderRadius: radius, ...style }} aria-hidden="true" />;
}

export function EmptyState({ icon, title, description, action, compact = false }) {
  return (
    <div className={`empty ${compact ? "empty--compact" : ""}`}>
      {icon ? <div className="empty__icon">{icon}</div> : null}
      <h3 className="empty__title">{title}</h3>
      {description ? <p className="empty__text">{description}</p> : null}
      {action ? <div className="empty__action">{action}</div> : null}
    </div>
  );
}

export function Avatar({ name, src, size = 48, ring = false, className = "" }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const style = { width: size, height: size, fontSize: Math.round(size * 0.38) };
  return (
    <span className={`avatar ${ring ? "avatar--ring" : ""} ${className}`.trim()} style={style}>
      {src && !failed ? (
        <img src={src} alt={name || ""} loading="lazy" className={loaded ? "is-loaded" : ""} onLoad={() => setLoaded(true)} onError={() => setFailed(true)} />
      ) : (
        <span aria-hidden="true">{initials(name)}</span>
      )}
    </span>
  );
}

const BANNER_ICONS = {
  error: <CircleAlert size={18} />,
  success: <CircleCheck size={18} />,
  warning: <TriangleAlert size={18} />,
  info: <Info size={18} />,
};

export function Banner({ tone = "info", children, action }) {
  if (!children) return null;
  return (
    <div className={`banner banner--${tone}`} role={tone === "error" ? "alert" : "status"}>
      <span className="banner__icon">{BANNER_ICONS[tone]}</span>
      <div className="banner__text">{children}</div>
      {action ? <div className="banner__action">{action}</div> : null}
    </div>
  );
}

export function Chip({ children, icon, selected = false, onClick, className = "" }) {
  if (onClick) {
    return (
      <button type="button" className={`chip chip--filter ${selected ? "is-selected" : ""} ${className}`.trim()} aria-pressed={selected} onClick={onClick}>
        {selected ? <CircleCheck size={14} className="chip__check" /> : icon}
        <span>{children}</span>
      </button>
    );
  }
  return (
    <span className={`chip ${className}`.trim()}>
      {icon}
      <span>{children}</span>
    </span>
  );
}

export function PageHeader({ eyebrow, title, subtitle, actions, leading }) {
  return (
    <header className="page-header">
      {leading ? <div className="page-header__leading">{leading}</div> : null}
      <div className="page-header__text">
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h1 className="display">{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {actions ? <div className="page-header__actions">{actions}</div> : null}
    </header>
  );
}

export function Segmented({ options, value, onChange, label, full = false }) {
  return (
    <div className={`segmented ${full ? "segmented--full" : ""}`} role="tablist" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          className={`segmented__btn ${value === o.value ? "is-active" : ""}`}
          onClick={(e) => onChange(o.value, e)}
        >
          {o.icon}
          <span>{o.label}</span>
        </button>
      ))}
    </div>
  );
}
