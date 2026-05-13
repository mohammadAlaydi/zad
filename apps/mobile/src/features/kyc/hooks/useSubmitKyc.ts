import type { KycApplicationResponse } from "@zadpay/validation";
import { useState } from "react";
import { type ClientError } from "@/lib/api/errors";
import { kycService } from "../services/kycService";

interface UseSubmitKycResult {
  submit: () => Promise<
    { ok: true; application: KycApplicationResponse } | { ok: false; error: ClientError }
  >;
  isPending: boolean;
  error: ClientError | null;
}

export function useSubmitKyc(): UseSubmitKycResult {
  const [isPending, setPending] = useState(false);
  const [error, setError] = useState<ClientError | null>(null);

  async function submit() {
    setPending(true);
    setError(null);
    try {
      const result = await kycService.submit();
      if (!result.ok) {
        setError(result.error);
        return { ok: false as const, error: result.error };
      }
      return { ok: true as const, application: result.value };
    } finally {
      setPending(false);
    }
  }

  return { submit, isPending, error };
}
