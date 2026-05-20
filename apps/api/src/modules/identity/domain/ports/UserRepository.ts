import type { User } from "../entities/User.js";
import type { Email } from "../value-objects/Email.js";

// Only the implementation (PrismaUserRepository) touches the identity.users
// table. Other modules — even other parts of this module's HTTP layer — go
// through this interface.
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findByPhone(phone: string): Promise<User | null>;
  save(user: User): Promise<void>;
}
