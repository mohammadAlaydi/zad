import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Locale } from "@/i18n";

export type Currency = "USD" | "AED" | "CAD" | "AUD";

// ─── Core Transaction ──────────────────────────────────────────────────────────
export type TxType =
  | "p2p"
  | "topup"
  | "withdrawal"
  | "bill"
  | "qr"
  | "agent_cashin"
  | "agent_cashout"
  | "visa_direct"
  | "bnpl"
  | "bnpl_repay"
  | "voucher"
  | "loyalty_redeem"
  | "savings_deposit"
  | "savings_withdraw"
  | "goal_deposit"
  | "goal_withdraw"
  | "invest_buy"
  | "invest_sell"
  | "crypto_buy"
  | "crypto_sell"
  | "scheduled"
  | "general";

export type Transaction = {
  id: string;
  name: string;
  category: string;
  amount: number;
  currency: Currency;
  date: string;
  avatar?: string;
  txType?: TxType;
};

export type SavedCard = {
  id: string;
  brand: "mastercard" | "visa";
  last4: string;
  exp: string;
  name: string;
  isVirtual?: boolean;
  isPhysical?: boolean;
  isActive?: boolean;
  atmEnabled?: boolean;
  cardNumber?: string;
};

export type VisaDirectTx = {
  id: string;
  recipientName: string;
  cardLast4: string;
  amount: number;
  fee: number;
  currency: Currency;
  date: string;
  status: "pending" | "completed" | "failed";
};

export type AgentProfile = {
  id: string;
  name: string;
  address: string;
  distance: string;
  rating: number;
  openNow: boolean;
  lat: number;
  lng: number;
  floatLimit: number;
};

export type BNPLInstallment = {
  id: string;
  merchantName: string;
  totalAmount: number;
  installments: number;
  paidCount: number;
  amountPerInstallment: number;
  nextDueDate: string;
  currency: Currency;
  lateFee: number;
  status: "active" | "completed" | "overdue";
};

export type Voucher = {
  id: string;
  type: "mobile_topup" | "gift_card" | "service_credit";
  merchant: string;
  value: number;
  currency: Currency;
  code: string;
  expiresAt: string;
  redeemedAt?: string;
  isUsed: boolean;
};

export type LoyaltyLevel = "Bronze" | "Silver" | "Gold" | "Platinum";
export type Referral = {
  id: string;
  name: string;
  joinedAt: string;
  pointsEarned: number;
};

export type WalletGoal = {
  id: string;
  name: string;
  emoji: string;
  targetAmount: number;
  savedAmount: number;
  currency: Currency;
  createdAt: string;
};

export type ScheduledFrequency = "daily" | "weekly" | "monthly";
export type ScheduledPayment = {
  id: string;
  recipient: string;
  recipientPhone?: string;
  amount: number;
  currency: Currency;
  frequency: ScheduledFrequency;
  nextDate: string;
  type: "transfer" | "bill";
  isActive: boolean;
  note?: string;
};

export type SavingsFrequency = "daily" | "weekly" | "monthly";
export type SavingsPlan = {
  id: string;
  name: string;
  emoji: string;
  targetAmount: number;
  savedAmount: number;
  contributionAmount: number;
  frequency: SavingsFrequency;
  lockUntil?: string;
  interestRate?: number;
  currency: Currency;
  createdAt: string;
  isActive: boolean;
};

export type StockHolding = {
  id: string;
  ticker: string;
  companyName: string;
  shares: number;
  avgBuyPrice: number;
  currentPrice: number;
  currency: Currency;
};

export type CryptoHolding = {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  avgBuyPrice: number;
  currentPrice: number;
  currency: Currency;
};

