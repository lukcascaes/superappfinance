import { CarFront, FlaskConical, House, LayoutGrid, Plus, ReceiptText } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { EntrySheet } from './components/EntrySheet';
import { useToast } from './components/Toast';
import { Logo, Segmented } from './components/ui';
import { VehicleDetailSheet, VehicleFormSheet } from './components/VehicleSheets';
import { greeting } from './lib/format';
import { emptyState, useStore } from './lib/store';
import type { Entry, Vehicle, Workspace } from './lib/types';
import { Entries } from './screens/Entries';
import { Fleet } from './screens/Fleet';
import { Home } from './screens/Home';
import { Onboarding } from './screens/Onboarding';
import { Plans } from './screens/Plans';

type Tab = 'home' | 'entries' | 'fleet' | 'plans';

export default function App() {
  const { state, dispatch } = useStore();
  const toast = useToast();
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

  if (!state.onboarded) return <Onboarding />;

  const startEmpty = () => {
    const before = state;
    dispatch({ type: 'reset', state: emptyState(state.ws) });
    setTab('home');
    toast('Dados de exemplo apagados', before);
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <Logo size={40} />
          <div>
            <span className="brand-name">lucky<b>zorts</b></span>
            <span className="brand-sub">finance</span>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => openEntry()}><Plus size={18} /> Novo lançamento</button>
        <nav className="side-nav">
          {nav.map((n) => {
            const Icon = n.icon;
            return (
              <button key={n.id} className={`side-btn ${tab === n.id ? 'active' : ''}`} onClick={() => setTab(n.id)}
                aria-current={tab === n.id ? 'page' : undefined}>
                <Icon size={20} strokeWidth={tab === n.id ? 2.4 : 1.9} /> {n.label}
              </button>
            );
          })}
        </nav>
        <p className="side-foot">{greeting()} 👋<br />MVP v0.1</p>
      </aside>

      <header className="topbar">
        <h1 className="page-title">{nav.find((n) => n.id === tab)?.label}</h1>
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
        {state.demo && (
          <div className="demo-banner">
            <FlaskConical size={16} />
            <span className="grow">Você está vendo <b>dados de exemplo</b>.</span>
            <button onClick={startEmpty}>Começar do zero</button>
          </div>
        )}
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
