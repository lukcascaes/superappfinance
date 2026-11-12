import type { Entry, Occurrence, Scope, State, Vehicle, Workspace } from './types';

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
  if (e.endMonth && monthDiff(e.endMonth, month) > 0) return null;
  if (e.skip?.includes(month)) return null;
  if (e.repeat === 'once' && d !== 0) return null;
  const n = d + (e.installmentOffset ?? 0);
  if (e.repeat === 'installments' && n >= (e.installments ?? 1)) return null;
  const key = `${e.id}@${month}`;
  return {
    key,
    entry: e,
    label: e.repeat === 'installments' ? `${n + 1}/${e.installments}` : undefined,
    paid: !!paid[key],
  };
}

export const isRecurring = (e: Entry) => e.repeat !== 'once';

function movePaid(paid: State['paid'], fromId: string, toId: string, test: (month: string) => boolean) {
  const out = { ...paid };
  for (const key of Object.keys(paid)) {
    const [id, m] = key.split('@');
    if (id === fromId && test(m)) {
      delete out[key];
      out[`${toId}@${m}`] = true;
    }
  }
  return out;
}

/**
 * Applies an edit of a recurring entry seen in `month`:
 * - only:   skip this month on the rule, add a one-off with the new values
 * - future: end the rule last month, start a new rule this month
 * - all:    rewrite the rule
 */
export function applyEdit(s: State, original: Entry, draft: Entry, scope: Scope, month: string, newId: string): State {
  const others = s.entries.filter((e) => e.id !== original.id);
  if (scope === 'all' || !isRecurring(original) || (scope === 'future' && monthDiff(original.startMonth, month) <= 0)) {
    const keepOffset = scope === 'all' ? draft : { ...draft, startMonth: original.startMonth };
    return { ...s, entries: [...others, { ...keepOffset, id: original.id }] };
  }
  if (scope === 'only') {
    const skipped: Entry = { ...original, skip: [...(original.skip ?? []), month] };
    const single: Entry = { ...draft, id: newId, repeat: 'once', startMonth: month, installments: undefined, installmentOffset: undefined, endMonth: undefined, skip: undefined };
    return { ...s, entries: [...others, skipped, single], paid: movePaid(s.paid, original.id, newId, (m) => m === month) };
  }
  // future
  const elapsed = monthDiff(original.startMonth, month);
  const ended: Entry = { ...original, endMonth: addMonths(month, -1) };
  const next: Entry = {
    ...draft,
    id: newId,
    startMonth: month,
    endMonth: undefined,
    skip: undefined,
    installmentOffset: draft.repeat === 'installments' && original.repeat === 'installments'
      ? (original.installmentOffset ?? 0) + elapsed
      : undefined,
  };
  return { ...s, entries: [...others, ended, next], paid: movePaid(s.paid, original.id, newId, (m) => monthDiff(month, m) >= 0) };
}

export function deleteScoped(s: State, entry: Entry, scope: Scope, month: string): State {
  const others = s.entries.filter((e) => e.id !== entry.id);
  if (scope === 'all' || !isRecurring(entry) || (scope === 'future' && monthDiff(entry.startMonth, month) <= 0)) {
    const paid = { ...s.paid };
    for (const k of Object.keys(paid)) if (k.startsWith(`${entry.id}@`)) delete paid[k];
    return { ...s, entries: others, paid };
  }
  const updated: Entry = scope === 'only'
    ? { ...entry, skip: [...(entry.skip ?? []), month] }
    : { ...entry, endMonth: addMonths(month, -1) };
  return { ...s, entries: [...others, updated] };
}

export type RentStatus =
  | { kind: 'none' }
  | { kind: 'paid'; amount: number }
  | { kind: 'due'; amount: number; day: number; inDays: number }
  | { kind: 'late'; amount: number; day: number; days: number };

/** Rent situation of a vehicle in `month`, relative to today. */
export function rentStatus(occs: Occurrence[], vehicleId: string, month: string, today = new Date()): RentStatus {
  const o = occs.find((x) => x.entry.vehicleId === vehicleId && x.entry.kind === 'in' && x.entry.category === 'aluguel');
  if (!o) return { kind: 'none' };
  const { amount, day } = o.entry;
  if (o.paid) return { kind: 'paid', amount };
  const [y, m] = month.split('-').map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  const due = new Date(y, m - 1, Math.min(day, lastDay));
  const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diff = Math.round((due.getTime() - t0.getTime()) / 86400000);
  return diff < 0 ? { kind: 'late', amount, day, days: -diff } : { kind: 'due', amount, day, inDays: diff };
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
  // api.whatsapp.com directly: the wa.me redirect mangles emoji in the text.
  const params = new URLSearchParams(num ? { phone: num, text } : { text });
  return `https://api.whatsapp.com/send?${params.toString().replace(/\+/g, '%20')}`;
}

/** Fleet plan: R$100 with 1 vehicle included, R$50 per additional vehicle. */
export function fleetPrice(vehicles: number) {
  return 100 + Math.max(0, vehicles - 1) * 50;
}
