import React from 'react';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface TextOutputProps {
  text: string;
}

const TextOutput = ({ text }: TextOutputProps) => {
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      duration: 2000
    });
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold">Extracted Text</h3>
        <Button variant="ghost" size="icon" onClick={copyToClipboard}>
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
        {text ? (
          <p className="whitespace-pre-wrap">{text}</p>
        ) : (
          <p className="text-gray-500 text-center">Extracted text will appear here</p>
        )}
      </div>
    </div>
  );
};

export default TextOutput;