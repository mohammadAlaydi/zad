import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ExternalMovementResponse, WithdrawalRequest } from "@zadpay/validation";
import { type ClientError } from "@/lib/api/errors";
import { walletService } from "../services/walletService";

export interface WithdrawInput {
  request: WithdrawalRequest;
  idempotencyKey: string;
}

export function useWithdraw() {
  const qc = useQueryClient();
  return useMutation<ExternalMovementResponse, ClientError, WithdrawInput>({
    mutationFn: async ({ request, idempotencyKey }) => {
      const result = await walletService.withdraw(request, idempotencyKey);
      if (!result.ok) throw result.error;
      return result.value;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["wallet", "balance"] });
      void qc.invalidateQueries({ queryKey: ["wallet", "transactions"] });
    },
  });
}
