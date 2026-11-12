import { ArrowDownLeft, ArrowUpRight, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CATEGORIES } from '../lib/categories';
import { isRecurring } from '../lib/finance';
import { monthLabel, uid } from '../lib/format';
import { useStore } from '../lib/store';
import type { Entry, Kind, Repeat, Scope } from '../lib/types';
import { useToast } from './Toast';
import { MoneyInput, Segmented, Sheet } from './ui';

export function EntrySheet({ open, onClose, entry, defaults }: {
  open: boolean; onClose: () => void; entry?: Entry; defaults?: Partial<Entry>;
}) {
  const { state, dispatch } = useStore();
  const blank = (): Entry => ({
    id: uid(), ws: state.ws, kind: 'out', title: '', amount: 0, category: 'outros_out',
    day: new Date().getDate(), startMonth: state.month, repeat: 'once', ...defaults,
  });
  const toast = useToast();
  const [draft, setDraft] = useState<Entry>(entry ?? blank());
  const [scope, setScope] = useState<Scope>('future');
  const recurring = !!entry && isRecurring(entry);

  useEffect(() => {
    if (open) {
      setDraft(entry ?? blank());
      setScope('future');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, entry]);

  const set = <K extends keyof Entry>(k: K, v: Entry[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const setKind = (kind: Kind) =>
    setDraft((d) => ({ ...d, kind, category: CATEGORIES.find((c) => c.kind === kind && c.id === d.category)?.id ?? (kind === 'in' ? 'aluguel' : 'outros_out') }));

  const vehicles = state.vehicles.filter((v) => v.ws === state.ws);
  const valid = draft.title.trim().length > 0 && draft.amount > 0;

  const save = () => {
    if (!valid) return;
    const clean: Entry = {
      ...draft,
      title: draft.title.trim(),
      day: Math.min(31, Math.max(1, draft.day || 1)),
      installments: draft.repeat === 'installments' ? Math.max(2, draft.installments ?? 2) : undefined,
    };
    const before = state;
    if (entry) dispatch({ type: 'editEntry', original: entry, draft: clean, scope: recurring ? scope : 'all' });
    else dispatch({ type: 'upsertEntry', entry: clean });
    toast(entry ? 'Alterações salvas' : 'Lançamento adicionado', before);
    onClose();
  };

  const remove = () => {
    if (!entry) return;
    const before = state;
    dispatch({ type: 'deleteEntry', entry, scope: recurring ? scope : 'all' });
    toast(recurring && scope === 'only' ? `Removido de ${monthLabel(state.month)}` : 'Lançamento excluído', before);
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title={entry ? 'Editar lançamento' : 'Novo lançamento'}>
      <Segmented<Kind>
        value={draft.kind}
        onChange={setKind}
        options={[
          { value: 'out', label: <><ArrowUpRight size={16} /> Saída</> },
          { value: 'in', label: <><ArrowDownLeft size={16} /> Entrada</> },
        ]}
      />

      <MoneyInput value={draft.amount} onChange={(v) => set('amount', v)} tone={draft.kind} />

      <div className="field">
        <label htmlFor="f-title">Descrição</label>
        <input id="f-title" placeholder={draft.kind === 'in' ? 'Ex.: Aluguel Polo' : 'Ex.: Pneu Ka branco'}
          value={draft.title} onChange={(e) => set('title', e.target.value)} autoComplete="off" />
      </div>

      <div className="field">
        <label>Categoria</label>
        <div className="chips">
          {CATEGORIES.filter((c) => c.kind === draft.kind).map((c) => {
            const Icon = c.icon;
            return (
              <button key={c.id} type="button" className={`chip ${draft.category === c.id ? 'active' : ''}`}
                style={draft.category === c.id ? { borderColor: c.color, color: c.color, background: `${c.color}1a` } : undefined}
                onClick={() => set('category', c.id)}>
                <Icon size={14} /> {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="f-day">Dia do vencimento</label>
          <input id="f-day" type="number" inputMode="numeric" min={1} max={31}
            value={draft.day} onChange={(e) => set('day', Number(e.target.value))} />
        </div>
        {vehicles.length > 0 && (
          <div className="field">
            <label htmlFor="f-veh">Veículo</label>
            <select id="f-veh" value={draft.vehicleId ?? ''} onChange={(e) => set('vehicleId', e.target.value || undefined)}>
              <option value="">Nenhum</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
        )}
      </div>

      {!(recurring && scope === 'only') && (
      <div className="field">
        <label>Repetição</label>
        <Segmented<Repeat>
          value={draft.repeat}
          onChange={(r) => set('repeat', r)}
          options={[
            { value: 'once', label: 'Única' },
            { value: 'monthly', label: 'Todo mês' },
            { value: 'installments', label: 'Parcelada' },
          ]}
        />
      </div>
      )}

      {draft.repeat === 'installments' && !(recurring && scope === 'only') && (
        <div className="field">
          <label htmlFor="f-inst">Número de parcelas</label>
          <div className="stepper">
            <button type="button" onClick={() => set('installments', Math.max(2, (draft.installments ?? 2) - 1))}>−</button>
            <input id="f-inst" type="number" inputMode="numeric" value={draft.installments ?? 2}
              onChange={(e) => set('installments', Number(e.target.value))} />
            <button type="button" onClick={() => set('installments', (draft.installments ?? 2) + 1)}>+</button>
          </div>
          <small className="hint">
            {draft.installments ?? 2}x de {draft.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} = {' '}
            {(draft.amount * (draft.installments ?? 2)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </small>
        </div>
      )}

      {recurring && (
        <div className="field scope-field">
          <label>Aplicar alterações e exclusão em</label>
          <Segmented<Scope>
            value={scope}
            onChange={setScope}
            options={[
              { value: 'only', label: 'Só este mês' },
              { value: 'future', label: 'Este e próximos' },
              { value: 'all', label: 'Todos' },
            ]}
          />
          <small className="hint">
            {scope === 'only' && `Só ${monthLabel(state.month)} muda; os outros meses ficam como estão.`}
            {scope === 'future' && `De ${monthLabel(state.month)} em diante; os meses anteriores ficam como estão.`}
            {scope === 'all' && 'Todos os meses, inclusive os que já passaram.'}
          </small>
        </div>
      )}

      <div className="sheet-actions">
        {entry && (
          <button className="btn btn-danger-ghost" onClick={remove}>
            <Trash2 size={16} /> Excluir
          </button>
        )}
        <button className="btn btn-primary grow" disabled={!valid} onClick={save}>
          {entry ? 'Salvar alterações' : 'Adicionar'}
        </button>
      </div>
    </Sheet>
  );
}
