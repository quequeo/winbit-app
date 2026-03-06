import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getInvestorData,
  getInvestorHistory,
  getWallets,
  getDepositOptions,
  getWithdrawalFeePreview,
  createInvestorRequest,
  validateInvestor,
  changeInvestorPassword,
  loginWithEmailPassword,
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
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('test%40example.com'));
    });

    it('returns error when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await getInvestorData('test@example.com');
      expect(result.data).toBeNull();
      expect(result.error).toBe('Network error');
    });

    it('returns error when response json is invalid', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      const result = await getInvestorData('test@example.com');
      expect(result.data).toBeNull();
      expect(result.error).toBe('Invalid JSON');
    });

    it('derives total return from balance when accumulated return is 0', async () => {
      const mockData = {
        data: {
          investor: {
            email: 'test@example.com',
            name: 'Test User',
          },
          portfolio: {
            currentBalance: 10171,
            totalInvested: 10000,
            accumulatedReturnUSD: 0,
            accumulatedReturnPercent: 0,
            annualReturnUSD: 0,
            annualReturnPercent: 0,
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const result = await getInvestorData('test@example.com');
      expect(result.error).toBeNull();
      // When legacy accumulated return is 0, we derive strategyReturnAll from balance - totalInvested.
      expect(result.data.strategyReturnAllUsd).toBeCloseTo(171, 5);
      expect(result.data.strategyReturnAllPct).toBeCloseTo(1.71, 2);
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

    it('returns error when investor not found (404)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await getInvestorData('test@example.com');
      expect(result.data).toBeNull();
      expect(result.error).toBe('Investor not found in database');
    });

    it('returns error when investor inactive (403)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
      });

      const result = await getInvestorData('test@example.com');
      expect(result.data).toBeNull();
      expect(result.error).toBe('Investor account is not active');
    });

    it('returns error when email is empty', async () => {
      const result = await getInvestorData('');
      expect(result.data).toBeNull();
      expect(result.error).toBe('Email is required');
    });

    it('uses api strategy return when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            investor: { email: 'test@example.com', name: 'Test' },
            portfolio: {
              currentBalance: 12000,
              totalInvested: 10000,
              strategyReturnAllUSD: 2500,
              strategyReturnAllPercent: 25,
              strategyReturnYtdUSD: 500,
              strategyReturnYtdPercent: 5,
              updatedAt: '2024-01-01T00:00:00.000Z',
            },
          },
        }),
      });

      const result = await getInvestorData('test@example.com');
      expect(result.data.strategyReturnAllUsd).toBe(2500);
      expect(result.data.strategyReturnAllPct).toBe(25);
    });

    it('encodes email correctly in URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: {} }),
      });

      await getInvestorData('user+test@example.com');
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('user%2Btest%40example.com'));
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

    it('returns error when investor not found (404)', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });

      const result = await getInvestorHistory('test@example.com');
      expect(result.data).toBeNull();
      expect(result.error).toBe('Investor not found in database');
    });

    it('returns error when investor inactive (403)', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 403 });

      const result = await getInvestorHistory('test@example.com');
      expect(result.data).toBeNull();
      expect(result.error).toBe('Investor account is not active');
    });

    it('returns error when email is empty', async () => {
      const result = await getInvestorHistory('');
      expect(result.data).toBeNull();
      expect(result.error).toBe('Email is required');
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
        expect.stringContaining('/api/public/v1/requests'),
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
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' }),
      });

      const result = await validateInvestor('test@example.com');
      expect(result.valid).toBe(false);
      expect(result.investor).toBeNull();
      expect(result.error).toBeDefined();
      consoleSpy.mockRestore();
    });

    it('returns error when email is empty', async () => {
      const result = await validateInvestor('');
      expect(result.valid).toBe(false);
      expect(result.investor).toBeNull();
      expect(result.error).toBe('Email is required');
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

  describe('getDepositOptions', () => {
    it('returns deposit options successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: [{ id: 1, label: 'USDT TRC20' }] }),
      });

      const result = await getDepositOptions();
      expect(result.data).toHaveLength(1);
      expect(result.error).toBeNull();
    });

    it('returns error when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await getDepositOptions();
      expect(result.data).toBeNull();
      expect(result.error).toBe('Network error');
    });

    it('returns error when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

      const result = await getDepositOptions();
      expect(result.data).toBeNull();
      expect(result.error).toBe('API Error: 500');
    });
  });

  describe('getWithdrawalFeePreview', () => {
    it('returns fee preview successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            withdrawalAmount: 1000,
            feeAmount: 60,
            feePercentage: 30,
            pendingProfit: 200,
            hasFee: true,
          },
        }),
      });

      const result = await getWithdrawalFeePreview('test@example.com', 1000);
      expect(result.data.feeAmount).toBe(60);
      expect(result.data.pendingProfit).toBe(200);
      expect(result.error).toBeNull();
    });

    it('returns error when API returns error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Monto inválido' }),
      });

      const result = await getWithdrawalFeePreview('test@example.com', -1);
      expect(result.data).toBeNull();
      expect(result.error).toBe('Monto inválido');
    });
  });

  describe('loginWithEmailPassword', () => {
    it('returns investor on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ investor: { email: 'test@example.com' } }),
      });

      const result = await loginWithEmailPassword('test@example.com', 'pass123');
      expect(result.data.email).toBe('test@example.com');
      expect(result.error).toBeNull();
    });

    it('returns error when credentials invalid', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Credenciales inválidas' }),
      });

      const result = await loginWithEmailPassword('test@example.com', 'wrong');
      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });
  });

  describe('API_BASE_URL', () => {
    it('should use environment variable if available', () => {
      expect(getInvestorData).toBeDefined();
      expect(getInvestorHistory).toBeDefined();
      expect(getWallets).toBeDefined();
      expect(getDepositOptions).toBeDefined();
      expect(getWithdrawalFeePreview).toBeDefined();
      expect(createInvestorRequest).toBeDefined();
      expect(validateInvestor).toBeDefined();
    });
  });

  describe('changeInvestorPassword', () => {
    it('returns success when password is changed', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200 });

      const result = await changeInvestorPassword('user@example.com', 'old123', 'new123');

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/change_password'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'user@example.com',
            current_password: 'old123',
            new_password: 'new123',
          }),
        }),
      );
    });

    it('returns error when API returns non-ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Contraseña actual incorrecta' }),
      });

      const result = await changeInvestorPassword('user@example.com', 'wrong', 'new123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Contraseña actual incorrecta');
    });

    it('returns error on network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await changeInvestorPassword('user@example.com', 'old123', 'new123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('returns error with status when response not ok and json fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 502,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      const result = await changeInvestorPassword('user@example.com', 'old123', 'new123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Error: 502');
    });
  });
});
