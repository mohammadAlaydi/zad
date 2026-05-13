import type { PrismaClient, WalletAccount as PrismaWalletAccount } from "@prisma/client";
import { CURRENCIES, Money, type Currency } from "@zadpay/types";
import { Account } from "../../domain/entities/Account.js";
import type { AccountRepository } from "../../domain/ports/AccountRepository.js";
import {
  isAccountStatus,
  isAccountType,
  type AccountType,
} from "../../domain/value-objects/AccountType.js";

function asCurrency(s: string): Currency {
  return (CURRENCIES as readonly string[]).includes(s) ? (s as Currency) : "USD";
}

function toDomain(row: PrismaWalletAccount): Account {
  return Account.rehydrate({
    id: row.id,
    ownerId: row.ownerId,
    currency: asCurrency(row.currency),
    type: isAccountType(row.type) ? row.type : "wallet",
    status: isAccountStatus(row.status) ? row.status : "active",
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export class PrismaAccountRepository implements AccountRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Account | null> {
    const row = await this.prisma.walletAccount.findUnique({ where: { id } });
    return row === null ? null : toDomain(row);
  }

  async findByOwnerAndCurrency(
    ownerId: string,
    currency: Currency,
    type: AccountType,
  ): Promise<Account | null> {
    const row = await this.prisma.walletAccount.findUnique({
      where: { ownerId_currency_type: { ownerId, currency, type } },
    });
    return row === null ? null : toDomain(row);
  }

  async listForOwner(ownerId: string): Promise<Account[]> {
    const rows = await this.prisma.walletAccount.findMany({
      where: { ownerId },
      orderBy: { createdAt: "asc" },
    });
    return rows.map(toDomain);
  }

  async save(account: Account): Promise<void> {
    await this.prisma.walletAccount.upsert({
      where: { id: account.id },
      create: {
        id: account.id,
        ownerId: account.ownerId,
        currency: account.currency,
        type: account.type,
        status: account.status,
      },
      update: { status: account.status },
    });
  }

  async getBalance(accountId: string): Promise<{ money: Money; updatedAt: Date | null }> {
    const account = await this.prisma.walletAccount.findUnique({
      where: { id: accountId },
      include: { balance: true },
    });
    if (account === null) {
      // Caller should have validated existence; treat as zero defensively.
      return { money: Money.of(0n, "USD"), updatedAt: null };
    }
    if (account.balance === null) {
      return { money: Money.of(0n, asCurrency(account.currency)), updatedAt: null };
    }
    // Prisma Decimal → string → bigint. The projection is whole-number
    // minor units; any fraction here would be a data integrity bug.
    const amount = BigInt(account.balance.amount.toString());
    return {
      money: Money.of(amount, asCurrency(account.balance.currency)),
      updatedAt: account.balance.updatedAt,
    };
  }
}
