import type { KycApplicationResponse } from "@zadpay/validation";
import { useCallback, useEffect, useRef, useState } from "react";
import { type ClientError } from "@/lib/api/errors";
import { kycService } from "../services/kycService";

interface UseKycApplicationResult {
  application: KycApplicationResponse | null;
  isLoading: boolean;
  error: ClientError | null;
  refetch: () => Promise<void>;
}

// Loads the user's KYC application + lets the screen refetch on demand
// (used by the polling effect in kyc-status.tsx). Calls `ensure` first so
// new users automatically have a `pending` application instead of 404.
export function useKycApplication(): UseKycApplicationResult {
  const [application, setApplication] = useState<KycApplicationResponse | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<ClientError | null>(null);
  // Stop reading state after unmount.
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const fetchOnce = useCallback(async () => {
    const result = await kycService.ensure();
    if (!mounted.current) return;
    if (!result.ok) {
      setError(result.error);
      setApplication(null);
      return;
    }
    setError(null);
    setApplication(result.value);
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchOnce().finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [fetchOnce]);

  return { application, isLoading, error, refetch: fetchOnce };
}
