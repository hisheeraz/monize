-- Add credit card statement date options: due date day and settlement date day
-- These allow users to track when their credit card payment is due each month
-- and the last day of the billing cycle (settlement/closing date).

ALTER TABLE accounts ADD COLUMN IF NOT EXISTS statement_due_day INTEGER;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS statement_settlement_day INTEGER;

-- Constrain values to valid day-of-month range (1-31)
-- Note: months with fewer days will use the last day of the month
ALTER TABLE accounts ADD CONSTRAINT chk_statement_due_day
  CHECK (statement_due_day IS NULL OR (statement_due_day >= 1 AND statement_due_day <= 31));

ALTER TABLE accounts ADD CONSTRAINT chk_statement_settlement_day
  CHECK (statement_settlement_day IS NULL OR (statement_settlement_day >= 1 AND statement_settlement_day <= 31));
