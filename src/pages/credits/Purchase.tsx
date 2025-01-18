import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign } from 'lucide-react';

const CreditPurchase = () => {
  const packages = [
    { credits: 100, price: 500, tag: 'Starter' },
    { credits: 500, price: 2000, tag: 'Popular', bonus: 50 },
    { credits: 1000, price: 3500, tag: 'Best Value', bonus: 150 },
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Purchase Credits</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Card key={pkg.credits} className="p-6 relative">
            {pkg.tag === 'Best Value' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm">
                {pkg.tag}
              </div>
            )}
            
            <div className="text-center space-y-4">
              <DollarSign className="h-8 w-8 mx-auto text-blue-600" />
              <div>
                <h3 className="text-2xl font-bold">{pkg.credits} Credits</h3>
                {pkg.bonus && (
                  <p className="text-green-600">+{pkg.bonus} Bonus Credits</p>
                )}
              </div>
              <p className="text-3xl font-bold">
                ৳{pkg.price}
                <span className="text-sm text-gray-500">/one-time</span>
              </p>
              <Button className="w-full">
                Purchase with bKash
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Payment Information</h3>
          <ul className="space-y-2 text-gray-600">
            <li>• Secure payment processing through bKash</li>
            <li>• Credits are added instantly after payment confirmation</li>
            <li>• For any payment issues, please contact support</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default CreditPurchase;