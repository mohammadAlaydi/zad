// The only escape-hatch raw SQL in the codebase per ADR-0004. Lives here
// because the wallet's hot path needs:
//   1. SELECT … FOR UPDATE on two rows in a deadlock-safe order
//   2. A conditional UPSERT on account_balances that rejects overdrafts
//      atomically with the entry insert
// Prisma's increment/decrement on Decimal don't support `bigint` natively,
// and FOR UPDATE isn't expressible without raw SQL. The Postgres trigger
// from prisma/sql/enforce_ledger_balance.sql is the structural safety net
// for the ledger sum invariant.

import { Prisma, type PrismaClient } from "@prisma/client";
import { err, ok, type Result } from "@zadpay/errors";
import { LedgerEntry } from "../../domain/entities/LedgerEntry.js";
import { Transaction } from "../../domain/entities/Transaction.js";
import { InsufficientBalance } from "../../domain/errors/index.js";
import type { IdGenerator } from "../../domain/ports/IdGenerator.js";
import type { PostTransferInput, TransferWriter } from "../../domain/ports/TransferWriter.js";

export class PrismaTransferWriter implements TransferWriter {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly ids: IdGenerator,
  ) {}

  async postTransfer(input: PostTransferInput): Promise<Result<Transaction, InsufficientBalance>> {
    const amountStr = input.amount.amount.toString();
    const amountDec = new Prisma.Decimal(amountStr);
    // Deterministic lock order to prevent deadlocks under concurrent transfers
    // touching the same accounts in opposite directions.
    const [firstId, secondId] =
      input.sourceAccountId < input.destAccountId
        ? [input.sourceAccountId, input.destAccountId]
        : [input.destAccountId, input.sourceAccountId];

    return this.prisma.$transaction(async (tx) => {
      // Lock both rows.
      await tx.$queryRaw`
        SELECT id FROM wallet.accounts
        WHERE id IN (${firstId}::uuid, ${secondId}::uuid)
        FOR UPDATE
      `;

      // Conditional debit: only succeeds if balance >= amount.
      // Upsert handles the first-ever debit (no projection row yet → 0
      // balance → can't debit anything; the ON CONFLICT clause is unused
      // in that case but keeps the statement uniform).
      const debited = await tx.$executeRaw`
        UPDATE wallet.account_balances
           SET amount = amount - ${amountDec},
               updated_at = NOW()
         WHERE account_id = ${input.sourceAccountId}::uuid
           AND amount >= ${amountDec}
      `;
      if (debited === 0) return err(new InsufficientBalance());

      // Credit destination; insert if no row yet.
      await tx.$executeRaw`
        INSERT INTO wallet.account_balances (account_id, amount, currency, updated_at)
        VALUES (${input.destAccountId}::uuid, ${amountDec}, ${input.amount.currency}, NOW())
        ON CONFLICT (account_id) DO UPDATE
           SET amount = wallet.account_balances.amount + EXCLUDED.amount,
               updated_at = NOW()
      `;

      // Header + entries. The trigger enforces the sum-to-zero invariant
      // when the statement-level constraint check fires at commit time.
      await tx.walletTransaction.create({
        data: {
          id: input.transactionId,
          idempotencyKey: input.idempotencyKey,
          type: "transfer",
          status: "posted",
          postedAt: input.now,
          metadata: input.metadata as Prisma.InputJsonValue,
        },
      });
      const debitId = this.ids.uuid();
      const creditId = this.ids.uuid();
      await tx.walletLedgerEntry.createMany({
        data: [
          {
            id: debitId,
            transactionId: input.transactionId,
            accountId: input.sourceAccountId,
            direction: "debit",
            amount: amountDec,
            currency: input.amount.currency,
          },
          {
            id: creditId,
            transactionId: input.transactionId,
            accountId: input.destAccountId,
            direction: "credit",
            amount: amountDec,
            currency: input.amount.currency,
          },
        ],
      });

      const debitEntry = LedgerEntry.debit({
        id: debitId,
        transactionId: input.transactionId,
        accountId: input.sourceAccountId,
        money: input.amount,
        now: input.now,
      });
      const creditEntry = LedgerEntry.credit({
        id: creditId,
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
        [debitEntry, creditEntry],
      );
      return ok(transaction);
    });
  }
}
