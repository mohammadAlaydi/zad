import { type Result } from "@zadpay/errors";
import {
  InboxPageResponseSchema,
  MarkAllReadResponseSchema,
  type InboxPageResponse,
  type MarkAllReadResponse,
} from "@zadpay/validation";
import { type ClientError } from "@/lib/api/errors";
import { api } from "@/lib/api/instance";

export const inboxService = {
  async list(
    cursor: string | null,
    pageSize = 30,
  ): Promise<Result<InboxPageResponse, ClientError>> {
    const qs = new URLSearchParams({ pageSize: String(pageSize) });
    if (cursor !== null) qs.set("cursor", cursor);
    return api.get<InboxPageResponse>(
      `/v1/notifications?${qs.toString()}`,
      InboxPageResponseSchema,
    );
  },

  async markRead(id: string): Promise<Result<void, ClientError>> {
    return api.patchVoid(`/v1/notifications/${id}/read`, undefined);
  },

  async markAllRead(): Promise<Result<MarkAllReadResponse, ClientError>> {
    return api.post<MarkAllReadResponse>(
      "/v1/notifications/mark-all-read",
      {},
      MarkAllReadResponseSchema,
    );
  },
};
