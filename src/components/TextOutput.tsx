import React, { useState } from 'react';
import { Copy, Check, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TextOutputProps {
  text: string;
  isProcessing: boolean;
}

const TextOutput = ({ text, isProcessing }: TextOutputProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      duration: 2000
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadText = () => {
    const blob = new Blob([text], { type: 'text/plain' });
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

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-2xl font-semibold text-gray-900">
          Extracted Text
        </h2>
        <div className="flex items-center gap-2">
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
            {text ? (
              <div className="prose prose-sm max-w-none">
                {text.split('\n').map((paragraph, index) => (
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
            {text ? (
              <pre className="font-mono text-sm whitespace-pre-wrap text-gray-800">
                {text}
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
