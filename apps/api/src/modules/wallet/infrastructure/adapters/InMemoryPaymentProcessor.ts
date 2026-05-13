import { ok, type Result } from "@zadpay/errors";
import type { ProcessorRejected } from "../../domain/errors/index.js";
import type {
  PaymentProcessor,
  ProcessorReceipt,
  SubmitTopupInput,
  SubmitWithdrawalInput,
} from "../../domain/ports/PaymentProcessor.js";

// Dev / test processor. Always succeeds; returns a deterministic-ish
// provider ref. Production swaps for StripePaymentProcessor (Phase 2).
export class InMemoryPaymentProcessor implements PaymentProcessor {
  private counter = 0;

  async submitTopup(input: SubmitTopupInput): Promise<Result<ProcessorReceipt, ProcessorRejected>> {
    this.counter += 1;
    return ok({ providerRef: `inmem-topup-${input.userId.slice(0, 8)}-${String(this.counter)}` });
  }

  async submitWithdrawal(
    input: SubmitWithdrawalInput,
  ): Promise<Result<ProcessorReceipt, ProcessorRejected>> {
    this.counter += 1;
    return ok({
      providerRef: `inmem-withdrawal-${input.userId.slice(0, 8)}-${String(this.counter)}`,
    });
  }
}
