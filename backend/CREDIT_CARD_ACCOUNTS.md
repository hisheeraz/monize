# Credit Card Accounts Guide

This document explains credit card account features in Monize, including statement date tracking.

## Overview

Credit card accounts in Monize support the standard account features (balance tracking, transactions, categories, payees) plus credit-card-specific fields:

- **Credit Limit**: The maximum credit available on the card
- **Interest Rate**: The annual interest rate on the card
- **Statement Due Day**: The day of the month when payment is due
- **Statement Settlement Day**: The last day of the billing cycle (also called the closing date)

## Statement Date Fields

### Due Date (Day of Month)

The day of each month when your credit card payment is due. For example, if set to `15`, your payment is due on the 15th of every month.

This is an optional field -- you can track it for your own reference, particularly useful when viewing favourite accounts on the dashboard.

### Settlement Date (Day of Month)

The settlement date (also called the **closing date** or **statement closing date**) is the last day of the billing cycle. Transactions posted on or before this day will appear on the current statement. Transactions posted after this day will appear on the next statement.

For example, if your settlement day is `25`:
- A transaction posted on March 25th appears on the March statement
- A transaction posted on March 26th appears on the April statement

This is an optional field -- it helps you understand which statement period a transaction belongs to.

### Day Range

Both fields accept values from 1 to 31. For months with fewer days (e.g., February), the system uses the last day of that month.

## Dashboard Display

When a credit card account is marked as a **favourite**, the dashboard's Favourite Accounts widget displays:
- The account name and institution
- The current balance (color-coded: red for negative/owing, green for positive/credit)
- The due date and/or settlement date with help icons explaining each field

## Database Schema

The credit card statement fields are stored in the `accounts` table:

```sql
statement_due_day INTEGER CHECK (statement_due_day IS NULL OR (statement_due_day >= 1 AND statement_due_day <= 31))
statement_settlement_day INTEGER CHECK (statement_settlement_day IS NULL OR (statement_settlement_day >= 1 AND statement_settlement_day <= 31))
```

## API

### Create Credit Card Account

```json
POST /api/v1/accounts
{
  "accountType": "CREDIT_CARD",
  "name": "Visa Infinite",
  "currencyCode": "CAD",
  "creditLimit": 10000,
  "interestRate": 19.99,
  "statementDueDay": 15,
  "statementSettlementDay": 25,
  "institution": "TD Bank"
}
```

### Update Statement Dates

```json
PATCH /api/v1/accounts/:id
{
  "statementDueDay": 20,
  "statementSettlementDay": 28
}
```

Both fields are optional and can be set independently. Omitting a field from the update leaves its current value unchanged.
