import React, { useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { humanize, hasText } from "../../utils/format";
import { normalizeEnum } from "../../utils/profile";
import { Chip } from "../ui";

// Form pieces shared by Onboarding and Edit profile (they were duplicated before).

export function FormSection({ title, description, icon, children, span = 12, id }) {
  return (
    <section className={`form-card form-card--span-${span}`} id={id}>
      <header className="form-card__head">
        {icon ? <span className="form-card__icon">{icon}</span> : null}
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
      </header>
      {children}
    </section>
  );
}

export function Field({ label, hint, error, children, full = false, required = false }) {
  return (
    <label className={`field ${full ? "field--full" : ""} ${error ? "is-invalid" : ""}`}>
      <span className="field__label">
        {label}
        {required ? <span className="field__req" aria-hidden="true"> *</span> : null}
      </span>
      {children}
      {error ? <span className="field__error">{error}</span> : hint ? <span className="field__hint">{hint}</span> : null}
    </label>
  );
}

export function TextField({ label, hint, error, full, required, ...props }) {
  return (
    <Field label={label} hint={hint} error={error} full={full} required={required}>
      <input className="input" {...props} />
    </Field>
  );
}

export function TextAreaField({ label, hint, error, full = true, required, maxLength, value = "", ...props }) {
  return (
    <Field
      label={label}
      hint={maxLength ? `${hint ? hint + " · " : ""}${String(value).length}/${maxLength}` : hint}
      error={error}
      full={full}
      required={required}
    >
      <textarea className="input input--textarea" maxLength={maxLength} value={value} {...props} />
    </Field>
  );
}

export function SelectField({ label, hint, error, full, required, placeholder = "Select…", options, ...props }) {
  return (
    <Field label={label} hint={hint} error={error} full={full} required={required}>
      <div className="select-wrap">
        <select className="input input--select" {...props}>
          <option value="">{placeholder}</option>
          {options.map((opt) =>
            typeof opt === "string" ? (
              <option key={opt} value={opt}>
                {humanize(opt)}
              </option>
            ) : (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            )
          )}
        </select>
      </div>
    </Field>
  );
}

export function ChipGroup({ label, hint, options, value, onToggle }) {
  return (
    <div className="chip-group">
      {label ? (
        <div className="chip-group__head">
          <h3>{label}</h3>
          <span className="chip-group__count">{value.length ? `${value.length} selected` : hint}</span>
        </div>
      ) : null}
      <div className="chip-group__list">
        {options.map((opt) => {
          const key = normalizeEnum(opt);
          return (
            <Chip key={opt} selected={value.includes(key)} onClick={() => onToggle(key)}>
              {humanize(opt)}
            </Chip>
          );
        })}
      </div>
    </div>
  );
}

function PhotoSlot({ index, value, onChange }) {
  const [broken, setBroken] = useState(false);
  const filled = hasText(value) && !broken;
  return (
    <div className={`photo-slot ${index === 0 ? "photo-slot--main" : ""}`}>
      <div className="photo-slot__preview">
        {filled ? (
          <img src={value} alt={`Photo ${index + 1}`} onError={() => setBroken(true)} />
        ) : (
          <div className="photo-slot__empty">
            <ImagePlus size={22} />
            <span>{broken ? "Image couldn't load" : index === 0 ? "Main photo" : `Photo ${index + 1}`}</span>
          </div>
        )}
        {hasText(value) ? (
          <button
            type="button"
            className="photo-slot__clear"
            aria-label={`Remove photo ${index + 1}`}
            onClick={() => {
              setBroken(false);
              onChange("");
            }}
          >
            <Trash2 size={14} />
          </button>
        ) : null}
      </div>
      <input
        className="input input--compact"
        type="url"
        inputMode="url"
        value={value}
        placeholder="Paste image URL"
        onChange={(e) => {
          setBroken(false);
          onChange(e.target.value);
        }}
      />
    </div>
  );
}

export function PhotoGrid({ images, onChange }) {
  return (
    <div className="photo-grid">
      {images.map((url, i) => (
        <PhotoSlot key={i} index={i} value={url} onChange={(v) => onChange(i, v)} />
      ))}
    </div>
  );
}
