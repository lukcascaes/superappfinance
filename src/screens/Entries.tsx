import { ReceiptText, Search } from 'lucide-react';
import { useState } from 'react';
import { EntryRow } from '../components/EntryRow';
import { Empty, MonthPicker, Segmented } from '../components/ui';
import { occurrences, summarize } from '../lib/finance';
import { brl } from '../lib/format';
import { useStore } from '../lib/store';
import type { Entry, Occurrence } from '../lib/types';

type Filter = 'all' | 'in' | 'out' | 'pending';

export function Entries({ openEntry }: { openEntry: (e?: Entry) => void }) {
  const { state } = useStore();
  const [filter, setFilter] = useState<Filter>('all');
  const [q, setQ] = useState('');
  const all = occurrences(state, state.month);
  const s = summarize(all);
  const query = q.trim().toLowerCase();
  const list = all.filter((o) => {
    if (filter === 'in' && o.entry.kind !== 'in') return false;
    if (filter === 'out' && o.entry.kind !== 'out') return false;
    if (filter === 'pending' && o.paid) return false;
    if (query) {
      const veh = state.vehicles.find((v) => v.id === o.entry.vehicleId)?.name ?? '';
      if (!`${o.entry.title} ${veh}`.toLowerCase().includes(query)) return false;
    }
    return true;
  });
  const ins = list.filter((o) => o.entry.kind === 'in');
  const outs = list.filter((o) => o.entry.kind === 'out');

  return (
    <div className="screen">
      <MonthPicker />

      <div className="totals">
        <div><small>Total creditado</small><strong className="pos">{brl(s.inc)}</strong></div>
        <div><small>Total debitado</small><strong className="neg">{brl(s.out)}</strong></div>
        <div><small>{s.result >= 0 ? 'Positivo' : 'Negativo'}</small><strong className={s.result >= 0 ? 'pos' : 'neg'}>{brl(s.result)}</strong></div>
      </div>

      <div className="toolbar">
      <label className="search">
        <Search size={16} />
        <input placeholder="Buscar lançamento ou veículo" value={q} onChange={(e) => setQ(e.target.value)} />
      </label>

      <Segmented<Filter>
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: 'Tudo' },
          { value: 'in', label: 'Entradas' },
          { value: 'out', label: 'Saídas' },
          { value: 'pending', label: 'Pendentes' },
        ]}
      />
      </div>

      {list.length === 0 ? (
        <Empty icon={<ReceiptText size={26} />} title="Nada por aqui" text="Nenhum lançamento encontrado com esse filtro."
          action={<button className="btn btn-primary" onClick={() => openEntry()}>Novo lançamento</button>} />
      ) : (
        <div className="groups">
          {ins.length > 0 && <Group title="Entradas" occs={ins} openEntry={openEntry} />}
          {outs.length > 0 && <Group title="Saídas" occs={outs} openEntry={openEntry} />}
        </div>
      )}
    </div>
  );
}

function Group({ title, occs, openEntry }: { title: string; occs: Occurrence[]; openEntry: (e: Entry) => void }) {
  const total = occs.reduce((a, o) => a + o.entry.amount, 0);
  const done = occs.filter((o) => o.paid).length;
  return (
    <section className="group">
      <div className="group-head">
        <h3>{title} <span className="count">{done}/{occs.length}</span></h3>
        <span>{brl(total)}</span>
      </div>
      <div className="list card">
        {occs.map((o) => <EntryRow key={o.key} occ={o} onOpen={() => openEntry(o.entry)} />)}
      </div>
    </section>
  );
}
