import type { UserRepository } from "../../domain/ports/UserRepository.js";

export interface UserProfileSummary {
  userId: string;
  fullName: string | null;
  phone: string | null;
  email: string | null;
}

// Read-only cross-module port. Used by the notifications module to fetch
// the sender + recipient display names for push messages without coupling
// to identity internals.
export interface UserLookup {
  byId(userId: string): Promise<UserProfileSummary | null>;
}

export class UserRepositoryUserLookup implements UserLookup {
  constructor(private readonly users: UserRepository) {}

  async byId(userId: string): Promise<UserProfileSummary | null> {
    const user = await this.users.findById(userId);
    if (user === null) return null;
    return {
      userId: user.id,
      fullName: user.fullName,
      phone: user.phone,
      email: user.email?.value ?? null,
    };
  }
}
