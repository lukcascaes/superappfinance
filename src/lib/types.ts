export type Workspace = 'pessoal' | 'frota';
export type Kind = 'in' | 'out';
export type Repeat = 'once' | 'monthly' | 'installments';

export type CategoryId =
  | 'aluguel'
  | 'salario'
  | 'saldo'
  | 'outros_in'
  | 'financiamento'
  | 'manutencao'
  | 'cartao'
  | 'seguro'
  | 'combustivel'
  | 'impostos'
  | 'moradia'
  | 'mercado'
  | 'lazer'
  | 'outros_out';

/** A rule that generates one occurrence per month (like a row copied across the spreadsheet). */
export interface Entry {
  id: string;
  ws: Workspace;
  kind: Kind;
  title: string;
  amount: number;
  category: CategoryId;
  /** Due day of the month (1–31). */
  day: number;
  /** YYYY-MM of the first occurrence. */
  startMonth: string;
  repeat: Repeat;
  /** Total number of installments when repeat === 'installments'. */
  installments?: number;
  /** Installments already elapsed before startMonth (after a "this and future" split). */
  installmentOffset?: number;
  /** Last month (inclusive) this rule produces an occurrence. */
  endMonth?: string;
  /** Months excluded from this rule ("only this month" edits/deletes). */
  skip?: string[];
  vehicleId?: string;
}

/** Which occurrences an edit or delete of a recurring entry applies to. */
export type Scope = 'only' | 'future' | 'all';

export interface Vehicle {
  id: string;
  ws: Workspace;
  name: string;
  plate: string;
  color: string;
  year?: number;
  km: number;
  kmUpdatedAt: string;
  lastServiceKm: number;
  serviceIntervalKm: number;
  renterName?: string;
  renterPhone?: string;
}

export interface State {
  version: 1;
  ws: Workspace;
  month: string;
  entries: Entry[];
  vehicles: Vehicle[];
  /** Keys `${entryId}@${YYYY-MM}` marked as paid/received. */
  paid: Record<string, true>;
  /** First-run choice done. Missing on data saved before onboarding existed. */
  onboarded?: boolean;
  /** Showing the sample data set. */
  demo?: boolean;
}

export interface Occurrence {
  key: string;
  entry: Entry;
  label?: string;
  paid: boolean;
}
