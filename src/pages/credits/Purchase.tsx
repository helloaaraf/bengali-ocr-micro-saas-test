import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const CreditPurchase = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const { data: packages, isLoading: isLoadingPackages } = useQuery({
    queryKey: ['credit-packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('credit_packages')
        .select('*')
        .order('credits', { ascending: true });

      if (error) throw error;
      console.log('Fetched packages:', data);
      return data;
    },
  });

  const handleBkashPayment = async (packageId: string) => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user);
      
      if (!user) {
        toast({
          title: 'অনুগ্রহ করে লগইন করুন',
          description: 'ক্রেডিট কিনতে আপনাকে প্রথমে লগইন করতে হবে',
          variant: 'destructive',
        });
        return;
      }

      // Store the package info in localStorage for the callback
      const selectedPackage = packages?.find(pkg => pkg.id === packageId);
      if (selectedPackage) {
        const packageInfo = {
          id: selectedPackage.id,
          credits: selectedPackage.credits,
          price: selectedPackage.price
        };
        console.log('Storing package info:', packageInfo);
        localStorage.setItem('pendingPackage', JSON.stringify(packageInfo));
      } else {
        throw new Error('Selected package not found');
      }

      console.log('Calling bKash payment function with:', { packageId, userId: user.id });
      
      const { data, error } = await supabase.functions.invoke('bkash-payment', {
        body: { packageId, userId: user.id },
      });

      console.log('bKash payment response:', { data, error });

      if (error) throw error;

      if (data?.data?.bkashURL) {
        window.location.href = data.data.bkashURL;
      } else {
        throw new Error('বিকাশ পেমেন্ট URL পাওয়া যায়নি');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: 'পেমেন্ট ব্যর্থ হয়েছে',
        description: error.message || 'অনুগ্রহ করে আবার চেষ্টা করুন',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingPackages) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">ক্রেডিট কিনুন</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages?.map((pkg) => (
          <Card key={pkg.id} className="p-6 relative">
            {pkg.is_popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm">
                জনপ্রিয়
              </div>
            )}
            
            <div className="text-center space-y-4">
              <DollarSign className="h-8 w-8 mx-auto text-primary" />
              <div>
                <h3 className="text-2xl font-bold">{pkg.credits} ক্রেডিট</h3>
                {pkg.discount_percentage > 0 && (
                  <p className="text-green-600">+{pkg.discount_percentage}% বোনাস</p>
                )}
              </div>
              <p className="text-3xl font-bold">
                ৳{pkg.price}
                <span className="text-sm text-muted-foreground">/একবার</span>
              </p>
              <Button 
                className="w-full"
                onClick={() => handleBkashPayment(pkg.id)}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                বিকাশে পেমেন্ট করুন
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">পেমেন্ট তথ্য</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li>• বিকাশের মাধ্যমে নিরাপদ পেমেন্ট</li>
            <li>• পেমেন্ট নিশ্চিত হওয়ার সাথে সাথে ক্রেডিট যোগ হবে</li>
            <li>• পেমেন্ট সমস্যার জন্য সাপোর্টে যোগাযোগ করুন</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default CreditPurchase;