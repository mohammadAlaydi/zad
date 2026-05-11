import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Locale } from "@/i18n";

export type Currency = "USD" | "AED" | "CAD" | "AUD";

export type Transaction = {
  id: string;
  name: string;
  category: string;
  amount: number; // negative = outgoing, positive = incoming
  currency: Currency;
  date: string; // ISO
  avatar?: string;
};

export type SavedCard = {
  id: string;
  brand: "mastercard" | "visa";
  last4: string;
  exp: string;
  name: string;
};

export type AppState = {
  bootstrapped: boolean;
  hasOnboarded: boolean;
  isAuthenticated: boolean;
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
  setOnboarded: (v: boolean) => void;
  setAuthenticated: (v: boolean) => void;
  toggleHideBalance: () => void;
  setBiometric: (v: boolean) => void;
  setFaceId: (v: boolean) => void;
  setActiveCurrency: (c: Currency) => void;
  setLocale: (l: Locale) => void;
  updateUser: (patch: Partial<AppState["user"]>) => void;
  addTransaction: (t: Transaction) => void;
  addCard: (c: SavedCard) => void;
  signOut: () => void;
};

const seededTransactions: Transaction[] = [
  { id: "t1", name: "Holmes Burger", category: "Food & Restaurants", amount: -52.0, currency: "USD", date: new Date().toISOString() },
  { id: "t2", name: "Ali Mohamed", category: "Money Received", amount: 6.0, currency: "USD", date: new Date().toISOString() },
  { id: "t3", name: "Roaa Ali", category: "Money Sent", amount: -2.0, currency: "USD", date: new Date(Date.now() - 86400000).toISOString() },
  { id: "t4", name: "Internet", category: "Bills", amount: -1.0, currency: "USD", date: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: "t5", name: "ADB Bank", category: "Money Received", amount: 8.0, currency: "USD", date: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: "t6", name: "Holmes Burger", category: "Food & Restaurants", amount: -52.0, currency: "USD", date: new Date(Date.now() - 86400000 * 4).toISOString() },
  { id: "t7", name: "Holmes Burger", category: "Food & Restaurants", amount: 6.0, currency: "USD", date: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: "t8", name: "Roaa Ali", category: "Money Sent", amount: -2.0, currency: "USD", date: new Date(Date.now() - 86400000 * 6).toISOString() },
];

const seededCards: SavedCard[] = [
  { id: "c1", brand: "mastercard", last4: "4242", exp: "08/27", name: "Mahmoud Hafez" },
  { id: "c2", brand: "mastercard", last4: "7821", exp: "01/26", name: "Mahmoud Hafez" },
];

export const useApp = create<AppState>()(
  persist(
    (set) => ({
      bootstrapped: false,
      hasOnboarded: true, // pre-seeded
      isAuthenticated: true, // pre-seeded
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
      setOnboarded: (v) => set({ hasOnboarded: v }),
      setAuthenticated: (v) => set({ isAuthenticated: v }),
      toggleHideBalance: () => set((s) => ({ hideBalance: !s.hideBalance })),
      setBiometric: (v) => set({ biometricEnabled: v }),
      setFaceId: (v) => set({ faceIdEnabled: v }),
      setActiveCurrency: (c) => set({ activeCurrency: c }),
      setLocale: (l) => set({ locale: l }),
      updateUser: (patch) => set((s) => ({ user: { ...s.user, ...patch } })),
      addTransaction: (t) => set((s) => ({ transactions: [t, ...s.transactions] })),
      addCard: (c) => set((s) => ({ cards: [...s.cards, c] })),
      signOut: () => set({ isAuthenticated: false, hasOnboarded: false }),
    }),
    {
      name: "zadpay-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        hasOnboarded: s.hasOnboarded,
        isAuthenticated: s.isAuthenticated,
        user: s.user,
        balances: s.balances,
        activeCurrency: s.activeCurrency,
        hideBalance: s.hideBalance,
        biometricEnabled: s.biometricEnabled,
        faceIdEnabled: s.faceIdEnabled,
        locale: s.locale,
        transactions: s.transactions,
        cards: s.cards,
      }),
    },
  ),
);
