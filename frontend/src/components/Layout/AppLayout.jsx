import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';

import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, loading } = useAuth();
  const { t = (k) => k } = useTranslation();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] fixed inset-0 z-[99999]">
        <div className="w-12 h-12 border-4 border-[var(--border-color)] border-t-[var(--color-brand)] rounded-full animate-spin mb-4" />
        <p className="font-black uppercase tracking-widest text-[var(--text-primary)]">
          {t('loading')}
        </p>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const toggleSidebar = (state) => {
    setIsSidebarOpen((prev) => (state !== undefined ? state : !prev));
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col min-h-screen md:ml-[260px]">
        <Topbar toggleSidebar={toggleSidebar} />
        <main className="p-6 md:p-12 flex-1 w-full mx-auto relative">
          <div className="animate-brutal-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
