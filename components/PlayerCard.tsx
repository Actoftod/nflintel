
import React, { useState, useRef } from 'react';
import { GeminiService } from '../services/geminiService';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { Zap, Share2, Activity, Edit3, Save, RotateCcw, Cpu, ExternalLink, Download, Trophy, ShieldAlert, ZapOff, Wifi } from 'lucide-react';

interface PlayerData {
  name: string;
  team: string;
  number: string;
  background: string;
  highlights: string[];
  stats: Record<string, number>;
}

interface PlayerCardProps extends PlayerData {
  image: string;
  onClose: () => void;
  onViewProfile?: () => void;
  onUpdate?: (data: PlayerData) => void;
}

const ElectricalSurge = () => (
  <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden rounded-[2.5rem] md:rounded-[3.5rem]">
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ 
          opacity: [0, 0.8, 0],
          scaleX: [0, 1.5, 0],
          x: ['-100%', '200%'],
          y: [`${10 + i * 15}%`, `${20 + i * 15}%`]
        }}
        transition={{
          duration: 0.4 + Math.random() * 0.4,
          repeat: Infinity,
          repeatDelay: Math.random() * 2,
          ease: "easeInOut"
        }}
        className="absolute w-full h-[1px] bg-[#ccff00] blur-[1px] shadow-[0_0_15px_#ccff00] -rotate-3"
      />
    ))}
    <motion.div 
      animate={{ opacity: [0, 0.15, 0.05, 0.2, 0] }}
      transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 1 }}
      className="absolute inset-0 bg-[#ccff00] mix-blend-overlay"
    />
  </div>
);

