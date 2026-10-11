
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, Comment, SavedSwap } from '../types';
import { LEAGUES } from '../constants';
import { GeminiService } from '../services/geminiService';
import { 
  Shield, Zap, Edit3, Crosshair, Activity, 
  Layers, X, Trophy, ChevronLeft, 
  PackageSearch, Target, Settings2, 
  Camera, LineChart, Cpu, TrendingUp, Award, Globe, Gauge, 
  MessageSquare, Send, BarChart, ZapOff, RefreshCw,
  Zap as Power, ThumbsUp, Radio, Heart, CornerDownRight,
  Share2, Users, UserPlus, UserMinus, Info, Upload
} from 'lucide-react';

const ElectricalSurge = () => (
  <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden rounded-[2rem]">
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ 
          opacity: [0, 1, 0],
          scaleX: [0, 2, 0],
          x: ['-100%', '200%'],
          y: [`${15 + i * 12}%`, `${25 + i * 12}%`]
        }}
        transition={{
          duration: 0.3 + Math.random() * 0.3,
          repeat: Infinity,
          repeatDelay: Math.random() * 1.5,
          ease: "linear"
        }}
        className="absolute w-full h-[2px] bg-[#ccff00] blur-[1px] shadow-[0_0_20px_#ccff00] -rotate-6"
      />
    ))}
    <motion.div 
      animate={{ opacity: [0, 0.2, 0.1, 0.3, 0] }}
      transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 0.5 }}
      className="absolute inset-0 bg-[#ccff00] mix-blend-color-dodge"
    />
  </div>
);

