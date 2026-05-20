import type { UserRepository } from "../../domain/ports/UserRepository.js";

export interface PhoneLookupRecord {
  userId: string;
  fullName: string | null;
  phone: string;
}

// Read-only cross-module port. Wallet uses this to resolve a recipient phone
// number to a user id without depending on identity's internals. Per ADR-0005
// this is exposed via the identity module barrel.
export interface PhoneLookup {
  byPhone(phone: string): Promise<PhoneLookupRecord | null>;
}

export class UserRepositoryPhoneLookup implements PhoneLookup {
  constructor(private readonly users: UserRepository) {}

  async byPhone(phone: string): Promise<PhoneLookupRecord | null> {
    const user = await this.users.findByPhone(phone);
    if (user === null || user.phone === null) return null;
    return { userId: user.id, fullName: user.fullName, phone: user.phone };
  }
}
