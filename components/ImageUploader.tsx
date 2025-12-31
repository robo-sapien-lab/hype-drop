import React, { useRef, useState } from 'react';

interface ImageUploaderProps {
  onImageUpload: (base64: string, mimeType: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const [meta, base64] = result.split(',');
      const mimeType = meta.split(':')[1].split(';')[0];
      onImageUpload(base64, mimeType);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(true);
  };

  const handleDragLeave = () => {
    setIsHovering(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  };

  return (
    <div 
      className={`
        relative group cursor-pointer rounded-[32px] transition-all duration-500 ease-out h-[400px]
        ${isHovering ? 'scale-[1.02] shadow-2xl' : 'scale-100 shadow-xl'}
      `}
      onClick={() => inputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Animated Gradient Background Border */}
      <div className={`
        absolute inset-0 rounded-[32px] opacity-30 transition-opacity duration-300
        bg-[conic-gradient(from_90deg_at_50%_50%,#1a1a1a_0%,#333_50%,#1a1a1a_100%)]
        ${isHovering ? 'opacity-100 bg-[conic-gradient(from_90deg_at_50%_50%,#bef264_0%,#4d7c0f_50%,#bef264_100%)]' : ''}
      `}></div>
      
      {/* Main Glass Container */}
      <div className={`
        absolute inset-[1px] rounded-[31px] flex flex-col items-center justify-center p-8
        transition-all duration-300 backdrop-blur-2xl
        ${isHovering ? 'bg-black/80' : 'bg-[#0a0a0a]/90'}
      `}>
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={inputRef} 
          onChange={handleFileChange}
        />
        
        {/* Icon Circle */}
        <div className={`
          w-20 h-20 rounded-2xl mb-8 flex items-center justify-center transition-all duration-500 shadow-lg
          ${isHovering ? 'bg-lime-400 text-black rotate-12 scale-110 shadow-[0_0_30px_rgba(163,230,53,0.4)]' : 'bg-white/5 text-gray-500 border border-white/5'}
        `}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        
        <h3 className="text-3xl font-bold mb-3 text-white tracking-tight">Upload Product</h3>
        <p className="text-gray-400 text-sm max-w-xs text-center leading-relaxed font-light">
          Drag & drop your flat lay or hanger shot here.<br/>
          <span className="text-xs text-gray-600 mt-3 block uppercase tracking-widest font-bold">Supports JPG, PNG (Max 10MB)</span>
        </p>
      </div>
    </div>
  );
};