// FIX: Properly type VaultCard as React.FC to handle React-reserved props like 'key' correctly in TypeScript
const VaultCard: React.FC<{ swap: SavedSwap }> = ({ swap }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="relative aspect-[3/4] perspective-1000 group"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="w-full h-full relative transform-style-3d cursor-pointer"
      >
        {/* Card Front */}
        <div className="absolute inset-0 backface-hidden glass rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl">
          <img src={swap.image} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700" alt={swap.team} />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
          <div className="absolute bottom-5 left-5 right-5 z-20 space-y-1">
            <span className="font-oswald italic font-black text-xl uppercase tracking-tighter text-white block leading-none">{swap.team}</span>
            <div className="flex items-center justify-between">
              <span className="font-oswald italic font-bold text-[10px] text-[#ccff00] tracking-widest uppercase">{swap.league}</span>
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                <Info className="w-3 h-3 text-white/40" />
              </div>
            </div>
          </div>
        </div>

        {/* Card Back */}
        <div className="absolute inset-0 backface-hidden glass rounded-[2rem] border border-[#ccff00]/30 overflow-hidden shadow-[0_0_40px_rgba(204,255,0,0.1)] rotate-y-180 bg-black flex flex-col p-6 items-center justify-center text-center">
          <ElectricalSurge />
          
          <div className="relative z-10 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#ccff00] flex items-center justify-center shadow-[0_0_20px_#ccff00] mx-auto mb-2">
              <Power className="w-6 h-6 text-black fill-current" />
            </div>
            
            <div className="space-y-1">
              <span className="font-oswald italic font-black text-[9px] text-[#ccff00] tracking-widest uppercase">KIT_COMMITMENT</span>
              <h4 className="font-oswald italic font-black text-2xl text-white uppercase leading-none">{swap.team}</h4>
            </div>

            <div className="h-px w-12 bg-white/20 mx-auto" />

            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="text-left">
                <p className="font-oswald italic text-[8px] text-zinc-500 uppercase tracking-widest font-black">LEAGUE</p>
                <p className="font-oswald italic text-xs text-white font-bold uppercase">{swap.league}</p>
              </div>
              <div className="text-right">
                <p className="font-oswald italic text-[8px] text-zinc-500 uppercase tracking-widest font-black">SEASON</p>
                <p className="font-oswald italic text-xs text-[#ccff00] font-bold uppercase">{swap.season}</p>
              </div>
            </div>

            <div className="pt-4">
              <p className="font-oswald italic text-[8px] text-zinc-600 uppercase tracking-mega font-black mb-1">DATA_TIMESTAMP</p>
              <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                <span className="font-oswald italic text-[11px] text-zinc-300 font-bold uppercase">{swap.date}</span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 inset-x-0 opacity-40">
             <span className="font-oswald italic text-[8px] text-zinc-500 tracking-[0.6em] uppercase font-black">TAP_TO_REVERT</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

interface CommentItemProps {
  comment: Comment;
  depth?: number;
  onLike: (id: string) => void;
  onReply: (comment: Comment) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, depth = 0, onLike, onReply }) => (
  <div className={`space-y-4 ${depth > 0 ? 'ml-8 md:ml-12 mt-4 border-l border-white/5 pl-4 md:pl-6' : ''}`}>
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3 md:gap-4 group">
      <div className={`rounded-xl bg-zinc-900 border border-white/10 shrink-0 overflow-hidden shadow-xl relative ${depth > 0 ? 'w-8 h-8' : 'w-12 h-12'}`}>
        <img 
          src={comment.userAvatar || `https://ui-avatars.com/api/?name=${comment.userName}&background=111&color=555`} 
          className="w-full h-full object-cover opacity-80" 
          alt={comment.userName}
        />
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-oswald italic font-black text-xs text-white uppercase tracking-widest group-hover:text-[#ccff00] transition-colors">{comment.userName}</span>
            <span className="font-oswald italic text-[8px] text-zinc-600 font-bold uppercase tracking-widest">{comment.timestamp}</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => onReply(comment)} className="font-oswald italic font-black text-[9px] text-zinc-600 hover:text-[#ccff00] transition-colors uppercase">REPLY</button>
            <button 
              onClick={() => onLike(comment.id)} 
              className={`flex items-center gap-1.5 transition-all p-1 -m-1 rounded-lg hover:bg-white/5 ${comment.hasLiked ? 'text-red-500' : 'text-zinc-600 hover:text-white'}`}
            >
              <Heart className={`w-3.5 h-3.5 ${comment.hasLiked ? 'fill-current' : ''}`} />
              <span className="font-oswald italic font-black text-[10px]">{comment.likeCount || 0}</span>
            </button>
          </div>
        </div>
        <div className="glass bg-white/2 border border-white/5 rounded-2xl p-4 md:p-5 shadow-inner hover:border-white/10 transition-colors">
          <p className="font-inter italic text-[13px] text-zinc-400 leading-relaxed">{comment.text}</p>
        </div>
      </div>
    </motion.div>
    {comment.replies && comment.replies.map(reply => (
      <CommentItem 
        key={reply.id} 
        comment={reply} 
        depth={depth + 1} 
        onLike={onLike} 
        onReply={onReply} 
      />
    ))}
  </div>
);

interface ProfileViewProps {
  profile: UserProfile;
  currentUser: UserProfile;
  isOwnProfile: boolean;
  followingProfiles: UserProfile[];
  onUpdate?: (p: UserProfile) => void;
  onBack: () => void;
  onFollow: (userId: string) => void;
  onGenerateBio?: () => void;
  isBioLoading?: boolean;
}

interface LiveStat {
  label: string;
  value: string;
  detail: string;
  status: 'live' | 'final' | 'upcoming';
}

