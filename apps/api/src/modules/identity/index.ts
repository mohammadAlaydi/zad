// Public surface of the identity module. Per ADR-0005, the rest of the
// codebase imports ONLY from this barrel — never from domain/, application/,
// infrastructure/, or interface/ directly. ESLint enforces this.

export type {
  LoginFailed,
  LoginSucceeded,
  RefreshTokenReplayed,
  RefreshTokenRotated,
  UserLoggedOut,
  UserRegistered,
} from "./domain/events/index.js";

// TokenSigner is exposed so the shared/middleware/auth.ts handler can
// verify access tokens minted by this module. Cross-module imports of
// other internals remain forbidden.
export type {
  AccessTokenClaims,
  AccessTokenIssued,
  TokenSigner,
} from "./domain/ports/TokenSigner.js";

// Read-only directory exposed to other modules (e.g. wallet) so they can
// resolve a phone number to a userId without coupling to identity internals.
export type { PhoneLookup, PhoneLookupRecord } from "./application/queries/LookupByPhone.js";
// Reverse: resolve a userId to a profile summary. Used by notifications
// to render the sender/recipient name in push messages.
export type { UserLookup, UserProfileSummary } from "./application/queries/LookupById.js";

export { registerIdentityModule } from "./register.js";
export type { IdentityModuleConfig, IdentityModuleHandles } from "./register.js";
