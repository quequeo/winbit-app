import { useState } from 'react';
import { Card } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Button } from '../../ui/Button';
import { sendDepositRequest } from '../../../services/email';

const networkOptions = [
  { value: '', label: 'Select network' },
  { value: 'Bitcoin', label: 'Bitcoin (BTC)' },
  { value: 'Ethereum', label: 'Ethereum (ETH)' },
  { value: 'USDT-TRC20', label: 'USDT (TRC20)' },
  { value: 'USDT-ERC20', label: 'USDT (ERC20)' },
];

export const DepositForm = ({ userName, userEmail }) => {
  const [formData, setFormData] = useState({
    amount: '',
    network: '',
    transactionHash: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }

    if (!formData.network) {
      setMessage({ type: 'error', text: 'Please select a network' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const result = await sendDepositRequest({
      userName,
      userEmail,
      amount: `$${parseFloat(formData.amount).toFixed(2)}`,
      network: formData.network,
      transactionHash: formData.transactionHash,
    });

    setLoading(false);

    if (result.success) {
      setMessage({
        type: 'success',
        text: 'Deposit notification sent successfully! Your balance will be updated soon.',
      });
      setFormData({ amount: '', network: '', transactionHash: '' });
    } else {
      setMessage({
        type: 'error',
        text: result.error || 'Failed to send notification. Please try again.',
      });
    }
  };

  return (
    <Card title="Notify Deposit">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Amount"
          type="number"
          id="amount"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          disabled={loading}
          required
          min="0.01"
          step="0.01"
          placeholder="Enter amount in USD"
        />

        <Select
          label="Network"
          id="network"
          name="network"
          value={formData.network}
          onChange={handleChange}
          options={networkOptions}
          disabled={loading}
          required
        />

        <Input
          label="Transaction Hash (Optional)"
          type="text"
          id="transactionHash"
          name="transactionHash"
          value={formData.transactionHash}
          onChange={handleChange}
          disabled={loading}
          placeholder="Enter transaction hash or ID"
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
          {loading ? 'Sending...' : 'Submit Notification'}
        </Button>
      </form>
    </Card>
  );
};
