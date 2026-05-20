-- Additive migration: phone-first signup + push notifications.
--
-- Safe to run on a database created by an earlier `prisma db push` of the
-- pre-this-PR schema. Every operation uses IF NOT EXISTS / IF EXISTS so
-- re-running is a no-op.
--
-- Apply on EC2 with:
--   docker exec -i zadpay-postgres psql -U postgres -d zadpay < migration.sql
-- or via prisma (if migrations are baselined):
--   pnpm --filter @zadpay/api exec prisma migrate deploy

-- ── identity.users: phone + fullName, email nullable ─────────────────
ALTER TABLE identity.users
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS full_name VARCHAR(120);

-- Drop NOT NULL on email (only if currently NOT NULL).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'identity'
      AND table_name = 'users'
      AND column_name = 'email'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE identity.users ALTER COLUMN email DROP NOT NULL;
  END IF;
END $$;

-- Unique index on phone (excluding NULLs — Postgres treats NULL as not-equal).
CREATE UNIQUE INDEX IF NOT EXISTS users_phone_key ON identity.users (phone);

-- ── notifications schema + push_tokens table ─────────────────────────
CREATE SCHEMA IF NOT EXISTS notifications;

CREATE TABLE IF NOT EXISTS notifications.push_tokens (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL,
  token        varchar(2048) NOT NULL,
  platform     varchar(10) NOT NULL,
  device_name  varchar(120),
  created_at   timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS push_tokens_token_key
  ON notifications.push_tokens (token);

CREATE INDEX IF NOT EXISTS push_tokens_user_id_idx
  ON notifications.push_tokens (user_id);
