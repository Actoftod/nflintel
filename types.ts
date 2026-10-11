
export interface Team {
  id: string;
  name: string;
  color: string;
  logo: string;
  primaryHex: string;
  leagueId: string;
}

export interface League {
  id: string;
  name: string;
  logo: string;
  logoVariants?: Record<string, string>;
  description: string;
  accentColor?: string;
}

export type AppStep = 'landing' | 'onboarding' | 'auth' | 'sport-select' | 'league-select' | 'upload' | 'customize' | 'processing' | 'result' | 'profile' | 'editor' | 'social-feed';

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  text: string;
  timestamp: string;
  likeCount?: number;
  hasLiked?: boolean;
  replies?: Comment[];
}

export interface SocialSwap {
  id: string;
  userId: string;
  userName: string;
  userHandle: string;
  userAvatar: string | null;
  image: string;
  team: string;
  sport: string;
  likes: number;
  hasLiked?: boolean;
  rating: number; // 0-5
  ratingCount: number;
  comments: Comment[];
  isSaved?: boolean;
  timestamp: string;
}

export interface SavedSwap {
  id: string;
  team: string;
  league: string;
  date: string;
  image: string;
  season: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string;
  handle: string;
  role: 'Athlete' | 'Pro Designer' | 'Scout';
  leaguePreference: string;
  bio: string;
  avatar: string | null;
  stats: {
    precision: number;
    sync: number;
    speed: number;
  };
  ovr: number;
  vault: SavedSwap[];
  followingIds?: string[];
  savedSwapIds?: string[];
}

export interface SwapState {
  sportId: string | null;
  image: string | null;
  league: League | null;
  team: Team | null;
  number: string;
  removeBackground: boolean;
  showLogoOverlay?: boolean;
  customPrompt: string;
}
