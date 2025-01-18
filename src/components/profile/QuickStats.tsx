import React from 'react';
import { Card } from '@/components/ui/card';
import { CreditCard, FileText, BarChart } from 'lucide-react';

interface QuickStatsProps {
  credits: number;
  documentsProcessed: number;
  usagePercentage: number;
}

const QuickStats = ({ credits, documentsProcessed, usagePercentage }: QuickStatsProps) => {
  const stats = [
    {
      label: 'Credits',
      value: credits,
      icon: CreditCard,
    },
    {
      label: 'Documents',
      value: documentsProcessed,
      icon: FileText,
    },
    {
      label: 'Usage',
      value: `${usagePercentage}%`,
      icon: BarChart,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 p-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-4 flex flex-col items-center justify-center space-y-1">
          <stat.icon className="h-5 w-5 text-muted-foreground" />
          <span className="text-lg font-semibold">{stat.value}</span>
          <span className="text-xs text-muted-foreground">{stat.label}</span>
        </Card>
      ))}
    </div>
  );
};

export default QuickStats;