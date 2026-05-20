// Generic per-user JSON store. Each item is scoped by (userId, feature)
// with an opaque JSON payload — the mobile owns the per-feature shape.
// No business logic in this module; it's deliberately a thin persistence
// layer for features that don't justify their own bounded context yet.

export interface UserItem {
  id: string;
  userId: string;
  feature: string;
  payload: unknown;
  createdAt: Date;
  updatedAt: Date; //etst
}
