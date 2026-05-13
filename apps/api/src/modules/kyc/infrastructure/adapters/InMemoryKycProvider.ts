import { logger } from "../../../../infra/logger/index.js";
import type { KycDecisionCallback, KycProvider } from "../../domain/ports/KycProvider.js";

// Dev / test provider. Schedules an auto-approval after a configurable
// delay so the demo can run end-to-end without a real KYC vendor.
// Production swaps this for SumsubKycProvider et al (Phase 2).
export class InMemoryKycProvider implements KycProvider {
  constructor(
    private readonly autoApproveAfterMs: number,
    private readonly onDecision: KycDecisionCallback,
  ) {}

  async submitForReview(applicationId: string): Promise<void> {
    const after = this.autoApproveAfterMs;
    setTimeout(() => {
      void this.onDecision({
        applicationId,
        decision: "approved",
        providerRef: `inmem-${applicationId.slice(0, 8)}`,
      }).catch((err: unknown) => {
        logger.error({ err, applicationId }, "InMemoryKycProvider auto-decision failed");
      });
    }, after).unref();
  }
}
