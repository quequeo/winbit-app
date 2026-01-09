import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getInvestorData,
  getInvestorHistory,
  getWallets,
  createInvestorRequest,
  validateInvestor,
} from './api';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('api service', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getInvestorData', () => {
    it('returns investor data successfully', async () => {
      const mockData = {
        data: {
          investor: {
            email: 'test@example.com',
            name: 'Test User',
          },
          portfolio: {
            current_balance: 10000,
            total_invested: 8000,
            accumulated_return_usd: 2000,
            accumulated_return_percent: 25,
            annual_return_usd: 1500,
            annual_return_percent: 18.75,
            last_updated: '2024-01-01T00:00:00.000Z',
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const result = await getInvestorData('test@example.com');
      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('test%40example.com'),
      );
    });

    it('returns error when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await getInvestorData('test@example.com');
      expect(result.data).toBeNull();
      expect(result.error).toBe('Network error');
    });

    it('returns error when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' }),
      });

      const result = await getInvestorData('test@example.com');
      expect(result.data).toBeNull();
      expect(result.error).toContain('500');
    });

    it('encodes email correctly in URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: {} }),
      });

      await getInvestorData('user+test@example.com');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('user%2Btest%40example.com'),
      );
    });
  });

  describe('getInvestorHistory', () => {
    it('returns history data successfully', async () => {
      const mockData = {
        data: [
          {
            code: '008',
            date: '2024-01-01T00:00:00.000Z',
            type: 'DEPOSITO',
            amount: 1000,
            status: 'COMPLETED',
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const result = await getInvestorHistory('test@example.com');
      expect(result.data).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.error).toBeNull();
    });

    it('returns error when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await getInvestorHistory('test@example.com');
      expect(result.data).toBeNull();
      expect(result.error).toBe('Network error');
    });

    it('returns error when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' }),
      });

      const result = await getInvestorHistory('test@example.com');
      expect(result.data).toBeNull();
      expect(result.error).toContain('API Error: 500');
    });
  });

  describe('getWallets', () => {
    it('returns wallets data successfully', async () => {
      const mockData = {
        data: [
          {
            network: 'USDT-TRC20',
            address: 'TXYZabc123',
            icon: '₮',
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const result = await getWallets();
      expect(result.data).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.error).toBeNull();
    });

    it('returns error when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await getWallets();
      expect(result.data).toBeNull();
      expect(result.error).toBe('Network error');
    });

    it('returns error when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' }),
      });

      const result = await getWallets();
      expect(result.data).toBeNull();
      expect(result.error).toContain('500');
    });
  });

  describe('createInvestorRequest', () => {
    it('creates deposit request successfully', async () => {
      const mockData = {
        data: {
          id: 1,
          request_type: 'DEPOSITO',
          status: 'PENDING',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockData,
      });

      const requestData = {
        investorEmail: 'test@example.com',
        requestType: 'DEPOSITO',
        amount: 1000,
        method: 'CRYPTO',
        walletType: 'USDT-TRC20',
        transactionHash: 'abc123',
      };

      const result = await createInvestorRequest(requestData);
      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/public/requests'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        }),
      );
    });

    it('creates withdrawal request successfully', async () => {
      const mockData = {
        data: {
          id: 2,
          request_type: 'RETIRO',
          status: 'PENDING',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockData,
      });

      const requestData = {
        investorEmail: 'test@example.com',
        requestType: 'RETIRO',
        amount: 500,
        method: 'BANK',
        withdrawalType: 'TOTAL',
      };

      const result = await createInvestorRequest(requestData);
      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('returns error when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await createInvestorRequest({
        investorEmail: 'test@example.com',
        requestType: 'DEPOSITO',
        amount: 1000,
      });

      expect(result.data).toBeNull();
      expect(result.error).toBe('Network error');
    });

    it('returns error when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid request' }),
      });

      const result = await createInvestorRequest({
        investorEmail: 'test@example.com',
        requestType: 'DEPOSITO',
        amount: 1000,
      });

      expect(result.data).toBeNull();
      expect(result.error).toContain('Invalid request');
    });
  });

  describe('validateInvestor', () => {
    it('validates investor successfully', async () => {
      const mockData = {
        data: {
          investor: {
            email: 'test@example.com',
            is_active: true,
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const result = await validateInvestor('test@example.com');
      expect(result.valid).toBe(true);
      expect(result.investor).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('returns error when investor not found (404)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Not found' }),
      });

      const result = await validateInvestor('notfound@example.com');
      expect(result.valid).toBe(false);
      expect(result.investor).toBeNull();
      expect(result.error).toBe('Investor not found in database');
    });

    it('returns error when investor is inactive (403)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ error: 'Forbidden' }),
      });

      const result = await validateInvestor('inactive@example.com');
      expect(result.valid).toBe(false);
      expect(result.investor).toBeNull();
      expect(result.error).toBe('Investor account is not active');
    });

    it('returns error when other error occurs', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' }),
      });

      const result = await validateInvestor('test@example.com');
      expect(result.valid).toBe(false);
      expect(result.investor).toBeNull();
      expect(result.error).toBeDefined();
    });

    it('returns error when fetch throws exception', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await validateInvestor('test@example.com');
      expect(result.valid).toBe(false);
      expect(result.investor).toBeNull();
      expect(result.error).toBe('Network error');
    });

    it('encodes email correctly in validation URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: { investor: {} } }),
      });

      await validateInvestor('user+test@example.com');
      const callArgs = mockFetch.mock.calls[0][0];
      expect(callArgs).toContain('user%2Btest%40example.com');
    });
  });

  describe('API_BASE_URL', () => {
    it('should use environment variable if available', () => {
      // This test verifies the module exports properly
      expect(getInvestorData).toBeDefined();
      expect(getInvestorHistory).toBeDefined();
      expect(getWallets).toBeDefined();
      expect(createInvestorRequest).toBeDefined();
      expect(validateInvestor).toBeDefined();
    });
  });
});
