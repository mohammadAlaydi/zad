// In-memory test doubles for the wallet module's ports.

import { Money, type Currency } from "@zadpay/types";
import { type Account } from "../../src/modules/wallet/domain/entities/Account.js";
import type { AccountRepository } from "../../src/modules/wallet/domain/ports/AccountRepository.js";
import type { Clock } from "../../src/modules/wallet/domain/ports/Clock.js";
import type { IdGenerator } from "../../src/modules/wallet/domain/ports/IdGenerator.js";
import type {
  ListTransactionsInput,
  ListTransactionsResult,
  TransactionRepository,
} from "../../src/modules/wallet/domain/ports/TransactionRepository.js";
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
}

export class InMemoryTransactionRepository implements TransactionRepository {
  async listForOwner(_input: ListTransactionsInput): Promise<ListTransactionsResult> {
    return { transactions: [], total: 0 };
  }
}

export class FixedClock implements Clock {
  constructor(private current: Date) {}
  now(): Date {
    return new Date(this.current.getTime());
  }
}

export class SequentialIdGenerator implements IdGenerator {
  private counter = 0;
  uuid(): string {
    this.counter += 1;
    return `00000000-0000-0000-0000-${String(this.counter).padStart(12, "0")}`;
  }
}
