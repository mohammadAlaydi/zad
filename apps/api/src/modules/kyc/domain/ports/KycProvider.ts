// Provider abstraction per ADR-0008. Adapters: InMemoryKycProvider (dev),
// SumsubKycProvider / OnfidoKycProvider (Phase 2).

export type KycDecisionCallback = (input: {
  applicationId: string;
  decision: "approved" | "rejected";
  providerRef: string | null;
  reason?: string;
}) => Promise<void>;

export interface KycProvider {
  /// Notify the provider that a user has submitted documents and we want a
  /// decision. The provider responds asynchronously by invoking the
  /// decision callback (in-memory) or via webhook (real providers — see
  /// shared/middleware/webhook routes in a future PR).
  submitForReview(applicationId: string): Promise<void>;
}
