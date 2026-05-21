import { useMutation } from "@tanstack/react-query";
import type { FraudReportResponse, SubmitFraudReportRequest } from "@zadpay/validation";
import { type ClientError } from "@/lib/api/errors";
import { fraudService } from "./fraudService";

export function useSubmitFraudReport() {
  return useMutation<FraudReportResponse, ClientError, SubmitFraudReportRequest>({
    mutationFn: async (input) => {
      const result = await fraudService.submit(input);
      if (!result.ok) throw result.error;
      return result.value;
    },
  });
}
