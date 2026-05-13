import { err, ok, type Result } from "@zadpay/errors";
import { Money, type Currency } from "@zadpay/types";
import type { EventBus } from "../../../../shared/events/EventBus.js";
import type { Transaction } from "../../domain/entities/Transaction.js";
import {
  AccountAccessDenied,
  AccountNotFound,
  CurrencyMismatch,
  type InsufficientBalance,
  InvalidAmount,
  type ProcessorRejected,
} from "../../domain/errors/index.js";
import type { WithdrawalFailed, WithdrawalPosted } from "../../domain/events/index.js";
import type { AccountRepository } from "../../domain/ports/AccountRepository.js";
import type { Clock } from "../../domain/ports/Clock.js";
import type { ExternalClearingWriter } from "../../domain/ports/ExternalClearingWriter.js";
import type { IdGenerator } from "../../domain/ports/IdGenerator.js";
import type { PaymentProcessor } from "../../domain/ports/PaymentProcessor.js";

export interface CreateWithdrawalInput {
  userId: string;
  idempotencyKey: string;
  accountId: string;
  amount: { amount: bigint; currency: Currency };
  destination: string;
}

export type CreateWithdrawalError =
  | AccountNotFound
  | AccountAccessDenied
  | CurrencyMismatch
  | InsufficientBalance
  | InvalidAmount
  | ProcessorRejected;

export interface CreateWithdrawalDeps {
  accounts: AccountRepository;
  processor: PaymentProcessor;
  writer: ExternalClearingWriter;
  ids: IdGenerator;
  clock: Clock;
  events: EventBus;
}

// Flow:
//   1. Validate ownership + currency + amount.
//   2. Post ledger FIRST (debit user_wallet, credit external_clearing).
//      Atomic balance check rejects overdraft.
//   3. Call processor.submitWithdrawal. If it fails AFTER our ledger has
//      posted, log + emit WithdrawalFailed; a reconciliation job will
//      reverse via a compensating transaction (PR-future).
//   This ordering is intentional: the user shouldn't see the funds in
//   their wallet AFTER asking to withdraw, even if the processor lags.
export class CreateWithdrawalCommand {
  constructor(private readonly deps: CreateWithdrawalDeps) {}

  async execute(input: CreateWithdrawalInput): Promise<Result<Transaction, CreateWithdrawalError>> {
    if (input.amount.amount <= 0n) return err(new InvalidAmount());

    const account = await this.deps.accounts.findById(input.accountId);
    if (account === null) return err(new AccountNotFound());
    if (account.ownerId !== input.userId) return err(new AccountAccessDenied());
    if (account.currency !== input.amount.currency) return err(new CurrencyMismatch());

    const money = Money.of(input.amount.amount, input.amount.currency);
    const now = this.deps.clock.now();
    const transactionId = this.deps.ids.uuid();

    const writeResult = await this.deps.writer.postExternalMovement({
      transactionId,
      idempotencyKey: input.idempotencyKey,
      userAccountId: account.id,
      amount: money,
      type: "withdrawal",
      providerRef: `pending-${transactionId}`,
      metadata: {
        userId: input.userId,
        destination: input.destination,
        status: "pending-processor",
      },
      now,
    });
    if (!writeResult.ok) {
      const failed: WithdrawalFailed = {
        name: "wallet.WithdrawalFailed",
        aggregateId: account.id,
        occurredAt: this.deps.clock.now(),
        payload: {
          userAccountId: account.id,
          amount: money.amount.toString(),
          currency: money.currency,
          reason: writeResult.error.code,
        },
      };
      await this.deps.events.publish(failed);
      return writeResult;
    }

    const processorResult = await this.deps.processor.submitWithdrawal({
      userId: input.userId,
      amount: money,
      destination: input.destination,
    });
    if (!processorResult.ok) {
      const failed: WithdrawalFailed = {
        name: "wallet.WithdrawalFailed",
        aggregateId: transactionId,
        occurredAt: this.deps.clock.now(),
        payload: {
          userAccountId: account.id,
          amount: money.amount.toString(),
          currency: money.currency,
          reason: processorResult.error.code,
        },
      };
      await this.deps.events.publish(failed);
      // Funds are already debited; the reconciliation job (PR-future)
      // posts a compensating transaction. We return the error so the
      // mobile can surface "withdrawal queued; we'll refund on failure".
      return processorResult;
    }

    const posted: WithdrawalPosted = {
      name: "wallet.WithdrawalPosted",
      aggregateId: transactionId,
      occurredAt: this.deps.clock.now(),
      payload: {
        transactionId,
        userAccountId: account.id,
        amount: money.amount.toString(),
        currency: money.currency,
        providerRef: processorResult.value.providerRef,
      },
    };
    await this.deps.events.publish(posted);
    return ok(writeResult.value);
  }
}
