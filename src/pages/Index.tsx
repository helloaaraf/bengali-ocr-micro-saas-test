import React, { useState, useEffect } from 'react';
import { createWorker } from 'tesseract.js';
import ImageUpload from '@/components/ImageUpload';
import TextOutput from '@/components/TextOutput';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, RefreshCcw, LogOut, CreditCard, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const OCR_COST = 5;
const REFINE_COST = 15;

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [creditBalance, setCreditBalance] = useState<number>(0);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{role: string, content: string}>>([]);
  const [isSending, setIsSending] = useState(false);
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

    // Set up realtime subscription for credit balance updates
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
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('deduct_credits', {
        user_id: user.id,
        amount: amount
      });

      if (error) throw error;

      setCreditBalance(data);
      return true;
    } catch (error: any) {
      toast({
        title: "Insufficient credits",
        description: "Please add more credits to continue",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsDeductingCredits(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const processImage = async (file: File) => {
    try {
      // Check and deduct credits first
      const canProceed = await deductCredits(OCR_COST);
      if (!canProceed) return;

      setIsProcessing(true);
      setSelectedImage(URL.createObjectURL(file));
      
      const worker = await createWorker('ben');
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      setExtractedText(text);
      toast({
        title: "Text extracted successfully",
        description: `${OCR_COST} credits have been deducted`,
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

  const sendMessage = async () => {
    if (!message.trim()) return;

    setIsSending(true);
    const newMessage = { role: 'user', content: message };
    const updatedHistory = [...chatHistory, newMessage];
    setChatHistory(updatedHistory);
    setMessage('');

    try {
      const { data, error } = await supabase.functions.invoke('chat-completion', {
        body: { messages: updatedHistory }
      });

      if (error) throw error;

      const assistantMessage = { 
        role: 'assistant', 
        content: data.choices[0].message.content 
      };
      setChatHistory([...updatedHistory, assistantMessage]);
    } catch (error) {
      toast({
        title: "Error sending message",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
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
            <div className={`flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow transition-all duration-300 ${isDeductingCredits ? 'scale-110' : ''}`}>
              <CreditCard className={`w-5 h-5 ${creditBalance < 50 ? 'text-red-600' : 'text-blue-600'} ${isDeductingCredits ? 'animate-spin' : ''}`} />
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
          
          <div className="space-y-6">
            <TextOutput text={extractedText} isProcessing={isProcessing} />
            
            <Card className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Chat</h2>
              <div className="space-y-4 mb-4 max-h-[300px] overflow-y-auto">
                {chatHistory.map((msg, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      msg.role === 'user' 
                        ? 'bg-blue-100 ml-auto max-w-[80%]' 
                        : 'bg-gray-100 mr-auto max-w-[80%]'
                    }`}
                  >
                    {msg.content}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={isSending}
                />
                <Button 
                  onClick={sendMessage}
                  disabled={isSending}
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;