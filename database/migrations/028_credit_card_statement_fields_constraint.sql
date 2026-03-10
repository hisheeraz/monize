-- Ensure statement_due_day and statement_settlement_day can only be set on CREDIT_CARD accounts.
-- Clean up any existing non-credit-card rows that may have these fields set.
UPDATE accounts
SET statement_due_day = NULL, statement_settlement_day = NULL
WHERE account_type != 'CREDIT_CARD'
  AND (statement_due_day IS NOT NULL OR statement_settlement_day IS NOT NULL);

-- Add CHECK constraints to enforce credit-card-only rule
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_statement_due_day_cc_only'
  ) THEN
    ALTER TABLE accounts ADD CONSTRAINT chk_statement_due_day_cc_only
      CHECK (account_type = 'CREDIT_CARD' OR statement_due_day IS NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_statement_settlement_day_cc_only'
  ) THEN
    ALTER TABLE accounts ADD CONSTRAINT chk_statement_settlement_day_cc_only
      CHECK (account_type = 'CREDIT_CARD' OR statement_settlement_day IS NULL);
  END IF;
END $$;
