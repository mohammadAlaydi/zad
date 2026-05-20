// Ephemeral cross-screen state for the send-money flow. Lives in memory
// only — never persisted — so a hot reload or a refresh tears it down.
// We use this instead of router params to avoid putting the password into
// expo-router's URL state.

import { create } from "zustand";
import { newIdempotencyKey } from "@/lib/api/idempotency";

export interface SendFlowState {
  recipientPhone: string | null; // E.164
  recipientName: string | null;
  recipientUserId: string | null;
  recipientCurrency: string | null;
  // Minor units (e.g. cents). Stored as a number for ergonomics; minimum
  // step is 1 minor unit.
  amountMinor: number;
  note: string;
  password: string | null;
  // Same idempotency key is reused across retries of the same payment
  // intent, so duplicate Send taps don't double-debit.
  idempotencyKey: string;
  // When set, the send was initiated from a payment request (QR / receive
  // screen). The confirm screen calls markPaymentRequestPaid(id, txId)
  // after a successful transfer so the recipient's request flips to paid.
  pendingRequestId: string | null;

  setRecipient(
    args: {
      phone: string;
      name: string;
      userId: string;
      currency: string;
    } | null,
  ): void;
  setAmountMinor(value: number): void;
  setNote(note: string): void;
  setPassword(password: string | null): void;
  setPendingRequestId(id: string | null): void;
  resetIdempotencyKey(): void;
  resetAll(): void;
}

export const useSendFlow = create<SendFlowState>((set) => ({
  recipientPhone: null,
  recipientName: null,
  recipientUserId: null,
  recipientCurrency: null,
  amountMinor: 0,
  note: "",
  password: null,
  idempotencyKey: newIdempotencyKey(),
  pendingRequestId: null,

  setRecipient(args) {
    set(
      args === null
        ? {
            recipientPhone: null,
            recipientName: null,
            recipientUserId: null,
            recipientCurrency: null,
          }
        : {
            recipientPhone: args.phone,
            recipientName: args.name,
            recipientUserId: args.userId,
            recipientCurrency: args.currency,
          },
    );
  },
  setAmountMinor(value) {
    set({ amountMinor: Math.max(0, Math.round(value)) });
  },
  setNote(note) {
    set({ note });
  },
  setPassword(password) {
    set({ password });
  },
  setPendingRequestId(id) {
    set({ pendingRequestId: id });
  },
  resetIdempotencyKey() {
    set({ idempotencyKey: newIdempotencyKey() });
  },
  resetAll() {
    set({
      recipientPhone: null,
      recipientName: null,
      recipientUserId: null,
      recipientCurrency: null,
      amountMinor: 0,
      note: "",
      password: null,
      idempotencyKey: newIdempotencyKey(),
      pendingRequestId: null,
    });
  },
}));
