import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getInvestorData } from './sheets';

describe('getInvestorData', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    global.fetch = vi.fn();
    process.env.VITE_GOOGLE_SHEETS_API_KEY = 'test-api-key';
    process.env.VITE_GOOGLE_SHEETS_ID = 'test-sheet-id';
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('returns error when credentials not configured', async () => {
    delete process.env.VITE_GOOGLE_SHEETS_API_KEY;
    delete process.env.VITE_GOOGLE_SHEETS_ID;

    const result = await getInvestorData('test@example.com');
    expect(result.data).toBeNull();
    expect(result.error).toBe('Google Sheets credentials not configured');
  });

  it('returns error when fetch fails', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false });

    const result = await getInvestorData('test@example.com');
    expect(result.data).toBeNull();
    expect(result.error).toBe('Failed to fetch investor data');
  });

  it('returns error when no data in sheet', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ values: [] }),
    });

    const result = await getInvestorData('test@example.com');
    expect(result.data).toBeNull();
    expect(result.error).toBe('No data found in sheet');
  });

  it('returns error when investor not found', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        values: [['other@example.com', 'Other User', '100', '90', '10']],
      }),
    });

    const result = await getInvestorData('test@example.com');
    expect(result.data).toBeNull();
    expect(result.error).toBe('Investor not found in database');
  });

  it('returns investor data for valid email and parses historical data', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        values: [
          [
            'test@example.com',
            'Test User',
            '10000',
            '8000',
            '25',
            '0',
            '9000',
            '9500',
            'not-a-number',
            '10000',
          ],
        ],
      }),
    });

    const result = await getInvestorData('test@example.com');
    expect(result.error).toBeNull();
    expect(result.data.email).toBe('test@example.com');
    expect(result.data.name).toBe('Test User');
    expect(result.data.balance).toBe(10000);
    expect(result.data.totalInvested).toBe(8000);
    expect(result.data.returns).toBe(25);
    expect(Array.isArray(result.data.historicalData)).toBe(true);
    // filters out 0 and non-numeric values
    expect(result.data.historicalData.length).toBe(3);
    expect(result.data.historicalData[0]).toMatchObject({ date: 'Day 2', balance: 9000 });
  });
});
