import React from 'react';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const UsageStatistics = () => {
  const { data: statistics, isLoading } = useQuery({
    queryKey: ['usage-statistics'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('usage_statistics')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    }
  });

  const chartData = React.useMemo(() => {
    if (!statistics) return [];
    
    const featureUsage = statistics.reduce((acc: any, curr) => {
      if (!acc[curr.feature]) {
        acc[curr.feature] = 0;
      }
      acc[curr.feature] += curr.credits_used;
      return acc;
    }, {});

    return Object.entries(featureUsage).map(([feature, credits]) => ({
      feature,
      credits,
    }));
  }, [statistics]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Usage Statistics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Usage by Feature */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Usage by Feature</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="feature" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="credits" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {statistics?.slice(0, 5).map((stat) => (
              <div 
                key={stat.id}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div>
                  <p className="font-medium capitalize">{stat.feature}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(stat.created_at).toLocaleDateString()}
                  </p>
                </div>
                <p className="font-medium text-red-600">
                  -{stat.credits_used} credits
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UsageStatistics;