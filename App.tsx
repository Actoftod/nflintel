
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { AppStep, SwapState, UserProfile, SavedSwap, SocialSwap, Comment } from './types';
import { TEAMS, LEAGUES } from './constants';
import { GeminiService } from './services/geminiService';
import PlayerCard from './components/PlayerCard';
import PhotoEditor from './components/PhotoEditor';
import AILab from './components/AILab';
import OnboardingFlow from './components/OnboardingFlow';
import ProfileView from './components/ProfileView';
import { SocialFeed } from './components/SocialFeed';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Cpu, Lock, ChevronRight, Download, Scan, LogIn, UserPlus, Mail, MessageSquare, LogOut, LayoutGrid, ShieldCheck, BookmarkCheck, Sparkles, Wand2, RotateCcw, AlertCircle, CheckCircle2, Trophy, Disc, Target, Activity, Dribbble, Sword, Globe, ArrowRight, Play } from 'lucide-react';

const STORAGE_ACCOUNTS_KEY = 'js_pro_accounts_v1';
const SESSION_KEY = 'js_pro_session_v1';
const SESSION_TIMESTAMP_KEY = 'js_pro_session_ts_v1';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; 

const ADMIN_EMAIL = 'toddybertoch@gmail.com';
const ADMIN_PW = 'Godknows57!!';

