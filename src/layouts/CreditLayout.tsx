import React from 'react';
import CreditNav from '@/components/CreditNav';

interface CreditLayoutProps {
  children: React.ReactNode;
}

const CreditLayout = ({ children }: CreditLayoutProps) => {
  return (
    <div>
      <CreditNav />
      {children}
    </div>
  );
};

export default CreditLayout;