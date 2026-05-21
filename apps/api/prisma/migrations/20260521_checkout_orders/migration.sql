-- Additive migration: checkout.orders for merchant-driven purchases.
-- Idempotent; safe to re-run.

CREATE SCHEMA IF NOT EXISTS checkout;

CREATE TABLE IF NOT EXISTS checkout.orders (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     uuid NOT NULL,
  merchant_id     uuid NOT NULL,
  merchant_name   varchar(120) NOT NULL,
  items           jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_minor     bigint NOT NULL,
  currency        varchar(3) NOT NULL,
  status          varchar(20) NOT NULL DEFAULT 'pending',
  transaction_id  uuid,
  failure_reason  varchar(200),
  idempotency_key varchar(120) NOT NULL,
  created_at      timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  paid_at         timestamp(3)
);

CREATE UNIQUE INDEX IF NOT EXISTS orders_idempotency_key_idx
  ON checkout.orders (idempotency_key);

CREATE INDEX IF NOT EXISTS orders_customer_created_idx
  ON checkout.orders (customer_id, created_at DESC);

CREATE INDEX IF NOT EXISTS orders_merchant_created_idx
  ON checkout.orders (merchant_id, created_at DESC);
