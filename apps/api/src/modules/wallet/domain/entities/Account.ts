import type { Currency } from "@zadpay/types";
import type { AccountStatus, AccountType } from "../value-objects/AccountType.js";

export class Account {
  private constructor(
    public readonly id: string,
    public readonly ownerId: string,
    public readonly currency: Currency,
    public readonly type: AccountType,
    public readonly status: AccountStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static rehydrate(props: {
    id: string;
    ownerId: string;
    currency: Currency;
    type: AccountType;
    status: AccountStatus;
    createdAt: Date;
    updatedAt: Date;
  }): Account {
    return new Account(
      props.id,
      props.ownerId,
      props.currency,
      props.type,
      props.status,
      props.createdAt,
      props.updatedAt,
    );
  }

  static create(props: {
    id: string;
    ownerId: string;
    currency: Currency;
    type: AccountType;
    now: Date;
  }): Account {
    return new Account(
      props.id,
      props.ownerId,
      props.currency,
      props.type,
      "active",
      props.now,
      props.now,
    );
  }
}
