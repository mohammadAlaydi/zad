import type { Prisma, PrismaClient, KycApplication as PrismaKycApplication } from "@prisma/client";
import { KycApplication, type TransitionEntry } from "../../domain/entities/KycApplication.js";
import type { KycApplicationRepository } from "../../domain/ports/KycApplicationRepository.js";
import {
  isKycApplicationStatus,
  type KycApplicationStatus,
} from "../../domain/value-objects/KycApplicationStatus.js";

function toDomain(row: PrismaKycApplication): KycApplication {
  const status: KycApplicationStatus = isKycApplicationStatus(row.status) ? row.status : "pending";
  // history is stored as JSON; we trust our own writes.
  const history = (row.history as TransitionEntry[] | null) ?? [];
  return KycApplication.rehydrate({
    id: row.id,
    userId: row.userId,
    provider: row.provider,
    providerRef: row.providerRef,
    status,
    submittedAt: row.submittedAt,
    decidedAt: row.decidedAt,
    rejectionReason: row.rejectionReason,
    history,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export class PrismaKycApplicationRepository implements KycApplicationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<KycApplication | null> {
    const row = await this.prisma.kycApplication.findUnique({ where: { id } });
    return row === null ? null : toDomain(row);
  }

  async findByUserId(userId: string): Promise<KycApplication | null> {
    const row = await this.prisma.kycApplication.findUnique({ where: { userId } });
    return row === null ? null : toDomain(row);
  }

  async save(application: KycApplication): Promise<void> {
    await this.prisma.kycApplication.upsert({
      where: { id: application.id },
      create: {
        id: application.id,
        userId: application.userId,
        provider: application.provider,
        providerRef: application.providerRef,
        status: application.status,
        submittedAt: application.submittedAt,
        decidedAt: application.decidedAt,
        rejectionReason: application.rejectionReason,
        history: application.history as unknown as Prisma.InputJsonValue,
      },
      update: {
        providerRef: application.providerRef,
        status: application.status,
        submittedAt: application.submittedAt,
        decidedAt: application.decidedAt,
        rejectionReason: application.rejectionReason,
        history: application.history as unknown as Prisma.InputJsonValue,
      },
    });
  }
}
