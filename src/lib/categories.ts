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
  { id: 'aluguel', kind: 'in', label: 'Aluguel', icon: KeyRound, color: '#f4f4f5' },
  { id: 'salario', kind: 'in', label: 'Salário', icon: Briefcase, color: '#f4f4f5' },
  { id: 'saldo', kind: 'in', label: 'Saldo', icon: PiggyBank, color: '#f4f4f5' },
  { id: 'outros_in', kind: 'in', label: 'Outros', icon: Sparkles, color: '#f4f4f5' },
  { id: 'financiamento', kind: 'out', label: 'Financiamento', icon: Landmark, color: '#a1a1aa' },
  { id: 'manutencao', kind: 'out', label: 'Manutenção', icon: Wrench, color: '#a1a1aa' },
  { id: 'cartao', kind: 'out', label: 'Cartão', icon: CreditCard, color: '#a1a1aa' },
  { id: 'seguro', kind: 'out', label: 'Seguro', icon: ShieldCheck, color: '#a1a1aa' },
  { id: 'combustivel', kind: 'out', label: 'Combustível', icon: Fuel, color: '#a1a1aa' },
  { id: 'impostos', kind: 'out', label: 'Taxas e pedágio', icon: Receipt, color: '#a1a1aa' },
  { id: 'moradia', kind: 'out', label: 'Moradia', icon: House, color: '#a1a1aa' },
  { id: 'mercado', kind: 'out', label: 'Mercado', icon: ShoppingCart, color: '#a1a1aa' },
  { id: 'lazer', kind: 'out', label: 'Lazer', icon: PartyPopper, color: '#a1a1aa' },
  { id: 'outros_out', kind: 'out', label: 'Outros', icon: CarFront, color: '#a1a1aa' },
];

const byId = new Map(CATEGORIES.map((c) => [c.id, c]));
export const category = (id: CategoryId) => byId.get(id) ?? CATEGORIES[CATEGORIES.length - 1];
