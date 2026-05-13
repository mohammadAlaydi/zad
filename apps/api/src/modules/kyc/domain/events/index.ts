import type { DomainEvent } from "../../../../shared/events/DomainEvent.js";

// Public events of the KYC module. Identity subscribes to Approved/Rejected
// to update `users.kyc_status` so the next /v1/auth/refresh issues an
// access token with the right `kyc` claim.

export type KycApplicationCreated = DomainEvent<
  "kyc.ApplicationCreated",
  { applicationId: string; userId: string; provider: string }
>;

export type KycApplicationSubmitted = DomainEvent<
  "kyc.ApplicationSubmitted",
  { applicationId: string; userId: string }
>;

export type KycApplicationApproved = DomainEvent<
  "kyc.ApplicationApproved",
  { applicationId: string; userId: string }
>;

export type KycApplicationRejected = DomainEvent<
  "kyc.ApplicationRejected",
  { applicationId: string; userId: string; reason: string }
>;

export type KycDocumentUploaded = DomainEvent<
  "kyc.DocumentUploaded",
  { applicationId: string; documentId: string; type: string }
>;
