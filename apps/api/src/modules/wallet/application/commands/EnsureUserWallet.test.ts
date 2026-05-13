import { beforeEach, describe, expect, it } from "vitest";
import { RecordingEventBus } from "../../../../../test/fakes/identity.js";
import {
  FixedClock,
  InMemoryAccountRepository,
  SequentialIdGenerator,
} from "../../../../../test/fakes/wallet.js";
import { EnsureUserWalletCommand } from "./EnsureUserWallet.js";

describe("EnsureUserWalletCommand", () => {
  let accounts: InMemoryAccountRepository;
  let events: RecordingEventBus;
  let ids: SequentialIdGenerator;
  let clock: FixedClock;
  let ensure: EnsureUserWalletCommand;

  const USER = "00000000-0000-0000-0000-00000000aaaa";

  beforeEach(() => {
    accounts = new InMemoryAccountRepository();
    events = new RecordingEventBus();
    ids = new SequentialIdGenerator();
    clock = new FixedClock(new Date("2026-05-13T12:00:00Z"));
    ensure = new EnsureUserWalletCommand({ accounts, ids, clock, events });
  });

  it("creates an active USD wallet on first call and emits AccountOpened", async () => {
    const result = await ensure.execute({ userId: USER, currency: "USD" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.ownerId).toBe(USER);
    expect(result.value.currency).toBe("USD");
    expect(result.value.type).toBe("wallet");
    expect(result.value.status).toBe("active");
    expect(events.published[0]?.name).toBe("wallet.AccountOpened");
  });

  it("is idempotent — second call returns the same account, no new event", async () => {
    const first = await ensure.execute({ userId: USER, currency: "USD" });
    expect(first.ok).toBe(true);
    events.published.length = 0;
    const second = await ensure.execute({ userId: USER, currency: "USD" });
    expect(second.ok).toBe(true);
    if (!first.ok || !second.ok) return;
    expect(second.value.id).toBe(first.value.id);
    expect(events.published).toHaveLength(0);
  });

  it("creates a separate account per currency", async () => {
    const usd = await ensure.execute({ userId: USER, currency: "USD" });
    const eur = await ensure.execute({ userId: USER, currency: "EUR" });
    expect(usd.ok && eur.ok).toBe(true);
    if (!usd.ok || !eur.ok) return;
    expect(usd.value.id).not.toBe(eur.value.id);
  });
});
