import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '../../ui/Card';
import { formatCurrency } from '../../../utils/formatCurrency';

export const PerformanceChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card title="Performance History">
        <div className="h-64 flex items-center justify-center text-gray-500">
          No historical data available
        </div>
      </Card>
    );
  }

  return (
    <Card title="Performance History">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#888" style={{ fontSize: '12px' }} />
            <YAxis
              stroke="#888"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip
              formatter={(value) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#58b098"
              strokeWidth={2}
              dot={{ fill: '#58b098', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
