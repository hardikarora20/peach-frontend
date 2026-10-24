import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { prefs } from "../utils/storage";

const ThemeContext = createContext(null);
const MODES = ["system", "light", "dark"];

const systemPrefersDark = () =>
  typeof window !== "undefined" && !window.matchMedia("(prefers-color-scheme: light)").matches;

// New: real dark mode. The old CSS had [data-theme="dark"] variables but nothing ever set the attribute.
export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(prefs.getTheme());
  const [systemDark, setSystemDark] = useState(systemPrefersDark());

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = (e) => setSystemDark(!e.matches); // dark unless the OS explicitly asks for light
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const resolved = mode === "system" ? (systemDark ? "dark" : "light") : mode;

  useEffect(() => {
    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.colorScheme = resolved;
  }, [resolved]);

  const changeMode = useCallback((next) => {
    setMode(next);
    prefs.setTheme(next);
  }, []);

  const cycle = useCallback(() => {
    changeMode(MODES[(MODES.indexOf(mode) + 1) % MODES.length]);
  }, [mode, changeMode]);

  const value = useMemo(() => ({ mode, resolved, setMode: changeMode, cycle }), [mode, resolved, changeMode, cycle]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
