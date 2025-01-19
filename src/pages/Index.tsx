import { useState, useEffect } from 'react';
import { createWorker } from 'tesseract.js';
import ImageUpload from '@/components/ImageUpload';
import TextOutput from '@/components/TextOutput';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, RefreshCcw, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const OCR_COST = 5;

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [creditBalance, setCreditBalance] = useState<number>(0);
  const [isDeductingCredits, setIsDeductingCredits] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('credit_balance')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setCreditBalance(profile.credit_balance);
        }
      }
    };

    fetchUserProfile();

    const channel = supabase
      .channel('credit-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${supabase.auth.getUser().then(({ data }) => data.user?.id)}`
        },
        (payload) => {
          const newBalance = payload.new.credit_balance;
          setCreditBalance(newBalance);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const deductCredits = async (amount: number) => {
    setIsDeductingCredits(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('ব্যবহারকারী যাচাই করা হয়নি');

      const { data, error } = await supabase.rpc('deduct_credits', {
        user_id: user.id,
        amount: amount
      });

      if (error) throw error;

      setCreditBalance(data);
      return true;
    } catch (error: any) {
      toast({
        title: "অপর্যাপ্ত ক্রেডিট",
        description: "অনুগ্রহ করে আরও ক্রেডিট যোগ করুন",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsDeductingCredits(false);
    }
  };

  const processImage = async (file: File) => {
    try {
      const canProceed = await deductCredits(OCR_COST);
      if (!canProceed) return;

      setIsProcessing(true);
      setSelectedImage(URL.createObjectURL(file));
      
      const worker = await createWorker('ben');
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      setExtractedText(text);
      toast({
        title: "টেক্সট সফলভাবে নিষ্কাশন করা হয়েছে",
        description: `${OCR_COST} ক্রেডিট কাটা হয়েছে`,
      });
    } catch (error) {
      toast({
        title: "ছবি প্রক্রিয়াকরণে ত্রুটি",
        description: "অনুগ্রহ করে অন্য ছবি দিয়ে চেষ্টা করুন",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const resetAll = () => {
    setSelectedImage(null);
    setExtractedText('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <header className="flex justify-between items-center mb-16">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              বাংলা টেক্সট এক্সট্র্যাক্টর
            </h1>
            <p className="text-xl text-gray-600">
              উন্নত অপটিক্যাল ক্যারেক্টার রিকগনিশন দিয়ে ছবি থেকে বাংলা টেক্সট নিষ্কাশন করুন
            </p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            সাইন আউট
          </Button>
        </header>

        <div className="grid lg:grid-cols-2 gap-12">
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">ছবি আপলোড</h2>
              {selectedImage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetAll}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  রিসেট
                </Button>
              )}
            </div>
            
            <ImageUpload onImageSelect={processImage} />
            
            {selectedImage && (
              <div className="relative rounded-xl overflow-hidden border bg-white shadow-sm">
                <img 
                  src={selectedImage} 
                  alt="নির্বাচিত" 
                  className="w-full h-auto object-contain max-h-[400px]"
                />
                {isProcessing && (
                  <div className="absolute inset-0 backdrop-blur-sm bg-black/30 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-12 h-12 text-white animate-spin" />
                    <p className="text-white font-medium">টেক্সট নিষ্কাশন করা হচ্ছে...</p>
                  </div>
                )}
              </div>
            )}
          </Card>
          
          <div className="space-y-6">
            <TextOutput text={extractedText} isProcessing={isProcessing} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;