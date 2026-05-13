import { beforeEach, describe, expect, it } from "vitest";
import { RecordingEventBus } from "../../../../../test/fakes/identity.js";
import {
  FakePaymentProcessor,
  FixedClock,
  InMemoryAccountRepository,
  InMemoryExternalClearingWriter,
  SequentialIdGenerator,
} from "../../../../../test/fakes/wallet.js";
import { Account } from "../../domain/entities/Account.js";
import {
  AccountAccessDenied,
  AccountNotFound,
  CurrencyMismatch,
  InsufficientBalance,
  InvalidAmount,
  ProcessorRejected,
} from "../../domain/errors/index.js";
import { CreateWithdrawalCommand } from "./CreateWithdrawal.js";

const NOW = new Date("2026-05-13T12:00:00Z");
const ALICE = "00000000-0000-0000-0000-00000000aaaa";
const BOB = "00000000-0000-0000-0000-00000000bbbb";

describe("CreateWithdrawalCommand", () => {
  let accounts: InMemoryAccountRepository;
  let writer: InMemoryExternalClearingWriter;
  let processor: FakePaymentProcessor;
  let events: RecordingEventBus;
  let ids: SequentialIdGenerator;
  let clock: FixedClock;
  let command: CreateWithdrawalCommand;
  let aliceUsd: Account;

  beforeEach(async () => {
    accounts = new InMemoryAccountRepository();
    ids = new SequentialIdGenerator();
    writer = new InMemoryExternalClearingWriter(accounts, ids);
    processor = new FakePaymentProcessor();
    events = new RecordingEventBus();
    clock = new FixedClock(NOW);
    command = new CreateWithdrawalCommand({ accounts, writer, processor, ids, clock, events });

    aliceUsd = Account.create({
      id: "00000000-0000-0000-0000-000000000001",
      ownerId: ALICE,
      currency: "USD",
      type: "wallet",
      now: NOW,
    });
    await accounts.save(aliceUsd);
    // Seed Alice with $100.
    accounts.setBalance(aliceUsd.id, 10_000n, "USD", NOW);
  });

  it("debits the user account and emits WithdrawalPosted", async () => {
    const result = await command.execute({
      userId: ALICE,
      idempotencyKey: "00000000-0000-0000-0000-000000000099",
      accountId: aliceUsd.id,
      amount: { amount: 2_500n, currency: "USD" },
      destination: "bank_iban_xxx",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.type).toBe("withdrawal");

    const balance = await accounts.getBalance(aliceUsd.id);
    expect(balance.money.amount).toBe(7_500n);
    expect(events.published.map((e) => e.name)).toEqual(["wallet.WithdrawalPosted"]);
    expect(processor.withdrawals).toHaveLength(1);
  });

  it("returns InsufficientBalance and never touches the processor", async () => {
    const result = await command.execute({
      userId: ALICE,
      idempotencyKey: "00000000-0000-0000-0000-000000000099",
      accountId: aliceUsd.id,
      amount: { amount: 50_000n, currency: "USD" },
      destination: "bank_iban_xxx",
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBeInstanceOf(InsufficientBalance);
    expect(processor.withdrawals).toHaveLength(0);
    expect(events.published.map((e) => e.name)).toEqual(["wallet.WithdrawalFailed"]);

    const balance = await accounts.getBalance(aliceUsd.id);
    expect(balance.money.amount).toBe(10_000n); // unchanged
  });

  it("rejects another user's account", async () => {
    const result = await command.execute({
      userId: BOB,
      idempotencyKey: "00000000-0000-0000-0000-000000000099",
      accountId: aliceUsd.id,
      amount: { amount: 100n, currency: "USD" },
      destination: "bank_iban_xxx",
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBeInstanceOf(AccountAccessDenied);
  });

  it("rejects non-positive amount", async () => {
    const result = await command.execute({
      userId: ALICE,
      idempotencyKey: "00000000-0000-0000-0000-000000000099",
      accountId: aliceUsd.id,
      amount: { amount: 0n, currency: "USD" },
      destination: "bank_iban_xxx",
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBeInstanceOf(InvalidAmount);
  });

  it("rejects currency mismatch", async () => {
    const result = await command.execute({
      userId: ALICE,
      idempotencyKey: "00000000-0000-0000-0000-000000000099",
      accountId: aliceUsd.id,
      amount: { amount: 100n, currency: "EUR" },
      destination: "bank_iban_xxx",
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBeInstanceOf(CurrencyMismatch);
  });

  it("returns AccountNotFound for an unknown account", async () => {
    const result = await command.execute({
      userId: ALICE,
      idempotencyKey: "00000000-0000-0000-0000-000000000099",
      accountId: "00000000-0000-0000-0000-000000000099",
      amount: { amount: 100n, currency: "USD" },
      destination: "bank_iban_xxx",
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBeInstanceOf(AccountNotFound);
  });

  it("surfaces ProcessorRejected — funds already debited but processor refused", async () => {
    processor.rejectNext = true;
    const result = await command.execute({
      userId: ALICE,
      idempotencyKey: "00000000-0000-0000-0000-000000000099",
      accountId: aliceUsd.id,
      amount: { amount: 1_000n, currency: "USD" },
      destination: "bank_iban_xxx",
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBeInstanceOf(ProcessorRejected);
    expect(events.published.map((e) => e.name)).toEqual(["wallet.WithdrawalFailed"]);
    // The ledger debit has already happened — reconciliation refunds (PR-future).
    const balance = await accounts.getBalance(aliceUsd.id);
    expect(balance.money.amount).toBe(9_000n);
  });
});
