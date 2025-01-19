import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const status = searchParams.get('status');
    const message = searchParams.get('message');

    if (status === 'success') {
      toast({
        title: 'পেমেন্ট সফল হয়েছে',
        description: 'আপনার ক্রেডিট ব্যালেন্স আপডেট হয়েছে',
      });
    } else {
      toast({
        title: 'পেমেন্ট ব্যর্থ হয়েছে',
        description: message || 'অনুগ্রহ করে আবার চেষ্টা করুন',
        variant: 'destructive',
      });
    }

    // Redirect back to purchase page after 2 seconds
    setTimeout(() => {
      navigate('/credits/purchase');
    }, 2000);
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">পেমেন্ট প্রসেস হচ্ছে...</p>
    </div>
  );
};

export default PaymentCallback;