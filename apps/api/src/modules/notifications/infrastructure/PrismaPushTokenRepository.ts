import type { Prisma, PrismaClient } from "@prisma/client";
import type { PushTokenRepository, PushTokenRow } from "../domain/ports/PushTokenRepository.js";

function platformOf(p: string): PushTokenRow["platform"] {
  if (p === "ios" || p === "android" || p === "web") return p;
  return "android";
}

export class PrismaPushTokenRepository implements PushTokenRepository {
  constructor(private readonly prisma: PrismaClient | Prisma.TransactionClient) {}

  async upsert(input: PushTokenRow): Promise<void> {
    // Dedup on the raw token value — registering the same physical device
    // multiple times is a no-op apart from updating the lastSeenAt
    // timestamp and the user attribution (if a different user signs in
    // on the same device, ownership flips).
    await this.prisma.pushToken.upsert({
      where: { token: input.token },
      create: {
        userId: input.userId,
        token: input.token,
        platform: input.platform,
        deviceName: input.deviceName,
      },
      update: {
        userId: input.userId,
        platform: input.platform,
        deviceName: input.deviceName,
        lastSeenAt: new Date(),
      },
    });
  }

  async remove(token: string): Promise<void> {
    // Idempotent — delete-by-unique returns void if the row is missing.
    await this.prisma.pushToken.deleteMany({ where: { token } });
  }

  async listForUser(userId: string): Promise<PushTokenRow[]> {
    const rows = await this.prisma.pushToken.findMany({ where: { userId } });
    return rows.map((r) => ({
      userId: r.userId,
      token: r.token,
      platform: platformOf(r.platform),
      deviceName: r.deviceName,
    }));
  }

  async pruneInvalid(token: string): Promise<void> {
    await this.prisma.pushToken.deleteMany({ where: { token } });
  }
}
