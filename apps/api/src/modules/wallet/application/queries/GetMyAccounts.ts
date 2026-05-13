import { ok, type Result } from "@zadpay/errors";
import type { Account } from "../../domain/entities/Account.js";
import type { AccountRepository } from "../../domain/ports/AccountRepository.js";

export interface GetMyAccountsInput {
  userId: string;
}

export interface GetMyAccountsDeps {
  accounts: AccountRepository;
}

export class GetMyAccountsQuery {
  constructor(private readonly deps: GetMyAccountsDeps) {}

  async execute(input: GetMyAccountsInput): Promise<Result<Account[], never>> {
    const all = await this.deps.accounts.listForOwner(input.userId);
    // Hide internal account types from the user-facing endpoint.
    const userFacing = all.filter((a) => a.type === "wallet");
    return ok(userFacing);
  }
}
