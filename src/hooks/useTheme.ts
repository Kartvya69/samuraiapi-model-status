'use client';

import { useState, useEffect } from 'react';

export function useTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check localStorage and system preference
    const stored = localStorage.getItem('theme');
    const systemPrefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const shouldBeDark = stored === 'dark' || (stored === null && systemPrefers);
    setIsDark(shouldBeDark);
    
    // Apply theme to document
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return { isDark, toggleTheme };
}