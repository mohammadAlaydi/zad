// Property-based ledger tests per ADR-0007. For any sequence of valid
// transfers between a fixed account set:
//   • every transaction's signed entries sum to 0 (double-entry invariant),
//   • each account's balance projection equals the signed sum of its
//     ledger entries (read model never drifts from the source of truth),
//   • no account's balance is ever negative (no overdraft).
//
// Runs at numRuns=500 on PR CI; nightly job (see ADR-0009) bumps to 10_000.

import fc from "fast-check";
import { describe, it } from "vitest";
import { RecordingEventBus } from "../../../../../test/fakes/identity.js";
import {
  FixedClock,
  InMemoryAccountRepository,
  InMemoryTransferWriter,
  SequentialIdGenerator,
} from "../../../../../test/fakes/wallet.js";
import { Account } from "../../domain/entities/Account.js";
import { CreateTransferCommand } from "./CreateTransfer.js";

const NOW = new Date("2026-05-13T12:00:00Z");
const OWNER = "00000000-0000-0000-0000-00000000aaaa";
const ACCOUNT_COUNT = 5;
const STARTING_BALANCE = 1_000_000n; // 10_000 USD per account in minor units

function makeAccounts(repo: InMemoryAccountRepository): Promise<Account[]> {
  return Promise.all(
    Array.from({ length: ACCOUNT_COUNT }, async (_unused, i) => {
      const account = Account.create({
        id: `00000000-0000-0000-0000-${String(i + 1).padStart(12, "0")}`,
        ownerId: OWNER,
        currency: "USD",
        type: "wallet",
        now: NOW,
      });
      await repo.save(account);
      repo.setBalance(account.id, STARTING_BALANCE, "USD", NOW);
      return account;
    }),
  );
}

const transferArb = fc
  .record({
    fromIndex: fc.integer({ min: 0, max: ACCOUNT_COUNT - 1 }),
    toIndex: fc.integer({ min: 0, max: ACCOUNT_COUNT - 1 }),
    amount: fc.bigInt({ min: 1n, max: STARTING_BALANCE / 2n }),
  })
  // Filter out self-transfers — they're a domain error, not interesting
  // to the ledger invariants.
  .filter((t) => t.fromIndex !== t.toIndex);

describe("transfer ledger invariants (property-based)", () => {
  it("per-transaction signed sum is always 0", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(transferArb, { minLength: 1, maxLength: 30 }),
        async (transfers) => {
          const accounts = new InMemoryAccountRepository();
          const writer = new InMemoryTransferWriter(accounts);
          const ids = new SequentialIdGenerator();
          const clock = new FixedClock(NOW);
          const events = new RecordingEventBus();
          const command = new CreateTransferCommand({ accounts, writer, ids, clock, events });
          const seeded = await makeAccounts(accounts);

          for (const t of transfers) {
            // Both ok and error outcomes are valid here; we just ensure
            // the invariants hold regardless.
            await command.execute({
              userId: OWNER,
              idempotencyKey: ids.uuid(),
              sourceAccountId: seeded[t.fromIndex]!.id,
              destAccountId: seeded[t.toIndex]!.id,
              amount: { amount: t.amount, currency: "USD" },
            });
          }

          for (const tx of writer.transactions) {
            const sum = tx.entries.reduce((acc, e) => acc + e.signedAmount(), 0n);
            if (sum !== 0n) {
              throw new Error(`transaction ${tx.id} unbalanced: signed sum = ${sum.toString()}`);
            }
          }
        },
      ),
      { numRuns: 500 },
    );
  });

  it("balance projection equals signed sum of entries for every account", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(transferArb, { minLength: 1, maxLength: 30 }),
        async (transfers) => {
          const accounts = new InMemoryAccountRepository();
          const writer = new InMemoryTransferWriter(accounts);
          const ids = new SequentialIdGenerator();
          const clock = new FixedClock(NOW);
          const events = new RecordingEventBus();
          const command = new CreateTransferCommand({ accounts, writer, ids, clock, events });
          const seeded = await makeAccounts(accounts);

          for (const t of transfers) {
            await command.execute({
              userId: OWNER,
              idempotencyKey: ids.uuid(),
              sourceAccountId: seeded[t.fromIndex]!.id,
              destAccountId: seeded[t.toIndex]!.id,
              amount: { amount: t.amount, currency: "USD" },
            });
          }

          for (const account of seeded) {
            const ledgerSum = writer.transactions
              .flatMap((tx) => tx.entries)
              .filter((e) => e.accountId === account.id)
              .reduce((acc, e) => acc + e.signedAmount(), 0n);
            const expected = STARTING_BALANCE + ledgerSum;
            const actual = (await accounts.getBalance(account.id)).money.amount;
            if (actual !== expected) {
              throw new Error(
                `account ${account.id}: projection ${actual.toString()} ≠ STARTING_BALANCE + ledger ${expected.toString()}`,
              );
            }
          }
        },
      ),
      { numRuns: 500 },
    );
  });

  it("no account balance is ever negative", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(transferArb, { minLength: 1, maxLength: 30 }),
        async (transfers) => {
          const accounts = new InMemoryAccountRepository();
          const writer = new InMemoryTransferWriter(accounts);
          const ids = new SequentialIdGenerator();
          const clock = new FixedClock(NOW);
          const events = new RecordingEventBus();
          const command = new CreateTransferCommand({ accounts, writer, ids, clock, events });
          const seeded = await makeAccounts(accounts);

          for (const t of transfers) {
            await command.execute({
              userId: OWNER,
              idempotencyKey: ids.uuid(),
              sourceAccountId: seeded[t.fromIndex]!.id,
              destAccountId: seeded[t.toIndex]!.id,
              amount: { amount: t.amount, currency: "USD" },
            });
          }
          for (const account of seeded) {
            const balance = (await accounts.getBalance(account.id)).money.amount;
            if (balance < 0n) {
              throw new Error(`account ${account.id} went negative: ${balance.toString()}`);
            }
          }
        },
      ),
      { numRuns: 500 },
    );
  });
});
