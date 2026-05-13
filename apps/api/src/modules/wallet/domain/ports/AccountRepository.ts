import type { Currency, Money } from "@zadpay/types";
import type { Account } from "../entities/Account.js";
import type { AccountType } from "../value-objects/AccountType.js";

export interface AccountRepository {
  findById(id: string): Promise<Account | null>;
  findByOwnerAndCurrency(
    ownerId: string,
    currency: Currency,
    type: AccountType,
  ): Promise<Account | null>;
  listForOwner(ownerId: string): Promise<Account[]>;
  save(account: Account): Promise<void>;
  /// Reads the projection in account_balances. Returns zero in the account's
  /// currency if no rows have been posted yet.
  getBalance(accountId: string): Promise<{ money: Money; updatedAt: Date | null }>;
}
