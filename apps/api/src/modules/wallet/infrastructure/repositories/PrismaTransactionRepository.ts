import type {
  PrismaClient,
  WalletLedgerEntry as PrismaWalletLedgerEntry,
  WalletTransaction as PrismaWalletTransaction,
} from "@prisma/client";
import { CURRENCIES, type Currency } from "@zadpay/types";
import { LedgerEntry } from "../../domain/entities/LedgerEntry.js";
import { Transaction } from "../../domain/entities/Transaction.js";
import type {
  ListTransactionsInput,
  ListTransactionsResult,
  TransactionRepository,
} from "../../domain/ports/TransactionRepository.js";
import {
  isLedgerDirection,
  isTransactionStatus,
  isTransactionType,
} from "../../domain/value-objects/TransactionType.js";

function asCurrency(s: string): Currency {
  return (CURRENCIES as readonly string[]).includes(s) ? (s as Currency) : "USD";
}

function toEntry(row: PrismaWalletLedgerEntry): LedgerEntry {
  return new LedgerEntry(
    row.id,
    row.transactionId,
    row.accountId,
    isLedgerDirection(row.direction) ? row.direction : "debit",
    BigInt(row.amount.toString()),
    asCurrency(row.currency),
    row.createdAt,
  );
}

function toTransaction(
  row: PrismaWalletTransaction & { ledgerEntries: PrismaWalletLedgerEntry[] },
): Transaction {
  return new Transaction(
    row.id,
    row.idempotencyKey,
    isTransactionType(row.type) ? row.type : "transfer",
    isTransactionStatus(row.status) ? row.status : "pending",
    row.createdAt,
    row.postedAt,
    (row.metadata as Readonly<Record<string, unknown>> | null) ?? {},
    row.ledgerEntries.map(toEntry),
  );
}

export class PrismaTransactionRepository implements TransactionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listForOwner(input: ListTransactionsInput): Promise<ListTransactionsResult> {
    // Find the owner's account IDs first, then transactions touching any of
    // them. Two queries instead of a join — simpler with Prisma's API and
    // negligible cost at the page sizes we serve here.
    const accounts = await this.prisma.walletAccount.findMany({
      where: { ownerId: input.ownerId },
      select: { id: true },
    });
    const accountIds = accounts.map((a) => a.id);
    if (accountIds.length === 0) return { transactions: [], total: 0 };

    const where = {
      ledgerEntries: { some: { accountId: { in: accountIds } } },
    } as const;

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.walletTransaction.findMany({
        where,
        include: { ledgerEntries: true },
        orderBy: { createdAt: "desc" },
        take: input.pageSize,
        skip: input.page * input.pageSize,
      }),
      this.prisma.walletTransaction.count({ where }),
    ]);

    return { transactions: rows.map(toTransaction), total };
  }
}
