import { useQuery } from "@tanstack/react-query";
import type { AccountBalanceResponse } from "@zadpay/validation";
import { type ClientError } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/queryClient";
import { walletService } from "../services/walletService";

export interface UseAccountBalanceOptions {
  // When true, poll the balance every 5s. Used by the wallet screen so the
  // recipient device sees an incoming transfer land within a few seconds
  // without manual pull-to-refresh.
  poll?: boolean;
}

export function useAccountBalance(
  accountId: string | undefined,
  options: UseAccountBalanceOptions = {},
) {
  return useQuery<AccountBalanceResponse, ClientError>({
    queryKey:
      accountId === undefined ? ["wallet", "balance", "none"] : queryKeys.wallet.balance(accountId),
    enabled: accountId !== undefined,
    refetchInterval: options.poll === true ? 5000 : false,
    refetchIntervalInBackground: false,
    queryFn: async () => {
      if (accountId === undefined) throw new Error("accountId required");
      const result = await walletService.accountBalance(accountId);
      if (!result.ok) throw result.error;
      return result.value;
    },
  });
}
