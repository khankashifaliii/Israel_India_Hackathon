'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

type Theme = 'dark' | 'light' | 'system';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  attribute?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'dark' | 'light';
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  actualTheme: 'light',
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'neurostep-theme',
  attribute = 'class',
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
    }
    return defaultTheme;
  });

  const [actualTheme, setActualTheme] = useState<'dark' | 'light'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');

    if (theme === 'system' && enableSystem) {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';

      root.classList.add(systemTheme);
      setActualTheme(systemTheme);
      return;
    }

    root.classList.add(theme);
    setActualTheme(theme as 'dark' | 'light');
  }, [theme, enableSystem]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    actualTheme,
  };

  if (!mounted) {
    return null;
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {!disableTransitionOnChange && (
        <style jsx global>{`
          * {
            transition: background-color 150ms ease-in-out, 
                       border-color 150ms ease-in-out, 
                       color 150ms ease-in-out,
                       fill 150ms ease-in-out,
                       stroke 150ms ease-in-out,
                       opacity 150ms ease-in-out,
                       box-shadow 150ms ease-in-out,
                       transform 150ms ease-in-out,
                       filter 150ms ease-in-out,
                       backdrop-filter 150ms ease-in-out;
          }
          
          *:focus-visible {
            transition: all 150ms ease-in-out;
          }
          
          .theme-transition-disable * {
            transition: none !important;
          }
        `}</style>
      )}
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};

// Theme toggle button component
const ThemeToggle: React.FC<{
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}> = ({ 
  className, 
  variant = 'ghost', 
  size = 'md', 
  showLabel = false 
}) => {
  const { theme, setTheme, actualTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
    { value: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> },
  ];

  const currentTheme = themes.find(t => t.value === theme) || themes[0];

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  };

  return (
    <div className="relative">
      <motion.button
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          sizeClasses[size],
          variantClasses[variant],
          showLabel && 'px-4 w-auto space-x-2',
          className
        )}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle theme"
      >
        <motion.div
          key={actualTheme}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {currentTheme.icon}
        </motion.div>
        {showLabel && (
          <span className="hidden sm:inline-block">{currentTheme.label}</span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              className="absolute right-0 top-full mt-2 z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {themes.map((themeOption) => (
                <motion.button
                  key={themeOption.value}
                  className={cn(
                    'relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
                    'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
                    'transition-colors duration-150',
                    theme === themeOption.value && 'bg-accent text-accent-foreground'
                  )}
                  onClick={() => {
                    setTheme(themeOption.value);
                    setIsOpen(false);
                  }}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-2">
                    <motion.div
                      animate={{
                        rotate: theme === themeOption.value ? [0, 360] : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {themeOption.icon}
                    </motion.div>
                    <span>{themeOption.label}</span>
                  </div>
                  {theme === themeOption.value && (
                    <motion.div
                      className="absolute right-2 w-2 h-2 bg-primary rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Theme-aware component wrapper
const ThemeAware: React.FC<{
  children: React.ReactNode;
  lightContent?: React.ReactNode;
  darkContent?: React.ReactNode;
  className?: string;
}> = ({ children, lightContent, darkContent, className }) => {
  const { actualTheme } = useTheme();

  if (lightContent && darkContent) {
    return (
      <div className={className}>
        <AnimatePresence mode="wait">
          <motion.div
            key={actualTheme}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {actualTheme === 'light' ? lightContent : darkContent}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return <div className={className}>{children}</div>;
};

// Theme transition wrapper
const ThemeTransition: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const { actualTheme } = useTheme();

  return (
    <motion.div
      key={actualTheme}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Hook for theme-aware values
const useThemeValue = <T,>(lightValue: T, darkValue: T): T => {
  const { actualTheme } = useTheme();
  return actualTheme === 'light' ? lightValue : darkValue;
};

// Theme script for preventing flash
const ThemeScript = () => {
  const script = `
    (function() {
      try {
        var theme = localStorage.getItem('neurostep-theme') || 'system';
        var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        var actualTheme = theme === 'system' ? systemTheme : theme;
        document.documentElement.classList.add(actualTheme);
      } catch (e) {
        document.documentElement.classList.add('light');
      }
    })()
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
};

export {
  ThemeToggle,
  ThemeAware,
  ThemeTransition,
  ThemeScript,
  useThemeValue,
};