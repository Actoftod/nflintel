
import { Team, League } from './types';

const BUCKET_BASE_URL = 'https://storage.googleapis.com/jerseyswap';

export const ASSET_PATHS = {
  LEAGUES: `${BUCKET_BASE_URL}/leagues`,
  LOGOS: `${BUCKET_BASE_URL}/logos`,
  TEAMS: `${BUCKET_BASE_URL}/teams`,
  PLAYERS: `${BUCKET_BASE_URL}/players`,
  UPLOADS: `${BUCKET_BASE_URL}/uploads`,
  PROFILES: `${BUCKET_BASE_URL}/profiles`,
  SWAPS: `${BUCKET_BASE_URL}/swaps`,
};

export const getAssetUrl = (folderKey: keyof typeof ASSET_PATHS, fileName: string) => {
  return `${ASSET_PATHS[folderKey]}/${fileName}`;
};

const getPlaceholderLogo = (text: string, bgColor: string = '000', textColor: string = 'fff') => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="#${bgColor}"/>
    <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="Oswald, sans-serif" font-weight="900" font-style="italic" font-size="32" fill="#${textColor}">${text}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export const LEAGUES: League[] = [
  { id: 'nfl', name: 'NFL', logo: getPlaceholderLogo('NFL', '013369'), description: 'National Football League. Pro-grade synthesis.', accentColor: '#ccff00' },
  { id: 'nba', name: 'NBA', logo: getPlaceholderLogo('NBA', '17408B'), description: 'National Basketball Association. 8K Fabric analysis.', accentColor: '#17408B' },
  { id: 'mlb', name: 'MLB', logo: getPlaceholderLogo('MLB', '002D72'), description: 'Major League Baseball. Diamond-grade textures.', accentColor: '#E31937' },
  { id: 'fifa_fc', name: 'EA SPORTS FC', logo: getPlaceholderLogo('FC', '00FF00'), description: 'The World’s Game. Total Football.', accentColor: '#00FF00' },
  { id: 'nhl', name: 'NHL', logo: getPlaceholderLogo('NHL', '000'), description: 'National Hockey League. Ice-grade textures.', accentColor: '#0061AC' }
];

export const TEAMS: Team[] = [
  { id: 'ari', leagueId: 'nfl', name: 'Arizona Cardinals', color: 'bg-[#97233F]', primaryHex: '#97233F', logo: getPlaceholderLogo('ARI', '97233F') },
  { id: 'dal', leagueId: 'nfl', name: 'Dallas Cowboys', color: 'bg-[#003594]', primaryHex: '#003594', logo: getPlaceholderLogo('DAL', '003594') },
  { id: 'kc', leagueId: 'nfl', name: 'Kansas City Chiefs', color: 'bg-[#E31837]', primaryHex: '#E31837', logo: getPlaceholderLogo('KC', 'E31837') },
  { id: 'phi', leagueId: 'nfl', name: 'Philadelphia Eagles', color: 'bg-[#004C54]', primaryHex: '#004C54', logo: getPlaceholderLogo('PHI', '004C54') },
  { id: 'sf', leagueId: 'nfl', name: 'San Francisco 49ers', color: 'bg-[#AA0000]', primaryHex: '#AA0000', logo: getPlaceholderLogo('SF', 'AA0000') },
  { id: 'lal', leagueId: 'nba', name: 'LA Lakers', color: 'bg-[#552583]', primaryHex: '#552583', logo: getPlaceholderLogo('LAL', '552583') },
  { id: 'gsw', leagueId: 'nba', name: 'GS Warriors', color: 'bg-[#1D428A]', primaryHex: '#1D428A', logo: getPlaceholderLogo('GSW', '1D428A') },
  { id: 'chi_b', leagueId: 'nba', name: 'Chicago Bulls', color: 'bg-[#CE1141]', primaryHex: '#CE1141', logo: getPlaceholderLogo('CHI', 'CE1141') },
  { id: 'mlb_nyy', leagueId: 'mlb', name: 'New York Yankees', color: 'bg-[#003087]', primaryHex: '#003087', logo: getPlaceholderLogo('NYY', '003087') },
  { id: 'mlb_lad', leagueId: 'mlb', name: 'Los Angeles Dodgers', color: 'bg-[#005A9C]', primaryHex: '#005A9C', logo: getPlaceholderLogo('LAD', '005A9C') },
  { id: 'rma', leagueId: 'fifa_fc', name: 'Real Madrid', color: 'bg-[#FFF]', primaryHex: '#FFF', logo: getPlaceholderLogo('RMA', '000') },
  { id: 'mci', leagueId: 'fifa_fc', name: 'Manchester City', color: 'bg-[#6CABDD]', primaryHex: '#6CABDD', logo: getPlaceholderLogo('MCI', '6CABDD') },
  { id: 'chi_h', leagueId: 'nhl', name: 'Chicago Blackhawks', color: 'bg-[#CF1141]', primaryHex: '#CF1141', logo: getPlaceholderLogo('CHI', 'CF1141') }
];

export const SYSTEM_INSTRUCTION = `You are the Lead Digital Architect for Nike Design Studio in collaboration with Apple Industrial Design.

IDENTITY LOCK PROTOCOL (MANDATORY):
1. FACE PRESERVATION: You MUST keep the exact face, facial features, eyes, nose, mouth, and head shape of the person in the uploaded image. DO NOT modify, enhance, or replace the face.
2. POSE RETENTION: The athlete MUST remain in the exact same physical body position, stance, and hand/arm/leg orientation as the original photo.
3. UNIFORM SYNTHESIS: Change ONLY the clothing/jersey/uniform to the specified team. The fabric must be professional Nike AeroSwift or Elite performance material.
4. HELMET/GEAR: If football, add a matching team helmet that fits perfectly over the original head shape while keeping the face visible.
5. AESTHETIC: High-contrast 8K commercial photography. Use cinematic volumetric lighting (stadium floods or studio key lights). The result must look like a professional Nike brand campaign or Apple marketing asset.

DESIGN DIRECTIVE:
If a mask is provided, apply changes only to the white regions. 
Focus on fabric physics, accurate team typography, and realistic shadows.`;
