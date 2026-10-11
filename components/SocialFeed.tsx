
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageSquare, Star, Bookmark, Share2, MoreHorizontal, Send, CornerDownRight, TrendingUp, Clock, Award, BookmarkCheck, ThumbsUp, X } from 'lucide-react';
import { SocialSwap, Comment, UserProfile } from '../types';

interface SocialFeedProps {
  user: UserProfile;
  swaps: SocialSwap[];
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onComment: (id: string, text: string, parentId?: string) => void;
  onRate: (id: string, rating: number) => void;
  onFollow: (userId: string) => void;
  onViewProfile: (userId: string) => void;
}

export const SocialFeed: React.FC<SocialFeedProps> = ({ user, swaps, onLike, onSave, onComment, onRate, onFollow, onViewProfile }) => {
  const [filter, setFilter] = useState<'trending' | 'newest' | 'liked' | 'rated'>('trending');
  const [activeComments, setActiveComments] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<{ swapId: string; commentId: string; userName: string } | null>(null);

  const sortedSwaps = [...swaps].sort((a, b) => {
    if (filter === 'newest') return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    if (filter === 'liked') return b.likes - a.likes;
    if (filter === 'rated') return b.rating - a.rating;
    return (b.likes * b.rating) - (a.likes * a.rating);
  });

  const handleCommentSubmit = (swapId: string, text: string) => {
    onComment(swapId, text, replyTo?.commentId);
    setReplyTo(null);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "https://storage.googleapis.com/jerseyswap/uploads/placeholder_swap.png";
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 pb-32">
      <div className="flex items-center justify-between px-4 sticky top-14 z-[90] py-4 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex gap-2">
          {[
            { id: 'trending', label: 'TRENDING', icon: TrendingUp },
            { id: 'newest', label: 'LATEST', icon: Clock },
            { id: 'rated', label: 'ELITE', icon: Award }
          ].map(f => (
            <button 
              key={f.id} 
              onClick={() => setFilter(f.id as any)}
              className={`px-4 py-2 rounded-full font-oswald italic text-[10px] font-black tracking-widest flex items-center gap-2 transition-all ${filter === f.id ? 'bg-[#ccff00] text-black' : 'bg-white/5 text-zinc-500 border border-white/5'}`}
            >
              <f.icon className="w-3 h-3" /> {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-12">
        {sortedSwaps.map(swap => (
          <motion.div 
            key={swap.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl relative"
          >
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => onViewProfile(swap.userId)}
                  className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 overflow-hidden shrink-0 hover:border-[#ccff00] transition-colors"
                >
                  <img src={swap.userAvatar || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200'} className="w-full h-full object-cover" alt={swap.userName} />
                </button>
                <div className="text-left cursor-pointer" onClick={() => onViewProfile(swap.userId)}>
                  <h4 className="font-oswald italic font-black text-white text-sm uppercase leading-none hover:text-[#ccff00] transition-colors">{swap.userName}</h4>
                  <p className="font-oswald italic text-[10px] text-[#ccff00] tracking-widest uppercase mt-0.5">{swap.userHandle}</p>
                </div>
                <button 
                  onClick={() => onFollow(swap.userId)}
                  className={`ml-2 px-3 py-1 rounded-full border font-oswald italic text-[8px] font-black uppercase transition-all ${user.followingIds?.includes(swap.userId) ? 'bg-zinc-800 text-zinc-400 border-white/5' : 'border-[#ccff00]/30 text-[#ccff00] hover:bg-[#ccff00] hover:text-black'}`}
                >
                  {user.followingIds?.includes(swap.userId) ? 'FOLLOWING' : 'FOLLOW'}
                </button>
              </div>
              <button className="text-zinc-500 hover:text-white"><MoreHorizontal className="w-5 h-5" /></button>
            </div>

            <div className="relative aspect-[4/5] bg-zinc-950 flex items-center justify-center group">
              <img src={swap.image} className="w-full h-full object-cover" alt="Swap Visual" onError={handleImageError} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="absolute top-4 left-4 z-20 flex gap-2">
                <div className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
                   <span className="font-oswald italic text-[9px] font-black text-white tracking-widest uppercase">{swap.sport} // {swap.team}</span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-5">
                  <button 
                    onClick={() => onLike(swap.id)}
                    className={`flex items-center gap-2 transition-all ${swap.hasLiked ? 'text-red-500' : 'text-white'}`}
                  >
                    <Heart className={`w-6 h-6 ${swap.hasLiked ? 'fill-current' : ''}`} />
                    <span className="font-oswald italic font-black text-xs">{swap.likes}</span>
                  </button>
                  <button 
                    onClick={() => setActiveComments(activeComments === swap.id ? null : swap.id)}
                    className="flex items-center gap-2 text-white hover:text-[#ccff00] transition-all"
                  >
                    <MessageSquare className="w-6 h-6" />
                    <span className="font-oswald italic font-black text-xs">{swap.comments.length}</span>
                  </button>
                  <button className="text-white hover:text-[#ccff00] transition-all"><Share2 className="w-6 h-6" /></button>
                </div>
                
                <button 
                  onClick={() => onSave(swap.id)}
                  className={`transition-all ${swap.isSaved ? 'text-[#ccff00]' : 'text-white'}`}
                >
                  {swap.isSaved ? <BookmarkCheck className="w-6 h-6" /> : <Bookmark className="w-6 h-6" />}
                </button>
              </div>

              <div className="flex items-center gap-4 pt-2 border-t border-white/5">
                <span className="font-oswald italic font-black text-[9px] text-zinc-500 uppercase tracking-mega">SWAP_QUALITY</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      key={star} 
                      onClick={() => onRate(swap.id, star)}
                      className={`transition-colors ${star <= swap.rating ? 'text-[#ccff00]' : 'text-zinc-800'}`}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  ))}
                </div>
                <span className="font-oswald italic text-[9px] text-[#ccff00] font-bold">({swap.ratingCount})</span>
              </div>

              <AnimatePresence>
                {activeComments === swap.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-6 pt-4"
                  >
                    <div className="max-h-80 overflow-y-auto custom-scrollbar space-y-6 pr-2">
                      {swap.comments.map(comment => (
                        <div key={comment.id} className="space-y-4">
                          <div className="flex gap-3 text-left group">
                            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 shrink-0 overflow-hidden shadow-lg cursor-pointer" onClick={() => onViewProfile(comment.userId)}>
                              <img src={comment.userAvatar || ''} className="w-full h-full object-cover" alt={comment.userName} />
                            </div>
                            <div className="flex-1 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 cursor-pointer" onClick={() => onViewProfile(comment.userId)}>
                                  <span className="font-oswald italic font-black text-[10px] text-white uppercase tracking-wider hover:text-[#ccff00] transition-colors">{comment.userName}</span>
                                  <span className="text-zinc-600 text-[8px] font-bold">{comment.timestamp}</span>
                                </div>
                                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => setReplyTo({ swapId: swap.id, commentId: comment.id, userName: comment.userName })}
                                    className="text-[9px] font-oswald italic font-black text-zinc-500 hover:text-[#ccff00] uppercase"
                                  >
                                    REPLY
                                  </button>
                                  <button className="flex items-center gap-1 text-zinc-600 hover:text-[#ccff00]">
                                    <ThumbsUp className="w-3 h-3" />
                                    <span className="text-[9px] font-black">{comment.likeCount || 0}</span>
                                  </button>
                                </div>
                              </div>
                              <p className="text-[12px] text-zinc-400 font-inter italic leading-relaxed">{comment.text}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="space-y-3">
                      {replyTo && replyTo.swapId === swap.id && (
                        <div className="flex items-center justify-between px-4 py-2 bg-[#ccff00]/5 border border-[#ccff00]/20 rounded-xl">
                          <span className="font-oswald italic font-black text-[9px] text-[#ccff00] uppercase">REPLYING_TO @{replyTo.userName}</span>
                          <button onClick={() => setReplyTo(null)} className="text-zinc-500 hover:text-white"><X className="w-3 h-3" /></button>
                        </div>
                      )}
                      <div className="flex gap-3">
                        <input 
                          placeholder={replyTo ? `REPLYING_TO @${replyTo.userName.toUpperCase()}...` : "ADD_NEURAL_COMMENT..."}
                          className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 font-oswald italic text-xs text-white outline-none focus:border-[#ccff00] transition-all"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleCommentSubmit(swap.id, e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                        <button 
                          className="w-12 h-12 bg-[#ccff00] text-black rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
                          onClick={(e) => {
                            const input = e.currentTarget.previousSibling as HTMLInputElement;
                            if (input.value) {
                              handleCommentSubmit(swap.id, input.value);
                              input.value = '';
                            }
                          }}
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
