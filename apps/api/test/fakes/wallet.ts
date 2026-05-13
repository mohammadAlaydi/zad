// In-memory test doubles for the wallet module's ports.

import { err, ok, type Result } from "@zadpay/errors";
import { Money, type Currency } from "@zadpay/types";
import { Account } from "../../src/modules/wallet/domain/entities/Account.js";
import { LedgerEntry } from "../../src/modules/wallet/domain/entities/LedgerEntry.js";
import { Transaction } from "../../src/modules/wallet/domain/entities/Transaction.js";
import {
  InsufficientBalance,
  type ProcessorRejected,
} from "../../src/modules/wallet/domain/errors/index.js";
import type { AccountRepository } from "../../src/modules/wallet/domain/ports/AccountRepository.js";
import type { Clock } from "../../src/modules/wallet/domain/ports/Clock.js";
import type {
  ExternalClearingWriter,
  PostExternalMovementInput,
} from "../../src/modules/wallet/domain/ports/ExternalClearingWriter.js";
import type { IdGenerator } from "../../src/modules/wallet/domain/ports/IdGenerator.js";
import type {
  PaymentProcessor,
  ProcessorReceipt,
  SubmitTopupInput,
  SubmitWithdrawalInput,
} from "../../src/modules/wallet/domain/ports/PaymentProcessor.js";
import type {
  ListTransactionsInput,
  ListTransactionsResult,
  TransactionRepository,
} from "../../src/modules/wallet/domain/ports/TransactionRepository.js";
import type {
  PostTransferInput,
  TransferWriter,
} from "../../src/modules/wallet/domain/ports/TransferWriter.js";
import type { AccountType } from "../../src/modules/wallet/domain/value-objects/AccountType.js";

// Used by InMemoryExternalClearingWriter to construct the lazy system
// external_clearing account.
const AccountTestHelper = Account;

export class InMemoryAccountRepository implements AccountRepository {
  private readonly byId = new Map<string, Account>();
  /// account-id → { amount, updatedAt }; only for tests to seed balances.
  readonly balances = new Map<string, { amount: bigint; currency: Currency; updatedAt: Date }>();

  async findById(id: string): Promise<Account | null> {
    return this.byId.get(id) ?? null;
  }
  async findByOwnerAndCurrency(
    ownerId: string,
    currency: Currency,
    type: AccountType,
  ): Promise<Account | null> {
    for (const a of this.byId.values()) {
      if (a.ownerId === ownerId && a.currency === currency && a.type === type) return a;
    }
    return null;
  }
  async listForOwner(ownerId: string): Promise<Account[]> {
    return [...this.byId.values()].filter((a) => a.ownerId === ownerId);
  }
  async save(account: Account): Promise<void> {
    this.byId.set(account.id, account);
  }
  async getBalance(accountId: string): Promise<{ money: Money; updatedAt: Date | null }> {
    const account = this.byId.get(accountId);
    const stored = this.balances.get(accountId);
    if (stored !== undefined) {
      return { money: Money.of(stored.amount, stored.currency), updatedAt: stored.updatedAt };
    }
    return { money: Money.of(0n, account?.currency ?? "USD"), updatedAt: null };
  }

  /// Test helper. Used to seed starting balances for property tests.
  setBalance(accountId: string, amount: bigint, currency: Currency, now: Date): void {
    this.balances.set(accountId, { amount, currency, updatedAt: now });
  }
}

export class InMemoryTransactionRepository implements TransactionRepository {
  readonly all: Transaction[] = [];
  async listForOwner(_input: ListTransactionsInput): Promise<ListTransactionsResult> {
    return { transactions: [], total: 0 };
  }
}

// Shares state with the AccountRepository (the projection map) so balance
// queries via either port reflect transfer effects deterministically. The
// writer is single-threaded — Node's event loop is the natural mutex.
export class InMemoryTransferWriter implements TransferWriter {
  readonly transactions: Transaction[] = [];

  constructor(
    private readonly accounts: InMemoryAccountRepository,
    private readonly transactionsRepo?: InMemoryTransactionRepository,
  ) {}

  async postTransfer(input: PostTransferInput): Promise<Result<Transaction, InsufficientBalance>> {
    const sourceBalance = (await this.accounts.getBalance(input.sourceAccountId)).money;
    if (sourceBalance.amount < input.amount.amount) return err(new InsufficientBalance());

    const newSource = sourceBalance.sub(input.amount);
    this.accounts.setBalance(
      input.sourceAccountId,
      newSource.amount,
      input.amount.currency,
      input.now,
    );

    const destBalance = (await this.accounts.getBalance(input.destAccountId)).money;
    // destBalance may be in a different currency-defaulted state if no row;
    // the use case has already enforced currency match.
    const newDest = Money.of(destBalance.amount + input.amount.amount, input.amount.currency);
    this.accounts.setBalance(input.destAccountId, newDest.amount, input.amount.currency, input.now);

    const debit = LedgerEntry.debit({
      id: `${input.transactionId}-d`,
      transactionId: input.transactionId,
      accountId: input.sourceAccountId,
      money: input.amount,
      now: input.now,
    });
    const credit = LedgerEntry.credit({
      id: `${input.transactionId}-c`,
      transactionId: input.transactionId,
      accountId: input.destAccountId,
      money: input.amount,
      now: input.now,
    });
    const transaction = new Transaction(
      input.transactionId,
      input.idempotencyKey,
      "transfer",
      "posted",
      input.now,
      input.now,
      input.metadata,
      [debit, credit],
    );
    this.transactions.push(transaction);
    if (this.transactionsRepo !== undefined) this.transactionsRepo.all.push(transaction);
    return ok(transaction);
  }
}

