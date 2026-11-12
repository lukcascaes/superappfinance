import { Gauge, MessageCircle, Pencil, Send, Trash2, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import { maintenance, occurrences, summarize, waLink } from '../lib/finance';
import { brl, km, monthLabel, uid } from '../lib/format';
import { useStore } from '../lib/store';
import type { Entry, Vehicle } from '../lib/types';
import { EntryRow } from './EntryRow';
import { useToast } from './Toast';
import { Plate, Progress, Sheet } from './ui';

const STATUS_TEXT = { ok: 'Em dia', soon: 'Revisão chegando', late: 'Revisão vencida' } as const;

export function VehicleDetailSheet({ vehicle, onClose, onEdit, onOpenEntry }: {
  vehicle?: Vehicle; onClose: () => void; onEdit: (v: Vehicle) => void; onOpenEntry: (e: Entry) => void;
}) {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [kmInput, setKmInput] = useState('');
  useEffect(() => {
    setKmInput(vehicle ? String(vehicle.km) : '');
  }, [vehicle]);

  const v = vehicle ? state.vehicles.find((x) => x.id === vehicle.id) ?? vehicle : undefined;
  const occs = v ? occurrences(state, state.month).filter((o) => o.entry.vehicleId === v.id) : [];
  const s = summarize(occs);
  const m = v ? maintenance(v) : undefined;
  const rent = occs.find((o) => o.entry.kind === 'in' && o.entry.category === 'aluguel');
  const first = v?.renterName?.split(' ')[0] ?? '';

  const updateKm = () => {
    if (!v) return;
    const n = Number(kmInput.replace(/\D/g, ''));
    if (!n) return;
    const before = state;
    dispatch({ type: 'upsertVehicle', vehicle: { ...v, km: n, kmUpdatedAt: new Date().toISOString() } });
    toast(`KM atualizado: ${km(n)}`, before);
  };

  return (
    <Sheet open={!!vehicle} onClose={onClose} title={v?.name ?? ''}>
      {v && m && (
        <>
          <div className="veh-hero" style={{ ['--car' as string]: v.color }}>
            <Plate plate={v.plate} />
            <div className="veh-hero-info">
              <span>{v.year ?? ''}</span>
              {v.renterName ? <strong>Locatário: {v.renterName}</strong> : <strong>{v.ws === 'frota' ? 'Sem locatário' : 'Uso pessoal'}</strong>}
            </div>
            <button className="icon-btn" onClick={() => onEdit(v)} aria-label="Editar veículo"><Pencil size={16} /></button>
          </div>

          <section className="card soft">
            <div className="row-between">
              <span className="label"><Gauge size={15} /> Quilometragem</span>
              <span className={`tag tag-${m.status}`}>{STATUS_TEXT[m.status]}</span>
            </div>
            <div className="km-big">{km(v.km)}</div>
            <Progress value={m.pct} tone={m.status} />
            <div className="row-between small muted">
              <span>Última revisão: {km(v.lastServiceKm)}</span>
              <span>{m.remaining >= 0 ? `faltam ${km(m.remaining)}` : `passou ${km(-m.remaining)}`}</span>
            </div>
            <div className="inline-form">
              <input inputMode="numeric" value={kmInput} onChange={(e) => setKmInput(e.target.value)} aria-label="KM atual" />
              <button className="btn btn-secondary" onClick={updateKm}>Atualizar KM</button>
            </div>
            <div className="btn-grid">
              <button className="btn btn-ghost" onClick={() => { const before = state; dispatch({ type: 'upsertVehicle', vehicle: { ...v, lastServiceKm: v.km } }); toast('Revisão registrada', before); }}>
                <Wrench size={16} /> Revisão feita
              </button>
              <a className="btn btn-whats" target="_blank" rel="noreferrer"
                href={waLink(v.renterPhone, `Fala${first ? ` ${first}` : ''}! Aqui é da locadora 👋 Pode me mandar a quilometragem atual do ${v.name} (placa ${v.plate})? É pra gente manter a revisão em dia.`)}>
                <MessageCircle size={16} /> Pedir KM
              </a>
            </div>
          </section>

          <section className="card soft">
            <div className="row-between">
              <span className="label">Resultado em {monthLabel(state.month)}</span>
              <strong className={s.result >= 0 ? 'pos' : 'neg'}>{brl(s.result)}</strong>
            </div>
            <div className="row-between small muted">
              <span>Entrou {brl(s.inc)}</span>
              <span>Saiu {brl(s.out)}</span>
            </div>
            {rent && (
              <a className="btn btn-whats full" target="_blank" rel="noreferrer"
                href={waLink(v.renterPhone, `Olá${first ? ` ${first}` : ''}! Lembrete do aluguel do ${v.name}: ${brl(rent.entry.amount)} com vencimento dia ${rent.entry.day}. Qualquer dúvida é só chamar. Obrigado! 🍀`)}>
                <Send size={16} /> Cobrar aluguel no WhatsApp
              </a>
            )}
          </section>

          <h3 className="section-title">Lançamentos do mês</h3>
          {occs.length === 0 ? (
            <p className="muted small">Nenhum lançamento ligado a este veículo neste mês.</p>
          ) : (
            <div className="list">
              {occs.map((o) => <EntryRow key={o.key} occ={o} onOpen={() => onOpenEntry(o.entry)} showVehicle={false} />)}
            </div>
          )}
        </>
      )}
    </Sheet>
  );
}

const COLORS = ['#f8fafc', '#9ca3af', '#111827', '#dc2626', '#2563eb', '#16a34a', '#ca8a04', '#7c3aed'];

export function VehicleFormSheet({ open, vehicle, onClose, onDeleted }: {
  open: boolean; vehicle?: Vehicle; onClose: () => void; onDeleted?: () => void;
}) {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const blank = (): Vehicle => ({
    id: uid(), ws: state.ws, name: '', plate: '', color: COLORS[0], km: 0, kmUpdatedAt: new Date().toISOString(),
    lastServiceKm: 0, serviceIntervalKm: 10000,
  });
  const [d, setD] = useState<Vehicle>(vehicle ?? blank());
  useEffect(() => {
    if (open) setD(vehicle ?? blank());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, vehicle]);
  const set = <K extends keyof Vehicle>(k: K, val: Vehicle[K]) => setD((x) => ({ ...x, [k]: val }));
  const num = (s: string) => Number(s.replace(/\D/g, '')) || 0;
  const valid = d.name.trim() && d.plate.trim();

  return (
    <Sheet open={open} onClose={onClose} title={vehicle ? 'Editar veículo' : 'Novo veículo'}>
      <div className="plate-preview"><Plate plate={d.plate || 'ABC1D23'} /></div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="v-name">Modelo / apelido</label>
          <input id="v-name" placeholder="Ex.: Polo prata" value={d.name} onChange={(e) => set('name', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="v-plate">Placa</label>
          <input id="v-plate" placeholder="ABC1D23" maxLength={8} value={d.plate}
            onChange={(e) => set('plate', e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} />
        </div>
      </div>
      <div className="field">
        <label>Cor</label>
        <div className="swatches">
          {COLORS.map((c) => (
            <button key={c} type="button" className={`swatch ${d.color === c ? 'active' : ''}`} style={{ background: c }}
              onClick={() => set('color', c)} aria-label={`Cor ${c}`} />
          ))}
        </div>
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="v-km">KM atual</label>
          <input id="v-km" inputMode="numeric" value={d.km || ''} onChange={(e) => set('km', num(e.target.value))} />
        </div>
        <div className="field">
          <label htmlFor="v-last">KM da última revisão</label>
          <input id="v-last" inputMode="numeric" value={d.lastServiceKm || ''} onChange={(e) => set('lastServiceKm', num(e.target.value))} />
        </div>
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="v-int">Revisar a cada (km)</label>
          <input id="v-int" inputMode="numeric" value={d.serviceIntervalKm || ''} onChange={(e) => set('serviceIntervalKm', num(e.target.value))} />
        </div>
        <div className="field">
          <label htmlFor="v-year">Ano</label>
          <input id="v-year" inputMode="numeric" value={d.year ?? ''} onChange={(e) => set('year', num(e.target.value) || undefined)} />
        </div>
      </div>
      {state.ws === 'frota' && (
        <div className="field-row">
          <div className="field">
            <label htmlFor="v-renter">Locatário</label>
            <input id="v-renter" placeholder="Nome" value={d.renterName ?? ''} onChange={(e) => set('renterName', e.target.value || undefined)} />
          </div>
          <div className="field">
            <label htmlFor="v-phone">WhatsApp</label>
            <input id="v-phone" inputMode="tel" placeholder="(11) 99999-0000" value={d.renterPhone ?? ''}
              onChange={(e) => set('renterPhone', e.target.value || undefined)} />
          </div>
        </div>
      )}
      <div className="sheet-actions">
        {vehicle && (
          <button className="btn btn-danger-ghost" onClick={() => { const before = state; dispatch({ type: 'deleteVehicle', id: vehicle.id }); toast(`${vehicle.name} excluído`, before); onDeleted?.(); onClose(); }}>
            <Trash2 size={16} /> Excluir
          </button>
        )}
        <button className="btn btn-primary grow" disabled={!valid}
          onClick={() => { dispatch({ type: 'upsertVehicle', vehicle: { ...d, name: d.name.trim(), plate: d.plate.trim() } }); onClose(); }}>
          {vehicle ? 'Salvar' : 'Adicionar veículo'}
        </button>
      </div>
    </Sheet>
  );
}
