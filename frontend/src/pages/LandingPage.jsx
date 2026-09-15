import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  LineChart,
  Mic,
  Moon,
  Package,
  Receipt,
  ShieldCheck,
  Sparkles,
  Sun,
  TrendingUp,
  Users,
} from 'lucide-react';

import { Logo } from '../components/UI/Logo';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export function LandingPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { t = (k) => k } = useTranslation();

  const go = () => navigate(user ? '/dashboard' : '/auth');

  const FEATURE_FLAGS = {
    inventory: true,
    billing: true,
    insights: true,
    privacy: true,
    profit: true,
    customers: true,
    assistant: false,
    voice: false,
  };

  const features = [
    {
      id: 'inventory',
      icon: Package,
      title: t('landing.featureInventory'),
      text: t('landing.featureInventoryDesc'),
      color: 'var(--color-brand)',
    },
    {
      id: 'billing',
      icon: Receipt,
      title: t('landing.featureBilling'),
      text: t('landing.featureBillingDesc'),
      color: 'var(--color-secondary)',
    },
    {
      id: 'insights',
      icon: LineChart,
      title: t('landing.featureInsights'),
      text: t('landing.featureInsightsDesc'),
      color: 'var(--color-accent)',
    },
    {
      id: 'privacy',
      icon: ShieldCheck,
      title: t('landing.featurePrivacy'),
      text: t('landing.featurePrivacyDesc'),
      color: 'var(--color-success)',
    },
    {
      id: 'assistant',
      icon: Sparkles,
      title: t('landing.featureAssistant'),
      text: t('landing.featureAssistantDesc'),
      color: 'var(--color-brand)',
    },
    {
      id: 'voice',
      icon: Mic,
      title: t('landing.featureVoice'),
      text: t('landing.featureVoiceDesc'),
      color: 'var(--color-secondary)',
    },
    {
      id: 'profit',
      icon: TrendingUp,
      title: t('landing.featureProfit'),
      text: t('landing.featureProfitDesc'),
      color: 'var(--color-accent)',
    },
    {
      id: 'customers',
      icon: Users,
      title: t('landing.featureCustomers'),
      text: t('landing.featureCustomersDesc'),
      color: 'var(--color-success)',
    },
  ];

  const trustItems = [
    { title: t('landing.trust1'), text: t('landing.trust1Desc'), color: 'var(--color-brand)' },
    { title: t('landing.trust2'), text: t('landing.trust2Desc'), color: 'var(--color-secondary)' },
    { title: t('landing.trust3'), text: t('landing.trust3Desc'), color: 'var(--color-accent)' },
    { title: t('landing.trust4'), text: t('landing.trust4Desc'), color: 'var(--color-success)' },
  ];

  return (
    <div
      className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans"
      style={{ overflowX: 'hidden' }}
    >
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 h-20 flex items-center justify-between px-6 md:px-12 bg-[var(--card-bg)] border-b-4 border-[var(--border-color)]">
        <Logo />
        <div className="flex items-center gap-4">
          <a
            href="#pricing"
            className="hidden sm:block text-xs font-black uppercase tracking-widest text-[var(--text-primary)] border-2 border-[var(--border-color)] px-3 py-1.5 shadow-[2px_2px_0_var(--border-color)] hover:bg-[var(--color-brand)] hover:text-[#111111] hover:border-[var(--color-brand)] transition-all"
          >
            {t('landing.pricing')}
          </a>
          <button
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center border-2 border-[var(--border-color)] bg-[var(--card-bg)] shadow-[2px_2px_0_var(--border-color)] hover:bg-[var(--color-brand)] hover:text-[#111111] transition-all"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-inherit" />
            ) : (
              <Moon className="w-5 h-5 text-inherit" />
            )}
          </button>
          <button onClick={go} className="brutalist-btn hidden sm:flex">
            {t('nav.launchApp')}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section
        className="relative flex flex-col items-center text-center animate-brutal-fade-in"
        style={{
          paddingTop: 160,
          paddingBottom: 100,
          paddingLeft: 24,
          paddingRight: 24,
          overflow: 'hidden',
        }}
      >
        {/* Dot texture */}
        <div className="texture-dots" style={{ opacity: 0.035 }} />

        {/* ₹ Rupee coin — top left */}
        <div
          className="biz-shape animate-float-slow"
          style={{ top: '14%', left: '4%', width: 72, height: 72, animationDelay: '0s' }}
        >
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
            <rect
              x="3"
              y="3"
              width="66"
              height="66"
              rx="4"
              fill="var(--color-brand)"
              stroke="var(--border-color)"
              strokeWidth="4"
              opacity="0.18"
            />
            <text
              x="36"
              y="50"
              textAnchor="middle"
              fill="var(--color-brand)"
              fontSize="34"
              fontWeight="900"
              fontFamily="serif"
            >
              ₹
            </text>
          </svg>
        </div>

        {/* % Percent — top right */}
        <div
          className="biz-shape animate-float-alt"
          style={{ top: '22%', right: '4%', width: 80, height: 80, animationDelay: '1.5s' }}
        >
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <rect
              x="3"
              y="3"
              width="74"
              height="74"
              fill="var(--color-secondary)"
              stroke="var(--border-color)"
              strokeWidth="4"
              opacity="0.18"
            />
            <text
              x="40"
              y="56"
              textAnchor="middle"
              fill="var(--color-secondary)"
              fontSize="40"
              fontWeight="900"
              fontFamily="sans-serif"
            >
              %
            </text>
          </svg>
        </div>

        {/* Bar chart — bottom left */}
        <div
          className="biz-shape animate-float-alt"
          style={{ bottom: '14%', left: '5%', width: 60, height: 60, animationDelay: '2s' }}
        >
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
            <rect
              x="2"
              y="2"
              width="56"
              height="56"
              fill="var(--color-accent)"
              stroke="var(--border-color)"
              strokeWidth="3"
              opacity="0.15"
            />
            <rect x="10" y="38" width="8" height="14" fill="var(--color-accent)" opacity="0.7" />
            <rect x="22" y="28" width="8" height="24" fill="var(--color-accent)" opacity="0.7" />
            <rect x="34" y="18" width="8" height="34" fill="var(--color-accent)" opacity="0.7" />
            <rect x="46" y="24" width="8" height="28" fill="var(--color-brand)" opacity="0.7" />
          </svg>
        </div>

        {/* Trending arrow — mid right */}
        <div
          className="biz-shape animate-float-slow hidden lg:flex"
          style={{ top: '55%', right: '6%', width: 52, height: 52, animationDelay: '3s' }}
        >
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
            <rect
              x="2"
              y="2"
              width="48"
              height="48"
              rx="3"
              fill="var(--color-success)"
              stroke="var(--border-color)"
              strokeWidth="3"
              opacity="0.18"
            />
            <polyline
              points="10,36 22,22 30,28 42,14"
              stroke="var(--color-success)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.85"
              fill="none"
            />
            <polyline
              points="34,14 42,14 42,22"
              stroke="var(--color-success)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.85"
              fill="none"
            />
          </svg>
        </div>

        {/* Receipt — bottom right */}
        <div
          className="biz-shape animate-float-spin hidden lg:flex"
          style={{ bottom: '20%', right: '14%', width: 44, height: 44, animationDelay: '5s' }}
        >
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <rect
              x="2"
              y="2"
              width="40"
              height="40"
              fill="var(--color-secondary)"
              stroke="var(--border-color)"
              strokeWidth="3"
              opacity="0.18"
            />
            <rect
              x="9"
              y="12"
              width="26"
              height="3"
              rx="1"
              fill="var(--color-secondary)"
              opacity="0.7"
            />
            <rect
              x="9"
              y="19"
              width="20"
              height="3"
              rx="1"
              fill="var(--color-secondary)"
              opacity="0.7"
            />
            <rect
              x="9"
              y="26"
              width="16"
              height="3"
              rx="1"
              fill="var(--color-secondary)"
              opacity="0.7"
            />
          </svg>
        </div>

        <div
          className="relative z-10 w-full"
          style={{
            maxWidth: 900,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          {/* Headline */}
          <h1
            className="font-black text-[var(--text-primary)] uppercase italic w-full"
            style={{
              fontSize: 'clamp(2.4rem, 6.5vw, 5rem)',
              lineHeight: 1.08,
              letterSpacing: '-0.04em',
              wordBreak: 'break-word',
            }}
          >
            {t('landing.heroTitle1')}
            <br />
            <span
              className="text-[#111111] inline-block"
              style={{
                background: 'var(--color-brand)',
                padding: '6px 22px',
                marginTop: 14,
                boxShadow: '8px 8px 0 var(--color-secondary)',
                wordBreak: 'break-word',
                maxWidth: '100%',
              }}
            >
              {t('landing.heroTitle2')}
            </span>
          </h1>

          {/* Sub-copy */}
          <div
            style={{
              maxWidth: 660,
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <p
              className="font-bold text-[var(--text-secondary)]"
              style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', lineHeight: 1.55 }}
            >
              {t('landing.heroSub1')}
            </p>
            <p
              className="font-bold text-[var(--text-secondary)]"
              style={{ fontSize: 'clamp(0.875rem, 1.6vw, 1.05rem)', lineHeight: 1.5 }}
            >
              {t('landing.heroSub2')}
            </p>
          </div>

          {/* CTA */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 14,
              marginTop: 8,
            }}
          >
            <button
              onClick={go}
              className="brutalist-btn bg-[var(--color-brand)] text-[#111111] hover:-translate-y-1 hover:shadow-[8px_8px_0_var(--border-color)] transition-all"
              style={{ fontSize: '1.2rem', padding: '16px 44px' }}
            >
              {t('landing.getStarted')} <ArrowRight className="ml-3 w-5 h-5" />
            </button>
            <span
              className="font-black uppercase tracking-widest text-[var(--text-secondary)]"
              style={{ fontSize: '0.7rem' }}
            >
              {t('landing.heroPlan')}
            </span>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section
        id="features"
        className="relative border-t-4 border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden"
        style={{ padding: '90px 24px' }}
      >
        <div className="texture-dots" />
        {/* ₹ tag — top right */}
        <div
          className="biz-shape animate-float-slow"
          style={{ top: '8%', right: '2%', width: 54, height: 54, animationDelay: '1s' }}
        >
          <svg width="54" height="54" viewBox="0 0 54 54" fill="none">
            <rect
              x="2"
              y="2"
              width="50"
              height="50"
              rx="3"
              fill="var(--color-brand)"
              stroke="var(--border-color)"
              strokeWidth="3"
              opacity="0.18"
            />
            <text
              x="27"
              y="38"
              textAnchor="middle"
              fill="var(--color-brand)"
              fontSize="26"
              fontWeight="900"
              fontFamily="serif"
            >
              ₹
            </text>
          </svg>
        </div>
        {/* Mini bar chart — bottom left */}
        <div
          className="biz-shape animate-float-alt"
          style={{ bottom: '8%', left: '1%', width: 46, height: 46, animationDelay: '3s' }}
        >
          <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
            <rect
              x="2"
              y="2"
              width="42"
              height="42"
              fill="var(--color-accent)"
              stroke="var(--border-color)"
              strokeWidth="2.5"
              opacity="0.15"
            />
            <rect x="8" y="30" width="6" height="10" fill="var(--color-accent)" opacity="0.75" />
            <rect x="17" y="22" width="6" height="18" fill="var(--color-accent)" opacity="0.75" />
            <rect x="26" y="14" width="6" height="26" fill="var(--color-brand)" opacity="0.75" />
            <rect x="35" y="18" width="6" height="22" fill="var(--color-accent)" opacity="0.75" />
          </svg>
        </div>
        {/* Trending up — mid right edge */}
        <div
          className="biz-shape animate-float-spin"
          style={{ top: '50%', right: '0.5%', width: 36, height: 36, animationDelay: '2s' }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <rect
              x="2"
              y="2"
              width="32"
              height="32"
              rx="2"
              fill="var(--color-success)"
              stroke="var(--border-color)"
              strokeWidth="2.5"
              opacity="0.18"
            />
            <polyline
              points="7,24 14,15 20,19 29,9"
              stroke="var(--color-success)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity="0.9"
            />
            <polyline
              points="23,9 29,9 29,15"
              stroke="var(--color-success)"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              opacity="0.9"
            />
          </svg>
        </div>
        <div
          className="mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          style={{ maxWidth: 1120, gap: 24 }}
        >
          {features.map((f, i) => {
            const Icon = f.icon;
            const isActive = FEATURE_FLAGS[f.id];
            return (
              <div
                key={i}
                className={`brutalist-card flex flex-col items-start transition-all animate-brutal-fade-in ${!isActive ? 'opacity-70 grayscale hover:grayscale-0' : 'hover:-translate-y-1 hover:shadow-[6px_6px_0_var(--border-color)]'}`}
                style={{
                  overflow: 'hidden',
                  wordBreak: 'break-word',
                  animationDelay: `${i * 0.07}s`,
                }}
              >
                {/* Icon */}
                <div
                  className={`flex-shrink-0 border-4 border-[var(--border-color)] flex items-center justify-center ${isActive ? 'shadow-[3px_3px_0_var(--border-color)]' : ''}`}
                  style={{
                    width: 52,
                    height: 52,
                    marginBottom: 16,
                    backgroundColor: isActive ? f.color : 'var(--bg-secondary)',
                  }}
                >
                  <Icon
                    className={`w-6 h-6 ${isActive ? 'text-[#111111]' : 'text-[var(--text-secondary)]'}`}
                  />
                </div>
                {/* Title */}
                <h3
                  className="font-black uppercase text-[var(--text-primary)]"
                  style={{
                    fontSize: !isActive ? '0.95rem' : '1.1rem',
                    lineHeight: 1.15,
                    letterSpacing: '-0.02em',
                    wordBreak: 'break-word',
                    marginBottom: 8,
                  }}
                >
                  {f.title}
                </h3>
                {/* Badge */}
                {!isActive && (
                  <span
                    className="inline-block bg-[var(--card-bg)] border-2 border-[var(--border-color)] text-[var(--text-secondary)] uppercase font-black tracking-widest"
                    style={{ fontSize: '8px', padding: '2px 6px', margin: '6px 0' }}
                  >
                    Coming Soon
                  </span>
                )}
                {/* Description */}
                <p
                  className="text-[var(--text-secondary)] font-bold flex-1"
                  style={{
                    fontSize: '0.85rem',
                    lineHeight: 1.55,
                    marginTop: 8,
                    wordBreak: 'break-word',
                  }}
                >
                  {f.text}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trust Section */}
      <section
        className="relative border-y-4 border-[var(--border-color)] overflow-hidden"
        style={{ padding: '100px 24px', background: '#0f0f1a' }}
      >
        <div className="texture-dots" style={{ opacity: 0.06 }} />
        {/* Coin ₹ — top left */}
        <div
          className="biz-shape animate-float-alt"
          style={{ top: '8%', left: '2%', width: 60, height: 60, animationDelay: '0s' }}
        >
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
            <circle
              cx="30"
              cy="30"
              r="27"
              fill="var(--color-brand)"
              stroke="var(--color-brand)"
              strokeWidth="3"
              opacity="0.22"
            />
            <text
              x="30"
              y="41"
              textAnchor="middle"
              fill="var(--color-brand)"
              fontSize="28"
              fontWeight="900"
              fontFamily="serif"
            >
              ₹
            </text>
          </svg>
        </div>
        {/* Receipt — bottom right */}
        <div
          className="biz-shape animate-float-spin"
          style={{ bottom: '8%', right: '2%', width: 48, height: 48, animationDelay: '2s' }}
        >
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect
              x="2"
              y="2"
              width="44"
              height="44"
              rx="2"
              fill="var(--color-accent)"
              stroke="var(--color-accent)"
              strokeWidth="3"
              opacity="0.22"
            />
            <rect
              x="10"
              y="13"
              width="28"
              height="3"
              rx="1"
              fill="var(--color-accent)"
              opacity="0.8"
            />
            <rect
              x="10"
              y="21"
              width="22"
              height="3"
              rx="1"
              fill="var(--color-accent)"
              opacity="0.8"
            />
            <rect
              x="10"
              y="29"
              width="16"
              height="3"
              rx="1"
              fill="var(--color-accent)"
              opacity="0.8"
            />
          </svg>
        </div>
        {/* % — mid right */}
        <div
          className="biz-shape animate-float-slow"
          style={{ top: '42%', right: '6%', width: 34, height: 34, animationDelay: '4s' }}
        >
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
            <rect
              x="2"
              y="2"
              width="30"
              height="30"
              rx="2"
              fill="var(--color-secondary)"
              stroke="var(--color-secondary)"
              strokeWidth="2.5"
              opacity="0.22"
            />
            <text
              x="17"
              y="24"
              textAnchor="middle"
              fill="var(--color-secondary)"
              fontSize="18"
              fontWeight="900"
              fontFamily="sans-serif"
            >
              %
            </text>
          </svg>
        </div>
        <div
          className="mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 text-center"
          style={{ maxWidth: 1120, gap: 40 }}
        >
          {trustItems.map((item, i) => (
            <div key={i} style={{ wordBreak: 'break-word' }}>
              <div
                className="font-black uppercase tracking-tighter"
                style={{
                  color: item.color,
                  fontSize: '1.35rem',
                  lineHeight: 1.15,
                  marginBottom: 10,
                }}
              >
                {item.title}
              </div>
              <div
                className="font-bold"
                style={{
                  color: '#cccccc',
                  opacity: 0.9,
                  fontSize: '0.95rem',
                  lineHeight: 1.5,
                }}
              >
                {item.text}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="relative border-t-4 border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden"
        style={{ padding: '100px 24px', scrollMarginTop: 80 }}
      >
        <div className="texture-dots" />
        {/* ₹ tag — top left */}
        <div
          className="biz-shape animate-float-slow"
          style={{ top: '6%', left: '1%', width: 62, height: 62, animationDelay: '0s' }}
        >
          <svg width="62" height="62" viewBox="0 0 62 62" fill="none">
            <rect
              x="2"
              y="2"
              width="58"
              height="58"
              rx="3"
              fill="var(--color-secondary)"
              stroke="var(--border-color)"
              strokeWidth="3"
              opacity="0.18"
            />
            <text
              x="31"
              y="43"
              textAnchor="middle"
              fill="var(--color-secondary)"
              fontSize="30"
              fontWeight="900"
              fontFamily="serif"
            >
              ₹
            </text>
          </svg>
        </div>
        {/* Coin — bottom right */}
        <div
          className="biz-shape animate-float-alt"
          style={{ bottom: '8%', right: '1.5%', width: 54, height: 54, animationDelay: '2.5s' }}
        >
          <svg width="54" height="54" viewBox="0 0 54 54" fill="none">
            <circle
              cx="27"
              cy="27"
              r="24"
              fill="var(--color-accent)"
              stroke="var(--border-color)"
              strokeWidth="3"
              opacity="0.18"
            />
            <circle
              cx="27"
              cy="27"
              r="18"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="2"
              opacity="0.4"
            />
            <text
              x="27"
              y="33"
              textAnchor="middle"
              fill="var(--color-accent)"
              fontSize="16"
              fontWeight="900"
              fontFamily="sans-serif"
            >
              ₹
            </text>
          </svg>
        </div>
        {/* Bar chart — top right */}
        <div
          className="biz-shape animate-float-spin"
          style={{ top: '30%', right: '3%', width: 40, height: 40, animationDelay: '1s' }}
        >
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect
              x="2"
              y="2"
              width="36"
              height="36"
              rx="2"
              fill="var(--color-brand)"
              stroke="var(--border-color)"
              strokeWidth="2.5"
              opacity="0.18"
            />
            <rect x="7" y="26" width="5" height="8" fill="var(--color-brand)" opacity="0.7" />
            <rect x="15" y="18" width="5" height="16" fill="var(--color-brand)" opacity="0.7" />
            <rect x="23" y="12" width="5" height="22" fill="var(--color-brand)" opacity="0.7" />
            <rect x="31" y="16" width="5" height="18" fill="var(--color-success)" opacity="0.7" />
          </svg>
        </div>
        {/* % — bottom left */}
        <div
          className="biz-shape animate-float-alt"
          style={{ bottom: '28%', left: '2%', width: 36, height: 36, animationDelay: '4s' }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <rect
              x="2"
              y="2"
              width="32"
              height="32"
              rx="2"
              fill="var(--color-success)"
              stroke="var(--border-color)"
              strokeWidth="2.5"
              opacity="0.18"
            />
            <text
              x="18"
              y="26"
              textAnchor="middle"
              fill="var(--color-success)"
              fontSize="20"
              fontWeight="900"
              fontFamily="sans-serif"
            >
              %
            </text>
          </svg>
        </div>
        <div className="mx-auto" style={{ maxWidth: 1120 }}>
          {/* Section Header */}
          <div style={{ marginBottom: 56, textAlign: 'center' }}>
            <h2
              className="font-black uppercase italic text-[var(--text-primary)]"
              style={{
                fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                lineHeight: 1.1,
                letterSpacing: '-0.04em',
                marginBottom: 12,
              }}
            >
              Simple, Honest Pricing.
            </h2>
            <p
              className="font-bold text-[var(--text-secondary)]"
              style={{ fontSize: '1rem', lineHeight: 1.5, maxWidth: 520, margin: '0 auto' }}
            >
              No hidden fees. No per-device charges. Pay once, use everywhere.
            </p>
          </div>

          {/* Cards row */}
          <div
            className="grid grid-cols-1 md:grid-cols-2"
            style={{ gap: 32, maxWidth: 840, margin: '0 auto' }}
          >
            {/* ── Starter ── */}
            <div
              className="brutalist-card flex flex-col"
              style={{ overflow: 'hidden', wordBreak: 'break-word', padding: 32 }}
            >
              {/* Plan name */}
              <div className="flex items-center gap-3" style={{ marginBottom: 20 }}>
                <div
                  className="flex-shrink-0 border-4 border-[var(--border-color)] flex items-center justify-center shadow-[3px_3px_0_var(--border-color)]"
                  style={{ width: 48, height: 48, backgroundColor: 'var(--color-brand)' }}
                >
                  <span className="font-black text-[#111111]" style={{ fontSize: '1.1rem' }}>
                    S
                  </span>
                </div>
                <div>
                  <h3
                    className="font-black uppercase text-[var(--text-primary)]"
                    style={{ fontSize: '1.25rem', lineHeight: 1.1, letterSpacing: '-0.03em' }}
                  >
                    Starter
                  </h3>
                  <p
                    className="font-bold text-[var(--text-secondary)]"
                    style={{ fontSize: '0.75rem' }}
                  >
                    {t('landing.dailyShop')}
                  </p>
                </div>
              </div>

              {/* Price */}
              <div style={{ marginBottom: 8 }}>
                <span
                  className="font-black text-[var(--text-primary)]"
                  style={{ fontSize: '2.8rem', lineHeight: 1, letterSpacing: '-0.04em' }}
                >
                  ₹399
                </span>
                <span
                  className="font-bold text-[var(--text-secondary)]"
                  style={{ fontSize: '0.85rem', marginLeft: 6 }}
                >
                  /month
                </span>
              </div>
              <p
                className="font-bold text-[var(--text-secondary)]"
                style={{ fontSize: '0.85rem', lineHeight: 1.5, marginBottom: 28 }}
              >
                Everything you need to run your daily business.
              </p>

              {/* Divider */}
              <div
                className="border-t-2 border-[var(--border-color)]"
                style={{ marginBottom: 24 }}
              />

              {/* Features */}
              <ul className="flex flex-col" style={{ gap: 12, marginBottom: 32, flex: 1 }}>
                {['Inventory Control', 'Billing System', 'Basic Insights', 'Offline Access'].map(
                  (feat) => (
                    <li key={feat} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-5 h-5 border-2 border-[var(--border-color)] bg-[var(--color-brand)] flex items-center justify-center shadow-[2px_2px_0_var(--border-color)]">
                        <span
                          className="text-[#111111] font-black"
                          style={{ fontSize: '10px', lineHeight: 1 }}
                        >
                          ✓
                        </span>
                      </div>
                      <span
                        className="font-bold text-[var(--text-secondary)]"
                        style={{ fontSize: '0.9rem' }}
                      >
                        {feat}
                      </span>
                    </li>
                  )
                )}
              </ul>

              {/* CTA */}
              <button
                onClick={go}
                className="brutalist-btn bg-[var(--color-brand)] text-[#111111] w-full hover:-translate-y-1 hover:shadow-[6px_6px_0_var(--border-color)] transition-all"
                style={{ fontSize: '1rem', padding: '14px 24px' }}
              >
                Get Started
              </button>
            </div>

            {/* ── Pro+ ── */}
            <div
              className="brutalist-card flex flex-col relative"
              style={{
                overflow: 'hidden',
                wordBreak: 'break-word',
                padding: 32,
                borderColor: 'var(--color-accent)',
                boxShadow: '6px 6px 0 var(--color-accent)',
                background: 'var(--card-bg)',
              }}
            >
              {/* Best Value badge */}
              <div
                className="absolute top-0 right-0 bg-[var(--color-accent)] text-[#111111] font-black uppercase tracking-widest"
                style={{
                  fontSize: '8px',
                  padding: '4px 10px',
                  borderLeft: '3px solid var(--border-color)',
                  borderBottom: '3px solid var(--border-color)',
                }}
              >
                Best Value
              </div>

              {/* Plan name */}
              <div className="flex items-center gap-3" style={{ marginBottom: 20 }}>
                <div
                  className="flex-shrink-0 border-4 flex items-center justify-center shadow-[3px_3px_0_var(--color-accent)]"
                  style={{
                    width: 48,
                    height: 48,
                    backgroundColor: 'var(--color-accent)',
                    borderColor: 'var(--color-accent)',
                  }}
                >
                  <span className="font-black text-[#111111]" style={{ fontSize: '1.1rem' }}>
                    P
                  </span>
                </div>
                <div>
                  <h3
                    className="font-black uppercase text-[var(--text-primary)]"
                    style={{ fontSize: '1.25rem', lineHeight: 1.1, letterSpacing: '-0.03em' }}
                  >
                    Pro+
                    <span
                      className="inline-block bg-[var(--bg-secondary)] border-2 border-[var(--border-color)] text-[var(--text-secondary)] uppercase font-black tracking-widest"
                      style={{
                        fontSize: '8px',
                        padding: '2px 6px',
                        marginLeft: 8,
                        verticalAlign: 'middle',
                      }}
                    >
                      Preview
                    </span>
                  </h3>
                  <p
                    className="font-bold text-[var(--text-secondary)]"
                    style={{ fontSize: '0.75rem' }}
                  >
                    {t('landing.premiumIntelligence')}
                  </p>
                </div>
              </div>

              {/* Price */}
              <div style={{ marginBottom: 8 }}>
                <span
                  className="font-black text-[var(--text-primary)]"
                  style={{ fontSize: '2.8rem', lineHeight: 1, letterSpacing: '-0.04em' }}
                >
                  ₹799
                </span>
                <span
                  className="font-bold text-[var(--text-secondary)]"
                  style={{ fontSize: '0.85rem', marginLeft: 6 }}
                >
                  /month
                </span>
              </div>
              <p
                className="font-bold text-[var(--text-secondary)]"
                style={{ fontSize: '0.85rem', lineHeight: 1.5, marginBottom: 28 }}
              >
                Advanced intelligence for smarter decisions.
              </p>

              {/* Divider */}
              <div style={{ borderTop: '2px solid var(--color-accent)', marginBottom: 24 }} />

              <ul className="flex flex-col" style={{ gap: 12, marginBottom: 32, flex: 1 }}>
                {[
                  { label: 'Everything in Starter', id: 'starter' },
                  { label: 'Smart Assistant', id: 'assistant' },
                  { label: 'Voice Entries', id: 'voice' },
                  { label: 'Profit Intelligence', id: 'profit' },
                  { label: 'Customer Insights', id: 'customers' },
                ].map((feat) => {
                  const isAvailable = feat.id === 'starter' ? true : FEATURE_FLAGS[feat.id];
                  return (
                    <li
                      key={feat.label}
                      className={`flex items-center gap-3 ${!isAvailable ? 'opacity-50' : ''}`}
                    >
                      <div
                        className="flex-shrink-0 w-5 h-5 border-2 flex items-center justify-center shadow-[2px_2px_0_var(--color-accent)]"
                        style={{
                          backgroundColor: isAvailable ? 'var(--color-accent)' : 'transparent',
                          borderColor: 'var(--color-accent)',
                        }}
                      >
                        {isAvailable && (
                          <span
                            className="text-[#111111] font-black"
                            style={{ fontSize: '10px', lineHeight: 1 }}
                          >
                            ✓
                          </span>
                        )}
                      </div>
                      <span
                        className="font-bold text-[var(--text-secondary)]"
                        style={{ fontSize: '0.9rem' }}
                      >
                        {feat.label}
                        {!isAvailable && (
                          <span
                            className="inline-block bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] uppercase font-black tracking-widest"
                            style={{
                              fontSize: '7px',
                              padding: '1px 4px',
                              marginLeft: 6,
                              verticalAlign: 'middle',
                            }}
                          >
                            Soon
                          </span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {/* CTA */}
              <button
                className="brutalist-btn w-full bg-[var(--color-accent)] text-[#111111] hover:-translate-y-1 hover:shadow-[6px_6px_0_var(--border-color)] transition-all"
                style={{ fontSize: '1rem', padding: '14px 24px' }}
                title="Pro+ features are currently in partial preview"
                onClick={go}
              >
                Upgrade (Preview)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="bg-[var(--card-bg)] border-t-4 border-[var(--border-color)]"
        style={{ padding: '52px 24px' }}
      >
        <div
          className="mx-auto flex flex-col md:flex-row justify-between items-center"
          style={{ maxWidth: 1120, gap: 28 }}
        >
          <Logo />
          <div className="flex flex-wrap justify-center gap-8 text-sm font-black uppercase tracking-widest text-[var(--text-primary)] underline decoration-2 underline-offset-4">
            <a href="#" className="hover:text-[var(--color-secondary)] transition-colors">
              {t('landing.privacy')}
            </a>
            <a href="#" className="hover:text-[var(--color-brand)] transition-colors">
              {t('landing.terms')}
            </a>
            <a
              href="mailto:tripathiakshat2604@gmail.com"
              className="hover:text-[var(--color-accent)] transition-colors"
            >
              {t('landing.support')}
            </a>
          </div>
          <p
            className="text-[var(--text-secondary)] font-black uppercase tracking-widest text-center md:text-right"
            style={{ fontSize: '0.7rem', maxWidth: 260 }}
          >
            Built for business owners who value clarity today and smarter growth tomorrow.
          </p>
        </div>
      </footer>
    </div>
  );
}
