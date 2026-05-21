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
  status: CheckoutStatus;
  errorMessage: string | null;
  setIntent: (merchant: MerchantInfo, cart: CartItem[]) => void;
  setPaymentMethod: (m: PaymentMethod) => void;
  setStatus: (s: CheckoutStatus) => void;
  setError: (msg: string | null) => void;
  reset: () => void;
};

// Checkout intent is set by the entry route (/checkout) reading url params
// from the merchant's deep link, or by a future backend lookup. The store
// starts EMPTY — the screen shows a "no checkout in progress" state when
// nothing is set, and that's the correct UX when the user opens /checkout
// directly without a merchant context.
export const useCheckoutStore = create<CheckoutState>((set) => ({
  merchant: null,
  cart: [],
  paymentMethod: "wallet",
  status: "idle",
  errorMessage: null,

  setIntent: (merchant, cart) => set({ merchant, cart, status: "idle", errorMessage: null }),
  setPaymentMethod: (m) => set({ paymentMethod: m }),
  setStatus: (s) => set({ status: s }),
  setError: (errorMessage) => set({ errorMessage }),

  reset: () =>
    set({
      merchant: null,
      cart: [],
      paymentMethod: "wallet",
      status: "idle",
      errorMessage: null,
    }),
}));
