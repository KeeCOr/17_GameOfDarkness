export const BOT_PROFILES = Object.freeze([
  { id: 'kr-lee', name: 'AI Lee', flag: 'KR', flagIcon: '🇰🇷', country: 'Korea' },
  { id: 'jp-sato', name: 'AI Sato', flag: 'JP', flagIcon: '🇯🇵', country: 'Japan' },
  { id: 'us-miller', name: 'AI Miller', flag: 'US', flagIcon: '🇺🇸', country: 'United States' },
  { id: 'de-weber', name: 'AI Weber', flag: 'DE', flagIcon: '🇩🇪', country: 'Germany' },
  { id: 'fr-moreau', name: 'AI Moreau', flag: 'FR', flagIcon: '🇫🇷', country: 'France' },
  { id: 'br-silva', name: 'AI Silva', flag: 'BR', flagIcon: '🇧🇷', country: 'Brazil' },
  { id: 'gb-carter', name: 'AI Carter', flag: 'GB', flagIcon: '🇬🇧', country: 'United Kingdom' },
  { id: 'in-rao', name: 'AI Rao', flag: 'IN', flagIcon: '🇮🇳', country: 'India' },
  { id: 'ca-brooks', name: 'AI Brooks', flag: 'CA', flagIcon: '🇨🇦', country: 'Canada' },
  { id: 'au-clarke', name: 'AI Clarke', flag: 'AU', flagIcon: '🇦🇺', country: 'Australia' },
]);

function hashSeed(value) {
  let hash = 0;
  const text = String(value);
  for (let i = 0; i < text.length; i++)
    hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

export function getBotProfileForMatch(seed = 'Player', mmr = 1000) {
  const index = hashSeed(`${seed}:${mmr}`) % BOT_PROFILES.length;
  return BOT_PROFILES[index];
}

export function formatBotLabel(profile) {
  if (!profile) return 'AI';
  return `${profile.flagIcon || profile.flag} ${profile.name}`;
}
