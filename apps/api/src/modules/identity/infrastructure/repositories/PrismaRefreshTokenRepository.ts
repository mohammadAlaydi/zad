import type { PrismaClient, RefreshToken as PrismaRefreshToken } from "@prisma/client";
import { RefreshToken } from "../../domain/entities/RefreshToken.js";
import type { RefreshTokenRepository } from "../../domain/ports/RefreshTokenRepository.js";

function toDomain(row: PrismaRefreshToken): RefreshToken {
  return RefreshToken.rehydrate({
    id: row.id,
    userId: row.userId,
    family: row.family,
    tokenHash: row.tokenHash,
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
    revokedAt: row.revokedAt,
    rotatedTo: row.rotatedTo,
  });
}

export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    const row = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });
    return row === null ? null : toDomain(row);
  }

  async save(token: RefreshToken): Promise<void> {
    await this.prisma.refreshToken.create({
      data: {
        id: token.id,
        userId: token.userId,
        family: token.family,
        tokenHash: token.tokenHash,
        expiresAt: token.expiresAt,
        revokedAt: token.revokedAt,
        rotatedTo: token.rotatedTo,
      },
    });
  }

  // Atomic rotate: revoke old + create new in one DB transaction so we
  // never end up with the old revoked but new missing (or vice versa).
  async rotate(oldId: string, newToken: RefreshToken): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.refreshToken.update({
        where: { id: oldId },
        data: { revokedAt: new Date(), rotatedTo: newToken.id },
      }),
      this.prisma.refreshToken.create({
        data: {
          id: newToken.id,
          userId: newToken.userId,
          family: newToken.family,
          tokenHash: newToken.tokenHash,
          expiresAt: newToken.expiresAt,
        },
      }),
    ]);
  }

  async revokeFamily(family: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { family, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async findActiveByUser(userId: string, now: Date): Promise<readonly RefreshToken[]> {
    const rows = await this.prisma.refreshToken.findMany({
      where: { userId, revokedAt: null, rotatedTo: null, expiresAt: { gt: now } },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toDomain);
  }

  async revokeById(id: string, userId: string, now: Date): Promise<boolean> {
    // Scope the update by userId so a leaked token id can't be used to
    // revoke someone else's session.
    const result = await this.prisma.refreshToken.updateMany({
      where: { id, userId, revokedAt: null },
      data: { revokedAt: now },
    });
    return result.count > 0;
  }

  async revokeAllForUser(userId: string, now: Date): Promise<number> {
    const result = await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: now },
    });
    return result.count;
  }
}
