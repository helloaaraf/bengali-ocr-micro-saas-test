import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/layout/MainLayout';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Profile from '@/pages/Profile';
import CreditDashboard from '@/pages/credits/Dashboard';
import CreditPurchase from '@/pages/credits/Purchase';
import TransactionHistory from '@/pages/credits/History';
import UsageStatistics from '@/pages/credits/Usage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize session
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error fetching session:', error);
          toast({
            title: 'Session Error',
            description: 'Please try logging in again.',
            variant: 'destructive',
          });
        }
        setSession(session);
      } catch (error) {
        console.error('Session initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_OUT') {
        // Clear any application cache/state
        queryClient.clear();
        setSession(null);
        toast({
          title: 'Signed out',
          description: 'You have been signed out successfully.',
        });
      } else if (event === 'SIGNED_IN') {
        setSession(session);
        toast({
          title: 'Signed in successfully',
          description: 'Welcome back!',
        });
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Session token refreshed');
        setSession(session);
      }
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  // Handle session recovery
  useEffect(() => {
    if (!session) {
      const recoverSession = async () => {
        try {
          const { data: { session: recoveredSession }, error } = await supabase.auth.getSession();
          if (recoveredSession && !error) {
            setSession(recoveredSession);
          }
        } catch (error) {
          console.error('Session recovery failed:', error);
        }
      };

      recoverSession();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route
            path="/auth"
            element={!session ? <Auth /> : <Navigate to="/" replace />}
          />
          <Route
            path="/*"
            element={
              session ? (
                <MainLayout>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/credits" element={<CreditDashboard />} />
                    <Route path="/credits/purchase" element={<CreditPurchase />} />
                    <Route path="/credits/history" element={<TransactionHistory />} />
                    <Route path="/credits/usage" element={<UsageStatistics />} />
                  </Routes>
                </MainLayout>
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
};

export default App;