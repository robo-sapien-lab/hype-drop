
import React, { useState, useRef } from 'react';
import { generateAdCopy, generate3DClothing, upscaleImage } from '../services/geminiService';
import { ImageUploader } from './ImageUploader';
import { Button } from './Button';
import { ShareModal } from './ShareModal';
import { ZoomableImage } from './ZoomableImage';
import { AdCopyResponse, AppStatus, LightingSettings, FabricType, BackgroundOption, ModelMode, ModelGender, CompositionType, GarmentType, CustomBackground, FitType } from '../types';

// Curated Studio Colors for Men's Fashion
const STUDIO_COLORS = [
  { name: 'Pure White', value: '#FFFFFF', class: 'bg-white' },
  { name: 'Off White', value: '#F5F5F5', class: 'bg-[#F5F5F5]' },
  { name: 'Studio Grey', value: '#E5E5E5', class: 'bg-[#E5E5E5]' },
  { name: 'Concrete', value: '#9CA3AF', class: 'bg-gray-400' },
  { name: 'Charcoal', value: '#374151', class: 'bg-gray-700' },
  { name: 'Midnight', value: '#0F172A', class: 'bg-slate-900' },
  { name: 'Sand', value: '#E7E5E4', class: 'bg-stone-200' },
  { name: 'Khaki', value: '#D6D3D1', class: 'bg-stone-300' },
  { name: 'Olive', value: '#44403C', class: 'bg-stone-700' },
  { name: 'Navy', value: '#172554', class: 'bg-blue-950' },
  { name: 'Black', value: '#000000', class: 'bg-black' },
  { name: 'Lime Accent', value: '#bef264', class: 'bg-lime-400' },
];

