import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg border border-gray-200 dark:border-gray-700 
                 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700
                 transition-all duration-200 ease-in-out group shadow-sm hover:shadow-md"
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5">
        <Sun
          className={`absolute inset-0 h-5 w-5 text-yellow-500 transition-all duration-300 ${
            isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
          }`}
        />
        <Moon
          className={`absolute inset-0 h-5 w-5 text-blue-400 transition-all duration-300 ${
            isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
          }`}
        />
      </div>
    </button>
  );
}