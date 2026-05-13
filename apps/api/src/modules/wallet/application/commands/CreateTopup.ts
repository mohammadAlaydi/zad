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
import type { TopupFailed, TopupPosted } from "../../domain/events/index.js";
import type { AccountRepository } from "../../domain/ports/AccountRepository.js";
import type { Clock } from "../../domain/ports/Clock.js";
import type { ExternalClearingWriter } from "../../domain/ports/ExternalClearingWriter.js";
import type { IdGenerator } from "../../domain/ports/IdGenerator.js";
import type { PaymentProcessor } from "../../domain/ports/PaymentProcessor.js";

export interface CreateTopupInput {
  userId: string;
  idempotencyKey: string;
  accountId: string;
  amount: { amount: bigint; currency: Currency };
  source: string;
}

export type CreateTopupError =
  | AccountNotFound
  | AccountAccessDenied
  | CurrencyMismatch
  | InvalidAmount
  | ProcessorRejected
  // The writer can't fail with InsufficientBalance for topups (external_
  // clearing is allowed to run negative), but the port returns this in
  // the type to keep CreateTransfer's writer interface uniform; we
  // include it in the union for type completeness.
  | InsufficientBalance;

export interface CreateTopupDeps {
  accounts: AccountRepository;
  processor: PaymentProcessor;
  writer: ExternalClearingWriter;
  ids: IdGenerator;
  clock: Clock;
  events: EventBus;
}

// Flow per ADR-0007:
//   1. Validate ownership + currency + amount.
//   2. Call processor.submitTopup with the (tokenized) source.
//   3. On approval, post ledger atomically: debit external_clearing,
//      credit user_wallet (writer).
//   4. Publish TopupPosted / TopupFailed.
export class CreateTopupCommand {
  constructor(private readonly deps: CreateTopupDeps) {}

  async execute(input: CreateTopupInput): Promise<Result<Transaction, CreateTopupError>> {
    if (input.amount.amount <= 0n) return err(new InvalidAmount());

    const account = await this.deps.accounts.findById(input.accountId);
    if (account === null) return err(new AccountNotFound());
    if (account.ownerId !== input.userId) return err(new AccountAccessDenied());
    if (account.currency !== input.amount.currency) return err(new CurrencyMismatch());

    const money = Money.of(input.amount.amount, input.amount.currency);
    const now = this.deps.clock.now();

    const processorResult = await this.deps.processor.submitTopup({
      userId: input.userId,
      amount: money,
      source: input.source,
    });
    if (!processorResult.ok) {
      const failed: TopupFailed = {
        name: "wallet.TopupFailed",
        aggregateId: account.id,
        occurredAt: this.deps.clock.now(),
        payload: {
          userAccountId: account.id,
          amount: money.amount.toString(),
          currency: money.currency,
          reason: processorResult.error.code,
        },
      };
      await this.deps.events.publish(failed);
      return processorResult;
    }

    const transactionId = this.deps.ids.uuid();
    const writeResult = await this.deps.writer.postExternalMovement({
      transactionId,
      idempotencyKey: input.idempotencyKey,
      userAccountId: account.id,
      amount: money,
      type: "topup",
      providerRef: processorResult.value.providerRef,
      metadata: {
        userId: input.userId,
        source: input.source,
        providerRef: processorResult.value.providerRef,
      },
      now,
    });
    if (!writeResult.ok) {
      // Topup writer can't return InsufficientBalance (we credit the user;
      // external_clearing can run negative). If it ever does, the failure
      // is fatal — log and propagate. PR-future adds processor refund.
      return writeResult;
    }

    const posted: TopupPosted = {
      name: "wallet.TopupPosted",
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
