"use client";

import { CssBaseline, Switch, ThemeProvider } from "@mui/material";
import React, { createContext, useContext, useEffect, useState } from "react";
import { createBaseTheme } from "./utils/createBaseTheme.ts";

const ThemeContext = createContext({ theme: "light", toggleTheme: () => {} });

export interface ThemeProps {
  children: React.ReactNode;
}

/**
 * Component to manage the theme of the application
 * @param props
 * @returns
 */
export const Theme = (props: Readonly<ThemeProps>) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const prevTheme = theme === "light" ? "dark" : "light";

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  /** Effects */
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(prevTheme);
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <ThemeProvider theme={theme === "light" ? createBaseTheme("light") : createBaseTheme("dark")}>
        <CssBaseline />
        {props.children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default Theme;

export const useThemeContext = () => useContext(ThemeContext);

export const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useThemeContext();

  return <Switch onChange={toggleTheme} checked={theme === "dark"} />;
};
