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
  SameAccountTransfer,
} from "../../domain/errors/index.js";
import type { TransferCreated, TransferFailed, TransferPosted } from "../../domain/events/index.js";
import type { AccountRepository } from "../../domain/ports/AccountRepository.js";
import type { Clock } from "../../domain/ports/Clock.js";
import type { IdGenerator } from "../../domain/ports/IdGenerator.js";
import type { TransferWriter } from "../../domain/ports/TransferWriter.js";

export interface CreateTransferInput {
  userId: string;
  idempotencyKey: string;
  sourceAccountId: string;
  destAccountId: string;
  amount: { amount: bigint; currency: Currency };
  note?: string;
}

export type CreateTransferError =
  | AccountNotFound
  | AccountAccessDenied
  | CurrencyMismatch
  | InsufficientBalance
  | SameAccountTransfer
  | InvalidAmount;

export interface CreateTransferDeps {
  accounts: AccountRepository;
  writer: TransferWriter;
  ids: IdGenerator;
  clock: Clock;
  events: EventBus;
}

// Per ADR-0007. Domain-layer checks (ownership, currency, same-account,
// positive amount) happen first; the atomic ledger write + race-safe
// balance check happens in TransferWriter.
export class CreateTransferCommand {
  constructor(private readonly deps: CreateTransferDeps) {}

  async execute(input: CreateTransferInput): Promise<Result<Transaction, CreateTransferError>> {
    if (input.amount.amount <= 0n) return err(new InvalidAmount());
    if (input.sourceAccountId === input.destAccountId) {
      return err(new SameAccountTransfer());
    }

    const source = await this.deps.accounts.findById(input.sourceAccountId);
    if (source === null) return err(new AccountNotFound());
    if (source.ownerId !== input.userId) return err(new AccountAccessDenied());

    const dest = await this.deps.accounts.findById(input.destAccountId);
    if (dest === null) return err(new AccountNotFound());

    if (source.currency !== input.amount.currency) return err(new CurrencyMismatch());
    if (source.currency !== dest.currency) return err(new CurrencyMismatch());

    const money = Money.of(input.amount.amount, input.amount.currency);
    const transactionId = this.deps.ids.uuid();
    const now = this.deps.clock.now();

    const metadata = {
      sourceOwnerId: source.ownerId,
      destOwnerId: dest.ownerId,
      ...(input.note === undefined ? {} : { note: input.note }),
    } as const;

    const created: TransferCreated = {
      name: "wallet.TransferCreated",
      aggregateId: transactionId,
      occurredAt: now,
      payload: {
        transactionId,
        sourceAccountId: input.sourceAccountId,
        destAccountId: input.destAccountId,
        amount: money.amount.toString(),
        currency: money.currency,
      },
    };
    await this.deps.events.publish(created);

    const result = await this.deps.writer.postTransfer({
      transactionId,
      idempotencyKey: input.idempotencyKey,
      sourceAccountId: input.sourceAccountId,
      destAccountId: input.destAccountId,
      amount: money,
      metadata,
      now,
    });

    if (!result.ok) {
      const failed: TransferFailed = {
        name: "wallet.TransferFailed",
        aggregateId: transactionId,
        occurredAt: this.deps.clock.now(),
        payload: {
          sourceAccountId: input.sourceAccountId,
          destAccountId: input.destAccountId,
          amount: money.amount.toString(),
          currency: money.currency,
          reason: result.error.code,
        },
      };
      await this.deps.events.publish(failed);
      return result;
    }

    const posted: TransferPosted = {
      name: "wallet.TransferPosted",
      aggregateId: transactionId,
      occurredAt: this.deps.clock.now(),
      payload: {
        transactionId,
        sourceAccountId: input.sourceAccountId,
        destAccountId: input.destAccountId,
        amount: money.amount.toString(),
        currency: money.currency,
      },
    };
    await this.deps.events.publish(posted);
    return ok(result.value);
  }
}
