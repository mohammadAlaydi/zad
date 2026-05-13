import { useQuery } from "@tanstack/react-query";
import type { AccountBalanceResponse } from "@zadpay/validation";
import { type ClientError } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/queryClient";
import { walletService } from "../services/walletService";

export function useAccountBalance(accountId: string | undefined) {
  return useQuery<AccountBalanceResponse, ClientError>({
    queryKey:
      accountId === undefined ? ["wallet", "balance", "none"] : queryKeys.wallet.balance(accountId),
    enabled: accountId !== undefined,
    queryFn: async () => {
      if (accountId === undefined) throw new Error("accountId required");
      const result = await walletService.accountBalance(accountId);
      if (!result.ok) throw result.error;
      return result.value;
    },
  });
}
