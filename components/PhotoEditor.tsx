
import React from 'react';
import { Team } from '../types';
import { motion } from 'framer-motion';
// Fixed: Added ArrowRight to imports
import { Image as ImageIcon, ShieldAlert, Sparkles, Wand2, Hash, Layers, ArrowRight } from 'lucide-react';

interface PhotoEditorProps {
  image: string;
  teams: Team[];
  selectedTeam: Team | null;
  onTeamSelect: (team: Team) => void;
  number: string;
  onNumberChange: (num: string) => void;
  removeBackground: boolean;
  onToggleBackground: () => void;
  onSwap: () => void;
  isProcessing: boolean;
  customPrompt: string;
  onCustomPromptChange: (val: string) => void;
}

const PhotoEditor: React.FC<PhotoEditorProps> = ({
  image,
  teams,
  selectedTeam,
  onTeamSelect,
  number,
  onNumberChange,
  removeBackground,
  onToggleBackground,
  onSwap,
  isProcessing,
  customPrompt,
  onCustomPromptChange
}) => {
  return (
    <div className="w-full flex flex-col lg:flex-row gap-12 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-7xl mx-auto py-10 px-4 items-start">
      {/* Visual Feedback Column */}
      <div className="w-full lg:w-1/2 sticky top-24">
        <div className="relative aspect-[3/4] glass rounded-[4rem] overflow-hidden border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] group">
          <img src={image} className="w-full h-full object-cover grayscale opacity-60 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-700" alt="Athlete Plate" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent pointer-events-none" />
          
          <div className="absolute inset-0 z-10 pointer-events-none">
             <motion.div 
               animate={{ y: ['-100%', '600%'] }} 
               transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
               className="h-px w-full bg-[#ccff00] shadow-[0_0_20px_#ccff00]" 
             />
          </div>

          <div className="absolute bottom-10 left-10 space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
              <p className="font-oswald italic text-[10px] tracking-mega text-[#ccff00] uppercase font-black">IDENTITY_LOCKED</p>
            </div>
            <h3 className="font-oswald italic text-4xl font-black uppercase tracking-ultra text-white leading-none">MASTER_PLATE_v2</h3>
          </div>
          
          {selectedTeam && (
            <div className="absolute top-10 right-10 flex flex-col items-end gap-2">
               <div className="w-16 h-16 glass rounded-2xl p-3 border border-[#ccff00]/40 flex items-center justify-center backdrop-blur-3xl animate-in zoom-in-75 duration-300">
                  <img src={selectedTeam.logo} className="w-full h-full object-contain" alt="Team Logo" />
               </div>
               <span className="font-oswald italic font-black text-[10px] text-white bg-[#ccff00] text-black px-3 py-1 rounded-full uppercase">TARGET_KIT</span>
            </div>
          )}
        </div>
      </div>

      {/* Control Column */}
      <div className="w-full lg:w-1/2 space-y-12">
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#ccff00]" />
              <h4 className="font-oswald italic text-xs tracking-mega uppercase text-zinc-500 font-black">1. SELECT_KIT_ASSET</h4>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {teams.map(t => (
              <button 
                key={t.id} 
                onClick={() => onTeamSelect(t)} 
                className={`p-6 rounded-[2rem] border transition-all flex flex-col items-center justify-center gap-3 relative overflow-hidden group ${
                  selectedTeam?.id === t.id 
                  ? 'bg-white border-white text-black shadow-2xl' 
                  : 'glass border-white/5 text-zinc-500 hover:border-white/20'
                }`}
              >
                <img 
                  src={t.logo} 
                  className={`h-12 w-12 object-contain transition-all ${selectedTeam?.id === t.id ? '' : 'grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100'}`} 
                  alt={t.name} 
                />
                <span className="font-oswald italic text-[9px] font-black uppercase tracking-tighter text-center leading-none">
                  {t.name.toUpperCase()}
                </span>
                {selectedTeam?.id === t.id && (
                  <motion.div layoutId="selection-ring" className="absolute inset-0 border-2 border-[#ccff00] rounded-[2rem]" />
                )}
              </button>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-[#ccff00]" />
                <h4 className="font-oswald italic text-xs tracking-mega uppercase text-zinc-500 font-black">2. KIT_NUMBER</h4>
              </div>
              <input 
                type="number" 
                value={number} 
                onChange={e => onNumberChange(e.target.value.slice(0, 2))} 
                className="w-full h-20 bg-white/5 border border-white/10 rounded-3xl px-8 font-oswald italic font-black text-5xl text-white outline-none focus:border-[#ccff00] transition-all text-center" 
                placeholder="23"
              />
           </div>
           <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-[#ccff00]" />
                <h4 className="font-oswald italic text-xs tracking-mega uppercase text-zinc-500 font-black">3. ENVIRONMENT</h4>
              </div>
              <button 
                onClick={onToggleBackground}
                className={`w-full h-20 rounded-3xl font-oswald italic tracking-widest text-[11px] uppercase border transition-all flex flex-col items-center justify-center font-black gap-1 ${
                  removeBackground 
                  ? 'bg-[#ccff00] text-black border-[#ccff00]' 
                  : 'glass text-zinc-500 border-white/10'
                }`}
              >
                <span className="text-xl leading-none">{removeBackground ? 'STUDIO_SYNTH' : 'PRESERVE_ENV'}</span>
                <span className="opacity-60 text-[8px]">TOGGLE_GROUNDING</span>
              </button>
           </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#ccff00]" />
            <h4 className="font-oswald italic text-xs tracking-mega uppercase text-zinc-500 font-black">4. NEURAL_DIRECTIVE</h4>
          </div>
          <textarea 
            value={customPrompt}
            onChange={(e) => onCustomPromptChange(e.target.value)}
            placeholder="ADD_DETAIL (e.g. 'Add dynamic motion trails', 'Metallic visor', 'Championship chain')"
            className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 font-inter italic text-sm text-white outline-none focus:border-[#ccff00] transition-all h-32 resize-none"
          />
        </section>

        <div className="pt-8">
          <button 
            onClick={onSwap} 
            disabled={!selectedTeam || isProcessing} 
            className="group w-full h-24 bg-[#ccff00] text-black font-oswald italic font-black text-3xl tracking-ultra rounded-[2rem] hover:bg-white transition-all disabled:opacity-30 disabled:grayscale active:scale-95 shadow-[0_20px_50px_rgba(204,255,0,0.3)] uppercase flex items-center justify-center gap-4"
          >
            {isProcessing ? 'SYNTHESIZING...' : <>EXECUTE_REMIX <ArrowRight className="w-8 h-8 group-hover:translate-x-3 transition-transform" /></>}
          </button>
          <p className="text-center font-oswald italic text-[10px] text-zinc-600 uppercase tracking-mega mt-6 font-black">MASTER_ID_LOCK_PROTOCOL_v3.2_ACTIVE</p>
        </div>
      </div>
    </div>
  );
};

export default PhotoEditor;
