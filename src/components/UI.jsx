import React from 'react';

export function Button({
  children,
  variant = 'primary',
  type = 'button',
  disabled = false,
  onClick,
  className = '',
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`btn btn-${variant} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Input({ label, error, className = '', ...props }) {
  return (
    <label className={`field ${className}`.trim()}>
      {label ? <span className="field-label">{label}</span> : null}
      <input className={`input ${error ? 'input-error' : ''}`} {...props} />
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <label className={`field ${className}`.trim()}>
      {label ? <span className="field-label">{label}</span> : null}
      <textarea className={`input textarea ${error ? 'input-error' : ''}`} {...props} />
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
}

export function Select({ label, error, className = '', children, ...props }) {
  return (
    <label className={`field ${className}`.trim()}>
      {label ? <span className="field-label">{label}</span> : null}
      <select className={`input ${error ? 'input-error' : ''}`} {...props}>
        {children}
      </select>
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
}

export function Loader({ label = 'Loading' }) {
  return (
    <div className="loader-wrap" role="status" aria-live="polite">
      <div className="loader" />
      <span>{label}…</span>
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">🍑</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function Avatar({ name = 'P' }) {
  const initials = String(name).trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('') || 'P';
  return <div className="avatar">{initials}</div>;
}

export function Badge({ children }) {
  return <span className="badge">{children}</span>;
}
