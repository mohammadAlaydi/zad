// Only file in this module that touches identity.users. Mapping between
// Prisma rows and domain aggregates lives here so the domain stays unaware
// of the persistence layer.

import type { Prisma, PrismaClient, User as PrismaUser } from "@prisma/client";
import { User } from "../../domain/entities/User.js";
import type { UserRepository } from "../../domain/ports/UserRepository.js";
import { Email } from "../../domain/value-objects/Email.js";
import { isKycStatus, type KycStatus } from "../../domain/value-objects/KycStatus.js";
import { isRole, type Role } from "../../domain/value-objects/Role.js";

function toDomain(row: PrismaUser): User {
  const status: KycStatus = isKycStatus(row.kycStatus) ? row.kycStatus : "not_started";
  const roles: Role[] = row.roles.filter(isRole);
  return User.rehydrate({
    id: row.id,
    email: row.email === null ? null : Email.of(row.email),
    phone: row.phone,
    fullName: row.fullName,
    passwordHash: row.passwordHash,
    kycStatus: status,
    roles,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient | Prisma.TransactionClient) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    return row === null ? null : toDomain(row);
  }

  async findByEmail(email: Email): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { email: email.value } });
    return row === null ? null : toDomain(row);
  }

  async findByPhone(phone: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { phone } });
    return row === null ? null : toDomain(row);
  }

  async save(user: User): Promise<void> {
    await this.prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: user.email?.value ?? null,
        phone: user.phone,
        fullName: user.fullName,
        passwordHash: user.passwordHash,
        kycStatus: user.kycStatus,
        roles: [...user.roles],
      },
      update: {
        email: user.email?.value ?? null,
        phone: user.phone,
        fullName: user.fullName,
        passwordHash: user.passwordHash,
        kycStatus: user.kycStatus,
        roles: [...user.roles],
      },
    });
  }
}
