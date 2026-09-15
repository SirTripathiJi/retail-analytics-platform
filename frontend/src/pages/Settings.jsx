import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Globe, Moon, ShieldCheck, Sun, Trash2 } from 'lucide-react';

import { Modal } from '../components/UI/Modal';
import { useToast } from '../components/UI/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useTranslation } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export function Settings() {
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();
  const { t = (k) => k, LANGS, LANG_NAMES, changeLanguage, lang } = useTranslation();
  const { resetAllData } = useData();
  const [showConfirm, setShowConfirm] = useState(false);

  const clearData = () => {
    resetAllData();
    toast.info('All business data has been deleted.');
    setShowConfirm(false);
    navigate('/dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto px-6 space-y-12">
      <div className="space-y-4 text-center">
        <h2 className="text-5xl font-black tracking-tighter uppercase italic leading-none text-[var(--text-primary)]">
          {t('nav.settings')}
        </h2>
        <p className="text-lg font-bold text-[var(--text-secondary)]">
          {t('settings.manageAccount')}
        </p>
      </div>

      <div className="space-y-8 flex flex-col gap-5">
        {/* Appearance Section */}
        <div className="brutalist-card w-full">
          <div className="flex justify-between items-center gap-8">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 border-4 border-[var(--border-color)] bg-[var(--color-brand)] flex items-center justify-center shadow-[4px_4px_0_var(--shadow-color)] text-[#111111]">
                {theme === 'dark' ? <Moon className="w-8 h-8" /> : <Sun className="w-8 h-8" />}
              </div>
              <div>
                <h4 className="text-2xl font-black uppercase tracking-tighter mb-1 text-[var(--text-primary)]">
                  {t('settings.darkMode')}
                </h4>
                <p className="text-sm font-black text-[var(--text-secondary)] uppercase tracking-widest italic">
                  {t('settings.darkModeDesc')}
                </p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative w-16 h-8 border-4 border-[var(--border-color)] transition-colors ${theme === 'dark' ? 'bg-[var(--color-brand)]' : 'bg-[var(--card-bg)]'}`}
            >
              <div
                className={`absolute top-0 bottom-0 w-6 bg-[var(--border-color)] transition-all ${theme === 'dark' ? 'right-0' : 'left-0'}`}
              />
            </button>
          </div>
        </div>

        {/* Language Section */}
        <div className="brutalist-card w-full">
          <div className="flex justify-between items-center gap-8">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 border-4 border-[var(--border-color)] bg-[var(--color-accent)] flex items-center justify-center shadow-[4px_4px_0_var(--shadow-color)]">
                <Globe className="w-8 h-8 text-[#111111]" />
              </div>
              <div>
                <h4 className="text-2xl font-black uppercase tracking-tighter mb-1 text-[var(--text-primary)]">
                  {t('settings.language')}
                </h4>
                <p className="text-sm font-black text-[var(--text-secondary)] uppercase tracking-widest italic">
                  {t('settings.languageDesc')}
                </p>
              </div>
            </div>
            <select
              value={lang}
              onChange={(e) => changeLanguage(e.target.value)}
              className="brutalist-input !w-auto !py-4 !px-8 bg-[var(--card-bg)] text-[var(--text-primary)] font-black text-sm shadow-[5px_5px_0_var(--shadow-color)] cursor-pointer"
            >
              {LANGS.map((l) => (
                <option key={l} value={l}>
                  {LANG_NAMES[l]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Security Section */}
        <div className="brutalist-card w-full !bg-[var(--card-bg)] border-red-500 shadow-[4px_4px_0_#ef4444]">
          <div className="flex justify-between items-center gap-8">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 border-4 border-[var(--border-color)] bg-red-500 flex items-center justify-center shadow-[4px_4px_0_var(--shadow-color)] text-[#ffffff]">
                <Trash2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-2xl font-black uppercase tracking-tighter mb-1 text-[var(--text-primary)]">
                  {t('settings.resetData')}
                </h4>
                <p className="text-sm font-black text-[var(--text-secondary)] uppercase tracking-widest italic">
                  {t('settings.resetDataDesc')}
                </p>
              </div>
            </div>
            <button
              className="brutalist-btn bg-red-500 text-[#ffffff] px-8 hover:shadow-[6px_6px_0_var(--shadow-color)] hover:-translate-y-1"
              onClick={() => setShowConfirm(true)}
            >
              {t('settings.deleteAll')}
            </button>
          </div>
        </div>
      </div>

      {/* Trust Badge */}
      <div className="p-10 border-4 border-[var(--border-color)] bg-[#111111] text-[#f5f5f5] flex gap-10 items-center shadow-[10px_10px_0_var(--color-brand)] w-full">
        <div className="w-20 h-20 bg-[var(--color-brand)] border-2 border-[#333333] flex items-center justify-center text-[#111111] flex-shrink-0">
          <ShieldCheck className="w-12 h-12" />
        </div>
        <div>
          <h4 className="font-black text-2xl uppercase italic tracking-tighter mb-3 text-[#f5f5f5]">
            {t('settings.trust')}
          </h4>
          <p className="text-base font-bold opacity-70 leading-tight text-[#cccccc]">{t('settings.support')}</p>
        </div>
      </div>

      {/* Confirm Modal */}
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title={t('settings.resetData')}
        actions={
          <div className="flex gap-6">
            <button
              className="text-sm font-black uppercase underline decoration-2"
              onClick={() => setShowConfirm(false)}
            >
              {t('settings.cancel')}
            </button>
            <button className="brutalist-btn bg-red-500 text-white px-10" onClick={clearData}>
              {t('settings.deleteAll')}
            </button>
          </div>
        }
      >
        <div className="flex flex-col items-center text-center py-8">
          <div className="w-24 h-24 border-4 border-[var(--border-color)] bg-[var(--card-bg)] flex items-center justify-center text-red-500 mb-8 shadow-[6px_6px_0_var(--shadow-color)]">
            <AlertTriangle className="w-12 h-12" />
          </div>
          <h3 className="text-4xl font-black tracking-tighter uppercase italic mb-4 text-[var(--text-primary)]">
            {t('settings.deleteConfirmTitle')}
          </h3>
          <p className="text-[var(--text-secondary)] font-bold text-xl leading-tight">
            {t('settings.deleteConfirmDesc')}
          </p>
        </div>
      </Modal>
    </div>
  );
}
