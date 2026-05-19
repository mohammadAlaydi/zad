import type { PrismaClient } from "@prisma/client";
import type { UserItem } from "../domain/UserItem.js";

export class PrismaUserItemRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(userId: string, feature: string): Promise<UserItem[]> {
    const rows = await this.prisma.userItem.findMany({
      where: { userId, feature },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => this.toDomain(r));
  }

  async findById(userId: string, id: string): Promise<UserItem | null> {
    const row = await this.prisma.userItem.findUnique({ where: { id } });
    if (row === null || row.userId !== userId) return null;
    return this.toDomain(row);
  }

  async create(input: { userId: string; feature: string; payload: unknown }): Promise<UserItem> {
    const row = await this.prisma.userItem.create({
      data: {
        userId: input.userId,
        feature: input.feature,
        // Prisma's Json type is strict — cast to its expected shape.
        payload: input.payload as object,
      },
    });
    return this.toDomain(row);
  }

  /// Authorization is the caller's responsibility (we filter by userId
  /// here, but the route layer must enforce that the JWT subject matches).
  async update(userId: string, id: string, payload: unknown): Promise<UserItem | null> {
    const existing = await this.findById(userId, id);
    if (existing === null) return null;
    const row = await this.prisma.userItem.update({
      where: { id },
      data: { payload: payload as object },
    });
    return this.toDomain(row);
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const existing = await this.findById(userId, id);
    if (existing === null) return false;
    await this.prisma.userItem.delete({ where: { id } });
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toDomain(row: any): UserItem {
    return {
      id: row.id,
      userId: row.userId,
      feature: row.feature,
      payload: row.payload,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
