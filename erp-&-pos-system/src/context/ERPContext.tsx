import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types
export type ServiceType = 'MESA' | 'COMANDA' | 'BALCAO' | 'DELIVERY';

export type PaymentStatus = 'NAO_INFORMADO' | 'PAGO' | 'NAO_PAGO' | 'PARCIAL';

export type OrderItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

export type Customer = {
  id: string;
  name: string;
  phone?: string;
  address?: string;
};

export type PaymentMethod = {
  method: string; // 'CREDITO', 'DEBITO', 'DINHEIRO', 'PIX'
  amount: number;
};

export type Order = {
  id: string;
  number: number;
  status: 'EM_ATENDIMENTO' | 'FINALIZADO' | 'CANCELADO';
  serviceType: ServiceType;
  serviceDetail?: string; // Table number, Address, etc.
  customer?: Customer | null; // null if anonymous
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  payments: PaymentMethod[];
  paymentStatus: PaymentStatus;
  createdAt: Date;
  observations?: string;
};

export type CashRegister = {
  isOpen: boolean;
  openedAt?: Date;
  closedAt?: Date;
  openingBalance: number;
  currentBalance: number; // Cash only
  expectedBalance?: number;
  operator: string;
};

interface ERPContextType {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  cashRegister: CashRegister;
  openCashRegister: (amount: number, operator: string) => void;
  closeCashRegister: (data: any) => void;
  customers: Customer[];
  addCustomer: (customer: Customer) => void;
  products: any[];
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

const MOCK_PRODUCTS = [
  { id: '1', name: 'X-Burger', price: 25.00, category: 'Lanches' },
  { id: '2', name: 'Coca-Cola 350ml', price: 6.00, category: 'Bebidas' },
  { id: '3', name: 'Batata Frita', price: 18.00, category: 'Porções' },
  { id: '4', name: 'Suco de Laranja', price: 10.00, category: 'Bebidas' },
  { id: '5', name: 'X-Salada', price: 22.00, category: 'Lanches' },
];

const MOCK_CUSTOMERS = [
  { id: '1', name: 'José Silva', phone: '11999999999', address: 'Rua A, 123' },
  { id: '2', name: 'Maria Oliveira', phone: '11888888888', address: 'Av B, 456' },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: '101',
    number: 101,
    status: 'EM_ATENDIMENTO',
    serviceType: 'BALCAO',
    serviceDetail: 'Grupo (Cliente Avulso)',
    customer: null,
    items: [
      { id: 'i1', productId: '1', name: 'X-Burger', price: 25.00, quantity: 5 },
      { id: 'i2', productId: '2', name: 'Coca-Cola 350ml', price: 6.00, quantity: 4 },
    ],
    subtotal: 149.00,
    discount: 0,
    total: 149.00,
    payments: [],
    paymentStatus: 'NAO_INFORMADO',
    createdAt: new Date(new Date().setHours(15, 53)),
  },
  {
    id: '102',
    number: 102,
    status: 'FINALIZADO',
    serviceType: 'BALCAO',
    serviceDetail: 'Venda em grupo',
    customer: { id: '1', name: 'José Silva' },
    items: [
      { id: 'i3', productId: '4', name: 'Suco de Laranja', price: 10.00, quantity: 1 },
    ],
    subtotal: 10.00,
    discount: 0,
    total: 10.00,
    payments: [{ method: 'DINHEIRO', amount: 10.00 }],
    paymentStatus: 'PAGO',
    createdAt: new Date(new Date().setHours(18, 59)),
  }
];

export function ERPProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [cashRegister, setCashRegister] = useState<CashRegister>({
    isOpen: true,
    openedAt: new Date(new Date().setHours(8, 0)),
    openingBalance: 250.00,
    currentBalance: 250.00,
    operator: 'Admin',
  });

  const addOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
  };

  const updateOrder = (id: string, updates: Partial<Order>) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  };

  const openCashRegister = (amount: number, operator: string) => {
    setCashRegister({
      isOpen: true,
      openedAt: new Date(),
      openingBalance: amount,
      currentBalance: amount,
      operator,
    });
  };

  const closeCashRegister = (data: any) => {
    setCashRegister(prev => ({
      ...prev,
      isOpen: false,
      closedAt: new Date(),
    }));
  };

  const addCustomer = (customer: Customer) => {
    setCustomers(prev => [...prev, customer]);
  };

  return (
    <ERPContext.Provider value={{
      orders,
      addOrder,
      updateOrder,
      cashRegister,
      openCashRegister,
      closeCashRegister,
      customers,
      addCustomer,
      products: MOCK_PRODUCTS
    }}>
      {children}
    </ERPContext.Provider>
  );
}

export function useERP() {
  const context = useContext(ERPContext);
  if (context === undefined) {
    throw new Error('useERP must be used within a ERPProvider');
  }
  return context;
}
