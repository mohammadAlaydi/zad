import { create } from "zustand";

export type PaymentMethod = "wallet" | "card" | "loyalty";
export type CheckoutStatus = "idle" | "authenticating" | "processing" | "success" | "failed";

export type CartItem = {
  id: string;
  name: string;
  price: number; // major units (e.g. dollars). Converted to minor for the API.
  quantity: number;
  image?: string;
};

export type MerchantInfo = {
  id: string;
  name: string;
  // Phone of the merchant account on ZADPAY. Required for the backend
  // checkout endpoint — that's how we resolve which wallet to credit.
  phone: string;
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
  errorMessage: string | null;
  purchaseHistory: { id: string; merchant: string; amount: number; date: string; items: number }[];
  setMerchant: (m: MerchantInfo) => void;
  setPaymentMethod: (m: PaymentMethod) => void;
  toggleLoyalty: () => void;
  setStatus: (s: CheckoutStatus) => void;
  setOAuthConnected: (v: boolean) => void;
  setError: (msg: string | null) => void;
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

// Placeholder merchant for the demo entry point. Swap `phone` for a real
// ZADPAY account phone that exists on the server before testing — the
// backend resolves this to a userId via identity.phoneLookup and credits
// that user's wallet on a successful purchase. The customer cannot be the
// merchant — the backend returns CHECKOUT.MERCHANT_NOT_FOUND if they are.
const DEMO_MERCHANT: MerchantInfo = {
  id: "m1",
  name: "TechStore",
  phone: "+10000000001",
  verified: true,
};

export const useCheckoutStore = create<CheckoutState>((set) => ({
  merchant: DEMO_MERCHANT,
  cart: sampleCart,
  paymentMethod: "wallet",
  useLoyltyPoints: false,
  loyaltyBalance: 1250,
  status: "idle",
  oauthConnected: false,
  fraudChecked: false,
  errorMessage: null,
  purchaseHistory: sampleHistory,

  setMerchant: (m) => set({ merchant: m }),
  setPaymentMethod: (m) => set({ paymentMethod: m }),
  toggleLoyalty: () => set((s) => ({ useLoyltyPoints: !s.useLoyltyPoints })),
  setStatus: (s) => set({ status: s }),
  setOAuthConnected: (v) => set({ oauthConnected: v }),
  setError: (errorMessage) => set({ errorMessage }),

  clearCart: () => set({ cart: [], status: "idle", errorMessage: null }),
}));
