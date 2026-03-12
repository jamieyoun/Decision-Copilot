"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getStoredTheme, setStoredTheme, getSystemDark, type Theme } from "@/lib/theme";

type ThemeContextValue = { theme: Theme; setTheme: (t: Theme) => void };

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = getStoredTheme();
  if (stored) return stored;
  return getSystemDark() ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = getInitialTheme();
    setThemeState(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
    setMounted(true);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    setStoredTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");
  };

  const value: ThemeContextValue = {
    theme: mounted ? theme : "light",
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
