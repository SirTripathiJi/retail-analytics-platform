import { useLocation } from 'react-router-dom';
import { Menu, Moon, Sun } from 'lucide-react';

import { useTranslation } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

const PAGE_KEYS = {
  dashboard: 'nav.overview',
  inventory: 'nav.inventory',
  sales: 'nav.billing',
  analytics: 'nav.insights',
  settings: 'nav.settings',
  customers: 'nav.customers',
  transactions: 'nav.transactions',
};

export function Topbar({ toggleSidebar }) {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const { t = (k) => k } = useTranslation();
  const path = location.pathname.split('/')[1] || 'dashboard';
  const titleKey = PAGE_KEYS[path] || 'nav.overview';

  return (
    <header className="sticky top-0 z-[100] h-20 bg-[var(--card-bg)] border-b-4 border-[var(--border-color)] px-8 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <button
          onClick={() => toggleSidebar()}
          className="md:hidden w-10 h-10 flex items-center justify-center border-2 border-[var(--border-color)] bg-[var(--card-bg)] shadow-[3px_3px_0_var(--shadow-color)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
        >
          <Menu className="w-6 h-6 text-[var(--text-primary)]" />
        </button>
        <h1 className="text-2xl font-black text-[var(--text-primary)] uppercase italic tracking-tighter">
          {t(titleKey)}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="w-12 h-12 flex items-center justify-center border-2 border-[var(--border-color)] bg-[var(--card-bg)] shadow-[4px_4px_0_var(--shadow-color)] hover:bg-[var(--color-brand)] hover:text-[#111111] transition-all active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
        >
          {theme === 'dark' ? (
            <Sun className="w-6 h-6 text-inherit" />
          ) : (
            <Moon className="w-6 h-6 text-inherit" />
          )}
        </button>
      </div>
    </header>
  );
}
