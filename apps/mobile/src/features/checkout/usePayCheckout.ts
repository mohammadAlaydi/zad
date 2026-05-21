import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PayCheckoutRequest, PayCheckoutResponse } from "@zadpay/validation";
import { type ClientError } from "@/lib/api/errors";
import { checkoutService } from "./checkoutService";

export interface PayCheckoutInput {
  request: PayCheckoutRequest;
  idempotencyKey: string;
}

// Posts a checkout payment. On success the customer's wallet balance +
// transactions are stale, so we invalidate the wallet caches. The
// inbox row for the matching transfer push will also flow in via the
// usual TransferPosted event subscription on the backend.
export function usePayCheckout() {
  const qc = useQueryClient();
  return useMutation<PayCheckoutResponse, ClientError, PayCheckoutInput>({
    mutationFn: async ({ request, idempotencyKey }) => {
      const result = await checkoutService.pay(request, idempotencyKey);
      if (!result.ok) throw result.error;
      return result.value;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["wallet", "balance"] });
      void qc.invalidateQueries({ queryKey: ["wallet", "transactions"] });
      void qc.invalidateQueries({ queryKey: ["notifications", "inbox"] });
    },
  });
}
