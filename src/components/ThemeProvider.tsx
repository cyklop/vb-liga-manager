'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

// Provide a default value that matches the initial state
const defaultContextValue: ThemeContextType = {
  theme: 'system', // Matches initial useState
  setTheme: () => {}, // Placeholder function
};

const ThemeContext = createContext<ThemeContextType>(defaultContextValue) // Use default value

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initial state should ideally reflect potential localStorage or system preference,
  // but 'system' is a safe default before client-side check.
  const [theme, setTheme] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)

  // Effect to set initial theme from localStorage or system preference ONCE on mount
  useEffect(() => {
    let initialTheme: Theme;
    const storedTheme = localStorage.getItem('theme') as Theme | null;

    if (storedTheme) {
      initialTheme = storedTheme;
    } else {
      // Default to system preference if no theme is stored
      initialTheme = 'system'; // Keep 'system' as the state if no storage
    }
    setTheme(initialTheme);
    setMounted(true); // Mark as mounted AFTER setting the initial theme state

    // Apply initial theme immediately after determining it
    applyTheme(initialTheme);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs only once on mount

  // Effect to apply theme changes whenever 'theme' state changes AFTER mount
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('theme', theme);
      applyTheme(theme);
    }
  }, [theme, mounted]);

  // Helper function to apply theme to the DOM using data-theme for DaisyUI
  const applyTheme = (currentTheme: Theme) => {
    const root = window.document.documentElement;
    let themeToApply: 'light' | 'dark';

    if (currentTheme === 'system') {
      themeToApply = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      themeToApply = currentTheme;
    }
    // Set the data-theme attribute for DaisyUI
    root.setAttribute('data-theme', themeToApply);
  };

  // Auf Änderungen der Systemeinstellung reagieren (nur wenn theme === 'system')
  useEffect(() => {
    if (theme === 'system' && mounted) { // Ensure mounted before adding listener
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handleChange = () => {
        // Re-apply the theme based on the new system preference
        applyTheme('system');
      };

      mediaQuery.addEventListener('change', handleChange);
      // Initial check needed when component mounts and theme is 'system'
      handleChange();

      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, mounted]); // Depend on theme and mounted status

  // Provider value should reflect the current state
  const value = { theme, setTheme };

  // Immer den Provider rendern. Der Wert wird aktualisiert, sobald der State gesetzt ist.
  // Die Kinder werden initial möglicherweise kurz mit dem Default-Theme gerendert,
  // aber der useEffect aktualisiert dies schnell.
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Komponente zum Umschalten des Themes
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  // Determine the effective theme for display/aria-label, considering 'system'
  const [effectiveTheme, setEffectiveTheme] = useState(theme);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (theme === 'system') {
      setEffectiveTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    } else {
      setEffectiveTheme(theme);
    }

    // Add listener for system changes if theme is 'system'
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        setEffectiveTheme(mediaQuery.matches ? 'dark' : 'light');
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  if (!isMounted) {
    // Avoid rendering the button server-side or before hydration
    return null;
  }

  return (
    <button
      // Immer explizit auf 'light' oder 'dark' umschalten, basierend auf dem aktuell angezeigten Modus (effectiveTheme)
      onClick={() => {
        const nextTheme = effectiveTheme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme); // Aktualisiert den Kontext (und löst Speicherung im localStorage aus)
      }}
      className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label={effectiveTheme === 'dark' ? 'Zum hellen Modus wechseln' : 'Zum dunklen Modus wechseln'}
    >
      {effectiveTheme === 'dark' ? (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
        </svg>
      )}
    </button>
  );
}


export function useTheme() {
  const context = useContext(ThemeContext);
  // Although we provide a default, this check is still good practice.
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
