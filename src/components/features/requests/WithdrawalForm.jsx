import { useState } from 'react';
import { Card } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { sendWithdrawalRequest } from '../../../services/email';
import { formatCurrency } from '../../../utils/formatCurrency';

export const WithdrawalForm = ({ userName, userEmail, currentBalance }) => {
  const [type, setType] = useState('partial');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const withdrawalAmount = type === 'full' ? currentBalance : parseFloat(amount);

    if (type === 'partial' && (!amount || withdrawalAmount <= 0)) {
      setMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }

    if (withdrawalAmount > currentBalance) {
      setMessage({ type: 'error', text: 'Amount exceeds current balance' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const result = await sendWithdrawalRequest({
      userName,
      userEmail,
      type: type === 'full' ? 'Full Withdrawal' : 'Partial Withdrawal',
      amount: formatCurrency(withdrawalAmount),
    });

    setLoading(false);

    if (result.success) {
      setMessage({
        type: 'success',
        text: 'Withdrawal request sent successfully! You will be contacted soon.',
      });
      setAmount('');
      setType('partial');
    } else {
      setMessage({
        type: 'error',
        text: result.error || 'Failed to send request. Please try again.',
      });
    }
  };

  return (
    <Card title="Request Withdrawal">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Withdrawal Type <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="partial"
                checked={type === 'partial'}
                onChange={(e) => setType(e.target.value)}
                className="w-4 h-4 text-primary"
              />
              <span>Partial</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="full"
                checked={type === 'full'}
                onChange={(e) => setType(e.target.value)}
                className="w-4 h-4 text-primary"
              />
              <span>Full</span>
            </label>
          </div>
        </div>

        <Input
          label="Amount"
          type="number"
          id="amount"
          name="amount"
          value={type === 'full' ? formatCurrency(currentBalance) : amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={type === 'full' || loading}
          required={type === 'partial'}
          min="0.01"
          step="0.01"
          placeholder="Enter amount in USD"
        />

        <div className="bg-accent/30 p-4 rounded-lg text-sm text-gray-700">
          <p className="font-medium mb-1">⏰ Processing Hours:</p>
          <p>• Requests 6pm-8am → processed 8-10am</p>
          <p>• Requests 10am-6pm → processed at 6pm</p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Sending...' : 'Submit Request'}
        </Button>
      </form>
    </Card>
  );
};
