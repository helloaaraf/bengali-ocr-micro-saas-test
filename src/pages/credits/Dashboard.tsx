import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CreditCard, History, ChartBar, ArrowUp, Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import CreditLayout from '@/layouts/CreditLayout';

const CreditDashboard = () => {
  const navigate = useNavigate();
  
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('credit_balance')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      return data;
    }
  });

  const { data: recentTransactions } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <CreditLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Credit Balance Card */}
        <Card className="p-6 bg-gradient-to-br from-blue-500 to-purple-600">
          <div className="text-white">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-6 w-6" />
              <h2 className="text-xl font-semibold">Credit Balance</h2>
            </div>
            <p className="text-4xl font-bold">{profile?.credit_balance || 0}</p>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            onClick={() => navigate('/credits/purchase')}
            className="flex items-center gap-2"
          >
            <ArrowUp className="h-4 w-4" />
            Buy Credits
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/credits/history')}
            className="flex items-center gap-2"
          >
            <History className="h-4 w-4" />
            Transaction History
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/credits/usage')}
            className="flex items-center gap-2"
          >
            <ChartBar className="h-4 w-4" />
            Usage Statistics
          </Button>
        </div>

        {/* Recent Transactions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Transactions</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/credits/history')}
            >
              View All
            </Button>
          </div>
          <div className="space-y-4">
            {recentTransactions?.map((transaction) => (
              <div 
                key={transaction.id} 
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div>
                  <p className="font-medium capitalize">{transaction.type}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </p>
                </div>
                <p className={`font-medium ${
                  transaction.type === 'purchase' 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {transaction.type === 'purchase' ? '+' : '-'}
                  {Math.abs(transaction.amount)}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Low Balance Warning */}
        {(profile?.credit_balance || 0) < 50 && (
          <Card className="p-4 border-orange-200 bg-orange-50">
            <div className="flex items-center gap-2 text-orange-700">
              <Bell className="h-5 w-5" />
              <p>Your credit balance is running low. Consider purchasing more credits.</p>
            </div>
          </Card>
        )}
      </div>
    </CreditLayout>
  );
};

export default CreditDashboard;
