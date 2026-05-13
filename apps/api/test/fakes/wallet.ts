// In-memory test doubles for the wallet module's ports.

import { err, ok, type Result } from "@zadpay/errors";
import { Money, type Currency } from "@zadpay/types";
import { type Account } from "../../src/modules/wallet/domain/entities/Account.js";
import { LedgerEntry } from "../../src/modules/wallet/domain/entities/LedgerEntry.js";
import { Transaction } from "../../src/modules/wallet/domain/entities/Transaction.js";
import { InsufficientBalance } from "../../src/modules/wallet/domain/errors/index.js";
import type { AccountRepository } from "../../src/modules/wallet/domain/ports/AccountRepository.js";
import type { Clock } from "../../src/modules/wallet/domain/ports/Clock.js";
import type { IdGenerator } from "../../src/modules/wallet/domain/ports/IdGenerator.js";
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

export class SequentialIdGenerator implements IdGenerator {
  private counter = 0;
  uuid(): string {
    this.counter += 1;
    return `00000000-0000-0000-0000-${String(this.counter).padStart(12, "0")}`;
  }
}
