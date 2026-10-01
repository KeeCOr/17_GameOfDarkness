# Multiplayer and MMR Release Assessment

Updated: 2026-06-17  
Version: v0.2.0

## Conclusion

Multiplayer and MMR code readiness has moved from AI fallback only to a minimal server-authoritative public PvP path. The build can now run matched human PvP through a shared server session, while final public release still requires two-account Steam client QA, Steam App ID setup, and live Steamworks validation.

| Item | Current state | Launch judgment |
| --- | --- | --- |
| AI fallback matchmaking | Implemented | OK for first Steam release |
| Local MMR/rank point save | Implemented with JSON rank store | OK for testing and ranked result storage |
| Steam leaderboard adapter | Implemented as an optional upload path | Needs Steam App ID and SDK QA |
| Two-human online match | Server-authoritative session path implemented | Needs manual two-account QA before store claim |
| Official ranked MMR | Server-generated result path implemented | Code-ready, external Steam QA still required |

## What Already Works

- `server/multiplayerCore.cjs` puts two queued clients into a room and creates a `pvpSession.cjs` server-owned board state.
- `server/pvpSession.cjs` validates wrong-turn, wrong-owner, illegal move, illegal summon, game-over, resign, and disconnect forfeit cases.
- Legacy client-provided `matchResult` messages are ignored; rank changes are recorded only from server-generated PvP results.
- `SteamService.getSteamId()` flows through Electron IPC/preload and `MultiplayerLobbyScene` adds it to the matchmaking WebSocket query when available.
- `MultiplayerLobbyScene` starts `Game` with `pvpSession` and `pvpSocket`; `GameScene` sends move, summon, and end-turn as `pvpCommand` messages and restores server snapshots.
- AI fallback matchmaking remains available when no opponent is found.

## Remaining External QA Before Public Store Claim

- Confirm Steam App ID and `steamworks.js` runtime in the real Steam client.
- Run two separate Steam accounts through queue matching, move, summon, end turn, resign, and disconnect forfeit cases.
- Confirm Steam Overlay and Steam ID are available in the packaged build.
- Confirm `RANK_POINTS` leaderboard upload after server-generated rank changes.
- Decide whether reconnect is required for launch or documented as post-launch hardening.

## Recommended Steam Launch Scope

First Steam release can now describe PvP as code-ready only after manual two-account QA passes. Until that QA is complete, store copy should still emphasize single-player first and avoid over-promising ranked stability.

## Code Readiness Gate

The release gate lives in `src/multiplayer/releaseReadiness.js`.

- `ai_fallback` is complete for the first Steam release.
- `public_pvp` now passes code readiness checks.
- Steamworks account/overlay/leaderboard verification remains part of the broader Steam submission QA checklist.
