import { Check } from 'lucide-react';
import { brl } from '../lib/format';
import { useStore } from '../lib/store';
import type { Occurrence } from '../lib/types';
import { CatIcon } from './ui';

export function EntryRow({ occ, onOpen, showVehicle = true }: { occ: Occurrence; onOpen: () => void; showVehicle?: boolean }) {
  const { state, dispatch } = useStore();
  const e = occ.entry;
  const vehicle = showVehicle && e.vehicleId ? state.vehicles.find((v) => v.id === e.vehicleId) : undefined;
  const today = new Date();
  const isCurrent = state.month === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const overdue = !occ.paid && isCurrent && e.day < today.getDate();

  const meta = [
    `dia ${e.day}`,
    occ.label,
    e.repeat === 'monthly' ? 'mensal' : undefined,
    vehicle?.name,
  ].filter(Boolean).join(' · ');

  return (
    <div className={`entry-row ${occ.paid ? 'is-paid' : ''}`}>
      <button className="entry-main" onClick={onOpen}>
        <CatIcon id={e.category} />
        <span className="entry-text">
          <span className="entry-title">{e.title}</span>
          <span className="entry-meta">
            {overdue && <span className="tag tag-late">atrasado</span>}
            {meta}
          </span>
        </span>
        <span className={`entry-amount ${e.kind}`}>{e.kind === 'in' ? '+' : '−'} {brl(e.amount)}</span>
      </button>
      <button
        className={`check ${occ.paid ? 'on' : ''} ${e.kind}`}
        onClick={() => dispatch({ type: 'togglePaid', key: occ.key })}
        aria-label={occ.paid ? 'Desmarcar' : e.kind === 'in' ? 'Marcar como recebido' : 'Marcar como pago'}
        title={occ.paid ? (e.kind === 'in' ? 'Recebido' : 'Pago') : 'Pendente'}
      >
        <Check size={16} strokeWidth={3} />
      </button>
    </div>
  );
}
