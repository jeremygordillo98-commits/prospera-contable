import React, { createContext, useContext, useState, useEffect } from "react";

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem("prospera-theme");
    return saved ? JSON.parse(saved) : true; // Default to dark as requested earlier
  });

  useEffect(() => {
    localStorage.setItem("prospera-theme", JSON.stringify(isDark));
    // Aplica el atributo al elemento raíz (root)
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    // También aplicamos el background base al body para evitar flashes
    document.body.className = isDark ? "dark-theme" : "light-theme";
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
