'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Moon, SunIcon } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'icon' | 'icon-with-text';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ModeToggle({ 
  variant = 'icon-with-text', 
  size = 'md', 
  className = '' 
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Prevent hydration mismatch
  useEffect(() => setMounted(true), []);
  
  if (!mounted) return null;

  // Map sizes to actual dimensions
  const sizeMap = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };
  
  const iconSize = sizeMap[size];

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={`flex ${variant === 'icon' ? '' : 'flex-col'} items-center text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors ${className}`}
      aria-label="Toggle theme"
    >
      <div className={`relative ${variant === 'icon-with-text' ? 'mb-1' : ''}`}>
        <SunIcon className={`${iconSize} absolute inset-0 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0`} />
        <Moon className={`${iconSize} absolute inset-0 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100`} />
        <div className={iconSize}></div> {/* Spacer */}
      </div>
      {variant === 'icon-with-text' && <span className="text-xs">Theme</span>}
    </button>
  );
}