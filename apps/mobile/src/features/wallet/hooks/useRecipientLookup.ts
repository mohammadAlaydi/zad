import { useQuery } from "@tanstack/react-query";
import type { RecipientLookupResponse } from "@zadpay/validation";
import { type ClientError } from "@/lib/api/errors";
import { walletService } from "../services/walletService";

// Debounced/normalised phone is passed in by the caller. The hook is
// enabled only when the phone parses as E.164; otherwise it stays idle so
// we don't fire a request for every keystroke.
export function useRecipientLookup(phone: string | null) {
  return useQuery<RecipientLookupResponse, ClientError>({
    queryKey: ["identity", "lookup", phone ?? "none"],
    enabled: phone !== null && phone.length > 0,
    // The recipient is stable for the lifetime of the send flow; we don't
    // need to retry on flaky errors.
    retry: false,
    queryFn: async () => {
      if (phone === null) throw new Error("phone required");
      const result = await walletService.lookupByPhone(phone);
      if (!result.ok) throw result.error;
      return result.value;
    },
  });
}
