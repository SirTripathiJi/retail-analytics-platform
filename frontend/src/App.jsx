import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

// Providers & Layout
import { AppLayout } from './components/Layout/AppLayout';
import { ErrorBoundary } from './components/UI/ErrorBoundary';
import { ToastProvider } from './components/UI/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';

// Lazy-loaded pages (using relative paths for stability)
const LandingPage = lazy(() =>
  import('./pages/LandingPage.jsx').then((module) => ({ default: module.LandingPage }))
);
const AuthPage = lazy(() =>
  import('./pages/AuthPage.jsx').then((module) => ({ default: module.AuthPage }))
);
const Dashboard = lazy(() =>
  import('./pages/Dashboard.jsx').then((module) => ({ default: module.Dashboard }))
);
const Inventory = lazy(() =>
  import('./pages/Inventory.jsx').then((module) => ({ default: module.Inventory }))
);
const Sales = lazy(() => import('./pages/Sales.jsx').then((module) => ({ default: module.Sales })));
const Analytics = lazy(() =>
  import('./pages/Analytics.jsx').then((module) => ({ default: module.Analytics }))
);
const Settings = lazy(() =>
  import('./pages/Settings.jsx').then((module) => ({ default: module.Settings }))
);
const Customers = lazy(() =>
  import('./pages/Customers.jsx').then((module) => ({ default: module.Customers }))
);
const Transactions = lazy(() =>
  import('./pages/Transactions.jsx').then((module) => ({ default: module.Transactions }))
);

// Global Skeleton Loader for Suspense Fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
    <div className="w-10 h-10 border-4 border-[var(--border-color)] border-t-[var(--color-primary)] rounded-full animate-spin" />
  </div>
);

function AppContent() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />

          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <ToastProvider>
            <AuthProvider>
              <DataProvider>
                <AppContent />
              </DataProvider>
            </AuthProvider>
          </ToastProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
