import { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { ViewModeSelector } from './ViewModeSelector';
import { Outlet } from 'react-router-dom';
import { useViewMode } from '../hooks/useViewMode';

export const Layout = () => {
  const { viewMode } = useViewMode();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar key={viewMode} />
      <main className="flex-1 overflow-auto flex flex-col">
        <div className="p-6 flex justify-between items-start">
          <ViewModeSelector />
          <button
            className="mb-4 px-3 py-1 rounded border text-xs"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label="Alternar tema"
          >
            {theme === 'light' ? '🌙 Modo Escuro' : '☀️ Modo Claro'}
          </button>
        </div>
        <div className="p-6 pt-0 flex-1">
          <Outlet />
        </div>
        <footer className="w-full text-center text-xs text-muted-foreground pb-2">
          <div>v1.0.0</div>
          <div className="font-semibold text-primary">LA Studio</div>
        </footer>
      </main>
    </div>
  );
};