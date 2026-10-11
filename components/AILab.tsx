
import React, { useState, useRef } from 'react';
import { GeminiService } from '../services/geminiService';
import AdvancedEditor from './AdvancedEditor';
// Added missing motion import from framer-motion
import { motion } from 'framer-motion';
import { LayoutGrid, Cpu, Search, Zap, Upload, MessageCircle, Sparkles, Send, PenTool, RotateCcw, Check, X, ShieldCheck } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface GroundingLink {
  uri: string;
  title: string;
}

const LOGO_STYLES = [
  { id: 'minimalist', label: 'INFINITE_LOOP', desc: 'Apple-grade clean vectors', prompt: 'ultra-minimalist, geometric, perfect symmetry, San Francisco typography, monochromatic' },
  { id: 'kinetic', label: 'AEROSWIFT', desc: 'Nike-grade performance lines', prompt: 'dynamic, motion-blur-inspired, aggressive angles, high-performance aesthetic, bold sans-serif' },
  { id: 'heritage', label: 'LEGACY_MARK', desc: 'Classic championship crest', prompt: 'shield-inspired, heritage textures, metallic gold accents, collegiate typography, prestigious' },
];

const AILab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scout' | 'coach' | 'studio'>('scout');
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [scoutResult, setScoutResult] = useState<{ text: string; sources: GroundingLink[] } | null>(null);
  const [coachLog, setCoachLog] = useState<{ type: 'user' | 'coach'; text: string; suggestions?: string[] }[]>([]);
  const [studioImage, setStudioImage] = useState<string | null>(null);
  
  // Logo Generation State
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);
  const [logoPrompt, setLogoPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(LOGO_STYLES[0]);
  const [showLogoMaker, setShowLogoMaker] = useState(false);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const gemini = useRef(new GeminiService());

  const checkApiKey = async () => {
    // @ts-ignore
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      return false;
    }
    return true;
  };

  const handleScout = async (template?: string) => {
    const finalQuery = template || query;
    if (!finalQuery) return;

    setIsProcessing(true);
    setScoutResult(null);
    try {
      const response = await gemini.current.queryScoutMode(finalQuery);
      setScoutResult(response);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
      setQuery('');
    }
  };

  const handleLiveCoach = async (overrideQuery?: string) => {
    const targetQuery = overrideQuery || query;
    if (!targetQuery) return;

    setIsProcessing(true);
    const userMsg = { type: 'user' as const, text: targetQuery };
    setCoachLog(prev => [...prev, userMsg]);
    setQuery('');

    try {
      const response = await gemini.current.queryCoachMode(targetQuery);
      setCoachLog(prev => [...prev, { 
        type: 'coach', 
        text: response.text,
        suggestions: response.suggestions
      }]);
    } catch (err) {
      console.error(err);
      setCoachLog(prev => [...prev, { 
        type: 'coach', 
        text: "Neural downlink interrupted." 
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStudioImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateLogo = async () => {
    if (!logoPrompt) return;
    const authorized = await checkApiKey();
    if (!authorized) return;

    setIsGeneratingLogo(true);
    setPreviewLogo(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: `Ultra-premium sports brand logo for "${logoPrompt.toUpperCase()}". Archetype: ${selectedStyle.prompt}. Design language: Pure black and white, vector aesthetic, high contrast. Must look like a professional identity for Nike or Apple. No shadows, no gradients, pure 8K precision. Centered on white background.`,
        config: {
          numberOfImages: 1,
          aspectRatio: '1:1',
          outputMimeType: 'image/jpeg'
        },
      });

      if (response.generatedImages?.[0]) {
        const base64 = response.generatedImages[0].image.imageBytes;
        setPreviewLogo(`data:image/png;base64,${base64}`);
      }
    } catch (err) {
      console.error("Logo generation failed:", err);
      // @ts-ignore
      if (err.message?.includes("Requested entity was not found")) {
        // @ts-ignore
        await window.aistudio.openSelectKey();
      }
    } finally {
      setIsGeneratingLogo(false);
    }
  };

  const commitLogoToStudio = () => {
    if (previewLogo) {
      setStudioImage(previewLogo);
      setShowLogoMaker(false);
      setPreviewLogo(null);
      setLogoPrompt('');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 md:space-y-12 animate-in fade-in duration-700 px-4">
      <div className="flex justify-center gap-2 md:gap-4 mb-8 flex-wrap">
        {[
          { id: 'scout', label: 'SCOUT MODE', icon: Search },
          { id: 'coach', label: 'DESIGN COACH', icon: MessageCircle },
          { id: 'studio', label: 'DESIGN STUDIO', icon: Zap }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-8 md:px-12 py-3 md:py-4 rounded-full font-oswald italic tracking-widest text-[10px] md:text-xs transition-all border font-black uppercase flex items-center gap-2 ${activeTab === tab.id ? 'bg-[#ccff00] text-black border-[#ccff00] shadow-[0_0_20px_rgba(204,255,0,0.3)]' : 'bg-white/5 text-zinc-500 border-white/5 hover:border-white/10'}`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'scout' && (
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="font-oswald text-5xl md:text-[8rem] italic font-black uppercase leading-none tracking-tighter text-white">INTEL ENGINE</h2>
            <p className="text-[#ccff00] font-oswald text-[10px] tracking-[0.6em] italic opacity-60 font-black">GLOBAL NEURAL GROUNDING</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
            <div className="md:col-span-2 space-y-6">
              <div className="relative group">
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="SCAN LOCATION OR TEAM..."
                  className="w-full bg-black/40 border-2 border-white/10 rounded-[2rem] p-6 md:p-8 font-oswald text-xl md:text-3xl italic tracking-tighter focus:border-[#ccff00] outline-none text-white transition-all pr-24 md:pr-40"
                  onKeyDown={(e) => e.key === 'Enter' && handleScout()}
                />
                <button onClick={() => handleScout()} disabled={isProcessing} className="absolute right-3 top-3 bottom-3 px-6 md:px-12 bg-[#ccff00] text-black font-oswald italic rounded-2xl shadow-lg active:scale-95 transition-all font-black text-sm md:text-xl">
                  {isProcessing ? 'SCANNING...' : 'SCAN'}
                </button>
              </div>
              {scoutResult && (
                <div className="glass rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border border-white/10 animate-in slide-in-from-bottom-4 duration-500">
                  <p className="font-inter italic text-zinc-300 text-sm md:text-lg leading-relaxed mb-8 text-left">{scoutResult.text}</p>
                  {scoutResult.sources.length > 0 && (
                    <div className="space-y-4">
                      <p className="font-oswald text-[8px] md:text-[10px] text-zinc-500 tracking-[0.3em] uppercase italic font-bold text-left">VERIFIED SOURCES</p>
                      <div className="flex flex-wrap gap-2 md:gap-3">
                        {scoutResult.sources.map((src, i) => (
                          <a key={i} href={src.uri} target="_blank" className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-oswald italic text-[#ccff00] hover:bg-[#ccff00]/10 transition-colors uppercase">
                            {src.title.toUpperCase() || 'SOURCE INTEL'}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-3 md:space-y-4">
              <p className="font-oswald text-[8px] md:text-[10px] text-zinc-500 tracking-[0.4em] uppercase italic px-4 font-black text-left">QUICK SCANS</p>
              {[{ label: 'NBA HQ', q: 'Tell me about NBA League offices in NY' }, { label: 'KC Chiefs Colors', q: 'Official color palette for the KC Chiefs' }, { label: 'Stadium Intel', q: 'Recent news on SoFi Stadium' }].map(item => (
                <button key={item.label} onClick={() => handleScout(item.q)} className="w-full p-5 md:p-6 glass rounded-[1.5rem] md:rounded-[2rem] border border-white/5 text-left font-oswald italic tracking-tighter hover:border-[#ccff00]/40 transition-all text-white/50 hover:text-white group flex items-center justify-between">
                  <span className="text-sm md:text-xl font-bold">{item.label}</span>
                  <svg className="w-4 h-4 text-[#ccff00] opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"/></svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'coach' && (
        <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-500">
          <div className="text-center space-y-4">
            <h2 className="font-oswald text-5xl md:text-[6rem] italic font-black uppercase leading-none tracking-ultra text-[#ccff00] drop-shadow-[0_0_30px_rgba(204,255,0,0.2)]">DESIGN COACH</h2>
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="w-4 h-4 text-[#ccff00] animate-pulse" />
              <p className="text-zinc-500 font-oswald text-[10px] tracking-[0.6em] italic font-black uppercase">Expert Synthesis & Advice</p>
            </div>
          </div>
          <div className="glass rounded-[3rem] h-[600px] border border-white/10 flex flex-col overflow-hidden relative shadow-2xl">
            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 custom-scrollbar scroll-smooth">
              {coachLog.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-center px-10">
                  <div className="w-20 h-20 bg-[#ccff00]/10 rounded-full flex items-center justify-center mb-6 border border-[#ccff00]/20">
                    <Cpu className="w-10 h-10 text-[#ccff00]" />
                  </div>
                  <h3 className="font-oswald italic font-black text-xl text-white uppercase mb-2">NEURAL CORE STANDBY</h3>
                  <p className="font-inter text-xs text-zinc-500 leading-relaxed max-w-xs italic">"Ask me for layout suggestions, kit color theory, or stadium environment aesthetics."</p>
                </div>
              )}
              {coachLog.map((log, i) => (
                <div key={i} className={`flex ${log.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-[2rem] p-6 shadow-xl ${log.type === 'user' ? 'bg-zinc-900 border border-white/5' : 'bg-white/5 border border-[#ccff00]/20'}`}>
                    <div className="flex items-center gap-2 mb-3">
                      {log.type === 'coach' ? <Cpu className="w-3 h-3 text-[#ccff00]" /> : <LayoutGrid className="w-3 h-3 text-zinc-500" />}
                      <span className={`font-oswald italic font-black text-[9px] tracking-widest uppercase ${log.type === 'coach' ? 'text-[#ccff00]' : 'text-zinc-500'}`}>
                        {log.type === 'coach' ? 'DESIGN_COACH_v5' : 'CREATIVE_DIRECTOR'}
                      </span>
                    </div>
                    <p className="font-inter text-sm md:text-[15px] leading-relaxed text-zinc-300 italic">{log.text}</p>
                    {log.suggestions && (
                      <div className="mt-8 flex flex-wrap gap-2">
                        {log.suggestions.map((s, si) => (
                          <button key={si} onClick={() => handleLiveCoach(s)} className="bg-black/60 border border-[#ccff00]/30 px-4 py-2 rounded-xl text-[10px] font-oswald italic text-[#ccff00] hover:bg-[#ccff00] hover:text-black transition-all font-black uppercase tracking-tighter">
                            + {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 md:p-8 bg-black/40 border-t border-white/10 flex gap-4 backdrop-blur-xl">
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Query the coach..." className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 md:px-8 font-oswald italic tracking-tighter outline-none focus:border-[#ccff00] text-white text-lg transition-all" onKeyDown={(e) => e.key === 'Enter' && handleLiveCoach()} />
              <button onClick={() => handleLiveCoach()} disabled={isProcessing || !query} className="w-16 h-16 bg-[#ccff00] text-black rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all shrink-0 hover:bg-white disabled:opacity-20 disabled:grayscale">
                {isProcessing ? <div className="w-6 h-6 border-[3px] border-black border-t-transparent rounded-full animate-spin"></div> : <Send className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'studio' && (
        <div className="w-full space-y-8 min-h-[60vh]">
          {studioImage ? (
            <div className="animate-in zoom-in-95 duration-700">
               <AdvancedEditor initialImage={studioImage} onSave={(img) => { setStudioImage(img); }} onBack={() => setStudioImage(null)} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-20 space-y-10 animate-in slide-in-from-bottom-10">
               <div className="text-center space-y-4">
                 <h2 className="font-oswald italic font-black text-6xl md:text-9xl uppercase tracking-ultra leading-none text-white">DESIGN_STUDIO</h2>
                 <p className="text-[#ccff00] font-oswald italic text-xs tracking-[0.5em] uppercase font-black opacity-80">LOAD_GEN_CORE_ASSET</p>
               </div>
               <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl justify-center items-stretch px-4">
                  <div onClick={() => fileInputRef.current?.click()} className="flex-1 aspect-video md:aspect-square glass rounded-[3rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-6 hover:border-[#ccff00]/40 transition-all group cursor-pointer shadow-2xl relative overflow-hidden">
                    <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-[#ccff00]/10 transition-all duration-700">
                      <Upload className="w-8 h-8 text-zinc-500 group-hover:text-[#ccff00] transition-all" />
                    </div>
                    <div className="text-center px-6">
                        <span className="font-oswald italic font-black text-2xl uppercase tracking-ultra text-white group-hover:text-[#ccff00] transition-colors">UPLOAD_PLATE</span>
                        <p className="font-oswald italic text-[9px] text-zinc-600 uppercase tracking-widest mt-2 font-black">SUPPORTS_8K_PLATES</p>
                    </div>
                  </div>
                  <div onClick={() => setShowLogoMaker(true)} className="flex-1 aspect-video md:aspect-square glass rounded-[3rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-6 hover:border-[#ccff00]/40 transition-all group cursor-pointer shadow-2xl relative overflow-hidden">
                    <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-[#ccff00]/10 transition-all duration-700">
                      <PenTool className="w-8 h-8 text-zinc-500 group-hover:text-[#ccff00] transition-all" />
                    </div>
                    <div className="text-center px-6">
                        <span className="font-oswald italic font-black text-2xl uppercase tracking-ultra text-white group-hover:text-[#ccff00] transition-colors">LOGO_ENGINE</span>
                        <p className="font-oswald italic text-[9px] text-zinc-600 uppercase tracking-widest mt-2 font-black">IMAGEN_4_PRO_SERIES</p>
                    </div>
                  </div>
               </div>
               <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleStudioUpload} />

               {showLogoMaker && (
                 <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6">
                   <div className="w-full max-w-4xl glass border border-white/10 rounded-[4rem] p-8 md:p-16 relative overflow-hidden shadow-2xl flex flex-col md:flex-row gap-12">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-[#ccff00]/5 blur-[100px] pointer-events-none" />
                      
                      <div className="flex-1 space-y-10">
                        <div className="space-y-2">
                           <div className="flex items-center justify-between">
                              <h3 className="font-oswald italic font-black text-5xl uppercase tracking-ultra text-white">LOGO_ENGINE</h3>
                              <button onClick={() => setShowLogoMaker(false)} className="text-zinc-600 hover:text-white transition-colors"><X className="w-8 h-8" /></button>
                           </div>
                           <p className="font-oswald italic text-[11px] text-zinc-500 tracking-[0.4em] uppercase font-black">NEURAL_IDENTITY_SYNTHESIS</p>
                        </div>
                        
                        <div className="space-y-6">
                          <div className="space-y-3">
                             <label className="font-oswald italic text-[10px] text-[#ccff00] tracking-widest uppercase font-black px-1 flex items-center gap-2">
                               <ShieldCheck className="w-3 h-3" /> BRAND_IDENTIFIER
                             </label>
                             <input 
                                value={logoPrompt}
                                onChange={(e) => setLogoPrompt(e.target.value)}
                                placeholder="E.G. NEON_VAPOR"
                                className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-6 px-8 font-oswald italic font-black text-3xl text-white outline-none focus:border-[#ccff00] transition-all uppercase tracking-tighter"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleGenerateLogo()}
                             />
                          </div>

                          <div className="space-y-4">
                             <label className="font-oswald italic text-[10px] text-zinc-500 tracking-widest uppercase font-black px-1">SELECT_ARCHETYPE</label>
                             <div className="grid grid-cols-1 gap-3">
                                {LOGO_STYLES.map(style => (
                                  <button 
                                    key={style.id}
                                    onClick={() => setSelectedStyle(style)}
                                    className={`p-5 rounded-2xl border text-left flex items-center justify-between group transition-all ${selectedStyle.id === style.id ? 'bg-[#ccff00] border-[#ccff00] text-black shadow-xl shadow-[#ccff00]/10' : 'bg-white/5 border-white/10 text-zinc-500 hover:border-[#ccff00]/40'}`}
                                  >
                                    <div className="leading-tight">
                                       <p className="font-oswald italic font-black text-lg uppercase tracking-tighter">{style.label}</p>
                                       <p className={`font-oswald italic text-[9px] uppercase font-bold ${selectedStyle.id === style.id ? 'text-black/60' : 'text-zinc-600'}`}>{style.desc}</p>
                                    </div>
                                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${selectedStyle.id === style.id ? 'border-black/20 bg-black/5' : 'border-white/10 bg-white/5'}`}>
                                       {selectedStyle.id === style.id ? <Check className="w-4 h-4" /> : <Zap className="w-4 h-4 opacity-20" />}
                                    </div>
                                  </button>
                                ))}
                             </div>
                          </div>

                          <button 
                            onClick={handleGenerateLogo}
                            disabled={!logoPrompt || isGeneratingLogo}
                            className="w-full py-6 bg-white text-black font-oswald italic font-black text-2xl rounded-[2rem] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 uppercase hover:bg-[#ccff00]"
                          >
                            {isGeneratingLogo ? (
                              <><RotateCcw className="w-8 h-8 animate-spin" /> FORGING_MARK...</>
                            ) : (
                              <><PenTool className="w-8 h-8" /> COMMENCE_GEN</>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col gap-6">
                        <div className="flex-1 aspect-square glass rounded-[3rem] border-2 border-white/5 overflow-hidden relative shadow-inner bg-zinc-950 flex flex-col items-center justify-center p-12">
                           {previewLogo ? (
                             <motion.img 
                               initial={{ opacity: 0, scale: 0.8 }}
                               animate={{ opacity: 1, scale: 1 }}
                               src={previewLogo} 
                               className="w-full h-full object-contain rounded-3xl"
                             />
                           ) : isGeneratingLogo ? (
                             <div className="text-center space-y-4">
                               <div className="w-20 h-20 border-4 border-white/5 border-t-[#ccff00] rounded-full animate-spin mx-auto" />
                               <span className="font-oswald italic font-black text-[10px] text-zinc-500 uppercase tracking-mega">NEURAL_ARRAY_ACTIVE</span>
                             </div>
                           ) : (
                             <div className="text-center opacity-20 space-y-4">
                               <PenTool className="w-20 h-20 text-zinc-500 mx-auto" />
                               <p className="font-oswald italic font-black text-xs uppercase tracking-widest text-zinc-500">AWAITING_INPUT_PLATE</p>
                             </div>
                           )}
                           <div className="absolute inset-0 bg-[#ccff00]/2 mix-blend-overlay pointer-events-none" />
                        </div>

                        <div className="flex gap-4">
                           <button 
                            disabled={!previewLogo}
                            onClick={() => setPreviewLogo(null)}
                            className="flex-1 py-5 glass border border-white/10 text-zinc-500 font-oswald italic font-black rounded-2xl uppercase hover:text-white transition-all disabled:opacity-20"
                           >
                             DISCARD
                           </button>
                           <button 
                            disabled={!previewLogo}
                            onClick={commitLogoToStudio}
                            className="flex-[2] py-5 bg-[#ccff00] text-black font-oswald italic font-black text-lg rounded-2xl uppercase shadow-xl hover:scale-105 transition-all disabled:opacity-20"
                           >
                             COMMIT_TO_STUDIO
                           </button>
                        </div>
                      </div>
                   </div>
                 </div>
               )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AILab;
