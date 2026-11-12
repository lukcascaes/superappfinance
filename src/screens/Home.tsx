import { AlertTriangle, ArrowDownLeft, ArrowUpRight, CarFront, ChevronRight, KeyRound, Wrench } from 'lucide-react';
import { EntryRow } from '../components/EntryRow';
import { FlowChart } from '../components/FlowChart';
import { MonthPicker, Plate, Progress } from '../components/ui';
import { maintenance, occurrences, summarize, vehicleSummary } from '../lib/finance';
import { brl, km } from '../lib/format';
import { useStore } from '../lib/store';
import type { Entry, Vehicle } from '../lib/types';

export function Home({ openEntry, openVehicle, goTo }: {
  openEntry: (e?: Entry) => void; openVehicle: (v: Vehicle) => void; goTo: (tab: 'entries' | 'fleet') => void;
}) {
  const { state } = useStore();
  const occs = occurrences(state, state.month);
  const s = summarize(occs);
  const vehicles = state.vehicles.filter((v) => v.ws === state.ws);
  const alerts = vehicles.map((v) => ({ v, m: maintenance(v) })).filter((x) => x.m.status !== 'ok')
    .sort((a, b) => b.m.pct - a.m.pct);
  const pending = occs.filter((o) => !o.paid);
  const realized = s.paidIn - s.paidOut;
  const progress = s.inc + s.out > 0 ? (s.paidIn + s.paidOut) / (s.inc + s.out) : 0;
  const isFleet = state.ws === 'frota';

  return (
    <div className="screen">
      <MonthPicker />

      <section className={`hero-card ${s.result >= 0 ? 'pos' : 'neg'}`}>
        <span className="hero-label">{s.result >= 0 ? 'Sobra prevista no mês' : 'Falta prevista no mês'}</span>
        <div className="hero-value">{brl(s.result)}</div>
        <div className="hero-split">
          <div>
            <span className="hero-chip in"><ArrowDownLeft size={14} /></span>
            <div><small>Entradas</small><strong>{brl(s.inc)}</strong></div>
          </div>
          <div>
            <span className="hero-chip out"><ArrowUpRight size={14} /></span>
            <div><small>Saídas</small><strong>{brl(s.out)}</strong></div>
          </div>
        </div>
        <div className="hero-progress">
          <div className="row-between small">
            <span>Realizado até agora</span>
            <strong>{brl(realized)}</strong>
          </div>
          <Progress value={progress} tone="in" />
          <span className="small muted-on-hero">{Math.round(progress * 100)}% do mês já foi pago/recebido</span>
        </div>
      </section>

      {isFleet ? (
        <div className="stat-row">
          <button className="stat" onClick={() => goTo('fleet')}>
            <CarFront size={18} />
            <strong>{vehicles.length}</strong>
            <span>veículos</span>
          </button>
          <button className="stat" onClick={() => goTo('fleet')}>
            <KeyRound size={18} />
            <strong>{vehicles.filter((v) => v.renterName).length}</strong>
            <span>alugados</span>
          </button>
          <button className="stat" onClick={() => goTo('fleet')}>
            <Wrench size={18} />
            <strong>{alerts.length}</strong>
            <span>revisões</span>
          </button>
        </div>
      ) : (
        <IncomeHealth inc={s.inc} out={s.out} />
      )}

      {alerts.length > 0 && (
        <section className="card alert-card">
          <div className="card-head">
            <h3><AlertTriangle size={16} /> Manutenção</h3>
          </div>
          {alerts.slice(0, 3).map(({ v, m }) => (
            <button key={v.id} className="alert-row" onClick={() => openVehicle(v)}>
              <Plate plate={v.plate} small />
              <span className="grow">
                <strong>{v.name}</strong>
                <small>{m.status === 'late' ? `Revisão vencida há ${km(-m.remaining)}` : `Revisão em ${km(m.remaining)}`}</small>
              </span>
              <span className={`tag tag-${m.status}`}>{m.status === 'late' ? 'vencida' : 'em breve'}</span>
            </button>
          ))}
        </section>
      )}

      <section className="card">
        <div className="card-head"><h3>Fluxo de caixa</h3></div>
        <FlowChart />
      </section>

      <section className="card">
        <div className="card-head">
          <h3>A pagar e receber</h3>
          <button className="link" onClick={() => goTo('entries')}>Ver tudo <ChevronRight size={14} /></button>
        </div>
        {pending.length === 0 ? (
          <p className="muted small">Tudo em dia neste mês. 🍀</p>
        ) : (
          <div className="list">
            {pending.slice(0, 5).map((o) => <EntryRow key={o.key} occ={o} onOpen={() => openEntry(o.entry)} />)}
          </div>
        )}
      </section>

      {isFleet && vehicles.length > 0 && <FleetRanking vehicles={vehicles} openVehicle={openVehicle} />}
    </div>
  );
}

function IncomeHealth({ inc, out }: { inc: number; out: number }) {
  const pct = inc > 0 ? out / inc : 0;
  const tone = pct >= 1 ? 'late' : pct >= 0.8 ? 'soon' : 'ok';
  const msg = pct >= 1
    ? 'Você está gastando mais do que ganha. Bora cortar alguma coisa?'
    : pct >= 0.8
      ? 'Sobra pouco. Cuidado com gastos novos este mês.'
      : 'Mandou bem! Dá pra guardar uma parte da sobra.';
  return (
    <section className="card">
      <div className="row-between">
        <span className="label">Comprometimento da renda</span>
        <strong className={`txt-${tone}`}>{Math.round(pct * 100)}%</strong>
      </div>
      <Progress value={pct} tone={tone} />
      <p className="small muted" style={{ marginTop: 8 }}>{msg}</p>
    </section>
  );
}

function FleetRanking({ vehicles, openVehicle }: { vehicles: Vehicle[]; openVehicle: (v: Vehicle) => void }) {
  const { state } = useStore();
  const occs = occurrences(state, state.month);
  const rows = vehicles.map((v) => ({ v, s: vehicleSummary(occs, v.id) })).sort((a, b) => b.s.result - a.s.result);
  const max = Math.max(1, ...rows.map((r) => Math.abs(r.s.result)));
  return (
    <section className="card">
      <div className="card-head"><h3>Resultado por veículo</h3></div>
      <div className="ranking">
        {rows.map(({ v, s }) => (
          <button key={v.id} className="rank-row" onClick={() => openVehicle(v)}>
            <span className="rank-name"><i className="car-dot" style={{ background: v.color }} />{v.name}</span>
            <span className="rank-bar">
              <span className={s.result >= 0 ? 'pos' : 'neg'} style={{ width: `${(Math.abs(s.result) / max) * 100}%` }} />
            </span>
            <span className={`rank-val ${s.result >= 0 ? 'pos' : 'neg'}`}>{brl(s.result)}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
