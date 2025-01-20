import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [transactionDetails, setTransactionDetails] = React.useState<any>(null);
  const [isProcessing, setIsProcessing] = React.useState(true);

  useEffect(() => {
    const processPayment = async () => {
      const status = searchParams.get('status');
      const paymentID = searchParams.get('paymentID');
      
      console.log('Processing payment callback:', { status, paymentID });

      try {
        if (status === 'success' && paymentID) {
          // Get the current user
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          console.log('Current user in callback:', user);
          
          if (userError) throw userError;
          if (!user) throw new Error('No user found');

          // Get the pending package from local storage
          const pendingPackageStr = localStorage.getItem('pendingPackage');
          console.log('Pending package from localStorage:', pendingPackageStr);
          
          if (!pendingPackageStr) {
            throw new Error('No pending package found');
          }

          const pendingPackage = JSON.parse(pendingPackageStr);
          console.log('Processing purchase for package:', pendingPackage);

          // Call the process_credit_purchase function
          const { data, error } = await supabase.rpc('process_credit_purchase', {
            p_user_id: user.id,
            p_package_id: pendingPackage.id,
            p_payment_id: paymentID,
            p_payment_method: 'bkash'
          });

          if (error) {
            console.error('Purchase processing error:', error);
            throw error;
          }

          console.log('Purchase processed:', data);
          setTransactionDetails({
            credits: pendingPackage.credits,
            amount: pendingPackage.price,
            paymentId: paymentID,
            timestamp: new Date().toLocaleString()
          });

          // Clear the pending package
          localStorage.removeItem('pendingPackage');

          // Invalidate relevant queries
          queryClient.invalidateQueries({ queryKey: ['profile'] });
          queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });

          toast({
            title: 'পেমেন্ট সফল হয়েছে',
            description: `${pendingPackage.credits} ক্রেডিট যোগ করা হয়েছে`,
          });

          // Redirect to dashboard after 5 seconds
          setTimeout(() => {
            navigate('/credits');
          }, 5000);
        } else {
          throw new Error('Payment failed or invalid status');
        }
      } catch (error: any) {
        console.error('Payment processing error:', error);
        toast({
          title: 'পেমেন্ট প্রসেস করতে সমস্যা হয়েছে',
          description: error.message || 'অনুগ্রহ করে আবার চেষ্টা করুন',
          variant: 'destructive',
        });
        
        // Redirect to purchase page after 2 seconds on error
        setTimeout(() => {
          navigate('/credits/purchase');
        }, 2000);
      } finally {
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [searchParams, navigate, toast, queryClient]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      {isProcessing ? (
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-center text-muted-foreground">পেমেন্ট প্রসেস হচ্ছে...</p>
          <p className="text-sm text-center text-muted-foreground mt-2">অনুগ্রহ করে অপেক্ষা করুন</p>
        </div>
      ) : transactionDetails ? (
        <Card className="w-full max-w-md p-6 space-y-4">
          <div className="text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-600 mb-4">পেমেন্ট সফল হয়েছে!</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ক্রেডিট পরিমাণ:</span>
              <span className="font-medium">{transactionDetails.credits}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">মূল্য:</span>
              <span className="font-medium">৳{transactionDetails.amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">পেমেন্ট আইডি:</span>
              <span className="font-medium">{transactionDetails.paymentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">সময়:</span>
              <span className="font-medium">{transactionDetails.timestamp}</span>
            </div>
          </div>

          <p className="text-sm text-center text-muted-foreground mt-4">
            আপনি স্বয়ংক্রিয়ভাবে ড্যাশবোর্ডে রিডাইরেক্ট হবেন...
          </p>
        </Card>
      ) : null}
    </div>
  );
};

export default PaymentCallback;