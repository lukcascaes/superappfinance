import type { Entry, Occurrence, State, Vehicle, Workspace } from './types';

const parse = (m: string) => {
  const [y, mm] = m.split('-').map(Number);
  return y * 12 + (mm - 1);
};

export function addMonths(m: string, n: number) {
  const d = parse(m) + n;
  return `${Math.floor(d / 12)}-${String((d % 12) + 1).padStart(2, '0')}`;
}

/** Months from a to b (b - a). */
export function monthDiff(a: string, b: string) {
  return parse(b) - parse(a);
}

export function occurrenceFor(e: Entry, month: string, paid: State['paid']): Occurrence | null {
  const d = monthDiff(e.startMonth, month);
  if (d < 0) return null;
  if (e.repeat === 'once' && d !== 0) return null;
  if (e.repeat === 'installments' && d >= (e.installments ?? 1)) return null;
  const key = `${e.id}@${month}`;
  return {
    key,
    entry: e,
    label: e.repeat === 'installments' ? `${d + 1}/${e.installments}` : undefined,
    paid: !!paid[key],
  };
}

export function occurrences(state: State, month: string, ws: Workspace = state.ws): Occurrence[] {
  return state.entries
    .filter((e) => e.ws === ws)
    .map((e) => occurrenceFor(e, month, state.paid))
    .filter((o): o is Occurrence => o !== null)
    .sort((a, b) => a.entry.day - b.entry.day || b.entry.amount - a.entry.amount);
}

export interface Summary {
  inc: number;
  out: number;
  result: number;
  paidIn: number;
  paidOut: number;
}

export function summarize(occs: Occurrence[]): Summary {
  const s: Summary = { inc: 0, out: 0, result: 0, paidIn: 0, paidOut: 0 };
  for (const o of occs) {
    if (o.entry.kind === 'in') {
      s.inc += o.entry.amount;
      if (o.paid) s.paidIn += o.entry.amount;
    } else {
      s.out += o.entry.amount;
      if (o.paid) s.paidOut += o.entry.amount;
    }
  }
  s.result = s.inc - s.out;
  return s;
}

export type MaintStatus = 'ok' | 'soon' | 'late';

export function maintenance(v: Vehicle) {
  const used = Math.max(0, v.km - v.lastServiceKm);
  const pct = v.serviceIntervalKm > 0 ? used / v.serviceIntervalKm : 0;
  const next = v.lastServiceKm + v.serviceIntervalKm;
  const status: MaintStatus = pct >= 1 ? 'late' : pct >= 0.85 ? 'soon' : 'ok';
  return { pct, next, remaining: next - v.km, status };
}

export function vehicleSummary(occs: Occurrence[], vehicleId: string) {
  return summarize(occs.filter((o) => o.entry.vehicleId === vehicleId));
}

export function waLink(phone: string | undefined, text: string) {
  const digits = (phone ?? '').replace(/\D/g, '');
  const num = digits ? (digits.startsWith('55') ? digits : `55${digits}`) : '';
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}

/** Fleet plan: R$100 with 1 vehicle included, R$50 per additional vehicle. */
export function fleetPrice(vehicles: number) {
  return 100 + Math.max(0, vehicles - 1) * 50;
}
