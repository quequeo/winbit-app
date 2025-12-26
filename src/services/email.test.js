import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendWithdrawalRequest, sendDepositRequest } from './email';
import emailjs from '@emailjs/browser';

vi.mock('@emailjs/browser', () => ({
  default: {
    send: vi.fn(),
  },
}));

describe('email service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
  });
});

