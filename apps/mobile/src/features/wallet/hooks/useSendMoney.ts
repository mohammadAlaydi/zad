import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { TransferRequest, TransferResponse } from "@zadpay/validation";
import { type ClientError } from "@/lib/api/errors";
import { walletService } from "../services/walletService";

export interface SendInput {
  request: TransferRequest;
  /// Stable across retries of the same logical send attempt. The caller
  /// generates one with newIdempotencyKey() on the send-flow screen mount
  /// and reuses it until the user starts a new flow.
  idempotencyKey: string;
}

export function useSendMoney() {
  const qc = useQueryClient();
  return useMutation<TransferResponse, ClientError, SendInput>({
    mutationFn: async ({ request, idempotencyKey }) => {
      const result = await walletService.send(request, idempotencyKey);
      if (!result.ok) throw result.error;
      return result.value;
    },
    onSuccess: () => {
      // Balance + transactions changed for both source and (other-user) dest;
      // invalidate the caller's caches. Other users' caches are updated on
      // their next refetch — server is source of truth.
      void qc.invalidateQueries({ queryKey: ["wallet", "balance"] });
      void qc.invalidateQueries({ queryKey: ["wallet", "transactions"] });
    },
  });
}
