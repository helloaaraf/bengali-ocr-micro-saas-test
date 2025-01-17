import React, { useState, useEffect } from 'react';
import { createWorker } from 'tesseract.js';
import ImageUpload from '@/components/ImageUpload';
import TextOutput from '@/components/TextOutput';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, RefreshCcw, LogOut, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [creditBalance, setCreditBalance] = useState<number>(0);
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
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const processImage = async (file: File) => {
    try {
      setIsProcessing(true);
      setSelectedImage(URL.createObjectURL(file));
      
      const worker = await createWorker('ben');
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      setExtractedText(text);
      toast({
        title: "Text extracted successfully",
        description: "Your text is ready to be copied or edited",
      });
    } catch (error) {
      toast({
        title: "Error processing image",
        description: "Please try again with a different image",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
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
              Bengali OCR
            </h1>
            <p className="text-xl text-gray-600">
              Extract Bengali text from images with advanced optical character recognition
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <span className="font-medium">{creditBalance} credits</span>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-12">
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">Image Input</h2>
              {selectedImage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetAll}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              )}
            </div>
            
            <ImageUpload onImageSelect={processImage} />
            
            {selectedImage && (
              <div className="relative rounded-xl overflow-hidden border bg-white shadow-sm">
                <img 
                  src={selectedImage} 
                  alt="Selected" 
                  className="w-full h-auto object-contain max-h-[400px]"
                />
                {isProcessing && (
                  <div className="absolute inset-0 backdrop-blur-sm bg-black/30 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-12 h-12 text-white animate-spin" />
                    <p className="text-white font-medium">Extracting text...</p>
                  </div>
                )}
              </div>
            )}
          </Card>
          
          <TextOutput text={extractedText} isProcessing={isProcessing} />
        </div>
      </div>
    </div>
  );
};

export default Index;