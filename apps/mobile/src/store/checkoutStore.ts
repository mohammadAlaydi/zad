import { create } from "zustand";

export type PaymentMethod = "wallet" | "card" | "loyalty";
export type CheckoutStatus = "idle" | "authenticating" | "processing" | "success" | "failed";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

export type MerchantInfo = {
  id: string;
  name: string;
  logo?: string;
  verified: boolean;
};

type CheckoutState = {
  merchant: MerchantInfo | null;
  cart: CartItem[];
  paymentMethod: PaymentMethod;
  useLoyltyPoints: boolean;
  loyaltyBalance: number;
  status: CheckoutStatus;
  oauthConnected: boolean;
  fraudChecked: boolean;
  purchaseHistory: { id: string; merchant: string; amount: number; date: string; items: number }[];
  setMerchant: (m: MerchantInfo) => void;
  setPaymentMethod: (m: PaymentMethod) => void;
  toggleLoyalty: () => void;
  setStatus: (s: CheckoutStatus) => void;
  setOAuthConnected: (v: boolean) => void;
  processPayment: () => void;
  clearCart: () => void;
};

const sampleCart: CartItem[] = [
  { id: "ci1", name: "Wireless Earbuds Pro", price: 79.99, quantity: 1 },
  { id: "ci2", name: "Phone Case - Clear", price: 15.99, quantity: 2 },
  { id: "ci3", name: "USB-C Cable 2m", price: 12.5, quantity: 1 },
];

const sampleHistory = [
  {
    id: "ph1",
    merchant: "TechStore",
    amount: 245.0,
    date: new Date(Date.now() - 604800000).toISOString(),
    items: 3,
  },
  {
    id: "ph2",
    merchant: "FashionHub",
    amount: 89.5,
    date: new Date(Date.now() - 1209600000).toISOString(),
    items: 2,
  },
  {
    id: "ph3",
    merchant: "GroceryMart",
    amount: 56.75,
    date: new Date(Date.now() - 2592000000).toISOString(),
    items: 8,
  },
];

export const useCheckoutStore = create<CheckoutState>((set, get) => ({
  merchant: { id: "m1", name: "TechStore", verified: true },
  cart: sampleCart,
  paymentMethod: "wallet",
  useLoyltyPoints: false,
  loyaltyBalance: 1250,
  status: "idle",
  oauthConnected: false,
  fraudChecked: false,
  purchaseHistory: sampleHistory,

  setMerchant: (m) => set({ merchant: m }),
  setPaymentMethod: (m) => set({ paymentMethod: m }),
  toggleLoyalty: () => set((s) => ({ useLoyltyPoints: !s.useLoyltyPoints })),
  setStatus: (s) => set({ status: s }),
  setOAuthConnected: (v) => set({ oauthConnected: v }),

  processPayment: () => {
    set({ status: "processing", fraudChecked: true });
    setTimeout(() => {
      set({ status: "success" });
    }, 2500);
  },

  clearCart: () => set({ cart: [], status: "idle" }),
}));
