import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserItemListResponse, UserItemResponse } from "@zadpay/validation";
import { type ClientError } from "@/lib/api/errors";
import { userdataService } from "./service";

// Per-feature query key so invalidating "cards" doesn't drop "goals".
function key(feature: string): readonly string[] {
  return ["userdata", feature] as const;
}

export function useUserItems<T = Record<string, unknown>>(
  feature: string,
  opts: { enabled?: boolean } = {},
) {
  return useQuery<
    UserItemListResponse,
    ClientError,
    { items: { id: string; payload: T; createdAt: string; updatedAt: string }[] }
  >({
    queryKey: key(feature),
    enabled: opts.enabled ?? true,
    queryFn: async () => {
      const r = await userdataService.list(feature);
      if (!r.ok) throw r.error;
      return r.value;
    },
    select: (data) => ({
      items: data.items.map((it) => ({
        id: it.id,
        payload: it.payload as T,
        createdAt: it.createdAt,
        updatedAt: it.updatedAt,
      })),
    }),
  });
}

export function useCreateUserItem(feature: string) {
  const qc = useQueryClient();
  return useMutation<UserItemResponse, ClientError, Record<string, unknown>>({
    mutationFn: async (payload) => {
      const r = await userdataService.create(feature, payload);
      if (!r.ok) throw r.error;
      return r.value;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: key(feature) });
    },
  });
}

export function useUpdateUserItem(feature: string) {
  const qc = useQueryClient();
  return useMutation<
    UserItemResponse,
    ClientError,
    { id: string; payload: Record<string, unknown> }
  >({
    mutationFn: async ({ id, payload }) => {
      const r = await userdataService.update(feature, id, payload);
      if (!r.ok) throw r.error;
      return r.value;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: key(feature) });
    },
  });
}

export function useDeleteUserItem(feature: string) {
  const qc = useQueryClient();
  return useMutation<void, ClientError, string>({
    mutationFn: async (id) => {
      const r = await userdataService.remove(feature, id);
      if (!r.ok) throw r.error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: key(feature) });
    },
  });
}
