import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { CITY_OPTIONS } from "../data/cities";

function hasText(value) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

export default function CityPicker({
  value,
  onSelect,
  placeholder = "Search your city",
}) {
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);

  const wrapperRef = useRef(null);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    const close = (e) => {
      if (!wrapperRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };

    window.addEventListener("click", close);

    return () => {
      window.removeEventListener("click", close);
    };
  }, []);

  const filteredCities = useMemo(() => {
    if (!hasText(query)) {
      return CITY_OPTIONS.slice(0, 12);
    }

    return CITY_OPTIONS.filter((city) =>
      city.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 12);
  }, [query]);

  return (
    <div className="city-picker" ref={wrapperRef}>
      <div className="city-picker__input-wrap">
        <MapPin size={18} />

        <input
          className="city-picker__input"
          value={query}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
        />
      </div>

      {open && (
        <div className="city-picker__dropdown">
          {filteredCities.length ? (
            filteredCities.map((city) => (
              <button
                key={city}
                type="button"
                className="city-picker__option"
                onClick={() => {
                  setQuery(city);
                  setOpen(false);
                  onSelect(city);
                }}
              >
                <MapPin size={15} />
                <span>{city}</span>
              </button>
            ))
          ) : (
            <div className="city-picker__empty">No supported cities found</div>
          )}
        </div>
      )}
    </div>
  );
}
