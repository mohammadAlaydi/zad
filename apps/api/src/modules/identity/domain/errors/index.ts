// Domain-specific errors. Codes are stable strings; the HTTP layer maps them
// via the AppError parent class (handler.ts), so adding a new error here
// requires no router changes.

import { ConflictError, NotFoundError, UnauthorizedError } from "@zadpay/errors";

export class InvalidCredentials extends UnauthorizedError {
  override readonly code = "IDENTITY.INVALID_CREDENTIALS";
  constructor() {
    super("Invalid email or password");
  }
}

export class RefreshTokenInvalid extends UnauthorizedError {
  override readonly code = "IDENTITY.REFRESH_TOKEN_INVALID";
  constructor() {
    super("Refresh token is invalid or expired");
  }
}

// Replay (reusing a rotated-out refresh token) is treated as a security
// incident: the entire family is revoked and an event fires for risk.
export class RefreshTokenReplay extends UnauthorizedError {
  override readonly code = "IDENTITY.REFRESH_TOKEN_REPLAY";
  constructor() {
    super("Refresh token replay detected");
  }
}

export class EmailAlreadyExists extends ConflictError {
  override readonly code = "IDENTITY.EMAIL_ALREADY_EXISTS";
  constructor() {
    super("An account with this email already exists");
  }
}

export class PhoneAlreadyExists extends ConflictError {
  override readonly code = "IDENTITY.PHONE_ALREADY_EXISTS";
  constructor() {
    super("An account with this phone number already exists");
  }
}

export class UserNotFound extends NotFoundError {
  override readonly code = "IDENTITY.USER_NOT_FOUND";
  constructor() {
    super("User not found");
  }
}

export class RecipientNotFound extends NotFoundError {
  override readonly code = "IDENTITY.RECIPIENT_NOT_FOUND";
  constructor() {
    super("No ZADPAY user found with this phone number");
  }
}

export class InvalidPassword extends UnauthorizedError {
  override readonly code = "IDENTITY.INVALID_PASSWORD";
  constructor() {
    super("Password is incorrect");
  }
}

export class SessionNotFound extends NotFoundError {
  override readonly code = "IDENTITY.SESSION_NOT_FOUND";
  constructor() {
    super("Session not found or already revoked");
  }
}
