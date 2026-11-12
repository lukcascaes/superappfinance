import { CarFront, Gauge, Plus, UserRound } from 'lucide-react';
import { Empty, Plate, Progress } from '../components/ui';
import { maintenance, occurrences, summarize, vehicleSummary } from '../lib/finance';
import { brl, km } from '../lib/format';
import { useStore } from '../lib/store';
import type { Vehicle } from '../lib/types';

export function Fleet({ openVehicle, newVehicle }: { openVehicle: (v: Vehicle) => void; newVehicle: () => void }) {
  const { state } = useStore();
  const vehicles = state.vehicles.filter((v) => v.ws === state.ws);
  const occs = occurrences(state, state.month);
  const fleetOccs = occs.filter((o) => o.entry.vehicleId);
  const fs = summarize(fleetOccs);
  const isFleet = state.ws === 'frota';

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <h1>{isFleet ? 'Frota' : 'Meus veículos'}</h1>
          <p className="muted small">{isFleet ? 'Aluguéis, financiamentos e revisões de cada carro.' : 'Controle os gastos e as revisões do seu carro.'}</p>
        </div>
        <button className="btn btn-primary sm" onClick={newVehicle}><Plus size={16} /> Veículo</button>
      </div>

      {vehicles.length > 0 && (
        <div className="totals">
          <div><small>{isFleet ? 'Receita' : 'Entradas'}</small><strong className="pos">{brl(fs.inc)}</strong></div>
          <div><small>Custos</small><strong className="neg">{brl(fs.out)}</strong></div>
          <div><small>Resultado</small><strong className={fs.result >= 0 ? 'pos' : 'neg'}>{brl(fs.result)}</strong></div>
        </div>
      )}

      {vehicles.length === 0 ? (
        <Empty icon={<CarFront size={26} />} title="Nenhum veículo ainda"
          text="Cadastre um carro para acompanhar aluguel, parcelas e revisões."
          action={<button className="btn btn-primary" onClick={newVehicle}>Adicionar veículo</button>} />
      ) : (
        <div className="veh-grid">
          {vehicles.map((v) => {
            const m = maintenance(v);
            const s = vehicleSummary(occs, v.id);
            return (
              <button key={v.id} className="veh-card" onClick={() => openVehicle(v)} style={{ ['--car' as string]: v.color }}>
                <div className="veh-top">
                  <Plate plate={v.plate} small />
                  <span className={`tag tag-${m.status}`}>{m.status === 'ok' ? 'em dia' : m.status === 'soon' ? 'revisão' : 'vencida'}</span>
                </div>
                <div className="veh-name">
                  <i className="car-dot" style={{ background: v.color }} />
                  <strong>{v.name}</strong>
                  {v.year && <span className="muted small">{v.year}</span>}
                </div>
                <div className="veh-renter small">
                  <UserRound size={13} /> {v.renterName ?? (isFleet ? 'Disponível' : 'Uso pessoal')}
                </div>
                <div className="veh-km small">
                  <span><Gauge size={13} /> {km(v.km)}</span>
                  <span className="muted">próx. {km(m.next)}</span>
                </div>
                <Progress value={m.pct} tone={m.status} />
                <div className="veh-foot">
                  <span className="muted small">No mês</span>
                  <strong className={s.result >= 0 ? 'pos' : 'neg'}>{brl(s.result)}</strong>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