const INITIAL_PROFILES: UserProfile[] = [
  { id: 'a1', name: 'KYLE SMITH', email: 'kyle@nike.com', handle: '@KYLE_DESIGN', role: 'Pro Designer', leaguePreference: 'NFL', bio: 'Visualizing the future of sports.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200', stats: { precision: 95, sync: 88, speed: 92 }, ovr: 94, vault: [], followingIds: [] },
  { id: 'a2', name: 'JORDAN VILLA', email: 'jordan@ea.com', handle: '@JV_KITS', role: 'Pro Designer', leaguePreference: 'NBA', bio: 'EA Sports kit architect.', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200', stats: { precision: 90, sync: 94, speed: 85 }, ovr: 91, vault: [], followingIds: [] }
];

const INITIAL_SOCIAL_SWAPS: SocialSwap[] = [
  {
    id: 's1', userId: 'a1', userName: 'KYLE S.', userHandle: '@KYLE_DESIGN', userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200',
    image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=600',
    team: 'SF 49ERS', sport: 'NFL', likes: 1240, rating: 4.8, ratingCount: 45, timestamp: new Date().toISOString(),
    comments: [], isSaved: false, hasLiked: false
  }
];

const App: React.FC = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>(INITIAL_PROFILES);
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);
  const [step, setStep] = useState<AppStep>('landing');
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'select' | '2fa'>('select');
  const [showAILab, setShowAILab] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  const [socialSwaps, setSocialSwaps] = useState<SocialSwap[]>(INITIAL_SOCIAL_SWAPS);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authHandle, setAuthHandle] = useState('');
  const [authName, setAuthName] = useState('');
  const [twoFACode, setTwoFACode] = useState('');

  const [state, setState] = useState<SwapState>({ 
    sportId: null, image: null, league: null, team: null, number: '23', removeBackground: false, customPrompt: ''
  });
  
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [playerData, setPlayerData] = useState<any>(null);
  const [showPlayerCard, setShowPlayerCard] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isNeuralForging, setIsNeuralForging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const geminiService = useRef(new GeminiService());

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    const savedProfiles = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
    let currentProfiles = INITIAL_PROFILES;
    if (savedProfiles) {
      currentProfiles = JSON.parse(savedProfiles);
      setProfiles(currentProfiles);
    }
    
    const sessionId = localStorage.getItem(SESSION_KEY);
    const sessionTs = localStorage.getItem(SESSION_TIMESTAMP_KEY);
    
    if (sessionId && sessionTs) {
      const now = Date.now();
      const lastActive = parseInt(sessionTs);
      if (now - lastActive < SESSION_TIMEOUT_MS) {
        const found = currentProfiles.find((p: UserProfile) => p.id === sessionId);
        if (found) {
          setActiveProfile(found);
          setStep('social-feed');
        }
      }
    }
  }, []);

  const syncProfiles = (updated: UserProfile[]) => {
    setProfiles(updated);
    localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(updated));
    if (activeProfile) {
      const refreshed = updated.find(p => p.id === activeProfile.id);
      if (refreshed) setActiveProfile(refreshed);
    }
  };

  const loginProfile = (p: UserProfile) => {
    setIsAuthLoading(true);
    setTimeout(() => {
      setActiveProfile(p);
      localStorage.setItem(SESSION_KEY, p.id);
      localStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString());
      setStep('social-feed');
      setIsAuthLoading(false);
      showToast('success', `NEURAL_ACCESS_GRANTED`);
    }, 800);
  };

  const handleSignIn = () => {
    setIsAuthLoading(true);
    setTimeout(() => {
      if (authEmail === ADMIN_EMAIL && authPassword === ADMIN_PW) {
        let adminProfile = profiles.find(p => p.email === ADMIN_EMAIL);
        if (!adminProfile) {
          adminProfile = { id: 'admin_root', name: 'TODD BERTOCH', email: ADMIN_EMAIL, handle: '@ADMIN', role: 'Scout', leaguePreference: 'Elite', bio: 'System Admin.', avatar: null, stats: { precision: 99, sync: 99, speed: 99 }, ovr: 99, vault: [], followingIds: [] };
          syncProfiles([...profiles, adminProfile]);
        }
        loginProfile(adminProfile);
        return;
      }
      const found = profiles.find(p => p.email === authEmail && p.password === authPassword);
      if (found) loginProfile(found);
      else {
        setIsAuthLoading(false);
        showToast('error', 'AUTH_FAILURE');
      }
    }, 1000);
  };

  const reset = useCallback(() => {
    setStep('sport-select');
    setShowAILab(false);
    setViewingProfile(null);
    setState({ sportId: null, image: null, league: null, team: null, number: '23', removeBackground: false, customPrompt: '' });
    setResultImage(null);
    setPlayerData(null);
    setShowPlayerCard(false);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        setState(prev => ({ ...prev, image: reader.result as string }));
        setStep('customize');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSwap = async () => {
    if (!state.image || !state.team) return;
    setIsLoading(true);
    setStep('processing');
    try {
      const [result, stats] = await Promise.all([
        geminiService.current.performJerseySwap(state.image, state.team.name, state.number, state.removeBackground, state.customPrompt),
        geminiService.current.generatePlayerStats(state.team.name)
      ]);
      setResultImage(result);
      setPlayerData(stats);
      setStep('result');
      showToast('success', 'NEURAL_FORGE_COMPLETE');
    } catch (error) {
      setStep('customize');
      showToast('error', 'SYNTHESIS_FAILURE');
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col items-center safe-top safe-bottom selection:bg-[#ccff00] selection:text-black">
      <AnimatePresence>
        {notification && (
          <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="fixed top-0 z-[500] pointer-events-none w-full flex justify-center">
            <div className={`px-6 py-3 rounded-full shadow-2xl backdrop-blur-xl border flex items-center gap-3 ${notification.type === 'success' ? 'bg-[#ccff00]/20 border-[#ccff00] text-[#ccff00]' : 'bg-red-500/20 border-red-500 text-red-500'}`}>
              <CheckCircle2 className="w-4 h-4" />
              <span className="font-oswald italic font-black text-xs tracking-widest uppercase">{notification.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {step === 'landing' && (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-6 text-center">
            <div className="absolute inset-0 overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
               <motion.div initial={{ scale: 1.2 }} animate={{ scale: 1 }} transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }} className="w-full h-full">
                  <video autoPlay muted loop playsInline className="w-full h-full object-cover grayscale opacity-40">
                    <source src="https://v.ftcdn.net/08/94/13/46/700_F_894134629_M3L8mH0BwRz7OqVnU9mZ6E7X6N8y2N4n_ST.mp4" type="video/mp4" />
                  </video>
               </motion.div>
            </div>
            
            <div className="relative z-20 space-y-12 max-w-4xl">
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                <Zap className="w-16 h-16 text-[#ccff00] mx-auto mb-6 fill-current drop-shadow-[0_0_20px_rgba(204,255,0,0.5)]" />
                <h1 className="font-oswald italic font-black text-6xl md:text-9xl uppercase tracking-ultra leading-none text-white">
                  JERSEY<span className="text-[#ccff00]">SWAP</span><span className="text-[0.2em] align-top">.IO</span>
                </h1>
                <p className="font-oswald italic text-zinc-500 text-xs md:text-lg tracking-[0.6em] uppercase mt-4 font-black">NIKE PERFORMANCE x APPLE PRECISION</p>
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-col md:flex-row gap-6 justify-center">
                <button 
                  onClick={() => setStep('auth')} 
                  className="group px-12 py-6 bg-[#ccff00] text-black font-oswald italic font-black text-2xl rounded-2xl flex items-center justify-center gap-4 hover:bg-white transition-all shadow-2xl active:scale-95"
                >
                  ENTER_STUDIO <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </button>
                <div className="px-12 py-6 glass rounded-2xl border border-white/10 flex items-center justify-center gap-4">
                   <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                   <span className="font-oswald italic font-black text-sm tracking-widest text-white uppercase">NEURAL_ARRAY_ONLINE</span>
                </div>
              </motion.div>
            </div>
            
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
               <span className="font-oswald italic text-[10px] tracking-mega text-zinc-600 uppercase font-black">ULTRA_HD_SYNTHESIS // V3.2.1</span>
               <div className="w-px h-12 bg-gradient-to-b from-[#ccff00] to-transparent" />
            </motion.div>
          </motion.div>
        )}

        {(step === 'auth' || !activeProfile) && step !== 'onboarding' && step !== 'landing' && (
          <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen w-full flex items-center justify-center p-4 bg-black">
            <div className="max-w-md w-full glass p-10 rounded-[3.5rem] border border-white/10 z-10 shadow-2xl text-center">
              <Zap className="w-12 h-12 text-[#ccff00] mx-auto mb-8 fill-current" />
              <h1 className="font-oswald italic font-black text-4xl uppercase tracking-ultra text-white mb-8">AUTHENTICATE_ID</h1>
              
              <AnimatePresence mode="wait">
                {authMode === 'select' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    {profiles.map(p => (
                      <button key={p.id} onClick={() => loginProfile(p)} className="w-full p-4 glass rounded-2xl border border-white/5 flex items-center gap-5 hover:border-[#ccff00]/30 transition-all">
                        <img src={p.avatar || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200'} className="w-12 h-12 rounded-xl object-cover" />
                        <div className="flex-1 text-left">
                          <p className="font-oswald italic font-black text-white uppercase text-lg leading-none">{p.name}</p>
                          <p className="font-oswald italic text-[10px] text-[#ccff00] tracking-widest uppercase mt-1">{p.handle}</p>
                        </div>
                      </button>
                    ))}
                    <div className="grid grid-cols-2 gap-4 pt-6">
                      <button onClick={() => setAuthMode('signin')} className="py-5 glass rounded-2xl font-oswald italic font-black text-[11px] uppercase text-white">SIGN_IN</button>
                      <button onClick={() => setAuthMode('signup')} className="py-5 bg-[#ccff00] rounded-2xl font-oswald italic font-black text-[11px] uppercase text-black">CREATE_ID</button>
                    </div>
                  </motion.div>
                )}

                {authMode === 'signin' && (
                   <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                     <div className="space-y-4 text-left">
                       <label className="font-oswald italic text-[9px] text-zinc-500 tracking-mega uppercase font-black px-1">NEURAL_EMAIL</label>
                       <input placeholder="EMAIL@DESIGN.COM" value={authEmail} onChange={e => setAuthEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 font-oswald italic text-white outline-none focus:border-[#ccff00]" />
                       <label className="font-oswald italic text-[9px] text-zinc-500 tracking-mega uppercase font-black px-1">SECURITY_KEY</label>
                       <input type="password" placeholder="••••••••" value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 font-oswald italic text-white outline-none focus:border-[#ccff00]" />
                     </div>
                     <button onClick={handleSignIn} disabled={isAuthLoading} className="w-full py-5 bg-[#ccff00] text-black font-oswald italic font-black text-xl rounded-2xl shadow-xl active:scale-95">
                       {isAuthLoading ? <RotateCcw className="w-6 h-6 animate-spin mx-auto" /> : 'AUTHORIZE_SESSION'}
                     </button>
                     <button onClick={() => setAuthMode('select')} className="w-full py-2 text-zinc-600 font-oswald italic text-[10px] uppercase">BACK_TO_ARRAY</button>
                   </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {activeProfile && step !== 'landing' && (
          <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full flex flex-col items-center">
            <header className="fixed top-0 inset-x-0 z-[100] bg-black/60 backdrop-blur-2xl border-b border-white/5 px-6 h-16 flex items-center justify-between">
              <div onClick={reset} className="flex items-center gap-3 cursor-pointer group">
                <Zap className="w-6 h-6 text-[#ccff00] fill-current group-hover:scale-125 transition-transform" />
                <span className="font-oswald italic font-black text-lg tracking-ultra uppercase text-white">JERSEY<span className="text-[#ccff00]">SWAP</span></span>
              </div>
              <div className="flex gap-1 md:gap-3 bg-white/5 p-1 rounded-2xl border border-white/5">
                {[
                  { id: 'social-feed', icon: Globe },
                  { id: 'sport-select', icon: Zap },
                  { id: 'profile', icon: LayoutGrid }
                ].map(item => (
                  <button 
                    key={item.id}
                    onClick={() => { if (item.id === 'sport-select') reset(); else setStep(item.id as any); setShowAILab(false); }}
                    className={`p-3 rounded-xl transition-all ${step === item.id ? 'bg-[#ccff00] text-black shadow-lg shadow-[#ccff00]/20' : 'text-zinc-500 hover:text-white'}`}
                  >
                    <item.icon className="w-5 h-5" />
                  </button>
                ))}
                <div className="w-px h-8 bg-white/10 my-auto mx-1" />
                <button onClick={() => setShowAILab(!showAILab)} className={`p-3 rounded-xl transition-all ${showAILab ? 'bg-[#ccff00] text-black' : 'text-zinc-500 hover:text-white'}`}><Cpu className="w-5 h-5" /></button>
              </div>
            </header>

            <main className="flex-1 w-full pt-24 pb-32 relative z-10 px-4 max-w-7xl">
              <AnimatePresence mode="wait">
                {step === 'processing' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center">
                    <div className="absolute inset-0 bg-video-wrap">
                      <video autoPlay muted loop playsInline className="w-full h-full object-cover opacity-20 grayscale scale-110">
                        <source src="https://storage.googleapis.com/jerseyswap/uploads/dark_clouds_with_lightning.mp4" type="video/mp4" />
                      </video>
                    </div>
                    <div className="relative z-10 flex flex-col items-center gap-8">
                       <motion.div animate={{ scale: [1, 1.2, 1], rotate: 360 }} transition={{ repeat: Infinity, duration: 4 }} className="w-40 h-40 border-4 border-[#ccff00]/20 border-t-[#ccff00] rounded-full flex items-center justify-center">
                          <Zap className="w-16 h-16 text-[#ccff00] fill-current animate-pulse" />
                       </motion.div>
                       <div className="space-y-2 text-center">
                          <h2 className="font-oswald italic font-black text-5xl md:text-7xl text-white uppercase tracking-ultra">NEURAL_FORGE</h2>
                          <p className="font-oswald italic text-xs md:text-xl text-[#ccff00] tracking-mega uppercase opacity-60">SYNTHESIZING_IDENTITY_V3.2</p>
                       </div>
                    </div>
                  </motion.div>
                )}

                {step === 'social-feed' && <SocialFeed user={activeProfile} swaps={socialSwaps} onLike={() => {}} onSave={() => {}} onComment={() => {}} onRate={() => {}} onFollow={() => {}} onViewProfile={() => {}} />}

                {step === 'sport-select' && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 py-10">
                     <div className="text-center space-y-2">
                        <h2 className="font-oswald italic font-black text-5xl md:text-8xl uppercase tracking-ultra text-white">CHOOSE_PATH</h2>
                        <p className="font-oswald italic text-[10px] tracking-mega text-[#ccff00] uppercase font-black opacity-60">SELECT_ATHLETE_DISCIPLINE</p>
                     </div>
                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {[
                          { id: 'football', name: 'GRIDIRON', icon: Trophy, color: '#ccff00' },
                          { id: 'basketball', name: 'HOOPS', icon: Target, color: '#17408B' },
                          { id: 'baseball', name: 'DIAMOND', icon: Disc, color: '#E31937' },
                          { id: 'soccer', name: 'PITCH', icon: Activity, color: '#ffffff' },
                          { id: 'hockey', name: 'ICE', icon: Disc, color: '#0061AC' }
                        ].map((s) => (
                          <button key={s.id} onClick={() => { setState(p => ({ ...p, sportId: s.id })); setStep('league-select'); }} className="group aspect-square glass rounded-[3rem] border border-white/5 p-8 flex flex-col items-center justify-center gap-6 hover:border-[#ccff00]/40 transition-all hover:-translate-y-2 shadow-2xl relative overflow-hidden">
                             <div className="absolute inset-0 bg-gradient-to-b from-[#ccff00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                             <s.icon className="w-16 h-16 text-zinc-700 group-hover:text-[#ccff00] transition-all" />
                             <h3 className="font-oswald italic font-black text-xl uppercase text-white group-hover:scale-110 transition-transform tracking-ultra">{s.name}</h3>
                          </button>
                        ))}
                     </div>
                  </motion.div>
                )}

                {step === 'league-select' && (
                  <div className="flex flex-col items-center py-10 space-y-12">
                    <div className="text-center space-y-2">
                      <h2 className="font-oswald italic font-black text-4xl md:text-7xl uppercase text-white">SELECT_HUB</h2>
                      <p className="font-oswald italic text-[10px] tracking-mega text-[#ccff00] uppercase font-black opacity-60">LEAGUE_SPECIFIC_GROUNDING</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
                      {LEAGUES.map(l => (
                        <button key={l.id} onClick={() => { setState(p => ({ ...p, league: l })); setStep('upload'); }} className="h-32 glass rounded-[2.5rem] border border-white/5 flex items-center p-8 gap-8 group hover:border-[#ccff00]/30 transition-all relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-[#ccff00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="w-20 h-20 glass rounded-2xl p-4 shrink-0 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                             <img src={l.logo} className="h-full w-full object-contain grayscale group-hover:grayscale-0 transition-all" />
                          </div>
                          <div className="text-left">
                            <span className="font-oswald italic font-black text-2xl uppercase text-white group-hover:text-[#ccff00] leading-none block">{l.name}</span>
                            <p className="font-oswald italic text-[9px] text-zinc-500 uppercase tracking-widest mt-2">{l.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 'upload' && (
                   <div className="flex flex-col items-center py-10 space-y-12">
                     <div className="text-center space-y-2">
                        <h2 className="font-oswald italic font-black text-4xl md:text-7xl uppercase text-white">LOAD_PLATE</h2>
                        <p className="font-oswald italic text-[10px] tracking-mega text-[#ccff00] uppercase font-black opacity-60">HIGH_RES_SOURCE_MANDATORY</p>
                     </div>
                     <div onClick={() => fileInputRef.current?.click()} className="group w-full max-w-md aspect-square glass rounded-[4rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-8 hover:border-[#ccff00]/40 cursor-pointer shadow-2xl relative overflow-hidden transition-all">
                        <div className="absolute inset-0 bg-[#ccff00]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-24 h-24 bg-[#ccff00]/10 rounded-3xl flex items-center justify-center border border-[#ccff00]/20 group-hover:scale-110 transition-transform">
                           <Scan className="w-12 h-12 text-[#ccff00]" />
                        </div>
                        <div className="text-center">
                           <span className="font-oswald italic font-black text-2xl uppercase text-white">SELECT_ATHLETE_PLATE</span>
                           <p className="font-oswald italic text-[10px] text-zinc-600 uppercase tracking-mega mt-2 font-black">DRAG_OR_DROP_RAW_PLATE</p>
                        </div>
                     </div>
                     <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                   </div>
                )}

                {step === 'customize' && state.image && (
                  <PhotoEditor 
                    image={state.image} 
                    teams={TEAMS.filter(t => t.leagueId === state.league?.id)} 
                    selectedTeam={state.team} 
                    onTeamSelect={(t) => setState(p => ({ ...p, team: t }))}
                    number={state.number} 
                    onNumberChange={(n) => setState(p => ({ ...p, number: n }))} 
                    removeBackground={state.removeBackground} 
                    onToggleBackground={() => setState(p => ({ ...p, removeBackground: !p.removeBackground }))}
                    onSwap={handleSwap} 
                    isProcessing={isLoading}
                    customPrompt={state.customPrompt} 
                    onCustomPromptChange={(cp) => setState(p => ({ ...p, customPrompt: cp }))}
                  />
                )}

                {step === 'result' && resultImage && (
                  <div className="flex flex-col items-center pb-24 space-y-12">
                    <div className="text-center space-y-2">
                       <h2 className="font-oswald italic font-black text-4xl md:text-7xl uppercase text-white">FORGE_COMPLETE</h2>
                       <p className="font-oswald italic text-[10px] tracking-mega text-[#ccff00] uppercase font-black opacity-60">MASTER_PLATE_GENERATED</p>
                    </div>
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md aspect-[3/4] glass rounded-[4rem] overflow-hidden border border-white/10 relative shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
                       <img src={resultImage} className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                       <button onClick={() => window.open(resultImage, '_blank')} className="absolute bottom-8 right-8 w-16 h-16 bg-[#ccff00] text-black rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all">
                         <Download className="w-8 h-8" />
                       </button>
                    </motion.div>
                    <div className="w-full max-w-md grid grid-cols-1 gap-4">
                       <button onClick={() => setShowPlayerCard(true)} className="w-full py-6 bg-white text-black font-oswald italic font-black text-2xl rounded-3xl uppercase tracking-tighter hover:bg-[#ccff00] transition-all shadow-xl">VIEW_NEURAL_CARD</button>
                       <button onClick={reset} className="w-full py-6 glass border border-white/10 text-white font-oswald italic font-black text-2xl rounded-3xl uppercase tracking-tighter hover:bg-white/5 transition-all">NEW_ITERATION</button>
                    </div>
                  </div>
                )}

                {step === 'profile' && activeProfile && (
                  <ProfileView 
                    profile={viewingProfile || activeProfile} 
                    isOwnProfile={!viewingProfile || viewingProfile.id === activeProfile.id}
                    currentUser={activeProfile}
                    onBack={() => { setViewingProfile(null); setStep('social-feed'); }} 
                    onUpdate={(p) => syncProfiles(profiles.map(pr => pr.id === p.id ? p : pr))}
                    onFollow={() => {}}
                    followingProfiles={profiles.filter(p => (viewingProfile || activeProfile).followingIds?.includes(p.id))}
                  />
                )}
                
                {showAILab && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full">
                    <AILab />
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      {showPlayerCard && resultImage && playerData && activeProfile && (
        <PlayerCard image={resultImage} name={activeProfile.name} team={state.team?.name || ''} number={state.number} background={playerData.background} highlights={playerData.highlights} stats={playerData.stats} onClose={() => setShowPlayerCard(false)} />
      )}
    </div>
  );
};

export default App;
