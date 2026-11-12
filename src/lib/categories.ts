import {
  Briefcase, CarFront, CreditCard, Fuel, House, KeyRound, Landmark, PartyPopper,
  PiggyBank, Receipt, ShieldCheck, ShoppingCart, Sparkles, Wrench, type LucideIcon,
} from 'lucide-react';
import type { CategoryId, Kind } from './types';

export interface Category {
  id: CategoryId;
  kind: Kind;
  label: string;
  icon: LucideIcon;
  color: string;
}

export const CATEGORIES: Category[] = [
  { id: 'aluguel', kind: 'in', label: 'Aluguel', icon: KeyRound, color: '#34d399' },
  { id: 'salario', kind: 'in', label: 'Salário', icon: Briefcase, color: '#a3e635' },
  { id: 'saldo', kind: 'in', label: 'Saldo', icon: PiggyBank, color: '#2dd4bf' },
  { id: 'outros_in', kind: 'in', label: 'Outros', icon: Sparkles, color: '#86efac' },
  { id: 'financiamento', kind: 'out', label: 'Financiamento', icon: Landmark, color: '#f472b6' },
  { id: 'manutencao', kind: 'out', label: 'Manutenção', icon: Wrench, color: '#fb923c' },
  { id: 'cartao', kind: 'out', label: 'Cartão', icon: CreditCard, color: '#a78bfa' },
  { id: 'seguro', kind: 'out', label: 'Seguro', icon: ShieldCheck, color: '#60a5fa' },
  { id: 'combustivel', kind: 'out', label: 'Combustível', icon: Fuel, color: '#facc15' },
  { id: 'impostos', kind: 'out', label: 'Taxas e pedágio', icon: Receipt, color: '#f87171' },
  { id: 'moradia', kind: 'out', label: 'Moradia', icon: House, color: '#38bdf8' },
  { id: 'mercado', kind: 'out', label: 'Mercado', icon: ShoppingCart, color: '#4ade80' },
  { id: 'lazer', kind: 'out', label: 'Lazer', icon: PartyPopper, color: '#e879f9' },
  { id: 'outros_out', kind: 'out', label: 'Outros', icon: CarFront, color: '#94a3b8' },
];

const byId = new Map(CATEGORIES.map((c) => [c.id, c]));
export const category = (id: CategoryId) => byId.get(id) ?? CATEGORIES[CATEGORIES.length - 1];
