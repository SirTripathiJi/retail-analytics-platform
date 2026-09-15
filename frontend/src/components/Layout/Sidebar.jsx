import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FileText,
  LayoutDashboard,
  LineChart,
  LogOut,
  Package,
  Receipt,
  Settings,
  Users,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import { DB } from '../../services/db';
import { Logo } from '../UI/Logo';

export function Sidebar({ isOpen, toggleSidebar }) {
  const { user, logout } = useAuth();
  const { t = (k) => k } = useTranslation();
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    if (user?.uid) {
      const products = DB.getProducts(user.uid);
      setLowStockCount(
        products.filter((x) => Number(x.qty) <= Number(x.lowStock) && Number(x.qty) > 0).length
      );
    }
  }, [user]);

  const nav = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('nav.overview') },
    { to: '/inventory', icon: Package, label: t('nav.inventory'), badge: lowStockCount },
    { to: '/customers', icon: Users, label: t('nav.customers') },
    { to: '/sales', icon: Receipt, label: t('nav.billing') },
    { to: '/transactions', icon: FileText, label: t('nav.transactions') },
    { to: '/analytics', icon: LineChart, label: t('nav.insights') },
    { to: '/settings', icon: Settings, label: t('nav.settings') },
  ];

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-[199] md:hidden transition-opacity duration-200 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => toggleSidebar(false)}
      />

      <aside
        className={`w-[260px] bg-[var(--card-bg)] border-r-4 border-[var(--border-color)] flex flex-col fixed top-0 bottom-0 left-0 z-[200] transition-transform duration-200 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b-4 border-[var(--border-color)] bg-[var(--color-brand)]/15">
          <Logo size="sm" />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-8 flex flex-col gap-2 overflow-y-auto">
          {nav.map(({ to, icon: Icon, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => toggleSidebar(false)}
              className={({ isActive }) =>
                `flex items-center gap-5 px-5 py-4 font-black text-base border-2 border-transparent transition-all group ${
                  isActive
                    ? 'bg-[var(--color-brand)] text-[#111111] shadow-[5px_5px_0_var(--shadow-color)]'
                    : 'text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] hover:border-[var(--border-color)] hover:shadow-[5px_5px_0_var(--shadow-color)]'
                }`
              }
            >
              <Icon className="w-6 h-6" />
              <span className="flex-1 uppercase tracking-normal">{label}</span>
              {badge > 0 && (
                <span className="bg-[var(--color-secondary)] text-[#ffffff] text-xs font-black px-2.5 py-1 border-2 border-[var(--border-color)]">
                  {badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t-4 border-[var(--border-color)] bg-[var(--bg-secondary)]">
          <div className="flex items-center gap-3 px-3 py-3 border-2 border-[var(--border-color)] bg-[var(--card-bg)] shadow-[3px_3px_0_var(--shadow-color)] mb-4">
            <div className="w-12 h-12 bg-[var(--color-brand)] text-[#111111] flex items-center justify-center font-black text-xl border-2 border-[var(--border-color)]">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="font-black text-base text-[var(--text-primary)] truncate uppercase leading-tight">
                {user?.name || t('dashboard.user')}
              </p>
              <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-tight">
                {user?.store || t('dashboard.myStore')}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              toggleSidebar(false);
              logout();
            }}
            className="flex items-center justify-center gap-4 px-5 py-4 border-2 border-[var(--border-color)] font-black text-base w-full bg-[var(--card-bg)] hover:bg-[var(--color-error)] hover:text-[#ffffff] text-[var(--text-primary)] transition-all shadow-[5px_5px_0_var(--shadow-color)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
          >
            <LogOut className="w-5 h-5" />
            <span className="uppercase">{t('nav.signout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
