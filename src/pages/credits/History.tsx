import React from 'react';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

// Static transactions data
const staticTransactions = [
  {
    id: 1,
    created_at: '2025-01-18T10:30:00',
    type: 'purchase',
    amount: 100,
    balance_after: 200,
    payment_method: 'Stripe',
    status: 'completed',
    description: 'ক্রেডিট কেনা'
  },
  {
    id: 2,
    created_at: '2025-01-18T11:15:00',
    type: 'usage',
    amount: 5,
    balance_after: 195,
    payment_method: '-',
    status: 'completed',
    description: 'OCR ব্যবহার'
  },
  {
    id: 3,
    created_at: '2025-01-17T15:45:00',
    type: 'purchase',
    amount: 50,
    balance_after: 100,
    payment_method: 'bKash',
    status: 'pending',
    description: 'ক্রেডিট কেনা'
  },
  {
    id: 4,
    created_at: '2025-01-17T16:20:00',
    type: 'usage',
    amount: 15,
    balance_after: 85,
    payment_method: '-',
    status: 'failed',
    description: 'টেক্সট রিফাইন'
  },
  {
    id: 5,
    created_at: '2025-01-16T09:10:00',
    type: 'purchase',
    amount: 200,
    balance_after: 250,
    payment_method: 'Nagad',
    status: 'completed',
    description: 'ক্রেডিট কেনা'
  }
];

const TransactionHistory = () => {
  const { data: transactions = staticTransactions, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      return staticTransactions; // Using static data instead of API call
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'সম্পন্ন';
      case 'pending':
        return 'প্রক্রিয়াধীন';
      case 'failed':
        return 'ব্যর্থ';
      default:
        return status;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">ট্রান্সেকশন ডিটেলস</h1>
      
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  তারিখ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ধরন
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  পরিমাণ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ব্যালেন্স
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  পেমেন্ট পদ্ধতি
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  অবস্থা
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  বিবরণ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions?.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      transaction.type === 'purchase'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type === 'purchase' ? 'ক্রয়' : 'ব্যবহার'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={transaction.type === 'purchase' ? 'text-green-600' : 'text-red-600'}>
                      {transaction.type === 'purchase' ? '+' : '-'}
                      {Math.abs(transaction.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.balance_after}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.payment_method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                      {getStatusText(transaction.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default TransactionHistory;