export type AppState = {
  bootstrapped: boolean;
  hasOnboarded: boolean;
  user: {
    fullName: string;
    username: string;
    email: string;
    phone: string;
    avatar?: string;
    dob?: string;
    gender?: "Male" | "Female";
  };
  balances: Record<Currency, number>;
  activeCurrency: Currency;
  hideBalance: boolean;
  biometricEnabled: boolean;
  faceIdEnabled: boolean;
  locale: Locale;
  transactions: Transaction[];
  cards: SavedCard[];
  visaDirectTxs: VisaDirectTx[];
  sendVisaDirect: (tx: VisaDirectTx) => void;
  agents: AgentProfile[];
  cashInAgent: (agentId: string, amount: number, currency: Currency) => void;
  cashOutAgent: (agentId: string, amount: number, currency: Currency) => void;
  bnplInstallments: BNPLInstallment[];
  addBNPL: (item: BNPLInstallment) => void;
  repayBNPL: (id: string) => void;
  vouchers: Voucher[];
  addVoucher: (v: Voucher) => void;
  redeemVoucher: (id: string) => void;
  loyaltyPoints: number;
  loyaltyLevel: LoyaltyLevel;
  referrals: Referral[];
  redeemLoyaltyPoints: (points: number) => void;
  addReferral: (r: Referral) => void;
  goals: WalletGoal[];
  addGoal: (g: WalletGoal) => void;
  depositGoal: (id: string, amount: number) => void;
  withdrawGoal: (id: string, amount: number) => void;
  scheduledPayments: ScheduledPayment[];
  addScheduledPayment: (p: ScheduledPayment) => void;
  toggleScheduledPayment: (id: string) => void;
  deleteScheduledPayment: (id: string) => void;
  savingsPlans: SavingsPlan[];
  addSavingsPlan: (p: SavingsPlan) => void;
  contributeSavings: (id: string, amount: number) => void;
  withdrawSavings: (id: string, amount: number) => void;
  stockHoldings: StockHolding[];
  buyStock: (ticker: string, shares: number, price: number, currency: Currency) => void;
  sellStock: (ticker: string, shares: number, price: number) => void;
  cryptoHoldings: CryptoHolding[];
  buyCrypto: (symbol: string, amount: number, price: number, currency: Currency) => void;
  sellCrypto: (symbol: string, amount: number, price: number) => void;
  setOnboarded: (v: boolean) => void;
  toggleHideBalance: () => void;
  setBiometric: (v: boolean) => void;
  setFaceId: (v: boolean) => void;
  setActiveCurrency: (c: Currency) => void;
  setLocale: (l: Locale) => void;
  updateUser: (patch: Partial<AppState["user"]>) => void;
  addTransaction: (t: Transaction) => void;
  addCard: (c: SavedCard) => void;
};

