import { type Result } from "@zadpay/errors";
import {
  UserItemListResponseSchema,
  UserItemResponseSchema,
  type UserItemListResponse,
  type UserItemResponse,
} from "@zadpay/validation";
import { type ClientError } from "@/lib/api/errors";
import { api } from "@/lib/api/instance";

// Generic per-user JSON store. Each call is scoped by feature (cards,
// goals, bnpl, savings, ...). The caller owns the payload shape.
export const userdataService = {
  list(feature: string): Promise<Result<UserItemListResponse, ClientError>> {
    return api.get<UserItemListResponse>(
      `/v1/userdata/${encodeURIComponent(feature)}`,
      UserItemListResponseSchema,
    );
  },

  create(
    feature: string,
    payload: Record<string, unknown>,
  ): Promise<Result<UserItemResponse, ClientError>> {
    return api.post<UserItemResponse>(
      `/v1/userdata/${encodeURIComponent(feature)}`,
      { payload },
      UserItemResponseSchema,
    );
  },

  update(
    feature: string,
    id: string,
    payload: Record<string, unknown>,
  ): Promise<Result<UserItemResponse, ClientError>> {
    return api.put<UserItemResponse>(
      `/v1/userdata/${encodeURIComponent(feature)}/${encodeURIComponent(id)}`,
      { payload },
      UserItemResponseSchema,
    );
  },

  remove(feature: string, id: string): Promise<Result<void, ClientError>> {
    return api.deleteVoid(`/v1/userdata/${encodeURIComponent(feature)}/${encodeURIComponent(id)}`);
  },
};
