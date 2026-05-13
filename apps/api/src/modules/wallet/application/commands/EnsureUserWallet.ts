import { ok, type Result } from "@zadpay/errors";
import type { Currency } from "@zadpay/types";
import type { EventBus } from "../../../../shared/events/EventBus.js";
import { Account } from "../../domain/entities/Account.js";
import type { WalletAccountOpened } from "../../domain/events/index.js";
import type { AccountRepository } from "../../domain/ports/AccountRepository.js";
import type { Clock } from "../../domain/ports/Clock.js";
import type { IdGenerator } from "../../domain/ports/IdGenerator.js";

export interface EnsureUserWalletInput {
  userId: string;
  currency: Currency;
}

export interface EnsureUserWalletDeps {
  accounts: AccountRepository;
  ids: IdGenerator;
  clock: Clock;
  events: EventBus;
}

// Idempotent: returns the user's wallet account in the given currency,
// creating it if missing. Invoked from the identity.UserRegistered
// subscription so every new user lands with a default wallet.
export class EnsureUserWalletCommand {
  constructor(private readonly deps: EnsureUserWalletDeps) {}

  async execute(input: EnsureUserWalletInput): Promise<Result<Account, never>> {
    const existing = await this.deps.accounts.findByOwnerAndCurrency(
      input.userId,
      input.currency,
      "wallet",
    );
    if (existing !== null) return ok(existing);

    const account = Account.create({
      id: this.deps.ids.uuid(),
      ownerId: input.userId,
      currency: input.currency,
      type: "wallet",
      now: this.deps.clock.now(),
    });
    await this.deps.accounts.save(account);

    const event: WalletAccountOpened = {
      name: "wallet.AccountOpened",
      aggregateId: account.id,
      occurredAt: this.deps.clock.now(),
      payload: {
        accountId: account.id,
        ownerId: account.ownerId,
        currency: account.currency,
        type: account.type,
      },
    };
    await this.deps.events.publish(event);
    return ok(account);
  }
}
