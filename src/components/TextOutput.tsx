import React, { useState } from 'react';
import { Copy, Check, Download, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';

interface TextOutputProps {
  text: string;
  isProcessing: boolean;
}

const REFINE_COST = 15;

const TextOutput = ({ text, isProcessing }: TextOutputProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [refinedText, setRefinedText] = useState('');

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(refinedText || text);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      duration: 2000
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadText = () => {
    const contentToDownload = refinedText || text;
    const blob = new Blob([contentToDownload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Text downloaded",
      description: "Saved as 'extracted-text.txt'",
      duration: 2000
    });
  };

  const refineText = async () => {
    setIsRefining(true);
    try {
      // Deduct credits first
      const { data: deductData, error: deductError } = await supabase.rpc('deduct_credits', {
        user_id: (await supabase.auth.getUser()).data.user?.id,
        amount: REFINE_COST
      });

      if (deductError) throw deductError;

      const { data, error } = await supabase.functions.invoke('chat-completion', {
        body: {
          messages: [
            {
              role: 'user',
              content: `please correct the spelling and remove all unnecessary things. please do not change the original text. Here's the text: ${text}`
            }
          ]
        }
      });

      if (error) throw error;

      setRefinedText(data.choices[0].message.content);
      toast({
        title: "Text refined successfully",
        description: `${REFINE_COST} credits have been deducted`,
        duration: 2000
      });
    } catch (error: any) {
      toast({
        title: error.message === 'Insufficient credits' ? 'Insufficient credits' : 'Error refining text',
        description: error.message === 'Insufficient credits' ? 'Please add more credits to continue' : 'Please try again later',
        variant: "destructive",
        duration: 2000
      });
    } finally {
      setIsRefining(false);
    }
  };

  const displayText = refinedText || text;

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-2xl font-semibold text-gray-900">
          Extracted Text
        </h2>
        <div className="flex items-center gap-2">
          {text && !isProcessing && (
            <Button
              variant="outline"
              size="sm"
              onClick={refineText}
              disabled={isRefining}
              className="group relative animate-fade-in"
            >
              <Wand2 className={`h-4 w-4 transition-all duration-300 ${isRefining ? 'animate-spin' : 'group-hover:scale-110 group-hover:rotate-12'}`} />
              <span className="ml-2">{isRefining ? 'Refining...' : 'Refine'}</span>
              <div className="absolute -inset-px bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-20 rounded-md transition-opacity duration-300" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            disabled={!text || isProcessing}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span className="ml-2">Copy</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadText}
            disabled={!text || isProcessing}
          >
            <Download className="h-4 w-4" />
            <span className="ml-2">Download</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="preview" className="w-full">
        <div className="px-6 pt-4 border-b">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="raw">Raw Text</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="preview" className="mt-0">
          <div className="p-6 min-h-[400px] max-h-[600px] overflow-y-auto bg-white">
            {displayText ? (
              <div className="prose prose-sm max-w-none">
                {displayText.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 last:mb-0">
                    {paragraph || '\u00A0'}
                  </p>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500 text-center">
                  {isProcessing 
                    ? 'Processing your image...'
                    : 'Extracted text will appear here'}
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="raw" className="mt-0">
          <div className="p-6 min-h-[400px] max-h-[600px] overflow-y-auto bg-gray-50">
            {displayText ? (
              <pre className="font-mono text-sm whitespace-pre-wrap text-gray-800">
                {displayText}
              </pre>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500 text-center">
                  {isProcessing 
                    ? 'Processing your image...'
                    : 'Raw text will appear here'}
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default TextOutput;
