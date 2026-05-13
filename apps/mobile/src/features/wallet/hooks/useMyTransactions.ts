import { useQuery } from "@tanstack/react-query";
import type { WalletTransactionListResponse } from "@zadpay/validation";
import { type ClientError } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/queryClient";
import { walletService } from "../services/walletService";

export function useMyTransactions(opts: { page?: number; pageSize?: number } = {}) {
  const page = opts.page ?? 0;
  const pageSize = opts.pageSize ?? 20;
  return useQuery<WalletTransactionListResponse, ClientError>({
    queryKey: queryKeys.wallet.transactions(page, pageSize),
    queryFn: async () => {
      const result = await walletService.myTransactions({ page, pageSize });
      if (!result.ok) throw result.error;
      return result.value;
    },
  });
}
