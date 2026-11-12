import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { category } from '../lib/categories';
import { addMonths } from '../lib/finance';
import { monthLabel } from '../lib/format';
import { useStore } from '../lib/store';
import type { CategoryId } from '../lib/types';

export function Logo({ size = 32 }: { size?: number }) {
  return <img src={`${import.meta.env.BASE_URL}icons/icon.svg`} width={size} height={size} alt="" className="logo" />;
}

export function MonthPicker() {
  const { state, dispatch } = useStore();
  const go = (n: number) => dispatch({ type: 'setMonth', month: addMonths(state.month, n) });
  return (
    <div className="month-picker">
      <button className="icon-btn" onClick={() => go(-1)} aria-label="Mês anterior"><ChevronLeft size={18} /></button>
      <span>{monthLabel(state.month)}</span>
      <button className="icon-btn" onClick={() => go(1)} aria-label="Próximo mês"><ChevronRight size={18} /></button>
    </div>
  );
}

export function CatIcon({ id, size = 40 }: { id: CategoryId; size?: number }) {
  const c = category(id);
  const Icon = c.icon;
  return (
    <span className="cat-icon" style={{ width: size, height: size, color: c.color, background: `${c.color}1f` }}>
      <Icon size={size * 0.48} strokeWidth={2.2} />
    </span>
  );
}

export function Plate({ plate, small }: { plate: string; small?: boolean }) {
  const p = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const fmt = p.length === 7 ? `${p.slice(0, 3)} ${p.slice(3)}` : p;
  return (
    <span className={`plate ${small ? 'plate-sm' : ''}`}>
      <span className="plate-top">BRASIL</span>
      <span className="plate-num">{fmt || '———'}</span>
    </span>
  );
}

export function Segmented<T extends string>({ value, onChange, options }: {
  value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode }[];
}) {
  return (
    <div className="segmented" role="tablist">
      {options.map((o) => (
        <button key={o.value} role="tab" aria-selected={value === o.value}
          className={value === o.value ? 'active' : ''} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Sheet({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode;
}) {
  const [mounted, setMounted] = useState(open);
  useEffect(() => {
    if (open) setMounted(true);
    else {
      const t = setTimeout(() => setMounted(false), 220);
      return () => clearTimeout(t);
    }
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);
  if (!mounted) return null;
  return (
    <div className={`sheet-root ${open ? 'open' : 'closing'}`}>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title}>
        <div className="sheet-grip" />
        <header className="sheet-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Fechar"><X size={18} /></button>
        </header>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  );
}

/** Bank-style money input: digits fill from the cents. */
export function MoneyInput({ value, onChange, tone }: { value: number; onChange: (v: number) => void; tone: 'in' | 'out' }) {
  const display = value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (
    <label className={`money-input tone-${tone}`}>
      <span className="money-prefix">R$</span>
      <input
        inputMode="numeric"
        value={display}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
          onChange(Number(digits || '0') / 100);
        }}
        aria-label="Valor"
      />
    </label>
  );
}

export function Progress({ value, tone = 'ok' }: { value: number; tone?: 'ok' | 'soon' | 'late' | 'in' | 'out' }) {
  return (
    <div className={`progress tone-${tone}`}>
      <div style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }} />
    </div>
  );
}

export function Empty({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="empty">
      <div className="empty-icon">{icon}</div>
      <strong>{title}</strong>
      <p>{text}</p>
      {action}
    </div>
  );
}
