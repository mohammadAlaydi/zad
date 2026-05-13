import { create } from "zustand";

export type MerchantTransaction = {
  id: string;
  customerName: string;
  amount: number;
  currency: string;
  type: "payment" | "refund";
  status: "completed" | "pending" | "refunded";
  method: "wallet" | "card" | "qr";
  timestamp: string;
};

export type Promotion = {
  id: string;
  title: string;
  description: string;
  discountPercent: number;
  validUntil: string;
  active: boolean;
  redemptions: number;
};

export type Employee = {
  id: string;
  name: string;
  role: "admin" | "cashier" | "manager";
  addedAt: string;
};

type MerchantState = {
  businessName: string;
  transactions: MerchantTransaction[];
  promotions: Promotion[];
  employees: Employee[];
  stats: {
    totalRevenue: number;
    todayRevenue: number;
    totalTransactions: number;
    activePromos: number;
  };
  addPromotion: (p: Promotion) => void;
  togglePromotion: (id: string) => void;
  refundTransaction: (id: string) => void;
  addEmployee: (e: Employee) => void;
  removeEmployee: (id: string) => void;
};

const sampleTx: MerchantTransaction[] = [
  {
    id: "mt1",
    customerName: "Ahmed K.",
    amount: 125.5,
    currency: "USD",
    type: "payment",
    status: "completed",
    method: "wallet",
    timestamp: new Date().toISOString(),
  },
  {
    id: "mt2",
    customerName: "Sara M.",
    amount: 45.0,
    currency: "USD",
    type: "payment",
    status: "completed",
    method: "qr",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "mt3",
    customerName: "Omar A.",
    amount: 230.0,
    currency: "USD",
    type: "payment",
    status: "completed",
    method: "card",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "mt4",
    customerName: "Fatima H.",
    amount: 18.75,
    currency: "USD",
    type: "refund",
    status: "refunded",
    method: "wallet",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "mt5",
    customerName: "Yusuf B.",
    amount: 95.0,
    currency: "USD",
    type: "payment",
    status: "pending",
    method: "card",
    timestamp: new Date(Date.now() - 14400000).toISOString(),
  },
];

const samplePromos: Promotion[] = [
  {
    id: "p1",
    title: "Welcome Discount",
    description: "10% off for first-time customers",
    discountPercent: 10,
    validUntil: new Date(Date.now() + 2592000000).toISOString(),
    active: true,
    redemptions: 42,
  },
  {
    id: "p2",
    title: "Weekend Special",
    description: "15% off on weekends",
    discountPercent: 15,
    validUntil: new Date(Date.now() + 604800000).toISOString(),
    active: true,
    redemptions: 18,
  },
  {
    id: "p3",
    title: "Loyalty Reward",
    description: "5% cashback for returning customers",
    discountPercent: 5,
    validUntil: new Date(Date.now() + 7776000000).toISOString(),
    active: false,
    redemptions: 156,
  },
];

const sampleEmployees: Employee[] = [
  {
    id: "e1",
    name: "Ali Mohammed",
    role: "manager",
    addedAt: new Date(Date.now() - 2592000000).toISOString(),
  },
  {
    id: "e2",
    name: "Hassan Omar",
    role: "cashier",
    addedAt: new Date(Date.now() - 864000000).toISOString(),
  },
  {
    id: "e3",
    name: "Noor Ahmed",
    role: "cashier",
    addedAt: new Date(Date.now() - 432000000).toISOString(),
  },
];

export const useMerchantStore = create<MerchantState>((set) => ({
  businessName: "ZAD Merchant Store",
  transactions: sampleTx,
  promotions: samplePromos,
  employees: sampleEmployees,
  stats: {
    totalRevenue: sampleTx.filter((t) => t.type === "payment").reduce((s, t) => s + t.amount, 0),
    todayRevenue: sampleTx
      .filter(
        (t) =>
          t.type === "payment" &&
          new Date(t.timestamp).toDateString() === new Date().toDateString(),
      )
      .reduce((s, t) => s + t.amount, 0),
    totalTransactions: sampleTx.length,
    activePromos: samplePromos.filter((p) => p.active).length,
  },

  addPromotion: (p) =>
    set((s) => ({
      promotions: [p, ...s.promotions],
      stats: { ...s.stats, activePromos: s.stats.activePromos + (p.active ? 1 : 0) },
    })),

  togglePromotion: (id) =>
    set((s) => {
      const promos = s.promotions.map((p) => (p.id === id ? { ...p, active: !p.active } : p));
      return {
        promotions: promos,
        stats: { ...s.stats, activePromos: promos.filter((p) => p.active).length },
      };
    }),

  refundTransaction: (id) =>
    set((s) => ({
      transactions: s.transactions.map((t) =>
        t.id === id ? { ...t, status: "refunded" as const, type: "refund" as const } : t,
      ),
    })),

  addEmployee: (e) => set((s) => ({ employees: [...s.employees, e] })),
  removeEmployee: (id) => set((s) => ({ employees: s.employees.filter((e) => e.id !== id) })),
}));
