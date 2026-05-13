// Sibling to PrismaTransferWriter (PR-10). Same raw-SQL escape hatch
// pattern per ADR-0004 — needs FOR UPDATE locking + conditional balance
// update for the withdrawal direction. Topups have no balance check
// (external_clearing can run negative; the system "owes" the rail until
// settlement).
//
// The external_clearing account is created on first use, lazily, per
// currency. One row per (currency, type='external_clearing').

import { Prisma, type PrismaClient } from "@prisma/client";
import { err, ok, type Result } from "@zadpay/errors";
import { LedgerEntry } from "../../domain/entities/LedgerEntry.js";
import { Transaction } from "../../domain/entities/Transaction.js";
import { InsufficientBalance } from "../../domain/errors/index.js";
import type {
  ExternalClearingWriter,
  PostExternalMovementInput,
} from "../../domain/ports/ExternalClearingWriter.js";
import type { IdGenerator } from "../../domain/ports/IdGenerator.js";

// Sentinel owner for system-owned accounts. No real user has this id.
const SYSTEM_OWNER = "00000000-0000-0000-0000-000000000000";

export class PrismaExternalClearingWriter implements ExternalClearingWriter {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly ids: IdGenerator,
  ) {}

  async postExternalMovement(
    input: PostExternalMovementInput,
  ): Promise<Result<Transaction, InsufficientBalance>> {
    const amountDec = new Prisma.Decimal(input.amount.amount.toString());

    return this.prisma.$transaction(async (tx) => {
      // Find-or-create the system external_clearing account for this currency.
      const externalAccount = await tx.walletAccount.upsert({
        where: {
          ownerId_currency_type: {
            ownerId: SYSTEM_OWNER,
            currency: input.amount.currency,
            type: "external_clearing",
          },
        },
        create: {
          id: this.ids.uuid(),
          ownerId: SYSTEM_OWNER,
          currency: input.amount.currency,
          type: "external_clearing",
        },
        update: {},
      });

      const [debitedAccountId, creditedAccountId] =
        input.type === "topup"
          ? [externalAccount.id, input.userAccountId]
          : [input.userAccountId, externalAccount.id];

      // Lock both rows in deterministic order to avoid deadlocks.
      const [firstId, secondId] =
        debitedAccountId < creditedAccountId
          ? [debitedAccountId, creditedAccountId]
          : [creditedAccountId, debitedAccountId];
      await tx.$queryRaw`
        SELECT id FROM wallet.accounts
        WHERE id IN (${firstId}::uuid, ${secondId}::uuid)
        FOR UPDATE
      `;

      // Balance check only applies when debiting a user wallet (withdrawal).
      // For topups the debited side is external_clearing — allowed to run
      // negative.
      if (input.type === "withdrawal") {
        const debited = await tx.$executeRaw`
          UPDATE wallet.account_balances
             SET amount = amount - ${amountDec},
                 updated_at = NOW()
           WHERE account_id = ${debitedAccountId}::uuid
             AND amount >= ${amountDec}
        `;
        if (debited === 0) return err(new InsufficientBalance());
      } else {
        // Topup: unconditional debit on external_clearing.
        await tx.$executeRaw`
          INSERT INTO wallet.account_balances (account_id, amount, currency, updated_at)
          VALUES (${debitedAccountId}::uuid, ${amountDec.neg()}, ${input.amount.currency}, NOW())
          ON CONFLICT (account_id) DO UPDATE
             SET amount = wallet.account_balances.amount - ${amountDec},
                 updated_at = NOW()
        `;
      }

      await tx.$executeRaw`
        INSERT INTO wallet.account_balances (account_id, amount, currency, updated_at)
        VALUES (${creditedAccountId}::uuid, ${amountDec}, ${input.amount.currency}, NOW())
        ON CONFLICT (account_id) DO UPDATE
           SET amount = wallet.account_balances.amount + ${amountDec},
               updated_at = NOW()
      `;

      await tx.walletTransaction.create({
        data: {
          id: input.transactionId,
          idempotencyKey: input.idempotencyKey,
          type: input.type,
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
            accountId: debitedAccountId,
            direction: "debit",
            amount: amountDec,
            currency: input.amount.currency,
          },
          {
            id: creditId,
            transactionId: input.transactionId,
            accountId: creditedAccountId,
            direction: "credit",
            amount: amountDec,
            currency: input.amount.currency,
          },
        ],
      });

      const debitEntry = LedgerEntry.debit({
        id: debitId,
        transactionId: input.transactionId,
        accountId: debitedAccountId,
        money: input.amount,
        now: input.now,
      });
      const creditEntry = LedgerEntry.credit({
        id: creditId,
        transactionId: input.transactionId,
        accountId: creditedAccountId,
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
        [debitEntry, creditEntry],
      );
      return ok(transaction);
    });
  }
}
