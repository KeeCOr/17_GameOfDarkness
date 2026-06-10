# Chess Summon UI Resource List

## Goal

Make combat state changes readable at a glance. The first polish pass focuses on three moments that currently feel too quiet:

- Check: the player must instantly notice the king is under threat.
- Capture: a defeated piece should feel like a decisive hit, not a silent replacement.
- Promotion: reaching the back rank should feel like a reward moment.

## Required UI Resources

| ID | Type | File | Purpose |
| --- | --- | --- | --- |
| `button-primary` | Button frame | `public/assets/ui/button-primary.svg` | High-contrast dark metal frame for primary actions, menu choices, confirmation buttons |
| `button-danger` | Button frame | `public/assets/ui/button-danger.svg` | High-contrast dark crimson frame for surrender/destructive action buttons |
| `frame-hud-panel` | Panel frame | `public/assets/ui/frame-hud-panel.svg` | Right HUD and modal frame reference |
| `state-check-alert` | State indicator | `public/assets/ui/state-check-alert.svg` | Check warning visual language |
| `fx-capture-impact` | Combat effect | `public/assets/ui/fx-capture-impact.svg` | Capture slash and impact reference |
| `fx-promotion-burst` | Combat effect | `public/assets/ui/fx-promotion-burst.svg` | Promotion burst/crown reference |
| `brand-logo` | Brand | `public/assets/brand/chesssummon-logo.svg` | Full logo for title, store, and promotional layouts |
| `brand-mark` | Brand | `public/assets/brand/chesssummon-mark.svg` | Compact crown/summon mark for app icons and capsules |
| `ingame-entry-mockup` | Concept mockup | `docs/assets/chesssummon-ingame-entry-mockup-v0.1.53.png` | 9:16 battle-entry mood reference for first-turn presentation and store screenshot direction |
| `mmr-bronze` | Rank icon | `public/assets/rank/mmr-bronze.svg` | Bronze MMR tier badge |
| `mmr-silver` | Rank icon | `public/assets/rank/mmr-silver.svg` | Silver MMR tier badge |
| `mmr-gold` | Rank icon | `public/assets/rank/mmr-gold.svg` | Gold MMR tier badge |
| `mmr-platinum` | Rank icon | `public/assets/rank/mmr-platinum.svg` | Platinum MMR tier badge |
| `mmr-diamond` | Rank icon | `public/assets/rank/mmr-diamond.svg` | Diamond MMR tier badge |
| `mmr-master` | Rank icon | `public/assets/rank/mmr-master.svg` | Master MMR tier badge |

## Implementation Notes

- Current game effects are code-native Phaser graphics, so they scale cleanly without introducing bitmap blur.
- SVG files are saved as reusable visual references and future asset hooks.
- `src/ui/effects.js` owns the resource catalog and combat feedback helpers.
- `GameScene` now calls dedicated effects for capture, promotion, and check.
- `src/game/rankTiers.js` maps MMR values to the rank icon set.
- `src/game/botProfiles.js` gives AI fallback opponents international flag/name profiles.
- v0.1.71 adds a dedicated checkmate flash, burst, camera shake, CHECKMATE label, and result copy.
- v0.1.70 recharges a side to 10 seconds at turn start when its chess clock is at 10 seconds or less.
- v0.1.69 keeps AI turn thinking at 3-5 seconds while restoring the chess clock limit to three minutes per side.
- v0.1.68 sets AI turn thinking to 3-5 seconds and restores the chess clock limit to five minutes per side.
- v0.1.67 restores the full single/multiplayer mode-select entry flow for Steam-channel builds while keeping test-channel difficulty direct entry.
- v0.1.66 skips the mode-select screen for test distribution and opens directly on difficulty selection.
- v0.1.65 aligns the board grid/frame width with the summon panel and compresses the top HUD to give the board more room.
- v0.1.64 restores vision from every allied move and attack zone while keeping the Easy full-board reveal branch removed.
- v0.1.63 limits move-path visibility to the currently selected player piece so medium games do not reveal most of the board after long-range summons.
- v0.1.62 removes the Easy-difficulty full-board reveal branch so fog-of-war remains active on the player-facing board.
- v0.1.61 removes the regular turn banner background and changes it to a floating fade-up text cue so the board remains readable.
- v0.1.60 adds timeout-specific result copy so flag-fall losses read differently from king capture or checkmate losses.
- v0.1.59 removes the summon panel helper copy and enlarges summon card rows, icons, and spacing while preserving mana/footer clearance.
- v0.1.58 stabilizes replay by deferring result-screen restarts and wiring scene shutdown cleanup for timers and event listeners.
- v0.1.57 ensures tutorial confirmation button backgrounds are included in overlay cleanup so popup button art cannot remain after advancing.
- v0.1.56 enlarges the in-game board cells and gives non-pawn pieces a larger display size so major silhouettes spill beyond their cells.
- v0.1.55 centers the single-line top HUD hint and removes the separate current-turn text label, relying on clock emphasis for turn state.
- v0.1.54 displays both player and opponent chess clocks in the top HUD, keeps the turn hint to one line, and expands help modal spacing.
- v0.1.53 adds a first-turn battle entry overlay using existing chess piece textures and Phaser graphics, guided by the generated entry mockup.
- v0.1.52 compresses the top HUD timer and moves board guidance into the top HUD via `hint-change` events.
- v0.1.51 enlarges the board grid and retunes the vertical layout to use portrait space more efficiently without HUD overlap.
- v0.1.50 slightly enlarges board pieces and their shadows so piece silhouettes can spill beyond cell edges without overwhelming the board.
- v0.1.49 widens the board hint frame and wraps hint text so long Korean guidance stays inside the visible panel.
- v0.1.48 increases vertical clearance in the summon HUD so the hint, summon cards, mana gauge, and footer buttons stay separated.
- v0.1.47 writes the current mana count directly on the summon-panel mana gauge using a high-contrast outlined label.
- v0.1.46 aligns the stage background, logo, and brand mark with the dark metal/gold button palette so the UI no longer feels visually split.
- v0.1.45 button frames use edge-focused highlights and dark centers so text remains readable on 9:16 mobile layouts.

## Follow-Up Candidates

- Add short sound cues for check, capture, promotion, and game over.
- Replace code-native effects with sprite sheets only if animation quality needs frame-by-frame control.
- Add result screen variants for king capture versus checkmate.
