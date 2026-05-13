import { type Currency, minorUnitsFor } from "./Currency";

export class CurrencyMismatchError extends Error {
  constructor(left: Currency, right: Currency) {
    super(`Currency mismatch: ${left} vs ${right}`);
    this.name = "CurrencyMismatchError";
  }
}

export class Money {
  private constructor(
    public readonly amount: bigint,
    public readonly currency: Currency,
  ) {}

  static of(amount: bigint | number, currency: Currency): Money {
    if (typeof amount === "number") {
      if (!Number.isInteger(amount)) {
        throw new Error(`Money.of: number must be integer minor units, got ${amount}`);
      }
      return new Money(BigInt(amount), currency);
    }
    return new Money(amount, currency);
  }

  static zero(currency: Currency): Money {
    return new Money(0n, currency);
  }

  static fromJSON(j: { amount: string; currency: Currency }): Money {
    return new Money(BigInt(j.amount), j.currency);
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  sub(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount - other.amount, this.currency);
  }

  neg(): Money {
    return new Money(-this.amount, this.currency);
  }

  abs(): Money {
    return new Money(this.amount < 0n ? -this.amount : this.amount, this.currency);
  }

  isNegative(): boolean {
    return this.amount < 0n;
  }

  isPositive(): boolean {
    return this.amount > 0n;
  }

  isZero(): boolean {
    return this.amount === 0n;
  }

  cmp(other: Money): -1 | 0 | 1 {
    this.assertSameCurrency(other);
    if (this.amount === other.amount) return 0;
    return this.amount < other.amount ? -1 : 1;
  }

  equals(other: Money): boolean {
    return this.currency === other.currency && this.amount === other.amount;
  }

  /** Major-unit string for display only. Not for arithmetic. */
  toDisplayString(): string {
    const minor = minorUnitsFor(this.currency);
    if (minor === 0) return this.amount.toString();
    const sign = this.amount < 0n ? "-" : "";
    const abs = this.amount < 0n ? -this.amount : this.amount;
    const padded = abs.toString().padStart(minor + 1, "0");
    const whole = padded.slice(0, -minor);
    const frac = padded.slice(-minor);
    return `${sign}${whole}.${frac}`;
  }

  toJSON(): { amount: string; currency: Currency } {
    return { amount: this.amount.toString(), currency: this.currency };
  }

  private assertSameCurrency(other: Money): void {
    if (other.currency !== this.currency) {
      throw new CurrencyMismatchError(this.currency, other.currency);
    }
  }
}
