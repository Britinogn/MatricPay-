import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "matricpay_theme";

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const resolved = theme === "system" ? getSystemTheme() : theme;

  if (resolved === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    return stored ?? "system";
  });

  // Apply theme on mount + whenever it changes
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  // Listen to system preference changes when in "system" mode
  useEffect(() => {
    if (theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const handler = () => applyTheme("system");
    media.addEventListener("change", handler);

    return () => media.removeEventListener("change", handler);
  }, [theme]);

  function setTheme(value: Theme) {
    setThemeState(value);
  }

  const resolvedTheme = theme === "system" ? getSystemTheme() : theme;

  return {
    theme,           // "light" | "dark" | "system"
    resolvedTheme,   // actual applied theme ("light" | "dark")
    setTheme,
  };
}