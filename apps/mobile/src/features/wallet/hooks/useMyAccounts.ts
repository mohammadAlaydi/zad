import { useQuery } from "@tanstack/react-query";
import type { AccountListResponse } from "@zadpay/validation";
import { type ClientError } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/queryClient";
import { walletService } from "../services/walletService";

export function useMyAccounts() {
  return useQuery<AccountListResponse, ClientError>({
    queryKey: queryKeys.wallet.accounts(),
    queryFn: async () => {
      const result = await walletService.myAccounts();
      if (!result.ok) throw result.error;
      return result.value;
    },
  });
}
