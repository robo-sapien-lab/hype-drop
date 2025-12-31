import React, { useState } from 'react';
import { generateVirtualTryOn } from '../services/geminiService';
import { ImageUploader } from './ImageUploader';
import { Button } from './Button';
import { ZoomableImage } from './ZoomableImage';
import { AppStatus } from '../types';

export const TryOnPanel: React.FC = () => {
  const [garmentImage, setGarmentImage] = useState<string | null>(null);
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGarmentUpload = (base64: string, mime: string) => {
    setGarmentImage(base64);
    setMimeType(mime);
    setErrorMessage(null);
  };

  const handleModelUpload = (base64: string, mime: string) => {
    setModelImage(base64);
    setErrorMessage(null);
  };

  const handleGenerate = async () => {
    if (!garmentImage || !modelImage) return;

    setStatus(AppStatus.LOADING);
    setErrorMessage(null);
    setResultImage(null);
    
    try {
      const result = await generateVirtualTryOn(garmentImage, modelImage, mimeType);
      setResultImage(result);
      setStatus(AppStatus.SUCCESS);
    } catch (error: any) {
      console.error(error);
      setStatus(AppStatus.ERROR);
      setErrorMessage(error.message || "Failed to generate try-on image.");
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = `data:${mimeType};base64,${resultImage}`;
    link.download = `hypedrop-tryon-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setGarmentImage(null);
    setModelImage(null);
    setResultImage(null);
    setStatus(AppStatus.IDLE);
    setErrorMessage(null);
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      {!garmentImage || !modelImage ? (
        <div className="max-w-5xl mx-auto mt-8">
           <div className="text-center mb-16">
              <h2 className="text-5xl font-bold mb-6 brand-font uppercase text-white tracking-wide drop-shadow-2xl">Virtual Try-On</h2>
              <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
                  <span className="bg-[#121212]/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">1. Upload Garment</span>
                  <span className="text-gray-600">→</span>
                  <span className="bg-[#121212]/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">2. Upload Model</span>
                  <span className="text-gray-600">→</span>
                  <span className="text-lime-400 font-bold bg-lime-400/10 px-4 py-2 rounded-full border border-lime-400/20 shadow-[0_0_15px_rgba(163,230,53,0.2)]">3. Generate</span>
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                 <h3 className="text-xs font-bold text-center text-gray-500 uppercase tracking-widest mb-4">Garment Source</h3>
                 {!garmentImage ? (
                    <ImageUploader onImageUpload={handleGarmentUpload} />
                 ) : (
                    <div className="relative h-96 bg-[#121212]/60 backdrop-blur-md rounded-[32px] overflow-hidden border border-lime-400/50 shadow-[0_0_30px_rgba(163,230,53,0.1)] group">
                        <img src={`data:${mimeType};base64,${garmentImage}`} className="w-full h-full object-cover" alt="Garment" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                            <button onClick={() => setGarmentImage(null)} className="text-white flex items-center gap-2 hover:text-red-400 transition-colors font-bold uppercase text-xs tracking-wider bg-black/50 px-4 py-2 rounded-full border border-white/10">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                Remove
                            </button>
                        </div>
                    </div>
                 )}
              </div>

              <div className="space-y-4">
                 <h3 className="text-xs font-bold text-center text-gray-500 uppercase tracking-widest mb-4">Model Target</h3>
                 {!modelImage ? (
                    <ImageUploader onImageUpload={handleModelUpload} />
                 ) : (
                    <div className="relative h-96 bg-[#121212]/60 backdrop-blur-md rounded-[32px] overflow-hidden border border-lime-400/50 shadow-[0_0_30px_rgba(163,230,53,0.1)] group">
                        <img src={`data:${mimeType};base64,${modelImage}`} className="w-full h-full object-cover" alt="Model" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                             <button onClick={() => setModelImage(null)} className="text-white flex items-center gap-2 hover:text-red-400 transition-colors font-bold uppercase text-xs tracking-wider bg-black/50 px-4 py-2 rounded-full border border-white/10">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                Remove
                            </button>
                        </div>
                    </div>
                 )}
              </div>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
           {/* Sidebar with Inputs */}
           <div className="lg:col-span-4 space-y-6">
                <div className="bg-[#121212]/60 backdrop-blur-2xl p-6 rounded-[32px] border border-white/10 shadow-xl">
                    <h3 className="text-[10px] font-bold uppercase text-gray-400 mb-6 tracking-widest">Source Assets</h3>
                    <div className="grid grid-cols-2 gap-4">
                         <div className="relative group rounded-2xl overflow-hidden aspect-square bg-black/40 border border-white/5">
                             <img src={`data:${mimeType};base64,${garmentImage}`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Garment" />
                             <div className="absolute bottom-2 left-2 text-[9px] font-bold text-white bg-black/60 px-2 py-0.5 rounded backdrop-blur-md">ITEM</div>
                         </div>
                         <div className="relative group rounded-2xl overflow-hidden aspect-square bg-black/40 border border-white/5">
                             <img src={`data:${mimeType};base64,${modelImage}`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Model" />
                             <div className="absolute bottom-2 left-2 text-[9px] font-bold text-white bg-black/60 px-2 py-0.5 rounded backdrop-blur-md">MODEL</div>
                         </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-white/5">
                        <Button variant="secondary" onClick={handleReset} className="w-full text-xs py-4 rounded-xl">Start New Try-On</Button>
                    </div>
                </div>

                {!resultImage && (
                    <div className="bg-gradient-to-br from-lime-900/10 to-black/40 p-8 rounded-[32px] border border-lime-400/20 text-center relative overflow-hidden group shadow-2xl">
                        <div className="absolute inset-0 bg-lime-400/5 blur-3xl group-hover:bg-lime-400/10 transition-colors"></div>
                        <p className="text-gray-300 text-sm mb-8 relative z-10 leading-relaxed font-light">
                            Ready to merge assets. The AI will fit the garment onto the model while preserving lighting, depth, and identity.
                        </p>
                        <Button 
                            variant="accent" 
                            onClick={handleGenerate} 
                            isLoading={status === AppStatus.LOADING} 
                            className="w-full relative z-10 shadow-lime-500/20 py-4 rounded-2xl"
                        >
                            Generate Try-On
                        </Button>
                    </div>
                )}
                
                {errorMessage && (
                    <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-[24px] text-red-200 text-xs backdrop-blur-xl shadow-lg">
                        <strong className="block mb-2 font-bold uppercase tracking-wide text-red-400">Generation Failed</strong>
                        <p className="opacity-90 leading-relaxed">{errorMessage}</p>
                    </div>
                )}
           </div>

           {/* Main Result Area */}
           <div className="lg:col-span-8">
               <div className="bg-[#121212]/60 backdrop-blur-2xl rounded-[32px] p-2 border border-white/10 shadow-2xl relative min-h-[600px] flex items-center justify-center overflow-hidden ring-1 ring-white/5">
                    {resultImage ? (
                        <ZoomableImage 
                            src={`data:${mimeType};base64,${resultImage}`} 
                            alt="Virtual Try-On Result" 
                            className="w-full h-auto rounded-[24px] bg-[#0a0a0a] shadow-inner"
                        />
                    ) : (
                         <div className="text-center text-gray-600 px-4">
                             {status === AppStatus.LOADING ? (
                                 <div className="flex flex-col items-center">
                                      <div className="relative w-24 h-24 mb-8">
                                          <div className="absolute inset-0 border-t-2 border-lime-400 rounded-full animate-spin shadow-[0_0_20px_rgba(163,230,53,0.4)]"></div>
                                          <div className="absolute inset-4 border-r-2 border-white/40 rounded-full animate-spin reverse"></div>
                                      </div>
                                      <p className="animate-pulse text-sm font-bold uppercase tracking-[0.3em] text-lime-400">Processing Mesh...</p>
                                 </div>
                             ) : (
                                 <div className="flex flex-col items-center opacity-30">
                                    <div className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/5 shadow-inner">
                                        <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <p className="font-light tracking-widest uppercase text-xs">Output preview will appear here</p>
                                 </div>
                             )}
                         </div>
                    )}
               </div>

               {resultImage && (
                    <div className="flex gap-4 mt-6">
                        <Button variant="accent" onClick={handleDownload} className="flex-1 py-5 text-base shadow-[0_0_30px_rgba(163,230,53,0.2)] rounded-2xl">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            Download Result
                        </Button>
                    </div>
               )}
           </div>
        </div>
      )}
    </div>
  );
};