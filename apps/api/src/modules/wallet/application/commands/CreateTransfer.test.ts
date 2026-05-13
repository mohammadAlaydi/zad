import { beforeEach, describe, expect, it } from "vitest";
import { RecordingEventBus } from "../../../../../test/fakes/identity.js";
import {
  FixedClock,
  InMemoryAccountRepository,
  InMemoryTransferWriter,
  SequentialIdGenerator,
} from "../../../../../test/fakes/wallet.js";
import { Account } from "../../domain/entities/Account.js";
import {
  AccountAccessDenied,
  AccountNotFound,
  CurrencyMismatch,
  InsufficientBalance,
  InvalidAmount,
  SameAccountTransfer,
} from "../../domain/errors/index.js";
import { CreateTransferCommand } from "./CreateTransfer.js";

const NOW = new Date("2026-05-13T12:00:00Z");
const ALICE = "00000000-0000-0000-0000-00000000aaaa";
const BOB = "00000000-0000-0000-0000-00000000bbbb";

describe("CreateTransferCommand", () => {
  let accounts: InMemoryAccountRepository;
  let writer: InMemoryTransferWriter;
  let events: RecordingEventBus;
  let ids: SequentialIdGenerator;
  let clock: FixedClock;
  let command: CreateTransferCommand;

  let aliceUsd: Account;
  let aliceEur: Account;
  let bobUsd: Account;

  beforeEach(async () => {
    accounts = new InMemoryAccountRepository();
    writer = new InMemoryTransferWriter(accounts);
    events = new RecordingEventBus();
    ids = new SequentialIdGenerator();
    clock = new FixedClock(NOW);

    aliceUsd = Account.create({
      id: "00000000-0000-0000-0000-000000000001",
      ownerId: ALICE,
      currency: "USD",
      type: "wallet",
      now: NOW,
    });
    aliceEur = Account.create({
      id: "00000000-0000-0000-0000-000000000002",
      ownerId: ALICE,
      currency: "EUR",
      type: "wallet",
      now: NOW,
    });
    bobUsd = Account.create({
      id: "00000000-0000-0000-0000-000000000003",
      ownerId: BOB,
      currency: "USD",
      type: "wallet",
      now: NOW,
    });
    await accounts.save(aliceUsd);
    await accounts.save(aliceEur);
    await accounts.save(bobUsd);

    // Alice starts with $100 (10_000 cents).
    accounts.setBalance(aliceUsd.id, 10_000n, "USD", NOW);

    command = new CreateTransferCommand({ accounts, writer, ids, clock, events });
  });

  it("transfers successfully and updates both balances", async () => {
    const result = await command.execute({
      userId: ALICE,
      idempotencyKey: "00000000-0000-0000-0000-000000000099",
      sourceAccountId: aliceUsd.id,
      destAccountId: bobUsd.id,
      amount: { amount: 2_500n, currency: "USD" },
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.type).toBe("transfer");
    expect(result.value.status).toBe("posted");
    expect(result.value.entries).toHaveLength(2);

    // Balances reflect the transfer.
    const aliceAfter = await accounts.getBalance(aliceUsd.id);
    const bobAfter = await accounts.getBalance(bobUsd.id);
    expect(aliceAfter.money.amount).toBe(7_500n);
    expect(bobAfter.money.amount).toBe(2_500n);

    // Two events fired: TransferCreated + TransferPosted.
    expect(events.published.map((e) => e.name)).toEqual([
      "wallet.TransferCreated",
      "wallet.TransferPosted",
    ]);
  });

  it("rejects InsufficientBalance and publishes TransferFailed", async () => {
    const result = await command.execute({
      userId: ALICE,
      idempotencyKey: "00000000-0000-0000-0000-000000000099",
      sourceAccountId: aliceUsd.id,
      destAccountId: bobUsd.id,
      amount: { amount: 20_000n, currency: "USD" },
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBeInstanceOf(InsufficientBalance);
    expect(events.published.map((e) => e.name)).toEqual([
      "wallet.TransferCreated",
      "wallet.TransferFailed",
    ]);
  });

  it("rejects same-account transfer", async () => {
    const result = await command.execute({
      userId: ALICE,
      idempotencyKey: "00000000-0000-0000-0000-000000000099",
      sourceAccountId: aliceUsd.id,
      destAccountId: aliceUsd.id,
      amount: { amount: 100n, currency: "USD" },
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBeInstanceOf(SameAccountTransfer);
  });

  it("rejects non-positive amount", async () => {
    const result = await command.execute({
      userId: ALICE,
      idempotencyKey: "00000000-0000-0000-0000-000000000099",
      sourceAccountId: aliceUsd.id,
      destAccountId: bobUsd.id,
      amount: { amount: 0n, currency: "USD" },
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBeInstanceOf(InvalidAmount);
  });

  it("rejects when source isn't owned by the caller", async () => {
    const result = await command.execute({
      userId: BOB, // Bob attempts to drain Alice's wallet
      idempotencyKey: "00000000-0000-0000-0000-000000000099",
      sourceAccountId: aliceUsd.id,
      destAccountId: bobUsd.id,
      amount: { amount: 100n, currency: "USD" },
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBeInstanceOf(AccountAccessDenied);
  });

  it("rejects currency mismatch", async () => {
    const result = await command.execute({
      userId: ALICE,
      idempotencyKey: "00000000-0000-0000-0000-000000000099",
      sourceAccountId: aliceUsd.id,
      destAccountId: aliceEur.id,
      amount: { amount: 100n, currency: "USD" },
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBeInstanceOf(CurrencyMismatch);
  });

  it("returns AccountNotFound for an unknown destination", async () => {
    const result = await command.execute({
      userId: ALICE,
      idempotencyKey: "00000000-0000-0000-0000-000000000099",
      sourceAccountId: aliceUsd.id,
      destAccountId: "00000000-0000-0000-0000-000000000099",
      amount: { amount: 100n, currency: "USD" },
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBeInstanceOf(AccountNotFound);
  });
});
