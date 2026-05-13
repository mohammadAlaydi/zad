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
  InvalidAmount,
  ProcessorRejected,
} from "../../domain/errors/index.js";
import { CreateTopupCommand } from "./CreateTopup.js";

const NOW = new Date("2026-05-13T12:00:00Z");
const ALICE = "00000000-0000-0000-0000-00000000aaaa";
const BOB = "00000000-0000-0000-0000-00000000bbbb";

describe("CreateTopupCommand", () => {
  let accounts: InMemoryAccountRepository;
  let writer: InMemoryExternalClearingWriter;
  let processor: FakePaymentProcessor;
  let events: RecordingEventBus;
  let ids: SequentialIdGenerator;
  let clock: FixedClock;
  let command: CreateTopupCommand;
  let aliceUsd: Account;

  beforeEach(async () => {
    accounts = new InMemoryAccountRepository();
    ids = new SequentialIdGenerator();
    writer = new InMemoryExternalClearingWriter(accounts, ids);
    processor = new FakePaymentProcessor();
    events = new RecordingEventBus();
    clock = new FixedClock(NOW);
    command = new CreateTopupCommand({ accounts, writer, processor, ids, clock, events });

    aliceUsd = Account.create({
      id: "00000000-0000-0000-0000-000000000001",
      ownerId: ALICE,
      currency: "USD",
      type: "wallet",
      now: NOW,
    });
    await accounts.save(aliceUsd);
  });

  it("credits the user account and posts TopupPosted", async () => {
    const result = await command.execute({
      userId: ALICE,
      idempotencyKey: "00000000-0000-0000-0000-000000000099",
      accountId: aliceUsd.id,
      amount: { amount: 5_000n, currency: "USD" },
      source: "card_4242",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.type).toBe("topup");
    expect(result.value.entries).toHaveLength(2);

    const balance = await accounts.getBalance(aliceUsd.id);
    expect(balance.money.amount).toBe(5_000n);
    expect(events.published.map((e) => e.name)).toEqual(["wallet.TopupPosted"]);
    expect(processor.topups).toHaveLength(1);
  });

  it("rejects non-positive amount before calling the processor", async () => {
    const result = await command.execute({
      userId: ALICE,
      idempotencyKey: "00000000-0000-0000-0000-000000000099",
      accountId: aliceUsd.id,
      amount: { amount: 0n, currency: "USD" },
      source: "card_4242",
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBeInstanceOf(InvalidAmount);
    expect(processor.topups).toHaveLength(0);
  });

  it("rejects another user's account (no enumeration: returns 404)", async () => {
    const result = await command.execute({
      userId: BOB,
      idempotencyKey: "00000000-0000-0000-0000-000000000099",
      accountId: aliceUsd.id,
      amount: { amount: 100n, currency: "USD" },
      source: "card_4242",
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBeInstanceOf(AccountAccessDenied);
  });

  it("rejects currency mismatch", async () => {
    const result = await command.execute({
      userId: ALICE,
      idempotencyKey: "00000000-0000-0000-0000-000000000099",
      accountId: aliceUsd.id,
      amount: { amount: 100n, currency: "EUR" },
      source: "card_4242",
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
      source: "card_4242",
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBeInstanceOf(AccountNotFound);
  });

  it("rejects when the processor declines", async () => {
    processor.rejectNext = true;
    const result = await command.execute({
      userId: ALICE,
      idempotencyKey: "00000000-0000-0000-0000-000000000099",
      accountId: aliceUsd.id,
      amount: { amount: 100n, currency: "USD" },
      source: "card_4242",
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBeInstanceOf(ProcessorRejected);
    expect(events.published.map((e) => e.name)).toEqual(["wallet.TopupFailed"]);
    // No ledger entries written when the processor rejects.
    const balance = await accounts.getBalance(aliceUsd.id);
    expect(balance.money.amount).toBe(0n);
  });
});
