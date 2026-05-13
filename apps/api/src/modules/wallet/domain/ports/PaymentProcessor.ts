import type { Result } from "@zadpay/errors";
import type { Money } from "@zadpay/types";
import type { ProcessorRejected } from "../errors/index.js";

// Pluggable processor adapter per ADR-0008/ADR-0007. Phase 2 wires Stripe
// / Adyen / Checkout.com implementations; PR-11 ships an in-memory stub
// that always succeeds so the demo flows.

export interface SubmitTopupInput {
  userId: string;
  amount: Money;
  source: string; // tokenized PAN / saved-payment-method id — never raw card data
}

export interface SubmitWithdrawalInput {
  userId: string;
  amount: Money;
  destination: string; // tokenized bank account ref
}

export interface ProcessorReceipt {
  providerRef: string;
}

export interface PaymentProcessor {
  submitTopup(input: SubmitTopupInput): Promise<Result<ProcessorReceipt, ProcessorRejected>>;
  submitWithdrawal(
    input: SubmitWithdrawalInput,
  ): Promise<Result<ProcessorReceipt, ProcessorRejected>>;
}
