import { ok, type Result } from "@zadpay/errors";
import type {
  FraudCategory,
  FraudReportRepository,
  SavedFraudReport,
} from "../domain/ports/FraudReportRepository.js";

export interface SubmitFraudReportInput {
  userId: string;
  transactionId: string | null;
  category: FraudCategory;
  description: string;
}

export class SubmitFraudReportCommand {
  constructor(private readonly repo: FraudReportRepository) {}

  async execute(input: SubmitFraudReportInput): Promise<Result<SavedFraudReport, never>> {
    const saved = await this.repo.create({
      userId: input.userId,
      transactionId: input.transactionId,
      category: input.category,
      description: input.description.trim(),
    });
    return ok(saved);
  }
}