const ProfileView: React.FC<ProfileViewProps> = ({ profile, currentUser, isOwnProfile, followingProfiles, onUpdate, onBack, onFollow }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editProfile, setEditProfile] = useState<UserProfile>(profile);
  const [commentText, setCommentText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [liveStats, setLiveStats] = useState<LiveStat[]>([]);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  
  const gemini = useRef(new GeminiService());

  const [profileComments, setProfileComments] = useState<Comment[]>([
    {
      id: 'pc1',
      userId: 'scout_01',
      userName: 'HEAD_SCOUT_MARCUS',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200',
      text: "Draft stock is rising. That OVR reflects the recent performance gain. Elite vision.",
      timestamp: '2H AGO',
      likeCount: 42,
      hasLiked: false,
      replies: [
        {
          id: 'pcr1',
          userId: 'athlete_x',
          userName: 'JEROME_DRAFT',
          userAvatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?q=80&w=200',
          text: "Stats don't lie. Next level incoming.",
          timestamp: '1H AGO',
          likeCount: 5,
          hasLiked: false,
          replies: []
        }
      ]
    },
    {
      id: 'pc2',
      userId: 'designer_01',
      userName: 'JORDAN_DESIGN',
      userAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200',
      text: "Cleanest kit archive I've seen in the league. Precise commitments and high-res execution.",
      timestamp: '5H AGO',
      likeCount: 28,
      hasLiked: true,
      replies: []
    }
  ]);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleSaveModal = () => {
    onUpdate?.(editProfile);
    setIsModalOpen(false);
  };

  const handleCancelModal = () => {
    setEditProfile({ ...profile });
    setIsModalOpen(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Simulate "neural processing" delay for better feel
        setTimeout(() => {
          onUpdate?.({...profile, avatar: base64});
          setEditProfile(prev => ({ ...prev, avatar: base64 }));
          setIsUploading(false);
        }, 1200);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    setEditProfile({ ...profile });
  }, [profile, isModalOpen]);

  useEffect(() => {
    const fetchLiveIntel = async () => {
      setIsStatsLoading(true);
      try {
        const leagueName = profile.leaguePreference || 'NFL';
        const query = `Get the latest 3 most significant live or recent game scores and player stats for the ${leagueName}. Format as a JSON array of objects with keys: label, value, detail, status. Only return JSON.`;
        const response = await gemini.current.queryScoutMode(query);
        const jsonMatch = response.text.match(/\[.*\]/s);
        if (jsonMatch) setLiveStats(JSON.parse(jsonMatch[0]));
      } catch (err) {
        console.error("Stats Fetch Error:", err);
      } finally {
        setIsStatsLoading(false);
      }
    };
    fetchLiveIntel();
  }, [profile.leaguePreference]);

  const handleLikeComment = (id: string) => {
    const toggleLikeRecursive = (comments: Comment[]): Comment[] => {
      return comments.map(c => {
        if (c.id === id) {
          const currentlyLiked = !!c.hasLiked;
          return {
            ...c,
            hasLiked: !currentlyLiked,
            likeCount: (c.likeCount || 0) + (currentlyLiked ? -1 : 1)
          };
        }
        if (c.replies && c.replies.length > 0) {
          return { ...c, replies: toggleLikeRecursive(c.replies) };
        }
        return c;
      });
    };
    setProfileComments(toggleLikeRecursive(profileComments));
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    const newComment: Comment = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      text: commentText,
      timestamp: 'JUST NOW',
      likeCount: 0,
      hasLiked: false,
      replies: []
    };

    if (replyingTo) {
      const updateReplies = (comments: Comment[]): Comment[] => {
        return comments.map(c => {
          if (c.id === replyingTo.id) {
            return { ...c, replies: [...(c.replies || []), newComment] };
          }
          if (c.replies && c.replies.length > 0) {
            return { ...c, replies: updateReplies(c.replies) };
          }
          return c;
        });
      };
      setProfileComments(updateReplies(profileComments));
      setReplyingTo(null);
    } else {
      setProfileComments([newComment, ...profileComments]);
    }
    setCommentText('');
  };

  const shareToTwitter = () => {
    const text = `Check out the scouting profile for ${profile.name} on JERSEYSWAP.IO! OVR: ${profile.ovr}.`;
    const url = window.location.href;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
  };

  const isFollowing = currentUser.followingIds?.includes(profile.id);

  const coreAttributes = [
    { label: 'PRECISION', key: 'precision' as const, color: '#ccff00', icon: Crosshair, desc: 'SYNTACTIC_ACCURACY' },
    { label: 'SYNC', key: 'sync' as const, color: '#00fff9', icon: Activity, desc: 'FABRIC_PHYSICS' },
    { label: 'VELOCITY', key: 'speed' as const, color: '#ff00ea', icon: Power, desc: 'RENDER_LATENCY' }
  ];

  const vaultItems = profile.vault || [];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 animate-in fade-in duration-700 pb-32">
      <div className="flex items-center justify-between py-6 mb-4">
        <button onClick={onBack} className="flex items-center gap-2 group">
          <div className="w-8 h-8 glass rounded-lg flex items-center justify-center border border-white/5 group-hover:bg-[#ccff00] group-hover:text-black transition-all">
            <ChevronLeft className="w-4 h-4" />
          </div>
          <span className="font-oswald italic font-black text-[10px] tracking-widest text-zinc-500 uppercase">EXIT_VAULT</span>
        </button>
        <div className="flex gap-2">
          <button onClick={shareToTwitter} className="px-4 py-2 glass border border-white/10 rounded-lg font-oswald italic font-black text-[10px] tracking-widest text-white hover:border-[#1DA1F2] hover:text-[#1DA1F2] transition-all flex items-center gap-2">
            <Share2 className="w-3 h-3" /> BROADCAST
          </button>
          {isOwnProfile ? (
            <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 glass border border-white/10 rounded-lg font-oswald italic font-black text-[10px] tracking-widest text-white hover:border-[#ccff00] hover:text-[#ccff00] transition-all flex items-center gap-2">
              <Settings2 className="w-3 h-3" /> CONFIGURE_ID
            </button>
          ) : (
            <button 
              onClick={() => onFollow(profile.id)} 
              className={`px-4 py-2 rounded-lg font-oswald italic font-black text-[10px] tracking-widest flex items-center gap-2 transition-all ${isFollowing ? 'bg-zinc-800 text-zinc-400 border border-white/5' : 'bg-[#ccff00] text-black shadow-lg shadow-[#ccff00]/20'}`}
            >
              {isFollowing ? <><UserMinus className="w-3 h-3" /> DETACH_SYNC</> : <><UserPlus className="w-3 h-3" /> ATTACH_SYNC</>}
            </button>
          )}
        </div>
      </div>

      <div className="relative glass rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-[5]" />
        <img src={profile.avatar || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200'} className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale blur-[1px]" alt="Avatar" />
        <div className="relative z-20 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <div className={`relative group ${isOwnProfile ? 'cursor-pointer' : ''}`} onClick={() => isOwnProfile && avatarInputRef.current?.click()}>
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl overflow-hidden border-2 border-[#ccff00]/30 shadow-[0_0_50px_rgba(204,255,0,0.15)] bg-black relative">
                <img src={profile.avatar || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200'} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Profile" />
                {isUploading && <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm z-30"><RefreshCw className="w-10 h-10 text-[#ccff00] animate-spin" /></div>}
              </div>
              {isOwnProfile && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl z-20">
                  <Camera className="w-8 h-8 text-[#ccff00] mb-2" />
                  <span className="font-oswald italic font-black text-[10px] text-white uppercase tracking-widest">SYNC_PHOTO</span>
                </div>
              )}
              <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
              <div className="absolute -bottom-3 -right-3 bg-[#ccff00] text-black font-oswald italic font-black text-2xl px-3 py-1 rounded-xl shadow-2xl border-4 border-black z-30">
                {profile.ovr}
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-1 text-left">
                <h1 className="font-oswald italic font-black text-5xl md:text-6xl uppercase tracking-ultra leading-none text-white">{profile.name}</h1>
                <div className="flex items-center gap-3">
                  <p className="font-oswald italic font-bold text-lg tracking-widest text-[#ccff00]">{profile.handle}</p>
                  <div className="h-4 w-px bg-white/10" />
                  <span className="text-xs text-zinc-500 font-oswald italic font-bold uppercase tracking-widest">{profile.role}</span>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-oswald italic font-black text-lg text-white">{(profile.followingIds || []).length}</span>
                  <span className="font-oswald italic text-[10px] text-zinc-500 uppercase tracking-widest font-black">FOLLOWING</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-oswald italic font-black text-lg text-white">42</span>
                  <span className="font-oswald italic text-[10px] text-zinc-500 uppercase tracking-widest font-black">FOLLOWERS</span>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full md:w-72">
            <div className="glass bg-black/40 border border-white/5 rounded-2xl p-5 backdrop-blur-xl relative">
              <div className="flex justify-between items-center mb-3">
                <span className="font-oswald italic text-[9px] text-zinc-500 tracking-[0.4em] uppercase font-black">NEURAL_SCOUT_REPORT</span>
                {isOwnProfile && <button onClick={() => setIsEditingBio(!isEditingBio)} className="text-[#ccff00]"><Edit3 className="w-3 h-3" /></button>}
              </div>
              {isEditingBio ? (
                <textarea 
                  value={editProfile.bio} 
                  autoFocus
                  onBlur={() => { onUpdate?.(editProfile); setIsEditingBio(false); }}
                  onChange={e => setEditProfile({...editProfile, bio: e.target.value})}
                  className="bg-black/50 border border-[#ccff00]/20 rounded-xl p-3 text-[12px] text-zinc-300 w-full h-24 resize-none outline-none font-inter italic"
                />
              ) : (
                <p className="text-[12px] text-zinc-400 leading-relaxed font-inter italic text-left">{profile.bio || "Searching neural database for scouting intel..."}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 mb-16">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-[#ccff00]/10 rounded-xl flex items-center justify-center border border-[#ccff00]/20">
            <Users className="w-5 h-5 text-[#ccff00]" />
          </div>
          <div>
            <h3 className="font-oswald italic font-black text-2xl tracking-tighter uppercase text-white leading-none">NEURAL_NETWORK</h3>
            <p className="font-oswald italic text-[10px] text-zinc-500 uppercase tracking-[0.3em] mt-1 font-bold">CONNECTED_ENTITIES: {followingProfiles.length}</p>
          </div>
        </div>
        
        {followingProfiles.length > 0 ? (
          <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar">
            {followingProfiles.map(p => (
              <motion.div 
                key={p.id}
                whileHover={{ scale: 1.05 }}
                className="shrink-0 w-32 glass rounded-[2rem] p-4 border border-white/5 flex flex-col items-center text-center gap-3 group"
              >
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 overflow-hidden relative">
                  <img src={p.avatar || `https://ui-avatars.com/api/?name=${p.name}&background=111&color=555`} className="w-full h-full object-cover" alt={p.name} />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => onFollow(p.id)} className="text-[#ccff00] hover:scale-110"><UserMinus className="w-5 h-5" /></button>
                  </div>
                </div>
                <div className="space-y-0.5">
                  <p className="font-oswald italic font-black text-[10px] text-white uppercase leading-tight truncate w-24">{p.name}</p>
                  <p className="font-oswald italic text-[8px] text-[#ccff00] uppercase font-bold truncate w-24">{p.handle}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass rounded-[2rem] p-10 flex flex-col items-center justify-center text-center gap-3 border-dashed border border-white/5 opacity-40">
            <UserPlus className="w-8 h-8 text-zinc-700" />
            <p className="font-oswald italic font-black text-xs text-white uppercase tracking-mega">NO_NEURAL_NODES_ATTACHED</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        {coreAttributes.map((stat, i) => (
          <div key={stat.key} className="glass rounded-3xl p-6 border border-white/5 relative overflow-hidden group">
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className="w-5 h-5 opacity-40" style={{ color: stat.color }} />
                <span className="font-oswald italic font-black text-[9px] tracking-widest text-zinc-500 uppercase">{stat.desc}</span>
              </div>
              <div className="flex items-baseline gap-2 mt-auto">
                <span className="font-oswald italic font-black text-5xl leading-none" style={{ color: stat.color }}>{profile.stats[stat.key]}</span>
                <span className="font-oswald italic font-bold text-[10px] text-zinc-700">PTS</span>
              </div>
              <h4 className="font-oswald italic font-black text-xs text-white uppercase tracking-widest mt-2">{stat.label}</h4>
            </div>
            <div className="absolute bottom-0 left-0 h-1.5 bg-white/5 w-full">
              <motion.div initial={{ width: 0 }} animate={{ width: `${profile.stats[stat.key]}%` }} transition={{ duration: 1.5, delay: i * 0.1 }} className="h-full" style={{ backgroundColor: stat.color }} />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6 mb-16">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-[#ccff00]/10 rounded-xl flex items-center justify-center border border-[#ccff00]/20">
            <Layers className="w-5 h-5 text-[#ccff00]" />
          </div>
          <div>
            <h3 className="font-oswald italic font-black text-2xl tracking-tighter uppercase text-white leading-none">KIT_ARCHIVE</h3>
            <p className="font-oswald italic text-[10px] text-zinc-500 uppercase tracking-[0.3em] mt-1 font-bold">TOTAL_COMMITMENTS: {vaultItems.length}</p>
          </div>
        </div>
        {vaultItems.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {vaultItems.map((swap) => (
              <VaultCard key={swap.id} swap={swap} />
            ))}
          </div>
        ) : (
          <div className="glass rounded-[3rem] p-20 flex flex-col items-center justify-center text-center gap-6 border-dashed border-2 border-white/5 opacity-40">
            <PackageSearch className="w-16 h-16 text-zinc-700" />
            <p className="font-oswald italic font-black text-2xl text-white uppercase tracking-tighter">VAULT_OFFLINE</p>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ccff00]/10 rounded-xl flex items-center justify-center border border-[#ccff00]/20">
              <MessageSquare className="w-5 h-5 text-[#ccff00]" />
            </div>
            <div>
              <h3 className="font-oswald italic font-black text-2xl tracking-tighter uppercase text-white leading-none">NEURAL_COMMS</h3>
              <p className="font-oswald italic text-[10px] text-zinc-500 uppercase tracking-[0.3em] mt-1 font-bold">PROFILE_ENCRYPTED_FEED</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-[3rem] border border-white/5 p-6 md:p-10 space-y-10 shadow-2xl bg-black/40 backdrop-blur-3xl">
          <div className="flex flex-col gap-6">
            <AnimatePresence>
              {replyingTo && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex items-center justify-between px-5 py-3 bg-[#ccff00]/5 border border-[#ccff00]/20 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <CornerDownRight className="w-3 h-3 text-[#ccff00]" />
                    <span className="font-oswald italic font-black text-[10px] text-[#ccff00] uppercase tracking-widest">REPLYING_TO @{replyingTo.userName}</span>
                  </div>
                  <button onClick={() => setReplyingTo(null)} className="text-zinc-500 hover:text-white transition-colors"><X className="w-3 h-3" /></button>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex gap-4 md:gap-6 group">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/10 shrink-0 overflow-hidden hidden md:block">
                <img src={currentUser.avatar || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200'} className="w-full h-full object-cover" alt="User" />
              </div>
              <div className="flex-1 flex flex-col gap-3">
                <textarea 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={replyingTo ? `REPLYING_TO @${replyingTo.userName.toUpperCase()}...` : "INIT_COMM_LINK..."} 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-oswald italic text-xs text-white outline-none focus:border-[#ccff00] transition-all min-h-[100px] resize-none"
                />
                <div className="flex justify-end">
                  <button 
                    onClick={handleAddComment}
                    disabled={!commentText.trim()}
                    className="px-8 py-3 bg-[#ccff00] text-black rounded-xl flex items-center gap-2 shadow-xl font-oswald italic font-black text-[10px] tracking-widest uppercase active:scale-95 transition-all"
                  >
                    <Send className="w-3 h-3" /> {replyingTo ? 'SYNC_REPLY' : 'COMMENCE_LINK'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8 max-h-[800px] overflow-y-auto custom-scrollbar pr-2 pb-6">
            <AnimatePresence initial={false}>
              {profileComments.map((comment) => (
                <CommentItem 
                  key={comment.id} 
                  comment={comment} 
                  onLike={handleLikeComment}
                  onReply={setReplyingTo}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCancelModal} className="absolute inset-0 bg-black/95 backdrop-blur-3xl" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }} className="relative w-full max-w-md glass border border-white/10 rounded-[3rem] p-10 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#ccff00]/5 blur-[60px]" />
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-oswald italic font-black text-3xl uppercase tracking-ultra text-white">CONFIGURE_ID</h2>
                <button onClick={handleCancelModal} className="w-10 h-10 glass rounded-full flex items-center justify-center text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-6 p-4 glass border border-white/5 rounded-2xl relative overflow-hidden group">
                   <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 relative">
                      <img src={editProfile.avatar || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200'} className="w-full h-full object-cover" alt="Current Avatar" />
                      {isUploading && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><RefreshCw className="w-5 h-5 text-[#ccff00] animate-spin" /></div>}
                   </div>
                   <div className="flex-1 space-y-1">
                      <p className="font-oswald italic font-black text-[10px] text-white uppercase tracking-widest">VISUAL_IDENTIFIER</p>
                      <button 
                        onClick={() => avatarInputRef.current?.click()}
                        className="text-[10px] font-oswald italic font-bold text-[#ccff00] uppercase hover:underline flex items-center gap-2"
                      >
                        <Upload className="w-3 h-3" /> UPDATE_NEURAL_PLATE
                      </button>
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="font-oswald italic text-[9px] text-[#ccff00] tracking-widest uppercase font-black px-1">ATHLETE_IDENTIFIER</label>
                  <input 
                    value={editProfile.name} 
                    onChange={e => setEditProfile({...editProfile, name: e.target.value.toUpperCase()})} 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 font-oswald italic font-black text-xl text-white outline-none focus:border-[#ccff00]" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-oswald italic text-[9px] text-zinc-500 tracking-widest uppercase font-black px-1">SOCIAL_HANDLE</label>
                    <input 
                      value={editProfile.handle} 
                      onChange={e => setEditProfile({...editProfile, handle: e.target.value})} 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 font-oswald italic font-bold text-sm text-[#ccff00] outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-oswald italic text-[9px] text-zinc-500 tracking-widest uppercase font-black px-1">OPERATIONAL_ROLE</label>
                    <select 
                      value={editProfile.role} 
                      onChange={e => setEditProfile({...editProfile, role: e.target.value as any})} 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 font-oswald italic font-bold text-sm text-white outline-none appearance-none"
                    >
                      <option value="Athlete">Athlete</option>
                      <option value="Pro Designer">Pro Designer</option>
                      <option value="Scout">Scout</option>
                    </select>
                  </div>
                </div>
                <div className="pt-4 space-y-3">
                  <button onClick={handleSaveModal} className="w-full py-5 bg-[#ccff00] text-black rounded-2xl font-oswald italic font-black text-sm tracking-widest shadow-xl uppercase transition-all active:scale-95">COMMIT_CHANGES</button>
                  <button onClick={handleCancelModal} className="w-full py-4 glass border border-white/5 rounded-2xl font-oswald italic font-black text-[10px] tracking-widest text-zinc-500 uppercase hover:text-white">DISCARD_EDITS</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileView;
