import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Locale } from "@/i18n";

export type Currency = "USD" | "AED" | "CAD" | "AUD";

export type Transaction = {
  id: string;
  name: string;
  category: string;
  amount: number;
  currency: Currency;
  date: string;
  avatar?: string;
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

export type AppState = {
  bootstrapped: boolean;
  hasOnboarded: boolean;
  activeCurrency: Currency;
  locale: Locale;
  agents: AgentProfile[];
  setOnboarded: (v: boolean) => void;
  setActiveCurrency: (c: Currency) => void;
  setLocale: (l: Locale) => void;
};

// MVP placeholder pending an Agents Directory API — same pattern as
// the hardcoded bills/operator list.
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

export const useApp = create<AppState>()(
  persist(
    (set) => ({
      bootstrapped: false,
      hasOnboarded: false,
      activeCurrency: "USD",
      locale: "en",
      agents: seededAgents,
      setOnboarded: (v) => set({ hasOnboarded: v }),
      setActiveCurrency: (c) => set({ activeCurrency: c }),
      setLocale: (l) => set({ locale: l }),
    }),
    {
      // v8: dropped all mock seeded slices (transactions, cards, BNPL,
      // vouchers, loyalty, goals, scheduled, savings, stocks, crypto,
      // balances, hide/biometric flags) — these live in the userdata
      // backend now. v7 stores will be discarded on first load.
      name: "zadpay-store-v8",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        hasOnboarded: s.hasOnboarded,
        activeCurrency: s.activeCurrency,
        locale: s.locale,
      }),
    },
  ),
);