const seededTransactions: Transaction[] = [
  {
    id: "t1",
    name: "Holmes Burger",
    category: "Food & Restaurants",
    amount: -52.0,
    currency: "USD",
    date: new Date().toISOString(),
  },
  {
    id: "t2",
    name: "Ali Mohamed",
    category: "Money Received",
    amount: 6.0,
    currency: "USD",
    date: new Date().toISOString(),
  },
  {
    id: "t3",
    name: "Roaa Ali",
    category: "Money Sent",
    amount: -2.0,
    currency: "USD",
    date: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "t4",
    name: "Internet",
    category: "Bills",
    amount: -1.0,
    currency: "USD",
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "t5",
    name: "ADB Bank",
    category: "Money Received",
    amount: 8.0,
    currency: "USD",
    date: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "t6",
    name: "Holmes Burger",
    category: "Food & Restaurants",
    amount: -52.0,
    currency: "USD",
    date: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: "t7",
    name: "Holmes Burger",
    category: "Food & Restaurants",
    amount: 6.0,
    currency: "USD",
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "t8",
    name: "Roaa Ali",
    category: "Money Sent",
    amount: -2.0,
    currency: "USD",
    date: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
];

const seededCards: SavedCard[] = [
  {
    id: "c1",
    brand: "mastercard",
    last4: "4242",
    exp: "08/27",
    name: "Mahmoud Hafez",
    isActive: true,
    atmEnabled: true,
  },
  {
    id: "c2",
    brand: "mastercard",
    last4: "7821",
    exp: "01/26",
    name: "Mahmoud Hafez",
    isActive: true,
    atmEnabled: false,
  },
];

const seededAgents: AgentProfile[] = [
  {
    id: "a1",
    name: "QuickCash Express",
    address: "12 Al Rashid St, Dubai",
    distance: "0.3 km",
    rating: 4.8,
    openNow: true,
    lat: 25.2048,
    lng: 55.2708,
    floatLimit: 5000,
  },
  {
    id: "a2",
    name: "PayPoint Central",
    address: "45 Sheikh Zayed Rd, Dubai",
    distance: "0.7 km",
    rating: 4.5,
    openNow: true,
    lat: 25.1972,
    lng: 55.2796,
    floatLimit: 10000,
  },
  {
    id: "a3",
    name: "City Cash Hub",
    address: "78 Jumeirah Blvd, Dubai",
    distance: "1.2 km",
    rating: 4.2,
    openNow: false,
    lat: 25.2122,
    lng: 55.2623,
    floatLimit: 3000,
  },
  {
    id: "a4",
    name: "Metro Money Services",
    address: "23 Business Bay, Dubai",
    distance: "1.8 km",
    rating: 4.7,
    openNow: true,
    lat: 25.1867,
    lng: 55.2614,
    floatLimit: 8000,
  },
  {
    id: "a5",
    name: "Sunrise Financial",
    address: "9 Marina Walk, Dubai",
    distance: "2.1 km",
    rating: 4.0,
    openNow: false,
    lat: 25.0819,
    lng: 55.1367,
    floatLimit: 2500,
  },
];

const seededBNPL: BNPLInstallment[] = [
  {
    id: "bnpl-1",
    merchantName: "Apple Store",
    totalAmount: 1299,
    installments: 12,
    paidCount: 4,
    amountPerInstallment: 108.25,
    nextDueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    currency: "USD",
    lateFee: 5,
    status: "active",
  },
  {
    id: "bnpl-2",
    merchantName: "Samsung Galaxy",
    totalAmount: 799,
    installments: 6,
    paidCount: 5,
    amountPerInstallment: 133.17,
    nextDueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
    currency: "USD",
    lateFee: 5,
    status: "active",
  },
  {
    id: "bnpl-3",
    merchantName: "IKEA Furniture",
    totalAmount: 450,
    installments: 3,
    paidCount: 3,
    amountPerInstallment: 150,
    nextDueDate: new Date(Date.now() - 5 * 86400000).toISOString(),
    currency: "USD",
    lateFee: 0,
    status: "completed",
  },
];

const seededVouchers: Voucher[] = [
  {
    id: "v1",
    type: "gift_card",
    merchant: "Amazon",
    value: 50,
    currency: "USD",
    code: "AMZN-X9K2-7YBP",
    expiresAt: new Date(Date.now() + 90 * 86400000).toISOString(),
    isUsed: false,
  },
  {
    id: "v2",
    type: "mobile_topup",
    merchant: "du Telecom",
    value: 25,
    currency: "USD",
    code: "DU-TOP-4521-H",
    expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    isUsed: false,
  },
  {
    id: "v3",
    type: "service_credit",
    merchant: "Netflix",
    value: 15,
    currency: "USD",
    code: "NFLX-2024-Q1ZZ",
    expiresAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    redeemedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    isUsed: true,
  },
];

const seededGoals: WalletGoal[] = [
  {
    id: "g1",
    name: "New Laptop",
    emoji: "💻",
    targetAmount: 1500,
    savedAmount: 620,
    currency: "USD",
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: "g2",
    name: "Vacation",
    emoji: "✈️",
    targetAmount: 3000,
    savedAmount: 1850,
    currency: "USD",
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
];

const seededScheduled: ScheduledPayment[] = [
  {
    id: "sp1",
    recipient: "Roaa Ali",
    recipientPhone: "0101663645",
    amount: 200,
    currency: "USD",
    frequency: "monthly",
    nextDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    type: "transfer",
    isActive: true,
    note: "Monthly allowance",
  },
  {
    id: "sp2",
    recipient: "Etisalat",
    amount: 85,
    currency: "USD",
    frequency: "monthly",
    nextDate: new Date(Date.now() + 12 * 86400000).toISOString(),
    type: "bill",
    isActive: true,
  },
];

const seededSavings: SavingsPlan[] = [
  {
    id: "sav1",
    name: "Emergency Fund",
    emoji: "🛡️",
    targetAmount: 5000,
    savedAmount: 2400,
    contributionAmount: 200,
    frequency: "monthly",
    interestRate: 2.5,
    currency: "USD",
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    isActive: true,
  },
  {
    id: "sav2",
    name: "Ramadan Savings",
    emoji: "🌙",
    targetAmount: 1000,
    savedAmount: 750,
    contributionAmount: 50,
    frequency: "weekly",
    lockUntil: new Date(Date.now() + 45 * 86400000).toISOString(),
    currency: "USD",
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    isActive: true,
  },
];

const seededReferrals: Referral[] = [
  {
    id: "r1",
    name: "Ahmed Karimi",
    joinedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    pointsEarned: 250,
  },
  {
    id: "r2",
    name: "Sara Nasser",
    joinedAt: new Date(Date.now() - 40 * 86400000).toISOString(),
    pointsEarned: 250,
  },
];

const seededStocks: StockHolding[] = [
  {
    id: "stk1",
    ticker: "AAPL",
    companyName: "Apple Inc.",
    shares: 3,
    avgBuyPrice: 171.5,
    currentPrice: 189.3,
    currency: "USD",
  },
  {
    id: "stk2",
    ticker: "AMZN",
    companyName: "Amazon.com Inc.",
    shares: 2,
    avgBuyPrice: 178.2,
    currentPrice: 192.1,
    currency: "USD",
  },
  {
    id: "stk3",
    ticker: "TSLA",
    companyName: "Tesla Inc.",
    shares: 5,
    avgBuyPrice: 245.0,
    currentPrice: 218.4,
    currency: "USD",
  },
];

const seededCrypto: CryptoHolding[] = [
  {
    id: "cry1",
    symbol: "BTC",
    name: "Bitcoin",
    amount: 0.05,
    avgBuyPrice: 58000,
    currentPrice: 67400,
    currency: "USD",
  },
  {
    id: "cry2",
    symbol: "ETH",
    name: "Ethereum",
    amount: 0.8,
    avgBuyPrice: 3100,
    currentPrice: 3520,
    currency: "USD",
  },
  {
    id: "cry3",
    symbol: "SOL",
    name: "Solana",
    amount: 12,
    avgBuyPrice: 145,
    currentPrice: 168,
    currency: "USD",
  },
];

export const useApp = create<AppState>()(
  persist(
    (set) => ({
      bootstrapped: false,
      hasOnboarded: false,
      user: {
        fullName: "Mahmoud Hafez",
        username: "@Mahmoudhafez",
        email: "Mahmoudrafathafez@gmail.com",
        phone: "+8801514855445158",
        dob: "16/07/1998",
        gender: "Male",
      },
      balances: { USD: 8600, AED: 8800, CAD: 0, AUD: 0 },
      activeCurrency: "USD",
      hideBalance: false,
      biometricEnabled: true,
      faceIdEnabled: false,
      locale: "en",
      transactions: seededTransactions,
      cards: seededCards,

      visaDirectTxs: [],

      sendVisaDirect: (tx) =>
        set((s) => ({
          visaDirectTxs: [tx, ...s.visaDirectTxs],
          balances: { ...s.balances, [tx.currency]: s.balances[tx.currency] - tx.amount - tx.fee },
          transactions: [
            {
              id: tx.id,
              name: tx.recipientName,
              category: "Visa Direct",
              amount: -(tx.amount + tx.fee),
              currency: tx.currency,
              date: tx.date,
              txType: "visa_direct",
            },
            ...s.transactions,
          ],
        })),

      agents: seededAgents,
      cashInAgent: (agentId, amount, currency) =>
        set((s) => ({
          balances: { ...s.balances, [currency]: s.balances[currency] + amount },
          transactions: [
            {
              id: "agt-in-" + Date.now(),
              name: s.agents.find((a) => a.id === agentId)?.name ?? "Agent",
              category: "Cash In",
              amount,
              currency,
              date: new Date().toISOString(),
              txType: "agent_cashin",
            },
            ...s.transactions,
          ],
        })),
      cashOutAgent: (agentId, amount, currency) =>
        set((s) => ({
          balances: { ...s.balances, [currency]: s.balances[currency] - amount },
          transactions: [
            {
              id: "agt-out-" + Date.now(),
              name: s.agents.find((a) => a.id === agentId)?.name ?? "Agent",
              category: "Cash Out",
              amount: -amount,
              currency,
              date: new Date().toISOString(),
              txType: "agent_cashout",
            },
            ...s.transactions,
          ],
        })),

      bnplInstallments: seededBNPL,
      addBNPL: (item) => set((s) => ({ bnplInstallments: [item, ...s.bnplInstallments] })),
      repayBNPL: (id) =>
        set((s) => ({
          bnplInstallments: s.bnplInstallments.map((b) =>
            b.id === id ? { ...b, paidCount: Math.min(b.paidCount + 1, b.installments) } : b,
          ),
        })),

      vouchers: seededVouchers,
      addVoucher: (v) => set((s) => ({ vouchers: [v, ...s.vouchers] })),
      redeemVoucher: (id) =>
        set((s) => ({
          vouchers: s.vouchers.map((v) =>
            v.id === id ? { ...v, isUsed: true, redeemedAt: new Date().toISOString() } : v,
          ),
        })),

      loyaltyPoints: 1240,
      loyaltyLevel: "Silver",
      referrals: seededReferrals,
      redeemLoyaltyPoints: (points) =>
        set((s) => ({ loyaltyPoints: Math.max(0, s.loyaltyPoints - points) })),
      addReferral: (r) => set((s) => ({ referrals: [r, ...s.referrals] })),

      goals: seededGoals,
      addGoal: (g) => set((s) => ({ goals: [g, ...s.goals] })),
      depositGoal: (id, amount) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === id ? { ...g, savedAmount: g.savedAmount + amount } : g,
          ),
          balances: { ...s.balances, [s.activeCurrency]: s.balances[s.activeCurrency] - amount },
        })),
      withdrawGoal: (id, amount) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === id ? { ...g, savedAmount: Math.max(0, g.savedAmount - amount) } : g,
          ),
          balances: { ...s.balances, [s.activeCurrency]: s.balances[s.activeCurrency] + amount },
        })),

      scheduledPayments: seededScheduled,
      addScheduledPayment: (p) => set((s) => ({ scheduledPayments: [p, ...s.scheduledPayments] })),
      toggleScheduledPayment: (id) =>
        set((s) => ({
          scheduledPayments: s.scheduledPayments.map((p) =>
            p.id === id ? { ...p, isActive: !p.isActive } : p,
          ),
        })),
      deleteScheduledPayment: (id) =>
        set((s) => ({ scheduledPayments: s.scheduledPayments.filter((p) => p.id !== id) })),

      savingsPlans: seededSavings,
      addSavingsPlan: (p) => set((s) => ({ savingsPlans: [p, ...s.savingsPlans] })),
      contributeSavings: (id, amount) =>
        set((s) => ({
          savingsPlans: s.savingsPlans.map((p) =>
            p.id === id ? { ...p, savedAmount: p.savedAmount + amount } : p,
          ),
          balances: { ...s.balances, [s.activeCurrency]: s.balances[s.activeCurrency] - amount },
        })),
      withdrawSavings: (id, amount) =>
        set((s) => ({
          savingsPlans: s.savingsPlans.map((p) =>
            p.id === id ? { ...p, savedAmount: Math.max(0, p.savedAmount - amount) } : p,
          ),
          balances: { ...s.balances, [s.activeCurrency]: s.balances[s.activeCurrency] + amount },
        })),

      stockHoldings: seededStocks,
      buyStock: (ticker, shares, price, currency) =>
        set((s) => {
          const existing = s.stockHoldings.find((h) => h.ticker === ticker);
          if (existing) {
            return {
              stockHoldings: s.stockHoldings.map((h) =>
                h.ticker === ticker
                  ? {
                      ...h,
                      shares: h.shares + shares,
                      avgBuyPrice:
                        (h.avgBuyPrice * h.shares + price * shares) / (h.shares + shares),
                    }
                  : h,
              ),
              balances: { ...s.balances, [currency]: s.balances[currency] - shares * price },
            };
          }
          return {
            stockHoldings: [
              ...s.stockHoldings,
              {
                id: "stk-" + Date.now(),
                ticker,
                companyName: ticker,
                shares,
                avgBuyPrice: price,
                currentPrice: price,
                currency,
              },
            ],
            balances: { ...s.balances, [currency]: s.balances[currency] - shares * price },
          };
        }),
      sellStock: (ticker, shares, price) =>
        set((s) => ({
          stockHoldings: s.stockHoldings
            .map((h) =>
              h.ticker === ticker ? { ...h, shares: Math.max(0, h.shares - shares) } : h,
            )
            .filter((h) => h.shares > 0),
          balances: {
            ...s.balances,
            [s.activeCurrency]: s.balances[s.activeCurrency] + shares * price,
          },
        })),

      cryptoHoldings: seededCrypto,
      buyCrypto: (symbol, amount, price, currency) =>
        set((s) => {
          const existing = s.cryptoHoldings.find((h) => h.symbol === symbol);
          if (existing) {
            return {
              cryptoHoldings: s.cryptoHoldings.map((h) =>
                h.symbol === symbol
                  ? {
                      ...h,
                      amount: h.amount + amount,
                      avgBuyPrice:
                        (h.avgBuyPrice * h.amount + price * amount) / (h.amount + amount),
                    }
                  : h,
              ),
              balances: { ...s.balances, [currency]: s.balances[currency] - amount * price },
            };
          }
          return {
            cryptoHoldings: [
              ...s.cryptoHoldings,
              {
                id: "cry-" + Date.now(),
                symbol,
                name: symbol,
                amount,
                avgBuyPrice: price,
                currentPrice: price,
                currency,
              },
            ],
            balances: { ...s.balances, [currency]: s.balances[currency] - amount * price },
          };
        }),
      sellCrypto: (symbol, amount, price) =>
        set((s) => ({
          cryptoHoldings: s.cryptoHoldings
            .map((h) =>
              h.symbol === symbol ? { ...h, amount: Math.max(0, h.amount - amount) } : h,
            )
            .filter((h) => h.amount > 0),
          balances: {
            ...s.balances,
            [s.activeCurrency]: s.balances[s.activeCurrency] + amount * price,
          },
        })),

      setOnboarded: (v) => set({ hasOnboarded: v }),
      toggleHideBalance: () => set((s) => ({ hideBalance: !s.hideBalance })),
      setBiometric: (v) => set({ biometricEnabled: v }),
      setFaceId: (v) => set({ faceIdEnabled: v }),
      setActiveCurrency: (c) => set({ activeCurrency: c }),
      setLocale: (l) => set({ locale: l }),
      updateUser: (patch) => set((s) => ({ user: { ...s.user, ...patch } })),
      addTransaction: (t) => set((s) => ({ transactions: [t, ...s.transactions] })),
      addCard: (c) => set((s) => ({ cards: [...s.cards, c] })),
    }),
    {
      // Bump the persist name to invalidate stale records with isAuthenticated/setAuthenticated.
      name: "zadpay-store-v6",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        hasOnboarded: s.hasOnboarded,
        user: s.user,
        balances: s.balances,
        activeCurrency: s.activeCurrency,
        hideBalance: s.hideBalance,
        biometricEnabled: s.biometricEnabled,
        faceIdEnabled: s.faceIdEnabled,
        locale: s.locale,
        transactions: s.transactions,
        cards: s.cards,
        visaDirectTxs: s.visaDirectTxs,
        bnplInstallments: s.bnplInstallments,
        vouchers: s.vouchers,
        loyaltyPoints: s.loyaltyPoints,
        loyaltyLevel: s.loyaltyLevel,
        referrals: s.referrals,
        goals: s.goals,
        scheduledPayments: s.scheduledPayments,
        savingsPlans: s.savingsPlans,
        stockHoldings: s.stockHoldings,
        cryptoHoldings: s.cryptoHoldings,
      }),
    },
  ),
);
