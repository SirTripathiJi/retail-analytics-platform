import { useRef } from 'react';

export function StatCard({
  label,
  value,
  icon,
  bgAccent,
  onDragStart,
  onDragEnter,
  onDragEnd,
  id,
}) {
  const cardRef = useRef(null);

  return (
    <div
      ref={cardRef}
      draggable
      onDragStart={(e) => {
        cardRef.current.style.opacity = '0.3';
        e.dataTransfer.setData('text/plain', id);
        onDragStart?.(id);
      }}
      onDragEnd={() => {
        cardRef.current.style.opacity = '1';
        onDragEnd?.();
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={() => onDragEnter?.(id)}
      className="brutalist-card cursor-grab active:cursor-grabbing select-none relative overflow-hidden flex flex-col justify-between min-h-[160px] animate-brutal-fade-in"
      style={{ backgroundColor: 'var(--card-bg)' }}
    >
      {/* Brutalist color block */}
      <div
        className="absolute top-0 right-0 w-20 h-20 border-l-4 border-b-4 border-[var(--border-color)]"
        style={{ backgroundColor: bgAccent }}
      />

      <div className="flex items-center justify-between relative z-10 text-[var(--text-primary)]">
        <span className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest leading-tight">
          {label}
        </span>
        <div className="w-12 h-12 flex items-center justify-center border-2 border-[var(--border-color)] bg-[var(--card-bg)] shadow-[3px_3px_0_var(--shadow-color)]">
          {icon}
        </div>
      </div>

      <div className="relative z-10 mt-8">
        <div className="text-4xl font-black text-[var(--text-primary)] leading-none uppercase tracking-tighter">
          {value}
        </div>
        <div className="mt-4 h-4 w-full border-2 border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-[2px_2px_0_var(--shadow-color)] overflow-hidden">
          <div
            className="h-full border-r-2 border-[var(--border-color)]"
            style={{ backgroundColor: bgAccent, width: '45%' }}
          />
        </div>
      </div>
    </div>
  );
}
