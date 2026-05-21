// User-submitted fraud reports. The app only ever creates rows — ops /
// support reads them through internal tooling.

export type FraudCategory = "unauthorized" | "scam" | "phishing" | "other";

export interface NewFraudReport {
  userId: string;
  transactionId: string | null;
  category: FraudCategory;
  description: string;
}

export interface SavedFraudReport {
  id: string;
  userId: string;
  transactionId: string | null;
  category: string;
  description: string;
  status: string;
  createdAt: Date;
}

export interface FraudReportRepository {
  create(input: NewFraudReport): Promise<SavedFraudReport>;
}
