'use client';

import React, { useEffect, useState } from 'react';
import { MoonIcon, SunIcon } from './ui/Icons';

const STORAGE_KEY = 'a11y-theme';

export default function ThemeToggle() {
  // The inline script in the document head has already applied the class; read
  // it back on mount rather than guessing, so the button never lies.
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    document.documentElement.style.colorScheme = next ? 'dark' : 'light';
    try {
      localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
    } catch {
      /* Storage unavailable — the choice just won't persist. */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={mounted ? isDark : undefined}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-surface
                 text-ink-muted transition-colors hover:border-border-strong hover:text-ink"
    >
      {mounted && isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
    </button>
  );
}
