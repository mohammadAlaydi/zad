// Public surface of the KYC module. Other modules subscribe to the events
// here (identity listens for Approved/Rejected to update User.kycStatus).
// Internal layers (domain/, application/, infrastructure/, interface/)
// remain private — ESLint enforces it.

export type {
  KycApplicationApproved,
  KycApplicationCreated,
  KycApplicationRejected,
  KycApplicationSubmitted,
  KycDocumentUploaded,
} from "./domain/events/index.js";

export { registerKycModule } from "./register.js";
export type { KycModuleConfig } from "./register.js";
