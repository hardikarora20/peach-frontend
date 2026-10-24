import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { CITY_OPTIONS } from "../data/cities";

// Now supports keyboard (↑ ↓ Enter Esc) and proper combobox ARIA roles.
export default function CityPicker({ value, onSelect, placeholder = "Search your city", invalid = false }) {
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapperRef = useRef(null);
  const listId = useId();

  useEffect(() => setQuery(value || ""), [value]);

  useEffect(() => {
    const close = (e) => {
      if (!wrapperRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CITY_OPTIONS.slice(0, 12);
    // cities that start with the text first, then ones that only contain it
    const starts = CITY_OPTIONS.filter((c) => c.toLowerCase().startsWith(q));
    const contains = CITY_OPTIONS.filter((c) => !c.toLowerCase().startsWith(q) && c.toLowerCase().includes(q));
    return [...starts, ...contains].slice(0, 12);
  }, [query]);

  const choose = (city) => {
    setQuery(city);
    setOpen(false);
    onSelect(city);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && open && results[highlight]) {
      e.preventDefault();
      choose(results[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="city-picker" ref={wrapperRef}>
      <div className={`input-shell ${invalid ? "is-invalid" : ""}`}>
        <MapPin size={18} className="input-shell__icon" />
        <input
          className="input-shell__input"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          value={query}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlight(0);
            setOpen(true);
          }}
        />
      </div>
      {open ? (
        <ul className="menu city-picker__menu" id={listId} role="listbox">
          {results.length ? (
            results.map((city, i) => (
              <li key={city} role="option" aria-selected={i === highlight}>
                <button
                  type="button"
                  className={`menu__item ${i === highlight ? "is-active" : ""}`}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => choose(city)}
                >
                  <MapPin size={16} />
                  {city}
                </button>
              </li>
            ))
          ) : (
            <li className="menu__empty">No matching city. Try a nearby larger city.</li>
          )}
        </ul>
      ) : null}
    </div>
  );
}
