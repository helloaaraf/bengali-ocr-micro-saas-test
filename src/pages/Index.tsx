import React, { useState } from 'react';
import { createWorker } from 'tesseract.js';
import ImageUpload from '@/components/ImageUpload';
import TextOutput from '@/components/TextOutput';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const processImage = async (file: File) => {
    try {
      setIsProcessing(true);
      setSelectedImage(URL.createObjectURL(file));
      
      const worker = await createWorker('ben');
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      setExtractedText(text);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Bengali OCR</h1>
          <p className="text-lg text-gray-600">Extract Bengali text from images</p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <ImageUpload onImageSelect={processImage} />
            {selectedImage && (
              <div className="relative rounded-lg overflow-hidden border shadow-sm">
                <img 
                  src={selectedImage} 
                  alt="Selected" 
                  className="w-full h-auto"
                />
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </div>
            )}
          </div>
          
          <TextOutput text={extractedText} />
        </div>
      </div>
    </div>
  );
};

export default Index;