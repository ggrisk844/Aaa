import React, { useState, useRef } from 'react';
import { Upload, X, Loader, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value?: string;
  onChange: (base64: string) => void;
  label?: string;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, label, className }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processImage = (file: File) => {
    if (!file) return;
    
    // Reset error
    setError(null);

    // Basic validation
    if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file.');
        return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit check before compression
        setError('File is too large. Please select an image under 5MB.');
        return;
    }

    setLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Aggressive compression for LocalStorage limits
        // Max 600px is sufficient for cards and avatars
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        // Resize logic to maintain aspect ratio
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Compress to JPEG with 0.6 quality to drastically reduce Base64 string size
        try {
            const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
            onChange(dataUrl);
        } catch (err) {
            setError('Failed to process image.');
            console.error(err);
        }
        setLoading(false);
      };
      img.onerror = () => {
          setError('Invalid image file.');
          setLoading(false);
      }
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
        setError('Error reading file.');
        setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) {
      processImage(file);
    }
  };

  return (
    <div className={className}>
      {label && <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{label}</label>}
      
      {!value ? (
        <div 
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition group h-48 bg-white dark:bg-gray-800/50 relative overflow-hidden ${
              error ? 'border-red-300 bg-red-50 dark:bg-red-900/10' : 'border-gray-300 dark:border-gray-600 hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          {loading ? (
             <div className="flex flex-col items-center animate-pulse">
                 <Loader className="animate-spin text-primary-500 mb-3" size={32} />
                 <span className="text-xs font-bold text-primary-600">Optimizing...</span>
             </div>
          ) : (
             <>
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4 group-hover:scale-110 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 transition shadow-inner">
                    <Upload className="text-gray-400 group-hover:text-primary-500 transition" size={28} />
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-bold group-hover:text-primary-600 text-center transition">
                    {error ? <span className="text-red-500">{error}</span> : "Click or Drag photo here"}
                </p>
                {!error && <p className="text-gray-400 text-xs mt-2 text-center">Auto-compressed for web</p>}
             </>
          )}
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 h-48 w-full group shadow-md bg-gray-100 dark:bg-gray-800">
             {value ? (
                 <img src={value?.trim() || undefined} alt="Uploaded preview" className="w-full h-full object-contain" />
             ) : (
                 <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
             )}
             <div className="absolute inset-0 bg-black/60 flex flex-col gap-3 items-center justify-center opacity-0 group-hover:opacity-100 transition backdrop-blur-sm">
                 <button 
                    onClick={(e) => { e.stopPropagation(); onChange(''); }}
                    className="bg-white text-red-600 px-5 py-2 rounded-full hover:bg-red-50 transition font-bold flex items-center gap-2 shadow-lg transform hover:scale-105"
                 >
                     <X size={18} /> Remove Photo
                 </button>
                 <span className="text-gray-200 text-xs font-medium">Change image</span>
             </div>
        </div>
      )}
      <input 
        type="file" 
        accept="image/*" 
        ref={inputRef} 
        className="hidden" 
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processImage(file);
        }} 
      />
    </div>
  );
};