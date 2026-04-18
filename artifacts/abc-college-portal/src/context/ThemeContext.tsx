import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark";

type ThemeContextValue = { theme: Theme; toggleTheme: () => void; setTheme: (theme: Theme) => void };

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => (localStorage.getItem("abc_theme") as Theme) || "light");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("abc_theme", theme);
  }, [theme]);

  const setTheme = (next: Theme) => setThemeState(next);
  const toggleTheme = () => setThemeState((current) => (current === "dark" ? "light" : "dark"));
  const value = useMemo(() => ({ theme, toggleTheme, setTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
