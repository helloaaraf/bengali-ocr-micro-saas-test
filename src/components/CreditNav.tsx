import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CreditCard, History, ChartBar, ArrowUp } from 'lucide-react';

const CreditNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex flex-wrap gap-2 p-4 bg-white border-b">
      <Button
        variant={isActive('/credits') ? 'default' : 'outline'}
        onClick={() => navigate('/credits')}
        className="flex items-center gap-2"
      >
        <CreditCard className="h-4 w-4" />
        Dashboard
      </Button>
      <Button
        variant={isActive('/credits/purchase') ? 'default' : 'outline'}
        onClick={() => navigate('/credits/purchase')}
        className="flex items-center gap-2"
      >
        <ArrowUp className="h-4 w-4" />
        Buy Credits
      </Button>
      <Button
        variant={isActive('/credits/history') ? 'default' : 'outline'}
        onClick={() => navigate('/credits/history')}
        className="flex items-center gap-2"
      >
        <History className="h-4 w-4" />
        History
      </Button>
      <Button
        variant={isActive('/credits/usage') ? 'default' : 'outline'}
        onClick={() => navigate('/credits/usage')}
        className="flex items-center gap-2"
      >
        <ChartBar className="h-4 w-4" />
        Usage
      </Button>
    </div>
  );
};

export default CreditNav;