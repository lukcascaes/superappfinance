import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { applyEdit, deleteScoped } from './finance';
import { currentMonth, uid } from './format';
import { seedState } from './seed';
import type { Entry, Scope, State, Vehicle, Workspace } from './types';

const KEY = 'luckyzortsfinance:v1';

type Action =
  | { type: 'setWs'; ws: Workspace }
  | { type: 'setMonth'; month: string }
  | { type: 'upsertEntry'; entry: Entry }
  | { type: 'editEntry'; original: Entry; draft: Entry; scope: Scope }
  | { type: 'deleteEntry'; entry: Entry; scope: Scope }
  | { type: 'togglePaid'; key: string }
  | { type: 'upsertVehicle'; vehicle: Vehicle }
  | { type: 'deleteVehicle'; id: string }
  | { type: 'reset'; state?: State };

export const demoState = (ws: Workspace = 'frota'): State => ({ ...seedState(), ws, demo: true, onboarded: true });
export const emptyState = (ws: Workspace): State => ({
  version: 1, ws, month: currentMonth(), entries: [], vehicles: [], paid: {}, demo: false, onboarded: true,
});

function upsert<T extends { id: string }>(list: T[], item: T) {
  return list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [...list, item];
}

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'setWs':
      return { ...s, ws: a.ws };
    case 'setMonth':
      return { ...s, month: a.month };
    case 'upsertEntry':
      return { ...s, entries: upsert(s.entries, a.entry) };
    case 'editEntry':
      return applyEdit(s, a.original, a.draft, a.scope, s.month, uid());
    case 'deleteEntry':
      return deleteScoped(s, a.entry, a.scope, s.month);
    case 'togglePaid': {
      const paid = { ...s.paid };
      if (paid[a.key]) delete paid[a.key];
      else paid[a.key] = true;
      return { ...s, paid };
    }
    case 'upsertVehicle':
      return { ...s, vehicles: upsert(s.vehicles, a.vehicle) };
    case 'deleteVehicle':
      return {
        ...s,
        vehicles: s.vehicles.filter((v) => v.id !== a.id),
        entries: s.entries.map((e) => (e.vehicleId === a.id ? { ...e, vehicleId: undefined } : e)),
      };
    case 'reset':
      return a.state ?? demoState(s.ws);
  }
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as State;
      // Data saved before onboarding existed: keep it, skip the first-run screen.
      if (s.version === 1) return { ...s, onboarded: s.onboarded ?? true };
    }
  } catch {
    /* ignore */
  }
  return { ...seedState(), demo: true, onboarded: false };
}

const Ctx = createContext<{ state: State; dispatch: React.Dispatch<Action> } | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore outside provider');
  return ctx;
}
