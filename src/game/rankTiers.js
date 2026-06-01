export const RANK_TIERS = Object.freeze([
  { id: 'bronze', label: 'Bronze', minMMR: 0, icon: 'public/assets/rank/mmr-bronze.svg' },
  { id: 'silver', label: 'Silver', minMMR: 900, icon: 'public/assets/rank/mmr-silver.svg' },
  { id: 'gold', label: 'Gold', minMMR: 1100, icon: 'public/assets/rank/mmr-gold.svg' },
  { id: 'platinum', label: 'Platinum', minMMR: 1300, icon: 'public/assets/rank/mmr-platinum.svg' },
  { id: 'diamond', label: 'Diamond', minMMR: 1500, icon: 'public/assets/rank/mmr-diamond.svg' },
  { id: 'master', label: 'Master', minMMR: 1750, icon: 'public/assets/rank/mmr-master.svg' },
]);

export function getRankTierForMMR(mmr = 0) {
  const score = Math.max(0, Number(mmr) || 0);
  let tier = RANK_TIERS[0];
  for (const candidate of RANK_TIERS) {
    if (score >= candidate.minMMR) tier = candidate;
  }
  return tier;
}
