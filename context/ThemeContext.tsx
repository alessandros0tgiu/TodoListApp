import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: typeof shadowColors | typeof lightColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const THEME_STORAGE_KEY = '@todo_theme_mode';

// Tavolozza Colori Notte (Quella che usi attualmente)
const shadowColors = {
  background: '#161622',
  card: '#1e1e2d',
  text: '#ffffff',
  textMuted: '#888888',
  border: '#2a2a3a',
  progressBarBg: '#161622',
  expiredBg: '#7a1f1f',
  expiredBorder: '#ff4444',
  expiredText: '#ffcccc',
};

// Tavolozza Colori Giorno (Nuova, speculare e coordinata)
const lightColors = {
  background: '#f4f6f9',
  card: '#ffffff',
  text: '#1c1c24',
  textMuted: '#6c757d',
  border: '#e2e8f0',
  progressBarBg: '#e2e8f0',
  expiredBg: '#fce8e6',
  expiredBorder: '#f44336',
  expiredText: '#c62828',
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true); // Default scuro come la tua app originale

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme !== null) {
        setIsDarkMode(JSON.parse(savedTheme));
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newValue = !prev;
      AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(newValue));
      return newValue;
    });
  };

  const colors = isDarkMode ? shadowColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};