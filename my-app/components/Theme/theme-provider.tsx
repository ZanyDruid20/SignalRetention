"use client";

import { usePathname } from "next/navigation";
import * as React from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeProviderContext = React.createContext<
  ThemeProviderState | undefined
>(undefined);

const THEME_CHANGE_EVENT = "signalretention-theme-change";

function isTheme(theme: string | null): theme is Theme {
  return theme === "dark" || theme === "light" || theme === "system";
}

function getStoredTheme(storageKey: string, defaultTheme: Theme) {
  if (typeof window === "undefined") {
    return defaultTheme;
  }

  const storedTheme = window.localStorage.getItem(storageKey);

  return isTheme(storedTheme) ? storedTheme : defaultTheme;
}

function applyTheme(theme: Theme) {
  const root = window.document.documentElement;

  root.classList.remove("light", "dark");

  if (theme === "system") {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";

    root.classList.add(systemTheme);
    return;
  }

  root.classList.add(theme);
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "signalretention-theme",
}: ThemeProviderProps) {
  const pathname = usePathname();
  const shouldApplyTheme = pathname !== "/";

  const subscribe = React.useCallback(
    (callback: () => void) => {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      const handleThemeChange = () => {
        if (!shouldApplyTheme) {
          document.documentElement.classList.remove("dark");
          document.documentElement.classList.add("light");
          callback();
          return;
        }

        applyTheme(getStoredTheme(storageKey, defaultTheme));
        callback();
      };

      window.addEventListener("storage", handleThemeChange);
      window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);
      mediaQuery.addEventListener("change", handleThemeChange);

      if (shouldApplyTheme) {
        applyTheme(getStoredTheme(storageKey, defaultTheme));
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
      }

      return () => {
        window.removeEventListener("storage", handleThemeChange);
        window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
        mediaQuery.removeEventListener("change", handleThemeChange);
      };
    },
    [defaultTheme, shouldApplyTheme, storageKey]
  );

  const getSnapshot = React.useCallback(
    () => getStoredTheme(storageKey, defaultTheme),
    [defaultTheme, storageKey]
  );

  const getServerSnapshot = React.useCallback(() => defaultTheme, [defaultTheme]);

  const theme = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const setTheme = React.useCallback(
    (newTheme: Theme) => {
      window.localStorage.setItem(storageKey, newTheme);
      if (shouldApplyTheme) {
        applyTheme(newTheme);
      }
      window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
    },
    [shouldApplyTheme, storageKey]
  );

  React.useEffect(() => {
    if (!shouldApplyTheme) {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      return;
    }

    if (theme !== "system") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemThemeChange = () => {
      applyTheme("system");
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, [shouldApplyTheme, theme]);

  const value = React.useMemo(
    () => ({
      theme,
      setTheme,
    }),
    [theme, setTheme]
  );

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
