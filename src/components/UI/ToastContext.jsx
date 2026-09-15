import { createContext, useCallback, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((msg, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
  };

  const getIcon = (type) => {
    if (type === 'success') return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    if (type === 'error') return <AlertCircle className="w-4 h-4 text-red-600" />;
    return <Info className="w-4 h-4 text-blue-600" />;
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-10 right-10 z-[10000] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
              className="pointer-events-auto min-w-[320px] max-w-sm bg-[var(--surface)] border border-[var(--border-color)] rounded-xl shadow-elite p-4 flex items-center gap-4 transition-all duration-300"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--bg-subtle)] flex items-center justify-center border border-[var(--border-color)]">
                {getIcon(t.type)}
              </div>
              <p className="flex-1 text-[13px] font-bold text-[var(--text)] leading-tight">
                {t.msg}
              </p>
              <button
                onClick={() => removeToast(t.id)}
                className="p-1.5 rounded-lg hover:bg-[var(--surface2)] text-[var(--text3)] hover:text-[var(--text)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
