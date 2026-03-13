import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from './api';
import { importApi, autoMatchCsvColumns } from './import';

vi.mock('./api', () => ({
  default: { post: vi.fn() },
}));

describe('importApi', () => {
  beforeEach(() => vi.clearAllMocks());

  it('parseQif posts content with 60s timeout', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { transactionCount: 10 } });
    const result = await importApi.parseQif('!Type:Bank\nD01/15/2025\nT-50.00\n^');
    expect(api.post).toHaveBeenCalledWith(
      '/import/qif/parse',
      { content: '!Type:Bank\nD01/15/2025\nT-50.00\n^' },
      { timeout: 60000 },
    );
    expect(result.transactionCount).toBe(10);
  });

  it('importQif posts data with 5min timeout', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { imported: 5, skipped: 0, errors: 0 } });
    const data = { content: 'qif', accountId: 'a1', categoryMappings: [], accountMappings: [] } as any;
    const result = await importApi.importQif(data);
    expect(api.post).toHaveBeenCalledWith('/import/qif', data, { timeout: 300000 });
    expect(result.imported).toBe(5);
  });
});

describe('autoMatchCsvColumns', () => {
  it('matches common header names to fields', () => {
    const result = autoMatchCsvColumns(['Date', 'Amount', 'Payee', 'Category', 'Memo']);
    expect(result.date).toBe(0);
    expect(result.amount).toBe(1);
    expect(result.payee).toBe(2);
    expect(result.category).toBe(3);
    expect(result.memo).toBe(4);
  });

  it('matches case-insensitively', () => {
    const result = autoMatchCsvColumns(['DATE', 'AMOUNT', 'DESCRIPTION']);
    expect(result.date).toBe(0);
    expect(result.amount).toBe(1);
    expect(result.payee).toBe(2);
  });

  it('matches multi-word header names', () => {
    const result = autoMatchCsvColumns(['Transaction Date', 'Transaction Amount', 'Check Number']);
    expect(result.date).toBe(0);
    expect(result.amount).toBe(1);
    expect(result.referenceNumber).toBe(2);
  });

  it('matches debit/credit columns', () => {
    const result = autoMatchCsvColumns(['Date', 'Debit', 'Credit', 'Description']);
    expect(result.date).toBe(0);
    expect(result.debit).toBe(1);
    expect(result.credit).toBe(2);
    expect(result.amount).toBeUndefined();
    expect(result.payee).toBe(3);
  });

  it('prefers amount over debit/credit when amount is present', () => {
    const result = autoMatchCsvColumns(['Date', 'Amount', 'Debit', 'Credit']);
    expect(result.amount).toBe(1);
    expect(result.debit).toBeUndefined();
    expect(result.credit).toBeUndefined();
  });

  it('returns empty result for unrecognized headers', () => {
    const result = autoMatchCsvColumns(['Col A', 'Col B', 'Col C']);
    expect(result.date).toBeUndefined();
    expect(result.amount).toBeUndefined();
    expect(result.payee).toBeUndefined();
  });

  it('matches substring patterns', () => {
    const result = autoMatchCsvColumns(['Post Date', 'Txn Amount', 'Merchant Name']);
    expect(result.date).toBe(0);
    expect(result.amount).toBe(1);
    expect(result.payee).toBe(2);
  });

  it('does not double-assign the same column', () => {
    // "Note" matches memo; each column used only once
    const result = autoMatchCsvColumns(['Date', 'Note', 'Notes']);
    expect(result.date).toBe(0);
    expect(result.memo).toBe(1);
  });
});
