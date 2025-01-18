import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import CreditDashboard from '@/pages/credits/Dashboard';
import CreditPurchase from '@/pages/credits/Purchase';
import TransactionHistory from '@/pages/credits/History';
import UsageStatistics from '@/pages/credits/Usage';

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={session ? <Index /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/auth"
          element={!session ? <Auth /> : <Navigate to="/" replace />}
        />
        <Route
          path="/credits"
          element={session ? <CreditDashboard /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/credits/purchase"
          element={session ? <CreditPurchase /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/credits/history"
          element={session ? <TransactionHistory /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/credits/usage"
          element={session ? <UsageStatistics /> : <Navigate to="/auth" replace />}
        />
      </Routes>
    </Router>
  );
};

export default App;