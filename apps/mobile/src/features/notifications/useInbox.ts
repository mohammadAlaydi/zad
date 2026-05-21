import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { InboxPageResponse } from "@zadpay/validation";
import { type ClientError } from "@/lib/api/errors";
import { inboxService } from "./inboxService";

const inboxKey = ["notifications", "inbox"] as const;

export function useInbox() {
  return useQuery<InboxPageResponse, ClientError>({
    queryKey: inboxKey,
    queryFn: async () => {
      const result = await inboxService.list(null);
      if (!result.ok) throw result.error;
      return result.value;
    },
    // Inbox is read-heavy and pushes already invalidate it on arrival,
    // so a moderate stale time is fine.
    staleTime: 30_000,
    // Refresh when the user returns to the screen — handles "tap push,
    // app comes to foreground, navigate to inbox" without a manual pull.
    refetchOnMount: "always",
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation<void, ClientError, string>({
    mutationFn: async (id) => {
      const result = await inboxService.markRead(id);
      if (!result.ok) throw result.error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: inboxKey });
    },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation<{ marked: number }, ClientError, void>({
    mutationFn: async () => {
      const result = await inboxService.markAllRead();
      if (!result.ok) throw result.error;
      return result.value;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: inboxKey });
    },
  });
}
