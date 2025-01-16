import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
}

const ImageUpload = ({ onImageSelect }: ImageUploadProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onImageSelect(acceptedFiles[0]);
    }
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ease-in-out',
        'bg-gradient-to-b from-white to-gray-50',
        isDragActive ? [
          'border-primary scale-[1.02] shadow-lg',
          'bg-primary/5 border-primary',
        ] : [
          'border-gray-200 hover:border-primary/50',
          'hover:bg-gray-50/50 hover:scale-[1.01]',
        ]
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="absolute -inset-4 bg-blue-500/10 blur-xl rounded-full" />
          <div className="relative bg-white p-4 rounded-xl shadow-sm">
            {isDragActive ? (
              <Upload className="w-12 h-12 text-primary animate-bounce" />
            ) : (
              <ImageIcon className="w-12 h-12 text-gray-400" />
            )}
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-gray-700">
            {isDragActive ? 'Drop it here!' : 'Drag & drop an image here'}
          </p>
          <p className="text-sm text-gray-500">
            or click to browse from your computer
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-400 mt-4">
          <span className="px-2 py-1 rounded bg-gray-100">PNG</span>
          <span className="px-2 py-1 rounded bg-gray-100">JPG</span>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
