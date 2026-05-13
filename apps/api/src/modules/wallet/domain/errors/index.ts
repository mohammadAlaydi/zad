import { ConflictError, NotFoundError, UnprocessableError } from "@zadpay/errors";

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
