
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from '../types';
import { GeminiService } from '../services/geminiService';
import { Zap, Target, Cpu, Layers } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: (onboardingData: Partial<UserProfile>) => void;
}

const KEYWORDS = ['Surgical', 'Legendary', 'Kinetic', 'Savage', 'Precision', 'Aggressive', 'Clean', 'Chaotic'];

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setStep] = useState(0);
  const [role, setRole] = useState<UserProfile['role']>('Pro Designer');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  
  const gemini = new GeminiService();

  const handleKeywordToggle = (word: string) => {
    if (keywords.includes(word)) {
      setKeywords(keywords.filter(k => k !== word));
    } else if (keywords.length < 3) {
      setKeywords([...keywords, word]);
    }
  };

  const handleGenerateBio = async () => {
    setIsSynthesizing(true);
    try {
      const result = await gemini.generateNeuralBio("Athlete", role, keywords);
      setBio(result);
      setStep(2);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleActivation = async () => {
    setIsActivating(true);
    setTimeout(() => {
      onComplete({
        role: role,
        leaguePreference: 'EA SPORTS MADDEN 26',
        bio: bio || 'Neural architecture finalized.',
        stats: { precision: 85, sync: 92, speed: 78 },
        ovr: 88,
      });
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-[#050505]/95 backdrop-blur-3xl z-[200] flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {isActivating ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="absolute inset-0 z-[210] flex flex-col items-center justify-center bg-black"
          >
             <div className="text-center space-y-4">
                <motion.div 
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-14 h-14 bg-[#ccff00] rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(204,255,0,0.4)] mx-auto mb-4"
                >
                  <Zap className="w-7 h-7 text-black fill-current" />
                </motion.div>
                <h2 className="font-oswald italic font-black text-3xl text-[#ccff00] uppercase tracking-ultra">SYNCING_ID</h2>
                <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden mx-auto">
                   <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.8 }} className="h-full bg-[#ccff00]" />
                </div>
             </div>
          </motion.div>
        ) : (
          <div className="max-w-[340px] w-full text-center relative z-10">
            <AnimatePresence mode="wait">
              {currentStep === 0 && (
                <motion.div key="role" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                  <header className="mb-6">
                    <h2 className="text-4xl font-oswald italic font-black text-white uppercase tracking-ultra leading-none">PATHWAY</h2>
                    <p className="text-zinc-600 font-oswald italic uppercase text-[9px] font-black tracking-widest mt-2 opacity-60">CHOOSE_OPERATIONAL_PERSONA</p>
                  </header>
                  <div className="grid grid-cols-1 gap-2">
                    {(['Athlete', 'Pro Designer', 'Scout'] as const).map(r => (
                      <button 
                        key={r} 
                        onClick={() => setRole(r)} 
                        className={`p-4 rounded-xl border-2 text-left flex items-center justify-between transition-all active:scale-[0.97] ${role === r ? 'bg-[#ccff00] border-[#ccff00] text-black shadow-lg shadow-[#ccff00]/10' : 'glass border-white/5 text-zinc-500 hover:border-white/10'}`}
                      >
                        <span className="font-oswald italic font-black text-xl uppercase tracking-tighter leading-none">{r}</span>
                        {r === 'Athlete' ? <Target className="w-4 h-4" /> : r === 'Pro Designer' ? <Zap className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setStep(1)} className="w-full py-4 bg-white text-black font-oswald italic font-black text-lg rounded-xl mt-6 uppercase active:scale-95 shadow-xl transition-all">CONTINUE</button>
                </motion.div>
              )}

              {currentStep === 1 && (
                <motion.div key="bio" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                  <header className="mb-6">
                    <h2 className="text-4xl font-oswald italic font-black text-[#ccff00] uppercase tracking-ultra leading-none">SYNC_BIO</h2>
                    <p className="text-zinc-600 font-oswald italic uppercase text-[9px] font-black tracking-widest mt-2 opacity-60">SELECT_3_KEY_TRAITS</p>
                  </header>
                  <div className="grid grid-cols-2 gap-2">
                    {KEYWORDS.map(word => (
                      <button 
                        key={word} 
                        onClick={() => handleKeywordToggle(word)} 
                        className={`py-3 rounded-lg border transition-all font-oswald italic text-[9px] tracking-widest uppercase font-black active:scale-95 ${keywords.includes(word) ? 'bg-[#ccff00] border-[#ccff00] text-black shadow-md shadow-[#ccff00]/10' : 'glass border-white/5 text-zinc-500'}`}
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                  <button 
                    disabled={keywords.length < 3 || isSynthesizing} 
                    onClick={handleGenerateBio} 
                    className="w-full py-4 bg-white text-black font-oswald italic font-black text-lg rounded-xl uppercase shadow-xl disabled:opacity-20 active:scale-95 transition-all mt-4"
                  >
                    {isSynthesizing ? 'SCANNING...' : 'FORGE_PROFILE'}
                  </button>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div key="final" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                  <header className="mb-4">
                    <h2 className="text-4xl font-oswald italic font-black text-white uppercase tracking-ultra leading-none">VERIFIED</h2>
                    <p className="text-[#ccff00] font-oswald italic uppercase text-[9px] font-black tracking-widest mt-2">INTEL_ACQUIRED</p>
                  </header>
                  <div className="glass rounded-[1.5rem] p-6 border border-[#ccff00]/20 text-left relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#ccff00]/5 blur-[40px]" />
                    <p className="font-inter italic text-zinc-300 text-sm leading-relaxed relative z-10">{bio}</p>
                  </div>
                  <button onClick={handleActivation} className="w-full py-4 bg-[#ccff00] text-black font-oswald italic font-black text-lg rounded-xl uppercase shadow-[0_0_20px_rgba(204,255,0,0.3)] active:scale-95 transition-all mt-4">INIT_LEGACY</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OnboardingFlow;
