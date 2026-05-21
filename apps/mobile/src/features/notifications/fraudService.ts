import { type Result } from "@zadpay/errors";
import {
  FraudReportResponseSchema,
  SubmitFraudReportRequestSchema,
  type FraudReportResponse,
  type SubmitFraudReportRequest,
} from "@zadpay/validation";
import { type ClientError } from "@/lib/api/errors";
import { api } from "@/lib/api/instance";

export const fraudService = {
  async submit(input: SubmitFraudReportRequest): Promise<Result<FraudReportResponse, ClientError>> {
    SubmitFraudReportRequestSchema.parse(input);
    return api.post<FraudReportResponse>("/v1/fraud-reports", input, FraudReportResponseSchema);
  },
};