export class FixedClock implements Clock {
  constructor(private current: Date) {}
  now(): Date {
    return new Date(this.current.getTime());
  }
  advance(ms: number): void {
    this.current = new Date(this.current.getTime() + ms);
  }
}

const SYSTEM_OWNER = "00000000-0000-0000-0000-000000000000";

// Sibling fake for PR-11. Lazy-creates a single external_clearing account
// per currency. Same single-threaded "Node event loop is the mutex" guarantee
// as the TransferWriter fake.
export class InMemoryExternalClearingWriter implements ExternalClearingWriter {
  readonly transactions: Transaction[] = [];

  constructor(
    private readonly accounts: InMemoryAccountRepository,
    private readonly ids: IdGenerator,
  ) {}

  private async ensureExternalAccount(currency: Currency, now: Date): Promise<string> {
    const existing = await this.accounts.findByOwnerAndCurrency(
      SYSTEM_OWNER,
      currency,
      "external_clearing",
    );
    if (existing !== null) return existing.id;
    const account = AccountTestHelper.create({
      id: this.ids.uuid(),
      ownerId: SYSTEM_OWNER,
      currency,
      type: "external_clearing",
      now,
    });
    await this.accounts.save(account);
    return account.id;
  }

  async postExternalMovement(
    input: PostExternalMovementInput,
  ): Promise<Result<Transaction, InsufficientBalance>> {
    const externalAccountId = await this.ensureExternalAccount(input.amount.currency, input.now);
    const debitedId = input.type === "topup" ? externalAccountId : input.userAccountId;
    const creditedId = input.type === "topup" ? input.userAccountId : externalAccountId;

    if (input.type === "withdrawal") {
      const balance = (await this.accounts.getBalance(debitedId)).money;
      if (balance.amount < input.amount.amount) return err(new InsufficientBalance());
    }

    const debitedBalance = (await this.accounts.getBalance(debitedId)).money;
    this.accounts.setBalance(
      debitedId,
      debitedBalance.amount - input.amount.amount,
      input.amount.currency,
      input.now,
    );
    const creditedBalance = (await this.accounts.getBalance(creditedId)).money;
    this.accounts.setBalance(
      creditedId,
      creditedBalance.amount + input.amount.amount,
      input.amount.currency,
      input.now,
    );

    const debit = LedgerEntry.debit({
      id: `${input.transactionId}-d`,
      transactionId: input.transactionId,
      accountId: debitedId,
      money: input.amount,
      now: input.now,
    });
    const credit = LedgerEntry.credit({
      id: `${input.transactionId}-c`,
      transactionId: input.transactionId,
      accountId: creditedId,
      money: input.amount,
      now: input.now,
    });
    const transaction = new Transaction(
      input.transactionId,
      input.idempotencyKey,
      input.type,
      "posted",
      input.now,
      input.now,
      input.metadata,
      [debit, credit],
    );
    this.transactions.push(transaction);
    return ok(transaction);
  }
}

export class FakePaymentProcessor implements PaymentProcessor {
  readonly topups: Array<{ userId: string; amount: bigint; source: string }> = [];
  readonly withdrawals: Array<{ userId: string; amount: bigint; destination: string }> = [];
  // Toggle to make the next call fail with ProcessorRejected.
  rejectNext = false;

  async submitTopup(input: SubmitTopupInput): Promise<Result<ProcessorReceipt, ProcessorRejected>> {
    if (this.rejectNext) {
      this.rejectNext = false;
      const { ProcessorRejected } = await import("../../src/modules/wallet/domain/errors/index.js");
      return err(new ProcessorRejected("card_declined"));
    }
    this.topups.push({ userId: input.userId, amount: input.amount.amount, source: input.source });
    return ok({ providerRef: `fake-topup-${String(this.topups.length)}` });
  }

  async submitWithdrawal(
    input: SubmitWithdrawalInput,
  ): Promise<Result<ProcessorReceipt, ProcessorRejected>> {
    if (this.rejectNext) {
      this.rejectNext = false;
      const { ProcessorRejected } = await import("../../src/modules/wallet/domain/errors/index.js");
      return err(new ProcessorRejected("destination_rejected"));
    }
    this.withdrawals.push({
      userId: input.userId,
      amount: input.amount.amount,
      destination: input.destination,
    });
    return ok({ providerRef: `fake-withdrawal-${String(this.withdrawals.length)}` });
  }
}

export class SequentialIdGenerator implements IdGenerator {
  private counter = 0;
  uuid(): string {
    this.counter += 1;
    return `00000000-0000-0000-0000-${String(this.counter).padStart(12, "0")}`;
  }
}
