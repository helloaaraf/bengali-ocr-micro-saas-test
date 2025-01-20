import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const processPayment = async () => {
      const status = searchParams.get('status');
      const paymentID = searchParams.get('paymentID');
      
      console.log('Processing payment:', { status, paymentID });

      try {
        if (status === 'success' && paymentID) {
          // Get the current user
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (userError) throw userError;
          if (!user) throw new Error('No user found');

          // Get the pending package from local storage
          const pendingPackage = JSON.parse(localStorage.getItem('pendingPackage') || '{}');
          if (!pendingPackage.id) {
            throw new Error('No pending package found');
          }

          console.log('Processing purchase for package:', pendingPackage);

          // Call the process_credit_purchase function
          const { data, error } = await supabase.rpc('process_credit_purchase', {
            p_user_id: user.id,
            p_package_id: pendingPackage.id,
            p_payment_id: paymentID,
            p_payment_method: 'bkash'
          });

          if (error) throw error;

          console.log('Purchase processed:', data);

          // Clear the pending package
          localStorage.removeItem('pendingPackage');

          // Invalidate relevant queries
          queryClient.invalidateQueries({ queryKey: ['profile'] });
          queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });

          toast({
            title: 'পেমেন্ট সফল হয়েছে',
            description: `${pendingPackage.credits} ক্রেডিট যোগ করা হয়েছে`,
          });

          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            navigate('/credits/dashboard');
          }, 2000);
        } else {
          throw new Error('Payment failed or invalid status');
        }
      } catch (error) {
        console.error('Payment processing error:', error);
        toast({
          title: 'পেমেন্ট প্রসেস করতে সমস্যা হয়েছে',
          description: error.message || 'অনুগ্রহ করে আবার চেষ্টা করুন',
          variant: 'destructive',
        });
        
        // Redirect to purchase page after 2 seconds
        setTimeout(() => {
          navigate('/credits/purchase');
        }, 2000);
      }
    };

    processPayment();
  }, [searchParams, navigate, toast, queryClient]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">পেমেন্ট প্রসেস হচ্ছে...</p>
    </div>
  );
};

export default PaymentCallback;