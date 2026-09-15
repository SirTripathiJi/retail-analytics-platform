import { cn } from '../../lib/utils';

export const LogoIcon = ({ className }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="saffronRose" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF9933" />
        <stop offset="100%" stopColor="#FF4D6D" />
      </linearGradient>
      <pattern id="dotGrain" width="4" height="4" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="0.6" fill="#ffffff" opacity="0.15" />
      </pattern>
    </defs>

    {/* Base Layer: Deep Charcoal */}
    <path
      d="M 8 2 H 24 A 6 6 0 0 0 30 8 V 24 A 6 6 0 0 0 24 30 H 8 A 6 6 0 0 0 2 24 V 8 A 6 6 0 0 0 8 2 Z"
      fill="#111111"
    />

    {/* Texture Layer: Embossed Grain */}
    <path
      d="M 8 2 H 24 A 6 6 0 0 0 30 8 V 24 A 6 6 0 0 0 24 30 H 8 A 6 6 0 0 0 2 24 V 8 A 6 6 0 0 0 8 2 Z"
      fill="url(#dotGrain)"
    />

    {/* Gradient Border (Temple Inward Corners) */}
    <path
      d="M 8 2 H 24 A 6 6 0 0 0 30 8 V 24 A 6 6 0 0 0 24 30 H 8 A 6 6 0 0 0 2 24 V 8 A 6 6 0 0 0 8 2 Z"
      fill="none"
      stroke="url(#saffronRose)"
      strokeWidth="2"
    />

    {/* Inner detail border (Bahi-Khata ledger lines) */}
    <path
      d="M 8 6 H 24 A 2 2 0 0 0 26 8 V 24 A 2 2 0 0 0 24 26 H 8 A 2 2 0 0 0 6 24 V 8 A 2 2 0 0 0 8 6 Z"
      fill="none"
      stroke="url(#saffronRose)"
      strokeWidth="0.5"
      opacity="0.4"
    />

    {/* ₹ Carved Mark */}
    <path
      d="M11 11h10 M11 16h6"
      stroke="url(#saffronRose)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M14 11v0c3.5 0 3.5 5 0 5"
      stroke="url(#saffronRose)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path d="M13 16l4.5 6" stroke="url(#saffronRose)" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export function Logo({ className, variant = 'full', size = 'md' }) {
  const sm = size === 'sm';
  return (
    <div
      className={cn(
        'flex items-center select-none group min-w-0',
        sm ? 'gap-3' : 'gap-4',
        className
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'relative flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105',
          sm ? 'w-8 h-8' : 'w-12 h-12'
        )}
      >
        <LogoIcon className="w-full h-full drop-shadow-md" />
      </div>

      {/* Wordmark */}
      {variant === 'full' && (
        <div className="flex items-baseline leading-none min-w-0">
          <span
            className={cn(
              'font-sans font-black text-[var(--text-primary)] tracking-tight',
              sm ? 'text-2xl' : 'text-[32px]'
            )}
          >
            अर्थ
          </span>
          <span
            className={cn(
              'font-sans font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF9933] to-[#FF4D6D] tracking-tighter ml-[6px]',
              sm ? 'text-2xl' : 'text-[32px]'
            )}
          >
            SAATHI
          </span>
        </div>
      )}
    </div>
  );
}
