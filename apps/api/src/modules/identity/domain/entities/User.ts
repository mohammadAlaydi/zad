import { type Email } from "../value-objects/Email.js";
import { type KycStatus } from "../value-objects/KycStatus.js";
import { type Role } from "../value-objects/Role.js";

// User aggregate. Identity-scoped; cross-module references use the id string
// only (no FK across schemas — see ADR-0005).
export class User {
  private constructor(
    public readonly id: string,
    public readonly email: Email | null,
    public readonly phone: string | null,
    public readonly fullName: string | null,
    public readonly passwordHash: string,
    public readonly kycStatus: KycStatus,
    public readonly roles: readonly Role[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static rehydrate(props: {
    id: string;
    email: Email | null;
    phone: string | null;
    fullName: string | null;
    passwordHash: string;
    kycStatus: KycStatus;
    roles: readonly Role[];
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User(
      props.id,
      props.email,
      props.phone,
      props.fullName,
      props.passwordHash,
      props.kycStatus,
      props.roles,
      props.createdAt,
      props.updatedAt,
    );
  }

  static create(props: {
    id: string;
    email: Email | null;
    phone: string | null;
    fullName: string | null;
    passwordHash: string;
    now: Date;
  }): User {
    return new User(
      props.id,
      props.email,
      props.phone,
      props.fullName,
      props.passwordHash,
      "not_started",
      ["customer"],
      props.now,
      props.now,
    );
  }

  hasRole(role: Role): boolean {
    return this.roles.includes(role);
  }

  withPasswordHash(passwordHash: string, now: Date): User {
    return new User(
      this.id,
      this.email,
      this.phone,
      this.fullName,
      passwordHash,
      this.kycStatus,
      this.roles,
      this.createdAt,
      now,
    );
  }

  withEmail(email: Email, now: Date): User {
    return new User(
      this.id,
      email,
      this.phone,
      this.fullName,
      this.passwordHash,
      this.kycStatus,
      this.roles,
      this.createdAt,
      now,
    );
  }

  withFullName(fullName: string, now: Date): User {
    return new User(
      this.id,
      this.email,
      this.phone,
      fullName,
      this.passwordHash,
      this.kycStatus,
      this.roles,
      this.createdAt,
      now,
    );
  }
}
