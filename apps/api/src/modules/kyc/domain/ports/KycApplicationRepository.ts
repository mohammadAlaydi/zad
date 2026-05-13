import type { KycApplication } from "../entities/KycApplication.js";

export interface KycApplicationRepository {
  findById(id: string): Promise<KycApplication | null>;
  findByUserId(userId: string): Promise<KycApplication | null>;
  save(application: KycApplication): Promise<void>;
}
