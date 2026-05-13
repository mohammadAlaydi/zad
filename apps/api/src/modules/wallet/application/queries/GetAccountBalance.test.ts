import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryAccountRepository } from "../../../../../test/fakes/wallet.js";
import { Account } from "../../domain/entities/Account.js";
import { AccountNotFound } from "../../domain/errors/index.js";
import { GetAccountBalanceQuery } from "./GetAccountBalance.js";

describe("GetAccountBalanceQuery", () => {
  let accounts: InMemoryAccountRepository;
  let query: GetAccountBalanceQuery;
  const NOW = new Date("2026-05-13T12:00:00Z");
  const USER = "00000000-0000-0000-0000-00000000aaaa";
  const OTHER = "00000000-0000-0000-0000-00000000bbbb";

  beforeEach(() => {
    accounts = new InMemoryAccountRepository();
    query = new GetAccountBalanceQuery({ accounts });
  });

  it("returns zero for a new account (no projection rows)", async () => {
    const account = Account.create({
      id: "00000000-0000-0000-0000-000000000001",
      ownerId: USER,
      currency: "USD",
      type: "wallet",
      now: NOW,
    });
    await accounts.save(account);

    const result = await query.execute({ userId: USER, accountId: account.id });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.balance.amount).toBe(0n);
    expect(result.value.balance.currency).toBe("USD");
    expect(result.value.updatedAt).toBeNull();
  });

  it("reflects the seeded projection amount", async () => {
    const account = Account.create({
      id: "00000000-0000-0000-0000-000000000002",
      ownerId: USER,
      currency: "USD",
      type: "wallet",
      now: NOW,
    });
    await accounts.save(account);
    accounts.balances.set(account.id, {
      amount: 12_345n,
      currency: "USD",
      updatedAt: new Date("2026-05-13T12:30:00Z"),
    });

    const result = await query.execute({ userId: USER, accountId: account.id });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.balance.amount).toBe(12_345n);
    expect(result.value.updatedAt?.toISOString()).toBe("2026-05-13T12:30:00.000Z");
  });

  it("returns AccountNotFound when the account doesn't exist", async () => {
    const result = await query.execute({
      userId: USER,
      accountId: "00000000-0000-0000-0000-000000000099",
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBeInstanceOf(AccountNotFound);
  });

  it("returns 404 (not 403) for another user's account so existence stays private", async () => {
    const account = Account.create({
      id: "00000000-0000-0000-0000-000000000003",
      ownerId: OTHER,
      currency: "USD",
      type: "wallet",
      now: NOW,
    });
    await accounts.save(account);

    const result = await query.execute({ userId: USER, accountId: account.id });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.httpStatus).toBe(404);
    expect(result.error.code).toBe("WALLET.ACCOUNT_NOT_FOUND");
  });
});
