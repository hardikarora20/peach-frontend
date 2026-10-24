import React, { useId } from "react";

export function LogoMark({ size = 36 }) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="logo-mark">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffb86b" />
          <stop offset=".45" stopColor="#ff7a59" />
          <stop offset="1" stopColor="#ff4d8d" />
        </linearGradient>
      </defs>
      <path d="M32 58c-13 0-22-9.6-22-22.5C10 22 20 13 32 13s22 9 22 22.5C54 48.4 45 58 32 58z" fill={`url(#${id})`} />
      <path d="M32 15c-2 8-2 30 0 42" stroke="#000" strokeOpacity=".18" strokeWidth="2" fill="none" />
      <path d="M33 13c2-6 8-9 15-8-2 6-8 9-15 8z" fill="#7fd18b" />
    </svg>
  );
}

export function Logo({ size = 32, showName = true }) {
  return (
    <span className="logo">
      <LogoMark size={size} />
      {showName ? <span className="logo__name">peach</span> : null}
    </span>
  );
}
