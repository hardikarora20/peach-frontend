import React from "react";
import { flushSync } from "react-dom";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { Segmented } from "./ui";

// The new theme spreads out in a circle from where you clicked (View Transitions API).
// Browsers without it just switch.
function withReveal(e, change) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || reduced) return change();
  const root = document.documentElement;
  const x = e?.clientX || window.innerWidth / 2;
  const y = e?.clientY || window.innerHeight / 2;
  const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  // New: tells motion.css to treat the page as one piece, so the page-slide animation
  // doesn't kick in and the circle covers the whole screen
  root.classList.add("vt-theme");
  const t = document.startViewTransition(() => flushSync(change));
  t.ready
    .then(() =>
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 560, easing: "cubic-bezier(0.2, 0, 0, 1)", pseudoElement: "::view-transition-new(root)" }
      )
    )
    .catch(() => {});
  t.finished.finally(() => root.classList.remove("vt-theme"));
}

const ICONS = { system: Monitor, light: Sun, dark: Moon };
const NAMES = { system: "System", light: "Light", dark: "Dark" };

// Icon button that cycles system → light → dark
export default function ThemeToggle({ className = "" }) {
  const { mode, cycle } = useTheme();
  const Icon = ICONS[mode];
  return (
    <button type="button" className={`theme-toggle ${className}`.trim()} onClick={(e) => withReveal(e, cycle)} title={`Theme: ${NAMES[mode]}`} aria-label={`Theme: ${NAMES[mode]}`}>
      <span key={mode} className="theme-toggle__icon">
        <Icon size={18} />
      </span>
    </button>
  );
}

// Three-way picker used on the profile page
export function ThemePicker() {
  const { mode, setMode } = useTheme();
  return (
    <Segmented
      label="Theme"
      value={mode}
      onChange={(v, e) => v !== mode && withReveal(e, () => setMode(v))}
      options={["system", "light", "dark"].map((v) => {
        const Icon = ICONS[v];
        return { value: v, label: NAMES[v], icon: <Icon size={16} /> };
      })}
    />
  );
}
