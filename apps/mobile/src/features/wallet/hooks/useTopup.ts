import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ExternalMovementResponse, TopupRequest } from "@zadpay/validation";
import { type ClientError } from "@/lib/api/errors";
import { walletService } from "../services/walletService";

export interface TopupInput {
  request: TopupRequest;
  idempotencyKey: string;
}

export function useTopup() {
  const qc = useQueryClient();
  return useMutation<ExternalMovementResponse, ClientError, TopupInput>({
    mutationFn: async ({ request, idempotencyKey }) => {
      const result = await walletService.topup(request, idempotencyKey);
      if (!result.ok) throw result.error;
      return result.value;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["wallet", "balance"] });
      void qc.invalidateQueries({ queryKey: ["wallet", "transactions"] });
    },
  });
}
