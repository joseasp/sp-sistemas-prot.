export enum PaymentStatus {
  PAGO = 'Pago',
  NAO_PAGO = 'Não pago',
  NAO_INFORMADO = 'Não informado'
}

export enum ClientType {
  PF = 'Pessoa Física',
  PJ = 'Pessoa Jurídica'
}

export interface Product {
  id: string;
  name: string;
  category: string;
  fiscalGroup?: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  unit: string;
  status: 'Ativo' | 'Inativo';
  ncm?: string;
  ean?: string;
  ncmDescription?: string;
  ncmNeedsReview?: boolean;
  cest?: string;
  origem?: string;
  taxCode?: string;
  taxNeedsReview?: boolean;
}

export interface Client {
  id: string;
  name: string;
  type: ClientType;
  document: string;
  phone: string;
  creditLimit?: number;
  status: 'Ativo' | 'Inativo';
  balance: number; // Saldo devedor
  ieIndicator?: '1' | '2' | '3' | '9';
  ie?: string;
  cep?: string;
  street?: string;
  number?: string;
  district?: string;
  city?: string;
  uf?: string;
  cityCode?: string;
  nfeEligible?: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  cnpj: string;
  status: 'Cadastrado' | 'Não Cadastrado';
}

export interface StockEntry {
  id: string;
  date: string;
  supplier: string;
  itemsCount: number;
  total: number;
  status: 'Aprovada' | 'Pendente';
  xmlKey?: string;
}

export interface FinancialMove {
  id: string;
  date: string;
  description: string; // Ex: items list
  value: number;
  status: PaymentStatus;
}

export interface Payable {
  id: string;
  dueDate: string;
  supplier: string;
  description: string;
  value: number;
  status: 'Aberto' | 'Pago';
  type: 'Boleto' | 'Fixo';
}
