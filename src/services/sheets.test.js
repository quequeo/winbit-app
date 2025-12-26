import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getInvestorData } from './sheets';

global.fetch = vi.fn();

describe('getInvestorData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns investor data for valid email', async () => {
    const mockData = {
      values: [
        ['test@example.com', 'Test User', '10000', '8000', '25', '9000', '9500', '10000'],
      ],
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await getInvestorData('test@example.com');

    expect(result.error).toBeNull();
    expect(result.data.email).toBe('test@example.com');
    expect(result.data.name).toBe('Test User');
    expect(result.data.balance).toBe(10000);
  });

  it('returns error when investor not found', async () => {
    const mockData = {
      values: [
        ['other@example.com', 'Other User', '10000', '8000', '25'],
      ],
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await getInvestorData('notfound@example.com');

    expect(result.data).toBeNull();
    expect(result.error).toBe('Investor not found in database');
  });

  it('returns error when fetch fails', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
    });

    const result = await getInvestorData('test@example.com');

    expect(result.data).toBeNull();
    expect(result.error).toBeTruthy();
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
});

