'use client';

import { MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, resolvedTheme, setTheme } = useTheme();

  // Avoid hydration mismatch: next-themes resolves theme only on client
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mounted pattern for theme hydration
    setMounted(true);
  }, []);

  const isDark =
    theme === 'dark' || (theme === 'system' && resolvedTheme === 'dark');

  const handleClick = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  if (!mounted) {
    return (
      <Button variant="outline" size="icon-sm" className="size-8" disabled>
        <SunIcon className="size-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon-sm"
      className="size-8"
      onClick={handleClick}
      aria-label="Alternar tema"
    >
      {isDark ? (
        <MoonIcon className="size-4" />
      ) : (
        <SunIcon className="size-4" />
      )}
    </Button>
  );
}
