import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SendByPhoneRequest, SendByPhoneResponse } from "@zadpay/validation";
import { type ClientError } from "@/lib/api/errors";
import { walletService } from "../services/walletService";

export interface SendByPhoneInput {
  request: SendByPhoneRequest;
  // Stable across retries of the same logical send attempt. The caller
  // generates one with newIdempotencyKey() on the send-flow screen mount
  // and reuses it for retries of the same payment intent.
  idempotencyKey: string;
}

export function useSendByPhone() {
  const qc = useQueryClient();
  return useMutation<SendByPhoneResponse, ClientError, SendByPhoneInput>({
    mutationFn: async ({ request, idempotencyKey }) => {
      const result = await walletService.sendByPhone(request, idempotencyKey);
      if (!result.ok) throw result.error;
      return result.value;
    },
    onSuccess: () => {
      // The recipient's balance updates server-side; their device picks it
      // up via the 5s poll on the wallet screen. The sender's local cache
      // is invalidated here so they see the deduction immediately.
      void qc.invalidateQueries({ queryKey: ["wallet", "balance"] });
      void qc.invalidateQueries({ queryKey: ["wallet", "transactions"] });
    },
  });
}
