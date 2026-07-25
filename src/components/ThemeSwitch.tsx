import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { clsx } from 'clsx';

export default function ThemeSwitch({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={clsx("flex items-center bg-gray-100 dark:bg-white/5 rounded-xl p-1 gap-1 border border-gray-200 dark:border-white/10", className)}>
      <button
        onClick={() => setTheme('light')}
        title="Light Mode"
        className={clsx(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
          theme === 'light'
            ? "bg-white dark:bg-[#222] shadow-sm text-neon-purple"
            : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
        )}
      >
        <Sun className="w-4 h-4 text-yellow-500" />
        <span className="hidden sm:inline">Light</span>
      </button>

      <button
        onClick={() => setTheme('dark')}
        title="Dark Mode"
        className={clsx(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
          theme === 'dark'
            ? "bg-white dark:bg-[#222] shadow-sm text-neon-purple"
            : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
        )}
      >
        <Moon className="w-4 h-4 text-blue-400" />
        <span className="hidden sm:inline">Dark</span>
      </button>

      <button
        onClick={() => setTheme('system')}
        title="System Theme"
        className={clsx(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
          theme === 'system'
            ? "bg-white dark:bg-[#222] shadow-sm text-neon-purple"
            : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
        )}
      >
        <Laptop className="w-4 h-4 text-purple-400" />
        <span className="hidden sm:inline">System</span>
      </button>
    </div>
  );
}
