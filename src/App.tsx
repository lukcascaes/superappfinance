import { CarFront, House, LayoutGrid, Plus, ReceiptText } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { EntrySheet } from './components/EntrySheet';
import { Logo, Segmented } from './components/ui';
import { VehicleDetailSheet, VehicleFormSheet } from './components/VehicleSheets';
import { greeting } from './lib/format';
import { useStore } from './lib/store';
import type { Entry, Vehicle, Workspace } from './lib/types';
import { Entries } from './screens/Entries';
import { Fleet } from './screens/Fleet';
import { Home } from './screens/Home';
import { Plans } from './screens/Plans';

type Tab = 'home' | 'entries' | 'fleet' | 'plans';

export default function App() {
  const { state, dispatch } = useStore();
  const [tab, setTab] = useState<Tab>('home');
  const [entrySheet, setEntrySheet] = useState<{ open: boolean; entry?: Entry; defaults?: Partial<Entry> }>({ open: false });
  const [detail, setDetail] = useState<Vehicle | undefined>();
  const [vehForm, setVehForm] = useState<{ open: boolean; vehicle?: Vehicle }>({ open: false });

  const openEntry = useCallback((entry?: Entry, defaults?: Partial<Entry>) => setEntrySheet({ open: true, entry, defaults }), []);
  const closeEntry = useCallback(() => setEntrySheet((s) => ({ ...s, open: false })), []);
  const closeDetail = useCallback(() => setDetail(undefined), []);
  const closeVehForm = useCallback(() => setVehForm((s) => ({ ...s, open: false })), []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [tab, state.ws]);

  const nav: { id: Tab; label: string; icon: typeof House }[] = [
    { id: 'home', label: 'Início', icon: House },
    { id: 'entries', label: 'Lançamentos', icon: ReceiptText },
    { id: 'fleet', label: state.ws === 'frota' ? 'Frota' : 'Veículos', icon: CarFront },
    { id: 'plans', label: 'Planos', icon: LayoutGrid },
  ];

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <Logo size={34} />
          <div>
            <span className="brand-name">lucky<b>zorts</b></span>
            <span className="brand-sub">{greeting()} 👋</span>
          </div>
        </div>
        <Segmented<Workspace>
          value={state.ws}
          onChange={(ws) => dispatch({ type: 'setWs', ws })}
          options={[{ value: 'pessoal', label: 'Pessoal' }, { value: 'frota', label: 'Frota' }]}
        />
      </header>

      <main key={`${tab}-${state.ws}`} className="main">
        {tab === 'home' && <Home openEntry={openEntry} openVehicle={setDetail} goTo={setTab} />}
        {tab === 'entries' && <Entries openEntry={openEntry} />}
        {tab === 'fleet' && <Fleet openVehicle={setDetail} newVehicle={() => setVehForm({ open: true })} />}
        {tab === 'plans' && <Plans />}
      </main>

      <nav className="bottom-nav">
        {nav.slice(0, 2).map((n) => <NavBtn key={n.id} {...n} active={tab === n.id} onClick={() => setTab(n.id)} />)}
        <button className="fab" onClick={() => openEntry()} aria-label="Novo lançamento"><Plus size={26} strokeWidth={2.5} /></button>
        {nav.slice(2).map((n) => <NavBtn key={n.id} {...n} active={tab === n.id} onClick={() => setTab(n.id)} />)}
      </nav>

      <EntrySheet open={entrySheet.open} entry={entrySheet.entry} defaults={entrySheet.defaults} onClose={closeEntry} />
      <VehicleDetailSheet vehicle={detail} onClose={closeDetail}
        onEdit={(v) => setVehForm({ open: true, vehicle: v })}
        onOpenEntry={(e) => openEntry(e)} />
      <VehicleFormSheet open={vehForm.open} vehicle={vehForm.vehicle} onClose={closeVehForm} onDeleted={closeDetail} />
    </div>
  );
}

function NavBtn({ label, icon: Icon, active, onClick }: { label: string; icon: typeof House; active: boolean; onClick: () => void }) {
  return (
    <button className={`nav-btn ${active ? 'active' : ''}`} onClick={onClick} aria-current={active ? 'page' : undefined}>
      <Icon size={22} strokeWidth={active ? 2.4 : 1.9} />
      <span>{label}</span>
    </button>
  );
}