const PlayerCard: React.FC<PlayerCardProps> = ({ 
  image, name, team, number, background, highlights, stats, 
  onClose, onViewProfile, onUpdate 
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  
  const [formData, setFormData] = useState<PlayerData>({
    name, team, number, background, highlights, stats
  });

  const gemini = useRef(new GeminiService());

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  
  const rotateX = useSpring(useTransform(y, [0, 1], [15, -15]), { stiffness: 120, damping: 25 });
  const rotateY = useSpring(useTransform(x, [0, 1], [-15, 15]), { stiffness: 120, damping: 25 });

  const overall = Math.round(
    (Object.values(formData.stats) as number[]).reduce((a: number, b: number) => a + b, 0) / (Object.values(formData.stats).length || 1)
  );

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isFlipped) return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    x.set(0.5);
    y.set(0.5);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = image;
    link.download = `jerseyswap_pro_${formData.name.toLowerCase().replace(/\s+/g, '_')}_card.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSynthesizeIntel = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSynthesizing(true);
    try {
      const data = await gemini.current.generatePlayerStats(formData.team);
      setFormData(prev => ({ ...prev, ...data }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleSaveChanges = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    onUpdate?.(formData);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
      title: 'JERSEYSWAP.IO PRO CARD',
      text: `Check out the elite ${formData.team} card for ${formData.name}! Generated via @JerseySwap`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("VAULT_LINK_COPIED: Link committed to clipboard.");
      } catch (err) {
        console.error('Failed to copy');
      }
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "https://storage.googleapis.com/jerseyswap/uploads/placeholder_card.png";
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/98 backdrop-blur-3xl animate-in fade-in duration-700 overflow-y-auto">
      <div 
        className="relative w-full max-w-[480px] aspect-[2/3] perspective-2000 group/container my-auto"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div 
          onClick={() => !isEditing && setIsFlipped(!isFlipped)}
          animate={{ 
            rotateY: isFlipped ? 180 : 0,
            scale: isFlipped ? 1.05 : 1,
            z: isFlipped ? 40 : 0
          }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20, 
            mass: 0.8 
          }}
          style={{ 
            rotateX: isFlipped ? 0 : rotateX,
            rotateY: isFlipped ? 180 : rotateY,
            transformStyle: "preserve-3d"
          }}
          className="relative w-full h-full cursor-pointer shadow-2xl"
        >
          {/* Card Face: Front */}
          <div className="absolute inset-0 backface-hidden glass rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(204,255,0,0.05)] bg-black">
            <div className="relative h-full w-full">
              <img src={image} className="w-full h-full object-cover" alt={name} onError={handleImageError} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
              
              <div className="absolute top-8 md:top-12 left-8 md:left-12 right-8 md:right-12 flex justify-between items-start">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse shadow-[0_0_10px_#ccff00]" />
                    <span className="font-oswald italic font-black text-[#ccff00] text-[10px] tracking-ultra uppercase">PRO_ID_VERIFIED</span>
                  </div>
                  <div className="px-3 py-1 glass rounded-full border border-white/5 bg-black/40 backdrop-blur-md">
                    <span className="font-oswald italic font-bold text-[9px] text-white tracking-mega uppercase">NEURAL FORGE // SERIES_02</span>
                  </div>
                </div>
                <div className="w-16 md:w-20 h-22 md:h-28 bg-[#ccff00] text-black rounded-xl md:rounded-2xl flex flex-col items-center justify-center rotate-6 shadow-[0_0_30px_rgba(204,255,0,0.3)] border-4 border-black/10">
                   <span className="font-oswald italic font-black text-5xl md:text-6xl leading-none">{overall}</span>
                   <span className="font-oswald italic font-bold text-[9px] md:text-[10px] uppercase tracking-tighter opacity-60">OVR</span>
                </div>
              </div>

              <div className="absolute bottom-10 md:bottom-16 left-8 md:left-12 right-8 md:right-12">
                <div className="flex flex-col gap-4">
                  <h2 className="font-oswald italic font-black text-5xl md:text-7xl leading-[0.8] uppercase tracking-ultra drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] text-left text-white">
                    {formData.name.split(' ')[0]} <br />
                    <span className="text-[#ccff00]">{formData.name.split(' ')[1] || ''}</span>
                  </h2>
                  <div className="flex items-center gap-3">
                    <div className="px-5 py-2.5 bg-white text-black rounded-lg font-oswald italic font-black text-[14px] uppercase tracking-ultra shadow-xl">
                      {formData.team}
                    </div>
                    <div className="px-5 py-2.5 glass rounded-lg font-oswald italic font-black text-[14px] text-white uppercase tracking-ultra border border-white/10 backdrop-blur-xl">
                      #{formData.number}
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-8 right-8 flex gap-3 opacity-0 group-hover/container:opacity-100 transition-opacity">
                <button onClick={handleShare} className="w-12 h-12 glass rounded-full flex items-center justify-center text-white hover:bg-[#ccff00] hover:text-black transition-all shadow-2xl backdrop-blur-xl">
                  <Share2 className="w-5 h-5" />
                </button>
                <button onClick={handleDownload} className="w-12 h-12 glass rounded-full flex items-center justify-center text-white hover:bg-[#ccff00] hover:text-black transition-all shadow-2xl backdrop-blur-xl">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Card Face: Back */}
          <div className="absolute inset-0 backface-hidden glass rounded-[2.5rem] md:rounded-[3.5rem] border border-white/10 rotate-y-180 bg-black flex flex-col p-8 md:p-10 overflow-hidden shadow-2xl relative">
            {/* Prominent Electrical Surge Animation */}
            <ElectricalSurge />
            
            <div className="relative flex items-start justify-between mb-8 z-10">
              <div className="space-y-1 text-left">
                <div className="flex items-center gap-2">
                  <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 0.15 }}>
                    <Wifi className="w-4 h-4 text-[#ccff00]" />
                  </motion.div>
                  <p className="font-oswald italic text-[10px] tracking-mega text-[#ccff00] uppercase font-black">NEURAL_LIVE_FEED</p>
                </div>
                <h3 className="font-oswald italic font-black text-4xl md:text-5xl uppercase tracking-ultra text-white leading-none">SCOUT_REPORT</h3>
              </div>
              <div className="w-14 h-14 bg-zinc-900 border border-white/10 rounded-xl flex flex-col items-center justify-center shrink-0 relative overflow-hidden">
                 <motion.div 
                   animate={{ y: [0, -40, 0] }}
                   transition={{ duration: 4, repeat: Infinity }}
                   className="absolute inset-0 bg-[#ccff00]/10 blur-xl"
                 />
                 <span className="font-oswald italic font-black text-2xl text-[#ccff00] leading-none relative z-10">{overall}</span>
                 <span className="font-oswald italic font-bold text-[8px] text-zinc-600 uppercase relative z-10">AVG</span>
              </div>
            </div>

            <div className="relative flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-10 z-10">
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 p-6 glass rounded-[2rem] border border-[#ccff00]/40 bg-zinc-950/80" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-oswald italic text-[10px] text-[#ccff00] uppercase font-black">IDENTITY_PARAMS</span>
                      <button onClick={handleSynthesizeIntel} disabled={isSynthesizing} className="text-[10px] font-oswald italic font-black text-zinc-500 hover:text-white flex items-center gap-1.5 transition-colors">
                        {isSynthesizing ? <RotateCcw className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />} RE_SYNTH
                      </button>
                    </div>
                    <input 
                      type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value.toUpperCase() }))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-4 font-oswald italic font-black text-3xl text-white outline-none focus:border-[#ccff00] uppercase"
                      placeholder="NAME"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="font-oswald italic text-[8px] text-zinc-600 uppercase font-bold px-1">TEAM_LOC</span>
                        <input type="text" value={formData.team} onChange={e => setFormData(p => ({ ...p, team: e.target.value.toUpperCase() }))} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-[12px] uppercase font-bold outline-none focus:border-[#ccff00]" />
                      </div>
                      <div className="space-y-1">
                        <span className="font-oswald italic text-[8px] text-zinc-600 uppercase font-bold px-1">UNI_NO</span>
                        <input type="text" value={formData.number} onChange={e => setFormData(p => ({ ...p, number: e.target.value.slice(0,2) }))} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-[#ccff00] text-2xl font-black text-center outline-none focus:border-[#ccff00]" />
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                    {Object.entries(formData.stats).map(([label, val]) => (
                      <div key={label} className="space-y-2">
                        <div className="flex justify-between items-end">
                          <span className="font-oswald italic font-bold text-[10px] text-zinc-500 uppercase tracking-widest">{label}</span>
                          <span className="font-oswald italic font-black text-2xl text-white leading-none">{val}</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} className="h-full bg-[#ccff00] shadow-[0_0_8px_#ccff00]" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </AnimatePresence>

              <div className={`space-y-4 ${isSynthesizing ? 'opacity-20 blur-sm' : ''}`}>
                <div className="flex items-center gap-3">
                  <span className="font-oswald italic font-black text-[10px] text-zinc-600 uppercase tracking-widest">LEGACY_NARRATIVE</span>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                {isEditing ? (
                  <textarea value={formData.background} onChange={e => setFormData(p => ({ ...p, background: e.target.value }))} className="w-full bg-zinc-950/50 border border-white/10 rounded-2xl p-5 text-zinc-400 text-sm h-32 resize-none outline-none focus:border-[#ccff00] font-inter italic" />
                ) : (
                  <p className="font-inter italic text-zinc-400 leading-relaxed text-[15px] text-left border-l-2 border-[#ccff00] pl-6 bg-white/2 py-4 rounded-r-2xl">{formData.background}</p>
                )}
              </div>

              <div className={`space-y-4 ${isSynthesizing ? 'opacity-20 blur-sm' : ''} pb-10`}>
                <div className="flex items-center gap-3">
                  <span className="font-oswald italic font-black text-[10px] text-[#ccff00] uppercase tracking-widest">NEURAL_HIGHLIGHTS</span>
                  <div className="h-px flex-1 bg-[#ccff00]/10" />
                </div>
                <div className="space-y-3">
                  {formData.highlights.map((h, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ x: 5 }}
                      className="flex gap-4 p-5 glass rounded-2xl border border-white/5 hover:border-[#ccff00]/40 transition-all text-left bg-zinc-950/40 group/item"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#ccff00]/10 border border-[#ccff00]/20 flex items-center justify-center font-oswald text-[10px] text-[#ccff00] shrink-0 font-black group-hover/item:bg-[#ccff00] group-hover/item:text-black transition-colors">{i + 1}</div>
                      <p className="font-oswald italic text-[13px] text-zinc-300 uppercase leading-tight self-center tracking-tight">{h}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative mt-8 grid grid-cols-2 md:grid-cols-3 gap-3 z-10 pt-4 border-t border-white/5 bg-black/40 backdrop-blur-md">
              <button onClick={e => { e.stopPropagation(); onViewProfile?.(); }} className="py-4 glass border border-white/5 text-white font-oswald italic font-black text-[14px] rounded-xl flex items-center justify-center gap-2 hover:bg-white/5 transition-all">
                <ExternalLink className="w-4 h-4" /> HUB
              </button>
              {/* FIX: Replaced undefined onEdit with setIsEditing(true) toggle */}
              <button onClick={e => { e.stopPropagation(); isEditing ? handleSaveChanges(e) : setIsEditing(true); }} className={`py-4 font-oswald font-black text-[14px] rounded-xl flex items-center justify-center gap-2 transition-all ${isEditing ? 'bg-[#ccff00] text-black shadow-lg shadow-[#ccff00]/20' : 'glass border border-[#ccff00]/20 text-[#ccff00] hover:bg-[#ccff00]/5'}`}>
                {isEditing ? <><Save className="w-4 h-4" /> COMMIT</> : <><Edit3 className="w-4 h-4" /> EDIT</>}
              </button>
              <button onClick={e => { e.stopPropagation(); onClose(); }} className="col-span-2 md:col-span-1 py-4 bg-white text-black font-oswald font-black text-[14px] rounded-xl uppercase hover:bg-zinc-200 transition-all">EXIT_CARD</button>
            </div>
          </div>
        </motion.div>

        <div className="absolute -bottom-16 inset-x-0 text-center animate-pulse pointer-events-none">
          <span className="font-oswald italic text-[10px] tracking-[0.8em] text-zinc-500 uppercase font-black">
            {isFlipped ? 'NEURAL_DATA_LOCK_v3.2' : 'TAP_TO_ENGAGE_NEURAL_BACK'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
