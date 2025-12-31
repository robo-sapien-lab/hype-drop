
import React, { useState } from 'react';
import { StudioPanel } from './components/StudioPanel';
import { TryOnPanel } from './components/TryOnPanel';

type AppMode = 'studio' | 'try-on';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('studio');

  return (
    <div className="min-h-screen pb-20 bg-[#050505] text-white selection:bg-lime-400 selection:text-black font-sans relative overflow-x-hidden">
      
      {/* Premium Background Stack */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Deep ambient base */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#1a1a1a_0%,_#050505_100%)]"></div>
        
        {/* Spotlights */}
        <div className="absolute top-[-10%] left-[20%] w-[40vw] h-[40vw] bg-lime-500/5 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[30vw] h-[30vw] bg-purple-500/5 blur-[100px] rounded-full mix-blend-screen"></div>

        {/* Film Grain Noise Texture */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
        }}></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-2xl transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setMode('studio')}>
            <div className="relative w-10 h-10">
                <div className="absolute inset-0 bg-lime-400 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-[#1a1a1a] to-black border border-white/10 rounded-xl flex items-center justify-center shadow-2xl">
                    <span className="font-bold text-lime-400 text-xl brand-font">S</span>
                </div>
            </div>
            <h1 className="text-2xl font-bold brand-font tracking-wide text-white">
              SPNK<span className="text-lime-400"> EDUCATION</span>
            </h1>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center p-1 bg-white/5 rounded-xl border border-white/5 backdrop-blur-md relative">
            {/* Sliding Background Pill */}
            <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-lime-400 rounded-lg shadow-[0_0_15px_rgba(163,230,53,0.3)] transition-all duration-300 ease-out ${mode === 'studio' ? 'left-1' : 'left-[calc(50%)]'}`}></div>

            <button 
                onClick={() => setMode('studio')}
                className={`relative px-8 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 z-10 ${
                  mode === 'studio' 
                  ? 'text-black' 
                  : 'text-gray-400 hover:text-white'
                }`}
            >
                Studio Edit
            </button>
            <button 
                onClick={() => setMode('try-on')}
                className={`relative px-8 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 z-10 ${
                  mode === 'try-on' 
                  ? 'text-black' 
                  : 'text-gray-400 hover:text-white'
                }`}
            >
                Virtual Try-On
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 text-[10px] font-mono text-lime-400/90 px-3 py-1.5 bg-lime-900/20 rounded-full border border-lime-500/20 shadow-[0_0_10px_rgba(163,230,53,0.1)]">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse"></span>
                SPNK CORE ACTIVE
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex border-t border-white/5 bg-black/90 backdrop-blur-xl">
            <button 
                onClick={() => setMode('studio')}
                className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-colors ${mode === 'studio' ? 'text-lime-400 border-b-2 border-lime-400 bg-white/5' : 'text-gray-500'}`}
            >
                Studio
            </button>
            <button 
                onClick={() => setMode('try-on')}
                className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-colors ${mode === 'try-on' ? 'text-lime-400 border-b-2 border-lime-400 bg-white/5' : 'text-gray-500'}`}
            >
                Try-On
            </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 pt-32 relative z-10">
        {mode === 'studio' ? <StudioPanel /> : <TryOnPanel />}
      </main>
    </div>
  );
};

export default App;
