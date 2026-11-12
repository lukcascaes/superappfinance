import { currentMonth } from './format';
import type { CategoryId, Entry, Kind, Repeat, State, Vehicle, Workspace } from './types';

/**
 * Fictional demo data. The "frota" workspace follows the shape of a real rental
 * spreadsheet (rentals in, financings/installments out) with made-up values.
 */
export function seedState(): State {
  const month = currentMonth();
  let n = 0;
  const e = (
    ws: Workspace, kind: Kind, title: string, amount: number, category: CategoryId, day: number,
    repeat: Repeat = 'monthly', installments?: number, vehicleId?: string,
  ): Entry => ({ id: `s${++n}`, ws, kind, title, amount, category, day, startMonth: month, repeat, installments, vehicleId });

  const today = new Date().toISOString();
  const v = (id: string, name: string, plate: string, color: string, year: number, kmNow: number, last: number, renterName?: string): Vehicle => ({
    id, ws: 'frota', name, plate, color, year, km: kmNow, kmUpdatedAt: today, lastServiceKm: last, serviceIntervalKm: 10000, renterName,
  });

  const vehicles: Vehicle[] = [
    v('c4c', 'C4 Cactus Cinza', 'RTX4C21', '#9ca3af', 2022, 48200, 40000, 'Rafael S.'),
    v('c4p', 'C4 Cactus Preto', 'SBA7H90', '#111827', 2023, 31650, 30000, 'Marcos T.'),
    v('kab', 'Ka Branco', 'QPL2E45', '#f8fafc', 2020, 87900, 78400, 'Daniela P.'),
    v('kap', 'Ka Preto', 'QOE9J12', '#0f172a', 2021, 64300, 60000, 'Bruno L.'),
    v('polo', 'Polo', 'SCK1D33', '#dc2626', 2023, 22950, 20000, 'Rodrigo F.'),
    v('voy', 'Voyage', 'PXQ5B78', '#94a3b8', 2019, 112400, 110000, 'Jéssica A.'),
    v('k', 'Ford K Preto', 'RKD3F56', '#1f2937', 2021, 70800, 61500),
    { id: 'onix', ws: 'pessoal', name: 'Meu Onix', plate: 'BRA2E19', color: '#2563eb', year: 2021, km: 54100, kmUpdatedAt: today, lastServiceKm: 50000, serviceIntervalKm: 5000 },
  ];

  const F: Workspace = 'frota';
  const P: Workspace = 'pessoal';
  const entries: Entry[] = [
    // —— Frota: entradas
    e(F, 'in', 'Saldo anterior', 5840.3, 'saldo', 25, 'once'),
    e(F, 'in', 'Aluguel C4 cinza', 2190, 'aluguel', 19, 'monthly', undefined, 'c4c'),
    e(F, 'in', 'Aluguel C4 preto', 2150, 'aluguel', 17, 'monthly', undefined, 'c4p'),
    e(F, 'in', 'Aluguel Ka branco', 1200, 'aluguel', 19, 'monthly', undefined, 'kab'),
    e(F, 'in', 'Aluguel Ka preto', 1950, 'aluguel', 19, 'monthly', undefined, 'kap'),
    e(F, 'in', 'Aluguel Polo', 1800, 'aluguel', 18, 'monthly', undefined, 'polo'),
    e(F, 'in', 'Aluguel Voyage', 1650, 'aluguel', 19, 'monthly', undefined, 'voy'),
    e(F, 'in', 'Contrato empresa parceira', 3900, 'aluguel', 20),
    e(F, 'in', 'Reembolso pedágio', 22.4, 'outros_in', 20, 'once'),
    // —— Frota: saídas
    e(F, 'out', 'Cartão de crédito locadora', 2318.9, 'cartao', 23),
    e(F, 'out', 'Financ. C4 cinza', 2290, 'financiamento', 25, 'monthly', undefined, 'c4c'),
    e(F, 'out', 'Financ. C4 preto', 1840, 'financiamento', 19, 'monthly', undefined, 'c4p'),
    e(F, 'out', 'Financ. Polo', 1765, 'financiamento', 18, 'monthly', undefined, 'polo'),
    e(F, 'out', 'Financ. Voyage', 1690, 'financiamento', 19, 'monthly', undefined, 'voy'),
    e(F, 'out', 'Correia Ka', 128, 'manutencao', 20, 'installments', 6, 'kab'),
    e(F, 'out', 'Entrada Cactus', 540, 'financiamento', 20, 'installments', 8, 'c4c'),
    e(F, 'out', 'Financ. Mobi', 2750, 'financiamento', 20, 'installments', 5),
    e(F, 'out', 'Ford K preto', 2890, 'financiamento', 20, 'installments', 3, 'k'),
    e(F, 'out', 'Documentação K', 74.9, 'impostos', 20, 'installments', 2, 'k'),
    e(F, 'out', 'Seguro K', 152.3, 'seguro', 20, 'installments', 5, 'k'),
    e(F, 'out', 'Transferência K', 912.5, 'impostos', 20, 'installments', 4, 'k'),
    e(F, 'out', 'Garagem', 720, 'outros_out', 20, 'installments', 10),
    e(F, 'out', 'Manutenção Voyage', 410, 'manutencao', 20, 'once', undefined, 'voy'),
    e(F, 'out', 'Manutenção Voyage (peças)', 386.7, 'manutencao', 20, 'once', undefined, 'voy'),
    e(F, 'out', 'Consórcio', 1980, 'financiamento', 20),
    e(F, 'out', 'Polo – franquia sinistro', 31.2, 'outros_out', 20, 'once', undefined, 'polo'),
    e(F, 'out', 'Polo – multa', 195.23, 'impostos', 20, 'installments', 3, 'polo'),
    e(F, 'out', 'Polo – funilaria', 140, 'manutencao', 20, 'installments', 4, 'polo'),
    e(F, 'out', 'Balanceamento Ka', 60, 'manutencao', 20, 'once', undefined, 'kap'),
    e(F, 'out', 'Pneu Ka branco', 159.9, 'manutencao', 20, 'installments', 4, 'kab'),
    e(F, 'out', 'Pedágios pendentes', 38.6, 'impostos', 20, 'once'),
    e(F, 'out', 'Ka branco (oficina)', 2105.4, 'manutencao', 21, 'once', undefined, 'kab'),
    e(F, 'out', 'Ar-condicionado Ka branco', 245, 'manutencao', 5, 'installments', 2, 'kab'),
    e(F, 'out', 'Entrada Cactus (2)', 430, 'financiamento', 5, 'installments', 8, 'c4c'),
    // —— Pessoal
    e(P, 'in', 'Salário', 4800, 'salario', 5),
    e(P, 'in', 'Freela', 650, 'outros_in', 15, 'once'),
    e(P, 'out', 'Aluguel do apê', 1450, 'moradia', 10),
    e(P, 'out', 'Mercado', 980, 'mercado', 8),
    e(P, 'out', 'Fatura do cartão', 1180.4, 'cartao', 15),
    e(P, 'out', 'Financ. Onix', 899.9, 'financiamento', 20, 'installments', 24, 'onix'),
    e(P, 'out', 'Gasolina', 420, 'combustivel', 12, 'monthly', undefined, 'onix'),
    e(P, 'out', 'Seguro Onix', 189.9, 'seguro', 10, 'monthly', undefined, 'onix'),
    e(P, 'out', 'Internet + celular', 159.9, 'moradia', 12),
    e(P, 'out', 'Rolê do fim de semana', 260, 'lazer', 22, 'once'),
  ];

  const paid: State['paid'] = {};
  const todayDay = new Date().getDate();
  for (const en of entries) {
    if (en.day <= todayDay - 1 || (en.ws === 'frota' && en.kind === 'in' && en.day < 20)) paid[`${en.id}@${month}`] = true;
  }

  return { version: 1, ws: 'frota', month, entries, vehicles, paid };
}
