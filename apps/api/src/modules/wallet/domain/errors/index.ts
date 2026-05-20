import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  UnprocessableError,
} from "@zadpay/errors";

export class AccountNotFound extends NotFoundError {
  override readonly code = "WALLET.ACCOUNT_NOT_FOUND";
  constructor() {
    super("Account not found");
  }
}

export class AccountAccessDenied extends NotFoundError {
  // 404 not 403 — don't leak account existence to non-owners.
  override readonly code = "WALLET.ACCOUNT_NOT_FOUND";
  constructor() {
    super("Account not found");
  }
}

export class TransactionNotFound extends NotFoundError {
  override readonly code = "WALLET.TRANSACTION_NOT_FOUND";
  constructor() {
    super("Transaction not found");
  }
}

export class InsufficientBalance extends UnprocessableError {
  override readonly code = "WALLET.INSUFFICIENT_BALANCE";
  constructor() {
    super("Insufficient balance");
  }
}

export class CurrencyMismatch extends UnprocessableError {
  override readonly code = "WALLET.CURRENCY_MISMATCH";
  constructor() {
    super("Accounts have different currencies");
  }
}

export class AccountAlreadyExists extends ConflictError {
  override readonly code = "WALLET.ACCOUNT_ALREADY_EXISTS";
  constructor() {
    super("An account of this type and currency already exists for this user");
  }
}

export class SameAccountTransfer extends UnprocessableError {
  override readonly code = "WALLET.SAME_ACCOUNT_TRANSFER";
  constructor() {
    super("Source and destination accounts must differ");
  }
}

export class InvalidAmount extends UnprocessableError {
  override readonly code = "WALLET.INVALID_AMOUNT";
  constructor() {
    super("Amount must be a positive integer");
  }
}

// Processor refused (e.g. card declined, bank rejected destination).
export class ProcessorRejected extends UnprocessableError {
  override readonly code = "WALLET.PROCESSOR_REJECTED";
  constructor(reason: string) {
    super(`Payment processor rejected the request: ${reason}`, { reason });
  }
}

// Phone-based send: no ZADPAY user found for the recipient phone.
export class RecipientNotFound extends NotFoundError {
  override readonly code = "WALLET.RECIPIENT_NOT_FOUND";
  constructor() {
    super("No ZADPAY user found with this phone number");
  }
}

// Phone-based send: sender entered the wrong password.
export class InvalidPassword extends UnauthorizedError {
  override readonly code = "WALLET.INVALID_PASSWORD";
  constructor() {
    super("Password is incorrect");
  }
}
