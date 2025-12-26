import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendWithdrawalRequest, sendDepositRequest } from './email';
import emailjs from '@emailjs/browser';

vi.mock('@emailjs/browser', () => ({
  default: {
    send: vi.fn(),
  },
}));

describe('email service', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('sendWithdrawalRequest', () => {
    it('returns error when email service not configured', async () => {
      const data = {
        userName: 'Test User',
        userEmail: 'test@example.com',
        type: 'Full Withdrawal',
        amount: '$10,000.00',
      };

      const result = await sendWithdrawalRequest(data);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email service not configured yet');
    });

    it('sends email when configured', async () => {
      process.env.VITE_EMAILJS_SERVICE_ID = 'service_test';
      process.env.VITE_EMAILJS_TEMPLATE_ID_WITHDRAWAL = 'template_withdrawal';
      process.env.VITE_EMAILJS_PUBLIC_KEY = 'public_test';

      emailjs.send.mockResolvedValueOnce({ status: 200 });

      const data = {
        userName: 'Test User',
        userEmail: 'test@example.com',
        type: 'Partial Withdrawal',
        amount: '$123.00',
      };

      const result = await sendWithdrawalRequest(data);
      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
      expect(emailjs.send).toHaveBeenCalledWith(
        'service_test',
        'template_withdrawal',
        expect.objectContaining({
          user_name: 'Test User',
          user_email: 'test@example.com',
          withdrawal_type: 'Partial Withdrawal',
          amount: '$123.00',
        }),
        'public_test',
      );
    });

    it('returns error if emailjs.send throws', async () => {
      process.env.VITE_EMAILJS_SERVICE_ID = 'service_test';
      process.env.VITE_EMAILJS_TEMPLATE_ID_WITHDRAWAL = 'template_withdrawal';
      process.env.VITE_EMAILJS_PUBLIC_KEY = 'public_test';

      emailjs.send.mockRejectedValueOnce(new Error('send failed'));

      const result = await sendWithdrawalRequest({
        userName: 'Test User',
        userEmail: 'test@example.com',
        type: 'Partial Withdrawal',
        amount: '$123.00',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('send failed');
    });
  });

  describe('sendDepositRequest', () => {
    it('returns error when email service not configured', async () => {
      const data = {
        userName: 'Test User',
        userEmail: 'test@example.com',
        amount: '$5,000.00',
        network: 'Bitcoin',
        transactionHash: 'abc123',
      };

      const result = await sendDepositRequest(data);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email service not configured yet');
    });

    it('sends email when configured (transactionHash default)', async () => {
      process.env.VITE_EMAILJS_SERVICE_ID = 'service_test';
      process.env.VITE_EMAILJS_TEMPLATE_ID_DEPOSIT = 'template_deposit';
      process.env.VITE_EMAILJS_PUBLIC_KEY = 'public_test';

      emailjs.send.mockResolvedValueOnce({ status: 200 });

      const result = await sendDepositRequest({
        userName: 'Test User',
        userEmail: 'test@example.com',
        amount: '$500.00',
        network: 'Bitcoin',
        transactionHash: '',
      });

      expect(result.success).toBe(true);
      expect(emailjs.send).toHaveBeenCalledWith(
        'service_test',
        'template_deposit',
        expect.objectContaining({
          user_name: 'Test User',
          user_email: 'test@example.com',
          amount: '$500.00',
          network: 'Bitcoin',
          transaction_hash: 'N/A',
        }),
        'public_test',
      );
    });
  });
});
