import React from 'react';
import { Button } from './Button';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  text: string;
  image?: string; // base64
  mimeType?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, text, image, mimeType }) => {
  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownload = () => {
    if (!image || !mimeType) return;
    const link = document.createElement('a');
    link.href = `data:${mimeType};base64,${image}`;
    link.download = 'hypedrop-asset.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNativeShare = async () => {
    const shareData: ShareData = {
        title: 'HypeDrop AI',
        text: text,
    };

    if (image && mimeType && navigator.share) {
        try {
            const byteCharacters = atob(image);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mimeType });
            const file = new File([blob], 'hypedrop-look.png', { type: mimeType });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                shareData.files = [file];
            }
        } catch (e) {
            console.warn("Error preparing file for share:", e);
        }
    }

    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            handleCopy();
            alert("Caption copied! Please download the image to post manually.");
        }
    } catch (err) {
        console.error('Error sharing:', err);
    }
  };

  const shareToX = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };
  
  const shareToWhatsApp = () => {
      const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl transition-all duration-300" onClick={onClose}></div>
      <div className="relative bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-fade-in ring-1 ring-white/5">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
            <h3 className="text-xl font-bold brand-font text-white uppercase tracking-wide">Share Campaign</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
            
            {/* Image Preview */}
            {image && (
                <div className="bg-black/40 rounded-2xl p-2 border border-white/5 shadow-inner">
                    <img src={`data:${mimeType};base64,${image}`} alt="Asset Preview" className="w-full h-56 object-cover rounded-xl" />
                </div>
            )}

            {/* Text Preview */}
            <div className="bg-white/5 rounded-2xl border border-white/5 p-5 relative group">
                <p className="text-gray-300 text-sm whitespace-pre-wrap font-light leading-relaxed">{text}</p>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={handleCopy} className="text-xs bg-black/50 text-white px-2 py-1 rounded hover:bg-lime-400 hover:text-black transition-colors">Copy</button>
                </div>
            </div>

            {/* Primary Action */}
            <Button variant="accent" onClick={handleNativeShare} className="w-full py-4 text-base shadow-[0_0_20px_rgba(163,230,53,0.15)]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                Share Image + Caption
            </Button>

            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-3">
                 <Button variant="secondary" onClick={handleCopy} className="text-xs py-3 rounded-xl">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                    Copy Text Only
                 </Button>
                 {image && (
                    <Button variant="secondary" onClick={handleDownload} className="text-xs py-3 rounded-xl">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Download Asset
                    </Button>
                 )}
            </div>

            <div className="border-t border-white/5 pt-5">
                <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-3 text-center">Social Quick Links</p>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={shareToX} className="flex items-center justify-center gap-2 bg-black hover:bg-gray-900 border border-white/10 text-white py-3 rounded-xl font-bold text-xs transition-all hover:border-white/20">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                        X (Twitter)
                    </button>
                    <button onClick={shareToWhatsApp} className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-black py-3 rounded-xl font-bold text-xs transition-all shadow-[0_0_15px_rgba(37,211,102,0.2)]">
                       <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                       WhatsApp
                    </button>
                </div>
            </div>

        </div>

      </div>
    </div>
  );
};