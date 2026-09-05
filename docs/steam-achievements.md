# Chess of Dark — Steam Achievements

*Standard format. Full design doc: `Steam_Achievements_설계.md`*

---

## Stats

| API Name | Type | Description |
|----------|------|-------------|
| `STAT_GAMES_PLAYED` | INT | Total games played |
| `STAT_GAMES_WON` | INT | Total wins |
| `STAT_HARD_WINS` | INT | Hard mode wins |
| `STAT_WIN_STREAK` | INT | Current win streak |
| `STAT_FASTEST_WIN_SECONDS` | INT | Fastest win (seconds) |
| `STAT_SUMMONS_TOTAL` | INT | Total pieces summoned |
| `STAT_CAPTURES_TOTAL` | INT | Total pieces captured |
| `STAT_PROMOTIONS_TOTAL` | INT | Total pawn promotions |
| `STAT_CHECKS_GIVEN` | INT | Total checks delivered |

---

## Achievements

| API Name | EN Name | KO Name | How to Unlock |
|----------|---------|---------|---------------|
| `ACH_TUTORIAL_COMPLETE` | Summoner Initiate | 소환술 입문 | Complete the tutorial |
| `ACH_FIRST_SUMMON` | First Summon | 첫 소환 | Summon your first piece |
| `ACH_FIRST_CAPTURE` | First Trophy | 첫 전리품 | Capture an enemy piece |
| `ACH_FIRST_CHECK` | King in Sight | 왕을 겨누다 | Deliver your first check |
| `ACH_FIRST_PROMOTION` | Light of Promotion | 승급의 빛 | Promote a pawn to any piece |
| `ACH_FIRST_WIN` | First Victory | 첫 승리 | Win your first game |
| `ACH_EASY_WIN` | Bright-Eyed Tactician | 시야를 밝히는 자 | Win on Easy difficulty |
| `ACH_MEDIUM_WIN` | Balance of Battle | 전장의 균형 | Win on Normal difficulty |
| `ACH_HARD_WIN` | Hard Mode Conqueror | 어려움 정복 | Win on Hard difficulty |
| `ACH_FAST_WIN` | Three-Minute Commander | 3분의 지휘관 | Win with 60+ seconds remaining |
| `ACH_WIN_STREAK_3` | Threefold Momentum | 세 번의 흐름 | Win 3 games in a row |
| `ACH_SUMMON_ALL_PIECE_TYPES` | Complete Summoning Circle | 완성된 소환진 | Summon knight, bishop, rook, and queen in one game |

---

## Implementation

- Defined in: `src/game/achievements.js`
- Tests: `tests/AchievementsCatalog.test.js`
- Steam API: `ISteamUserStats` (`ActivateAchievement`, `GetAchievement`, `SetStat`, `StoreStats`)
- All achievements are unlockable in single-player without internet
- Online/ranked achievements deferred to Phase 3

## Notes

- Replace App ID 480 with real Steamworks App ID before submission
- Icon assets: reference `ChessSummon_UI_리소스_목록.md`
- Phase 3 additions: leaderboard-tied achievements, online match milestones
