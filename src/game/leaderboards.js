export const STEAM_LEADERBOARDS = Object.freeze([
  {
    id: 'rank_points',
    apiName: 'RANK_POINTS',
    displayName: 'Rank Points',
    description: 'Account rank points used for the first Steam leaderboard.',
    sortMethod: 'descending',
    displayType: 'numeric',
    uploadPolicy: 'keep_best',
    scoreSource: 'account.rankPoints',
    releasePhase: 2,
  },
]);

export function getLeaderboardById(id) {
  return STEAM_LEADERBOARDS.find(board => board.id === id);
}
