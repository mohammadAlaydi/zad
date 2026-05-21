-- Additive migration: user-submitted fraud reports.
-- Idempotent; safe to re-run.

CREATE TABLE IF NOT EXISTS notifications.fraud_reports (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL,
  transaction_id uuid,
  category       varchar(40) NOT NULL,
  description    varchar(2000) NOT NULL,
  status         varchar(20) NOT NULL DEFAULT 'open',
  created_at     timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at    timestamp(3)
);

CREATE INDEX IF NOT EXISTS fraud_reports_user_created_idx
  ON notifications.fraud_reports (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS fraud_reports_status_idx
  ON notifications.fraud_reports (status);
