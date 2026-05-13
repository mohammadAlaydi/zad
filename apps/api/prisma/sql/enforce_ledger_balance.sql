-- Per ADR-0007. Run once after `prisma migrate dev --name wallet-init` lands
-- the wallet.* tables. Prisma doesn't manage triggers; apply manually or
-- via a CI step before the first money-moving deploy.
--
-- The trigger fires after every INSERT/UPDATE on wallet.ledger_entries and
-- recomputes the sum of signed amounts for the affected transaction. If
-- it's nonzero, the statement is rejected — no half-posted transactions
-- ever land in the ledger.

CREATE OR REPLACE FUNCTION wallet.enforce_ledger_balance()
RETURNS TRIGGER AS $$
DECLARE
  imbalance NUMERIC(38, 0);
  tx_id UUID;
BEGIN
  tx_id := COALESCE(NEW.transaction_id, OLD.transaction_id);
  SELECT COALESCE(SUM(
    CASE direction
      WHEN 'debit' THEN -amount
      WHEN 'credit' THEN amount
    END
  ), 0)
  INTO imbalance
  FROM wallet.ledger_entries
  WHERE transaction_id = tx_id;

  IF imbalance <> 0 THEN
    RAISE EXCEPTION
      'ledger imbalance for transaction %: signed sum = %',
      tx_id, imbalance;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_ledger_balance ON wallet.ledger_entries;
CREATE CONSTRAINT TRIGGER enforce_ledger_balance
  AFTER INSERT OR UPDATE OR DELETE ON wallet.ledger_entries
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW
  EXECUTE FUNCTION wallet.enforce_ledger_balance();
