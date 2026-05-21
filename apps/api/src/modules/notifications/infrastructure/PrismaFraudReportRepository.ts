import type { PrismaClient } from "@prisma/client";
import type {
  FraudReportRepository,
  NewFraudReport,
  SavedFraudReport,
} from "../domain/ports/FraudReportRepository.js";

export class PrismaFraudReportRepository implements FraudReportRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: NewFraudReport): Promise<SavedFraudReport> {
    const row = await this.prisma.fraudReport.create({
      data: {
        userId: input.userId,
        transactionId: input.transactionId,
        category: input.category,
        description: input.description,
      },
    });
    return {
      id: row.id,
      userId: row.userId,
      transactionId: row.transactionId,
      category: row.category,
      description: row.description,
      status: row.status,
      createdAt: row.createdAt,
    };
  }
}
