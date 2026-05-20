import { err, ok, type Result } from "@zadpay/errors";
import { type Currency } from "@zadpay/types";
import type { Transaction } from "../../domain/entities/Transaction.js";
import {
  AccountNotFound,
  type CurrencyMismatch,
  type InsufficientBalance,
  type InvalidAmount,
  InvalidPassword,
  RecipientNotFound,
  type SameAccountTransfer,
} from "../../domain/errors/index.js";
import type { AccountRepository } from "../../domain/ports/AccountRepository.js";
import type { CallerPasswordVerifier } from "../../domain/ports/CallerPasswordVerifier.js";
import type { RecipientDirectory } from "../../domain/ports/RecipientDirectory.js";
import type { CreateTransferCommand } from "./CreateTransfer.js";

export interface SendByPhoneInput {
  userId: string;
  idempotencyKey: string;
  recipientPhone: string;
  password: string;
  amount: { amount: bigint; currency: Currency };
  note?: string;
}

export interface SendByPhoneOutput {
  transaction: Transaction;
  recipient: { userId: string; fullName: string; phone: string };
}

export type SendByPhoneError =
  | InvalidPassword
  | RecipientNotFound
  | AccountNotFound
  | SameAccountTransfer
  | InsufficientBalance
  | CurrencyMismatch
  | InvalidAmount;

export interface SendByPhoneDeps {
  accounts: AccountRepository;
  passwords: CallerPasswordVerifier;
  recipients: RecipientDirectory;
  createTransfer: CreateTransferCommand;
}

// User-friendly send flow used by the mobile client.
//   1. Verify the caller's password (Argon2). Wrong → InvalidPassword.
//   2. Resolve the recipient phone to a user. Missing → RecipientNotFound.
//      Self-send is rejected at the resolver layer for clarity.
//   3. Resolve both wallets (caller's + recipient's) in the requested
//      currency. Missing → AccountNotFound.
//   4. Hand off to CreateTransferCommand which does the atomic ledger
//      write and the balance check.
export class SendByPhoneCommand {
  constructor(private readonly deps: SendByPhoneDeps) {}

  async execute(input: SendByPhoneInput): Promise<Result<SendByPhoneOutput, SendByPhoneError>> {
    const passwordOk = await this.deps.passwords.verify(input.userId, input.password);
    if (!passwordOk) return err(new InvalidPassword());

    const recipient = await this.deps.recipients.byPhone(input.recipientPhone);
    if (recipient === null || recipient.userId === input.userId) {
      return err(new RecipientNotFound());
    }

    const sourceAccount = await this.deps.accounts.findByOwnerAndCurrency(
      input.userId,
      input.amount.currency,
      "wallet",
    );
    if (sourceAccount === null) return err(new AccountNotFound());

    const destAccount = await this.deps.accounts.findByOwnerAndCurrency(
      recipient.userId,
      input.amount.currency,
      "wallet",
    );
    if (destAccount === null) return err(new AccountNotFound());

    const transferResult = await this.deps.createTransfer.execute({
      userId: input.userId,
      idempotencyKey: input.idempotencyKey,
      sourceAccountId: sourceAccount.id,
      destAccountId: destAccount.id,
      amount: input.amount,
      ...(input.note === undefined ? {} : { note: input.note }),
    });
    if (!transferResult.ok) return transferResult;

    return ok({
      transaction: transferResult.value,
      recipient: {
        userId: recipient.userId,
        fullName: recipient.fullName ?? "ZADPAY user",
        phone: recipient.phone,
      },
    });
  }
}