export const StudioPanel: React.FC = () => {
  // State for Images
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  
  // State for Processing
  const [adCopy, setAdCopy] = useState<AdCopyResponse | null>(null);
  const [adStatus, setAdStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [activeTab, setActiveTab] = useState<'witty' | 'edgy' | 'minimalist' | 'sarcastic' | 'aspirational'>('witty');
  
  // 3D Generation State
  const [gen3DStatus, setGen3DStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [upscaleStatus, setUpscaleStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Material, Garment & Model State
  const [fabricType, setFabricType] = useState<FabricType>('cotton');
  const [garmentType, setGarmentType] = useState<GarmentType>('t-shirt');
  const [fitType, setFitType] = useState<FitType>('oversized');
  const [secondaryFabricType, setSecondaryFabricType] = useState<FabricType | 'none'>('none');
  
  // Background State
  const [bgMode, setBgMode] = useState<'preset' | 'custom_color' | 'custom_image'>('preset');
  const [background, setBackground] = useState<BackgroundOption>('sunlit_travertine');
  const [customColor, setCustomColor] = useState<string>('#E5E5E5');
  const [customBgImage, setCustomBgImage] = useState<{data: string, mime: string} | null>(null);

  const bgFileInputRef = useRef<HTMLInputElement>(null);
  
  const [modelMode, setModelMode] = useState<ModelMode>('ghost');
  const [modelGender, setModelGender] = useState<ModelGender>('female');
  
  // Forced Golden Ratio
  const composition: CompositionType = 'golden_ratio'; 

  // Lighting State - Defaulting to Premium Cinematic Settings
  const [lighting, setLighting] = useState<LightingSettings>({
    main: { intensity: 'medium', color: 'neutral', direction: 'left' }, 
    rim: { intensity: 'subtle', color: 'white', direction: 'right' }
  });

  // Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleImageUpload = (base64: string, mime: string) => {
    setOriginalImage(base64);
    setCurrentImage(base64);
    setMimeType(mime);
    setAdCopy(null);
    setAdStatus(AppStatus.IDLE);
    setGen3DStatus(AppStatus.IDLE);
    setUpscaleStatus(AppStatus.IDLE);
    setErrorMessage(null);
    setActiveTab('witty');
  };

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const result = reader.result as string;
              const [meta, base64] = result.split(',');
              const mime = meta.split(':')[1].split(';')[0];
              setCustomBgImage({ data: base64, mime });
          };
          reader.readAsDataURL(file);
      }
  };

  const handleGenerateAdCopy = async () => {
    if (!currentImage) return;
    setAdStatus(AppStatus.LOADING);
    try {
      const result = await generateAdCopy(currentImage, mimeType);
      setAdCopy(result);
      setAdStatus(AppStatus.SUCCESS);
    } catch (error) {
      console.error("Ad Copy Error:", error);
      setAdStatus(AppStatus.ERROR);
    }
  };

  const handleGenerate3D = async () => {
    if (!originalImage) return; 
    setErrorMessage(null);
    
    // Helper to check key existence
    const ensureKey = async () => {
        if ((window as any).aistudio) {
            const isKeySelected = await (window as any).aistudio.hasSelectedApiKey();
            if (!isKeySelected) {
                await (window as any).aistudio.openSelectKey();
            }
        }
    };

    try {
        await ensureKey();
    } catch (e) {
        console.error("Key selection failed", e);
        return;
    }

    setGen3DStatus(AppStatus.LOADING);

    // Construct custom background object if needed
    let customBg: CustomBackground | undefined = undefined;
    if (bgMode === 'custom_color') {
        customBg = { type: 'color', value: customColor };
    } else if (bgMode === 'custom_image' && customBgImage) {
        customBg = { type: 'image', value: customBgImage.data, mimeType: customBgImage.mime };
    }

    try {
      const newImageBase64 = await generate3DClothing(
          originalImage, 
          mimeType, 
          lighting, 
          fabricType, 
          garmentType,
          fitType,
          secondaryFabricType,
          background,
          modelMode,
          modelGender,
          composition,
          customBg
      );
      if (newImageBase64) {
        setCurrentImage(newImageBase64);
        setGen3DStatus(AppStatus.SUCCESS);
        setUpscaleStatus(AppStatus.IDLE);
      }
    } catch (error: any) {
      console.error("3D Gen Error:", error);
      
      const errorStr = (JSON.stringify(error) + (error.message || "")).toLowerCase();
      
      // Handle Quota Errors
      if (errorStr.includes("429") || errorStr.includes("resource_exhausted") || errorStr.includes("quota")) {
          setErrorMessage("Daily Studio quota exceeded. Please try again later or check your plan.");
          setGen3DStatus(AppStatus.ERROR);
          return;
      }

      const isAuthError = errorStr.includes("403") || errorStr.includes("permission") || errorStr.includes("not found");

        if (isAuthError && (window as any).aistudio) {
            try {
                await (window as any).aistudio.openSelectKey();
                const newImageBase64 = await generate3DClothing(
                    originalImage, 
                    mimeType, 
                    lighting, 
                    fabricType, 
                    garmentType,
                    fitType,
                    secondaryFabricType,
                    background,
                    modelMode,
                    modelGender,
                    composition,
                    customBg
                );
                if (newImageBase64) {
                    setCurrentImage(newImageBase64);
                    setGen3DStatus(AppStatus.SUCCESS);
                    setUpscaleStatus(AppStatus.IDLE);
                    return;
                }
            } catch (retryEx) {
                console.error("Retry failed after key selection", retryEx);
            }
        }

      setGen3DStatus(AppStatus.ERROR);
      if (!errorMessage) setErrorMessage("Generation failed. Please check your credentials and connection.");
    }
  };

  const handleUpscale = async (resolution: '2K' | '4K') => {
    if (!currentImage) return;
    setErrorMessage(null);

    // Helper to check key existence
    const ensureKey = async () => {
        if ((window as any).aistudio) {
            const isKeySelected = await (window as any).aistudio.hasSelectedApiKey();
            if (!isKeySelected) {
                await (window as any).aistudio.openSelectKey();
            }
        }
    };

    try {
        await ensureKey();
    } catch (e) {
        console.error("Key selection failed", e);
        return;
    }

    setUpscaleStatus(AppStatus.LOADING);
    try {
        const upscaled = await upscaleImage(currentImage, mimeType, resolution);
        if (upscaled) {
            setCurrentImage(upscaled);
            setUpscaleStatus(AppStatus.SUCCESS);
        }
    } catch (e: any) {
        console.error("Upscale error", e);
        const errorStr = (JSON.stringify(e) + (e.message || "")).toLowerCase();
        
        if (errorStr.includes("429") || errorStr.includes("resource_exhausted") || errorStr.includes("quota")) {
             setErrorMessage("Quota exceeded. Upscaling skipped.");
             setUpscaleStatus(AppStatus.ERROR);
             return;
        }

        const isAuthError = errorStr.includes("403") || errorStr.includes("permission") || errorStr.includes("not found");

        if (isAuthError && (window as any).aistudio) {
            try {
                await (window as any).aistudio.openSelectKey();
                const upscaledRetry = await upscaleImage(currentImage, mimeType, resolution);
                if (upscaledRetry) {
                    setCurrentImage(upscaledRetry);
                    setUpscaleStatus(AppStatus.SUCCESS);
                    return;
                }
            } catch (retryEx) {
                console.error("Retry failed after key selection", retryEx);
            }
        }
        setUpscaleStatus(AppStatus.ERROR);
        if (!errorMessage) setErrorMessage("Upscale failed. Please ensure you have a valid Studio Key.");
    }
  };

  const handleReset = () => {
    setCurrentImage(originalImage);
    setGen3DStatus(AppStatus.IDLE);
    setUpscaleStatus(AppStatus.IDLE);
    setErrorMessage(null);
  };

  const handleStartOver = () => {
    setOriginalImage(null);
    setCurrentImage(null);
    setAdCopy(null);
    setAdStatus(AppStatus.IDLE);
    setGen3DStatus(AppStatus.IDLE);
    setUpscaleStatus(AppStatus.IDLE);
    setErrorMessage(null);
  };

  const handleDownloadCurrent = () => {
    if (!currentImage) return;
    const link = document.createElement('a');
    link.href = `data:${mimeType};base64,${currentImage}`;
    link.download = `spnk-edit-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openShareModal = () => {
    if (adCopy || currentImage) {
      setIsShareModalOpen(true);
    }
  };

  const getShareText = () => {
    if (!adCopy) return 'Check out this design created in the SPNK Education Studio.';
    const currentStyle = adCopy[activeTab];
    return `${currentStyle.headline}\n\n${currentStyle.body}\n\n${currentStyle.hashtags.join(' ')}`;
  };

  const updateMainLight = (field: keyof LightingSettings['main'], value: string) => {
    setLighting(prev => ({ ...prev, main: { ...prev.main, [field]: value } }));
  };

  const updateRimLight = (field: keyof LightingSettings['rim'], value: string) => {
    setLighting(prev => ({ ...prev, rim: { ...prev.rim, [field]: value } }));
  };

  const handleModeChange = (mode: ModelMode) => {
    setModelMode(mode);
    if (mode === 'human') {
        // Switch to cinematic lighting for humans (Side lighting reveals texture)
        setLighting({
            main: { intensity: 'hard', color: 'warm', direction: 'left' },
            rim: { intensity: 'subtle', color: 'white', direction: 'right' }
        });
    } else {
        // Switch to even studio lighting for ghost mannequin - improved default
        setLighting({
            main: { intensity: 'medium', color: 'neutral', direction: 'left' },
            rim: { intensity: 'subtle', color: 'white', direction: 'right' }
        });
    }
  };

  // Reusable Select Component with Glass Style
  const SelectControl = ({ label, value, options, onChange, disabled = false }: any) => (
    <div className="flex-1 min-w-[100px]">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">{label}</label>
        <div className="relative group">
            <select 
                value={value} 
                onChange={(e) => onChange(e.target.value)} 
                disabled={disabled}
                className={`w-full appearance-none bg-black/40 border border-white/10 text-white text-xs rounded-xl py-2.5 px-3 focus:outline-none focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/50 transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-white/20 hover:bg-black/60 cursor-pointer'}`}
            >
                {options.map((opt: any) => (
                    <option key={opt.value} value={opt.value} className="bg-[#1a1a1a]">{opt.label}</option>
                ))}
            </select>
            <div className="absolute right-3 top-3 pointer-events-none text-gray-500 group-hover:text-white transition-colors">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
        </div>
    </div>
  );

  if (!originalImage) {
      return (
        <div className="max-w-xl mx-auto mt-12 animate-fade-in relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-5xl font-bold mb-4 brand-font uppercase text-white tracking-tight drop-shadow-2xl">SPNK Studio</h2>
              <p className="text-gray-400 text-lg font-light">Upload your product photos. Get instant 3D assets and premium ad copy.</p>
            </div>
            <ImageUploader onImageUpload={handleImageUpload} />
          </div>
      );
  }

  return (
    <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold uppercase text-white brand-font tracking-wide">Workspace</h2>
            <button 
                onClick={handleStartOver}
                className="group flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
            >
                <span className="w-8 h-8 rounded-full border border-gray-700 flex items-center justify-center group-hover:border-lime-400 group-hover:bg-lime-400 group-hover:text-black transition-all bg-black/50 backdrop-blur-md">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4 4m0 0L8 8m4-4v12" /></svg>
                </span>
                Upload New
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Image Area */}
            <div className="lg:col-span-7 space-y-6">
              {/* Main Canvas with Glass Effect */}
              <div className="bg-[#121212]/60 backdrop-blur-2xl rounded-[32px] p-2 border border-white/10 shadow-2xl overflow-hidden relative group ring-1 ring-white/5">
                {currentImage && (
                  <ZoomableImage 
                        src={`data:${mimeType};base64,${currentImage}`} 
                        alt="Product" 
                        className="w-full h-auto rounded-[24px] bg-[#0a0a0a] shadow-inner"
                    />
                )}
                
                {/* HUD Overlay for Status */}
                {(gen3DStatus === AppStatus.LOADING || upscaleStatus === AppStatus.LOADING) && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-10 transition-all duration-500">
                    <div className="text-center">
                      <div className="relative w-20 h-20 mx-auto mb-6">
                         <div className="absolute inset-0 border-t-2 border-lime-400 rounded-full animate-spin shadow-[0_0_15px_rgba(163,230,53,0.5)]"></div>
                         <div className="absolute inset-3 border-r-2 border-white/30 rounded-full animate-spin reverse"></div>
                      </div>
                      <p className="text-lime-400 font-mono text-sm tracking-[0.2em] animate-pulse font-bold">
                          {upscaleStatus === AppStatus.LOADING ? 'ENHANCING RESOLUTION...' : 'RENDERING ASSET...'}
                      </p>
                    </div>
                  </div>
                )}
                {(gen3DStatus === AppStatus.ERROR || upscaleStatus === AppStatus.ERROR) && (
                    <div className="absolute top-6 left-6 right-6 bg-red-500/10 backdrop-blur-xl border border-red-500/30 text-red-200 p-4 rounded-2xl text-xs z-20 shadow-xl animate-fade-in">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            <div>
                                <p className="font-bold mb-1 uppercase tracking-wide text-red-400">Studio Error</p>
                                <p className="opacity-80 leading-relaxed">{errorMessage || "An unexpected error occurred. Please check your credentials."}</p>
                            </div>
                            <button onClick={() => { setGen3DStatus(AppStatus.IDLE); setUpscaleStatus(AppStatus.IDLE); setErrorMessage(null); }} className="ml-auto text-red-400 hover:text-white">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    </div>
                )}
              </div>
              
              {/* Action Bar */}
              <div className="grid grid-cols-2 gap-4">
                  <Button variant="secondary" onClick={handleDownloadCurrent} className="py-4 rounded-2xl bg-black/40 border-white/10 hover:bg-white/10 backdrop-blur-xl">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Download
                  </Button>
                  <Button variant="secondary" onClick={openShareModal} className="py-4 rounded-2xl bg-black/40 border-white/10 hover:bg-white/10 backdrop-blur-xl">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                    Share
                  </Button>
              </div>

              {/* Upscale Controls */}
              <div className="bg-[#121212]/60 backdrop-blur-2xl p-5 rounded-3xl border border-white/10 flex items-center justify-between shadow-lg">
                 <div>
                    <h4 className="text-sm font-bold text-white uppercase flex items-center gap-2 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-lime-400 shadow-[0_0_10px_#a3e635]"></span>
                        SPNK Enhancer
                    </h4>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Enhance resolution & detail</p>
                 </div>
                 <div className="flex gap-2">
                     <Button 
                        variant="secondary" 
                        className="px-5 py-2 text-xs h-auto rounded-xl border-white/5 bg-black/20" 
                        onClick={() => handleUpscale('2K')}
                        isLoading={upscaleStatus === AppStatus.LOADING}
                        disabled={upscaleStatus === AppStatus.LOADING}
                    >
                        2K
                    </Button>
                     <Button 
                        variant="accent" 
                        className="px-5 py-2 text-xs h-auto rounded-xl" 
                        onClick={() => handleUpscale('4K')}
                        isLoading={upscaleStatus === AppStatus.LOADING}
                        disabled={upscaleStatus === AppStatus.LOADING}
                    >
                        4K
                    </Button>
                 </div>
              </div>

              {/* 3D Generation Controls */}
              <div className="bg-[#121212]/60 backdrop-blur-2xl rounded-[32px] p-8 border border-white/10 shadow-2xl">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                  <h3 className="text-xl font-bold flex items-center gap-3 text-white">
                      <div className="p-2 bg-lime-400/10 rounded-lg border border-lime-400/20">
                        <svg className="w-5 h-5 text-lime-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                      </div>
                      3D Studio
                  </h3>
                  {originalImage !== currentImage && (
                     <button onClick={handleReset} className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:border-white/20">Reset Original</button>
                  )}
                </div>

                <div className="mb-8 space-y-8">
                    
                    {/* Presentation Mode Toggle (Ghost vs Human) */}
                    <div>
                        <div className="flex justify-between items-center mb-3 px-1">
                             <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Presentation Mode</h4>
                             {modelMode === 'human' && (
                                 <div className="flex bg-black/40 rounded-lg p-0.5 border border-white/5">
                                    {(['female', 'male', 'neutral'] as const).map(g => (
                                        <button 
                                            key={g}
                                            onClick={() => setModelGender(g)}
                                            className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase transition-all ${modelGender === g ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                 </div>
                             )}
                        </div>
                        <div className="bg-black/40 p-1.5 rounded-2xl flex border border-white/5 relative">
                            <button 
                                onClick={() => handleModeChange('ghost')}
                                className={`flex-1 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${modelMode === 'ghost' ? 'bg-white/10 text-white shadow-lg border border-white/5' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                Ghost Mannequin
                            </button>
                            <button 
                                onClick={() => handleModeChange('human')}
                                className={`flex-1 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${modelMode === 'human' ? 'bg-lime-400 text-black shadow-[0_0_20px_rgba(163,230,53,0.2)]' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                                AI Model
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Garment Type Selector */}
                        <div>
                            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 pl-1">Garment Type</h4>
                            <div className="relative group">
                                <select 
                                    value={garmentType} 
                                    onChange={(e) => setGarmentType(e.target.value as GarmentType)} 
                                    className="w-full appearance-none bg-black/40 border border-white/10 text-white text-xs rounded-xl py-3 px-3 focus:outline-none focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/50 transition-all hover:border-white/20 hover:bg-black/60 cursor-pointer"
                                >
                                    <option value="t-shirt" className="bg-[#1a1a1a]">T-Shirt</option>
                                    <option value="hoodie" className="bg-[#1a1a1a]">Hoodie</option>
                                    <option value="sweatshirt" className="bg-[#1a1a1a]">Sweatshirt</option>
                                    <option value="jacket" className="bg-[#1a1a1a]">Jacket / Outerwear</option>
                                    <option value="pants" className="bg-[#1a1a1a]">Pants</option>
                                    <option value="shorts" className="bg-[#1a1a1a]">Shorts</option>
                                </select>
                                <div className="absolute right-3 top-3.5 pointer-events-none text-gray-500 group-hover:text-white transition-colors">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>

                         {/* Material Selector */}
                        <div>
                            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 pl-1">Material</h4>
                            <div className="relative group">
                                <select 
                                    value={fabricType} 
                                    onChange={(e) => setFabricType(e.target.value as FabricType)} 
                                    className="w-full appearance-none bg-black/40 border border-white/10 text-white text-xs rounded-xl py-3 px-3 focus:outline-none focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/50 transition-all hover:border-white/20 hover:bg-black/60 cursor-pointer"
                                >
                                    <option value="cotton" className="bg-[#1a1a1a]">Cotton (Matte)</option>
                                    <option value="fleece" className="bg-[#1a1a1a]">Fleece (Soft)</option>
                                    <option value="denim" className="bg-[#1a1a1a]">Denim (Rigid)</option>
                                    <option value="nylon" className="bg-[#1a1a1a]">Nylon / Tech (Crisp)</option>
                                    <option value="leather" className="bg-[#1a1a1a]">Leather (Grain)</option>
                                </select>
                                <div className="absolute right-3 top-3.5 pointer-events-none text-gray-500 group-hover:text-white transition-colors">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fit Selector */}
                    <div>
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 pl-1">Fit & Drape Physics</h4>
                        <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                            {(['regular', 'oversized', 'slim'] as const).map(f => (
                                <button 
                                    key={f} 
                                    onClick={() => setFitType(f)} 
                                    className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${fitType === f ? 'bg-lime-400 text-black shadow' : 'text-gray-500 hover:text-white'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Background & Environment Selector */}
                    <div>
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 pl-1">Background & Environment</h4>
                        
                        {/* Background Mode Toggle */}
                        <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 mb-4">
                            <button onClick={() => setBgMode('preset')} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${bgMode === 'preset' ? 'bg-lime-400 text-black shadow' : 'text-gray-500 hover:text-white'}`}>Presets</button>
                            <button onClick={() => setBgMode('custom_color')} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${bgMode === 'custom_color' ? 'bg-lime-400 text-black shadow' : 'text-gray-500 hover:text-white'}`}>Color Studio</button>
                            <button onClick={() => setBgMode('custom_image')} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${bgMode === 'custom_image' ? 'bg-lime-400 text-black shadow' : 'text-gray-500 hover:text-white'}`}>Custom Image</button>
                        </div>

                        {/* Presets Grid */}
                        {bgMode === 'preset' && (
                            <div className="grid grid-cols-2 gap-2 animate-fade-in">
                                <button onClick={() => setBackground('sunlit_travertine')} className={`py-3 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all border ${background === 'sunlit_travertine' ? 'bg-white/10 text-white border-lime-400/50 shadow-lg' : 'bg-black/40 border-white/5 text-gray-500 hover:text-white'}`}>Sunlit Travertine</button>
                                <button onClick={() => setBackground('urban_concrete')} className={`py-3 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all border ${background === 'urban_concrete' ? 'bg-white/10 text-white border-lime-400/50 shadow-lg' : 'bg-black/40 border-white/5 text-gray-500 hover:text-white'}`}>Urban Concrete</button>
                                <button onClick={() => setBackground('minimal_luxury')} className={`py-3 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all border ${background === 'minimal_luxury' ? 'bg-white/10 text-white border-lime-400/50 shadow-lg' : 'bg-black/40 border-white/5 text-gray-500 hover:text-white'}`}>Clean Studio</button>
                                <button onClick={() => setBackground('moody_editorial')} className={`py-3 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all border ${background === 'moody_editorial' ? 'bg-white/10 text-white border-lime-400/50 shadow-lg' : 'bg-black/40 border-white/5 text-gray-500 hover:text-white'}`}>Moody Dark</button>
                            </div>
                        )}

                        {/* Custom Color Swatches */}
                        {bgMode === 'custom_color' && (
                            <div className="animate-fade-in bg-black/40 p-4 rounded-xl border border-white/5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Select Studio Backdrop</label>
                                <div className="grid grid-cols-4 gap-3">
                                    {STUDIO_COLORS.map((color) => (
                                        <button
                                            key={color.value}
                                            onClick={() => setCustomColor(color.value)}
                                            className={`relative group aspect-square rounded-full transition-all duration-300 flex items-center justify-center border-2 ${customColor === color.value ? 'border-lime-400 scale-110 shadow-[0_0_15px_rgba(163,230,53,0.3)]' : 'border-transparent hover:scale-105'}`}
                                            title={color.name}
                                        >
                                            <div className={`w-full h-full rounded-full ${color.class} shadow-inner`}></div>
                                            {customColor === color.value && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-1.5 h-1.5 bg-lime-400 rounded-full ring-2 ring-black"></div>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-4 flex items-center gap-2 justify-center">
                                    <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: customColor }}></div>
                                    <span className="text-[10px] font-mono text-gray-400">{STUDIO_COLORS.find(c => c.value === customColor)?.name || customColor}</span>
                                </div>
                            </div>
                        )}

                        {/* Custom Image Upload */}
                        {bgMode === 'custom_image' && (
                            <div className="animate-fade-in bg-black/40 p-4 rounded-xl border border-white/5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Upload Environment</label>
                                <input 
                                    type="file" 
                                    ref={bgFileInputRef}
                                    onChange={handleBgImageUpload}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <div 
                                    onClick={() => bgFileInputRef.current?.click()}
                                    className="border border-dashed border-white/20 rounded-xl p-4 cursor-pointer hover:border-lime-400/50 hover:bg-white/5 transition-all text-center group"
                                >
                                    {customBgImage ? (
                                        <div className="relative h-24 w-full overflow-hidden rounded-lg">
                                            <img src={`data:${customBgImage.mime};base64,${customBgImage.data}`} alt="Custom Bg" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-[9px] font-bold text-white uppercase">Change Image</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-4">
                                            <svg className="w-6 h-6 text-gray-500 mx-auto mb-2 group-hover:text-lime-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            <p className="text-[10px] text-gray-400">Click to upload background</p>
                                        </div>
                                    )}
                                </div>
                                <p className="text-[9px] text-gray-500 mt-2">Lighting & shadows will match this image.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Main Light Controls */}
                    <div className={`bg-black/40 p-6 rounded-[24px] border border-white/5 transition-colors ${bgMode === 'custom_image' ? 'opacity-50 pointer-events-none' : 'hover:border-white/10'}`}>
                        <div className="flex justify-between items-center mb-4">
                             <h4 className="text-[10px] font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white]"></span> Main Light
                            </h4>
                            {bgMode === 'custom_image' && <span className="text-[9px] text-lime-400 font-bold uppercase">Auto-Matching</span>}
                        </div>
                       
                        <div className="flex gap-2 flex-wrap">
                            <SelectControl 
                                label="Intensity"
                                value={lighting.main.intensity}
                                options={[{value:'soft', label:'Soft'}, {value:'medium', label:'Medium'}, {value:'hard', label:'Hard'}]}
                                onChange={(v:any) => updateMainLight('intensity', v)}
                                disabled={bgMode === 'custom_image'}
                            />
                            <SelectControl 
                                label="Tint"
                                value={lighting.main.color}
                                options={[{value:'neutral', label:'Neutral'}, {value:'warm', label:'Warm'}, {value:'cool', label:'Cool'}]}
                                onChange={(v:any) => updateMainLight('color', v)}
                                disabled={bgMode === 'custom_image'}
                            />
                            <SelectControl 
                                label="Direction"
                                value={lighting.main.direction}
                                options={[{value:'front', label:'Front'}, {value:'left', label:'Left'}, {value:'right', label:'Right'}, {value:'top', label:'Top'}]}
                                onChange={(v:any) => updateMainLight('direction', v)}
                                disabled={bgMode === 'custom_image'}
                            />
                        </div>
                    </div>

                    {/* Rim Light Controls */}
                    <div className="bg-black/40 p-6 rounded-[24px] border border-white/5 hover:border-white/10 transition-colors">
                         <h4 className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-lime-400 rounded-full shadow-[0_0_8px_#a3e635]"></span> Rim Light
                        </h4>
                        <div className="flex gap-2 flex-wrap">
                            <SelectControl 
                                label="Strength"
                                value={lighting.rim.intensity}
                                options={[{value:'none', label:'Off'}, {value:'subtle', label:'Subtle'}, {value:'strong', label:'Strong'}]}
                                onChange={(v:any) => updateRimLight('intensity', v)}
                            />
                            <SelectControl 
                                label="Color"
                                value={lighting.rim.color}
                                disabled={lighting.rim.intensity === 'none'}
                                options={[{value:'white', label:'White'}, {value:'lime', label:'Lime'}, {value:'cyan', label:'Cyan'}, {value:'magenta', label:'Magenta'}, {value:'orange', label:'Orange'}]}
                                onChange={(v:any) => updateRimLight('color', v)}
                            />
                            <SelectControl 
                                label="Source"
                                value={lighting.rim.direction}
                                disabled={lighting.rim.intensity === 'none'}
                                options={[{value:'left', label:'Left'}, {value:'right', label:'Right'}, {value:'top', label:'Top'}]}
                                onChange={(v:any) => updateRimLight('direction', v)}
                            />
                        </div>
                    </div>
                </div>

                <Button variant="accent" onClick={handleGenerate3D} isLoading={gen3DStatus === AppStatus.LOADING} className="w-full py-5 text-base shadow-[0_0_30px_rgba(163,230,53,0.2)] rounded-2xl">
                    {modelMode === 'human' ? `Generate Model Shoot` : 'Generate 3D Asset'}
                </Button>
              </div>
            </div>

            {/* Right Column: Ad Copy Area */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#121212]/60 backdrop-blur-2xl rounded-[32px] p-6 border border-white/10 h-full flex flex-col shadow-2xl">
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-1 flex items-center gap-3 text-white">
                      <div className="p-2 bg-lime-400/10 rounded-lg border border-lime-400/20">
                          <svg className="w-5 h-5 text-lime-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                      </div>
                      Ad Generator
                  </h3>
                  <p className="text-xs text-gray-400 font-medium">Viral captions optimized for engagement.</p>
                </div>

                {!adCopy ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 border border-dashed border-white/10 rounded-3xl bg-black/20 group hover:border-white/20 transition-colors">
                    <p className="text-gray-500 text-sm text-center mb-6 max-w-[200px] leading-relaxed">Ready to drop? Generate copy based on the current look of your product.</p>
                    <Button variant="secondary" onClick={handleGenerateAdCopy} isLoading={adStatus === AppStatus.LOADING} className="w-full rounded-2xl bg-black/40 border-white/10 hover:bg-white/10">Generate Ad Copy</Button>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col gap-5 animate-fade-in">
                    <div className="flex flex-wrap p-1 bg-black/40 rounded-xl border border-white/5 gap-1">
                      {(['witty', 'edgy', 'minimalist', 'sarcastic', 'aspirational'] as const).map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 min-w-[80px] py-2.5 text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all duration-300 ${activeTab === tab ? 'bg-lime-400 text-black shadow-lg shadow-lime-500/20' : 'text-gray-500 hover:text-gray-300'}`}>{tab}</button>
                      ))}
                    </div>
                    
                    <div className="bg-black/20 p-6 rounded-3xl border border-white/5 relative">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Headline</label>
                      <p className="text-xl font-bold text-white brand-font tracking-wide leading-tight">{adCopy[activeTab].headline}</p>
                    </div>
                    
                    <div className="bg-black/20 p-6 rounded-3xl border border-white/5 flex-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Caption</label>
                      <p className="text-gray-300 leading-relaxed whitespace-pre-wrap font-light">{adCopy[activeTab].body}</p>
                    </div>
                    
                    <div className="bg-black/20 p-6 rounded-3xl border border-white/5">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {adCopy[activeTab].hashtags.map(tag => <span key={tag} className="text-lime-400 text-xs font-medium bg-lime-400/10 px-2 py-1.5 rounded-lg border border-lime-400/20">{tag}</span>)}
                      </div>
                    </div>
                    
                    <Button variant="secondary" onClick={handleGenerateAdCopy} isLoading={adStatus === AppStatus.LOADING} className="flex-1 rounded-2xl">Regenerate</Button>
                  </div>
                )}
              </div>
            </div>
        </div>

        <ShareModal 
          isOpen={isShareModalOpen} 
          onClose={() => setIsShareModalOpen(false)}
          text={getShareText()}
          image={currentImage || undefined}
          mimeType={mimeType}
        />
    </div>
  );
};
