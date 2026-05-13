import { err, ok, type Result } from "@zadpay/errors";
import type { Money } from "@zadpay/types";
import { AccountAccessDenied, AccountNotFound } from "../../domain/errors/index.js";
import type { AccountRepository } from "../../domain/ports/AccountRepository.js";

export interface GetAccountBalanceInput {
  userId: string;
  accountId: string;
}

export interface GetAccountBalanceResult {
  accountId: string;
  balance: Money;
  updatedAt: Date | null;
}

export interface GetAccountBalanceDeps {
  accounts: AccountRepository;
}

export class GetAccountBalanceQuery {
  constructor(private readonly deps: GetAccountBalanceDeps) {}

  async execute(
    input: GetAccountBalanceInput,
  ): Promise<Result<GetAccountBalanceResult, AccountNotFound | AccountAccessDenied>> {
    const account = await this.deps.accounts.findById(input.accountId);
    if (account === null) return err(new AccountNotFound());
    // Per-row authorisation in the repository pattern. 404 not 403 so we
    // don't leak existence.
    if (account.ownerId !== input.userId) return err(new AccountAccessDenied());

    const { money, updatedAt } = await this.deps.accounts.getBalance(account.id);
    return ok({ accountId: account.id, balance: money, updatedAt });
  }
}
