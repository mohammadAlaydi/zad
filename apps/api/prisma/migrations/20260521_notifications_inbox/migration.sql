-- Additive migration: per-user notifications inbox.
--
-- Safe to re-run; every operation uses IF NOT EXISTS.
-- Apply on EC2 via the normal deploy path:
--   pnpm --filter @zadpay/api exec prisma migrate deploy

CREATE TABLE IF NOT EXISTS notifications.notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL,
  type       varchar(60) NOT NULL,
  title      varchar(200) NOT NULL,
  body       varchar(500) NOT NULL,
  data       jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at    timestamp(3),
  created_at timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS notifications_user_created_idx
  ON notifications.notifications (user_id, created_at DESC);
