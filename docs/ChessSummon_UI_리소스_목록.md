# Chess of Dark UI Resource List

## Goal

Make combat state changes readable at a glance. The first polish pass focuses on three moments that currently feel too quiet:

- Check: the player must instantly notice the king is under threat.
- Capture: a defeated piece should feel like a decisive hit, not a silent replacement.
- Promotion: reaching the back rank should feel like a reward moment.

## Required UI Resources

| ID | Type | File | Purpose |
| --- | --- | --- | --- |
| `button-primary` | Button frame | `public/assets/ui/title-button-frame.png` | High-contrast dark metal frame for primary actions, menu choices, confirmation buttons |
| `button-danger` | Button frame | `public/assets/ui/game-action-button-frame.png` | High-contrast dark crimson frame for surrender/destructive action buttons |
| `stage-background` | Stage background | `public/assets/ui/game-background.png` | Dark stone/gold/cyan background shared by title and gameplay stages |
| `title-background` | Title bitmap | `public/assets/ui/title-background.png` | Generated 9:16 gothic chess hall background for the start screen |
| `title-button-frame` | Title button bitmap | `public/assets/ui/title-button-frame.png` | Generated dark metal/gold/cyan button frame for start and difficulty buttons |
| `game-background` | Gameplay bitmap | `public/assets/ui/game-background.png` | Dark gothic gameplay backdrop derived for the active play screen |
| `game-top-hud-frame` | Gameplay HUD bitmap | `public/assets/ui/game-top-hud-frame.png` | Wide top clock HUD frame for player/opponent timers and hint text |
| `game-board-frame` | Gameplay board bitmap | `public/assets/ui/game-board-frame.png` | Generated dark metal/gold/cyan frame used behind the active 5x5 board |
| `game-summon-card-frame` | Gameplay card bitmap | `public/assets/ui/game-summon-card-frame.png` | Wide dark metal summon-card frame for each recruit row |
| `game-summon-tile-frame` | Gameplay card bitmap | `public/assets/ui/game-summon-tile-frame.png` | Vertical summon tile frame for the horizontal recruit-card layout |
| `game-mana-frame` | Gameplay mana bitmap | `public/assets/ui/game-mana-frame.png` | Thin dark metal frame for the mana gauge |
| `game-action-button-frame` | Gameplay button bitmap | `public/assets/ui/game-action-button-frame.png` | Dark metal action frame for turn-end and surrender buttons |
| `frame-top-hud` | HUD frame | `public/assets/ui/game-top-hud-frame.png` | Generated top clock HUD frame based on the approved play-screen direction |
| `frame-hud-panel` | Panel frame | `public/assets/ui/game-bottom-hud-frame.png` | Right HUD and modal frame reference |
| `frame-summon-card` | Summon frame | `public/assets/ui/game-summon-card-frame.png` | Generated summon-row frame for in-game piece recruitment controls |
| `frame-mana` | Mana frame | `public/assets/ui/game-mana-frame.png` | Generated mana gauge frame with cyan/gold accents |
| `battle-entry-plate` | Cropped bitmap | `public/assets/ui/battle-entry-plate.png` | Cropped battle-start plate from the approved gameplay mockup for the in-game entry overlay |
| `state-check-alert` | State indicator | `src/ui/effects.js` | Check warning visual language |
| `fx-capture-impact` | Combat effect | `src/ui/effects.js` | Capture slash and impact reference |
| `fx-promotion-burst` | Combat effect | `src/ui/effects.js` | Promotion burst/crown reference |
| `brand-logo` | Brand | `public/assets/brand/chesssummon-logo.png` | Generated 3D metallic Chess of Dark bitmap wordmark with a crown crest, gold lettering, and cyan jewel accents |
| `brand-mark` | Brand | `public/assets/brand/chesssummon-mark.png` | Compact crown/summon mark for app icons and capsules |
| `title-logo-ornament` | Brand bitmap | `public/assets/brand/title-logo-ornament.png` | Generated gold king ornament behind the title logo |
| `ingame-entry-mockup` | Concept mockup | `docs/assets/chesssummon-ingame-entry-mockup-v0.1.53.png` | 9:16 battle-entry mood reference for first-turn presentation and store screenshot direction |
| `mmr-bronze` | Rank icon | `public/assets/rank/mmr-bronze.png` | Bronze MMR tier badge |
| `mmr-silver` | Rank icon | `public/assets/rank/mmr-silver.png` | Silver MMR tier badge |
| `mmr-gold` | Rank icon | `public/assets/rank/mmr-gold.png` | Gold MMR tier badge |
| `mmr-platinum` | Rank icon | `public/assets/rank/mmr-platinum.png` | Platinum MMR tier badge |
| `mmr-diamond` | Rank icon | `public/assets/rank/mmr-diamond.png` | Diamond MMR tier badge |
| `mmr-master` | Rank icon | `public/assets/rank/mmr-master.png` | Master MMR tier badge |

## Implementation Notes

- Current game effects are code-native Phaser graphics, so they scale cleanly without introducing bitmap blur.
- SVG files are saved as reusable visual references and future asset hooks.
- `src/ui/effects.js` owns the resource catalog and combat feedback helpers.
- `GameScene` now calls dedicated effects for capture, promotion, and check.
- `src/game/rankTiers.js` maps MMR values to the rank icon set.
- `src/game/botProfiles.js` gives AI fallback opponents international flag/name profiles.
- v0.2.17 adds `result-trophy.png`, removes the `SINGLE MMR` text label from the result screen, and enlarges the rating frame so score text stays inside the frame.
- v0.2.16 lowers the result screen `다시하기` and `메인 메뉴` labels inside the title button frames with a result-specific text offset.
- v0.2.15 regenerates the in-game top HUD, bottom HUD, summon tile, mana, and action button PNG frames from `scripts/generate_ui_frames.cjs`; `game-bottom-hud-frame.png` now frames the whole lower HUD and summon cards are widened to match the reference mockup proportions.
- v0.2.14 replaces the multiplayer lobby text title with the shared title logo and moves the lobby copy/buttons below the logo stack.
- v0.2.13 lowers difficulty label/hint copy inside the title button frame and dims the locked Very Hard button via the disabled button art state.
- v0.2.12 simplifies the result screen into a single-player MMR movement plate and removes the old outcome/reason text stack from the rendered result view.
- v0.2.11 enlarges the in-game footer action buttons to 60px height using the `chesssummon-ingame-entry-mockup-v0.1.53.png` bottom-button proportions as the reference.
- v0.2.10 adds `LAYOUT.PIECE_BOARD_LIFT` and raises in-game/placement board piece sprites by 6px while preserving shared bottom-edge alignment.
- v0.2.9 lowers the multiplayer lobby queue/back button labels and the difficulty-menu back label inside the title-frame artwork.
- v0.2.8 lowers difficulty-button label/hint copy by 6px and changes the menu release badge to a bottom-only `vX.Y.Z` label without the Desktop channel word.
- v0.2.7 lowers the start-screen brand logo center from y=165 to y=180 for better vertical balance above the mode buttons.
- v0.2.6 aligns menu-adjacent screens (placement, tutorial prompt, multiplayer lobby, and result) with the start-screen title background and title button frame so the pre/post-game flow uses one visual language.
- v0.2.5 reintroduces the gameplay board frame as a generated project PNG that matches the current dark metal/gold/cyan UI tone and replaces the active runtime graphics frame when the texture is available.
- v0.1.93 adds a Steam store asset requirement catalog and a store submission package document covering capsules, screenshots, trailers, and store copy.
- v0.1.92 adds a testable Steam release readiness checklist module and a submission QA checklist document for build, store, Steamworks, and manual QA blockers.
- v0.1.91 keeps the locked Very Hard option in the same full-bright 92px title-button format as the other difficulties while preserving the locked start behavior.
- v0.1.90 removes the separate single-player/difficulty-select headings and moves difficulty hint copy into taller 92px buttons with 100px hit areas.
- v0.1.89 removes the start-screen subtitle copy and reduces single/multiplayer button text from 24px to 22px so the labels fit the title button frame more comfortably.
- v0.1.88 replaces the flat title SVG with a generated transparent 3D metallic PNG logo and displays it at 410x205 so the start screen matches the approved rendered art direction.
- v0.1.87 adds a Steam leaderboard summary slot to the multiplayer lobby so the release build has an in-game surface for `RANK_POINTS` lookup results.
- v0.1.86 aligns the Electron portable window content area to the 450x800 game canvas so desktop launches no longer start with wide empty space around the portrait layout.
- v0.1.85 restyles the defeat/result screen as a dark metal result plate with a cracked crown motif, stronger defeat-state contrast, and larger bottom action buttons.
- v0.1.84 removes the gameplay board bitmap frame from the active resource set because it did not match the in-game tone. The board now uses a code-drawn dark panel with restrained gold lines.
- v0.1.83 separates the battle-entry text band from the king-versus-king image band to avoid visual overlap during the intro.
- v0.1.82 lowers/enlarges the integrated title wordmark and increases title/difficulty button heights for roomier text and touch padding.
- v0.1.81 changes the title logo from a separated symbol-plus-text composition to an integrated wordmark and stops rendering the separate title ornament behind it.
- v0.1.80 regenerates the title logo as a larger high-contrast SVG wordmark and removes the mode-select title text from the start screen.
- v0.1.79 replaces the title logo with a heraldic dark-fantasy SVG wordmark while keeping the existing `brand_logo` load key.
- v0.1.78 changes the gameplay summon area from a vertical list to five horizontal cards, adds the summon-tile frame, and repositions the title/difficulty menu around the generated title button frame.
- v0.1.77 adds gameplay-specific PNG background, top HUD, board, summon, mana, and action-button frames and wires them into GameScene/UIScene.
- v0.1.76 adds generated PNG title background, button frame, and logo ornament assets and wires them into the menu screen.
- v0.1.75 replaces the boxed logo with a larger metallic wordmark and connects gameplay staging to the shared dark stone background.
- v0.1.74 strengthens Hard AI checkmate/check-pressure choices and locks Very Hard until the Hard clear achievement is unlocked.
- v0.1.73 renames the visible game brand to Chess of Dark and adds generated/cropped stage, HUD, summon-card, mana, and battle-entry resources from the approved screen direction.
- v0.1.72 adds the Very Hard difficulty option to menu/replay/placement flows and connects high-rank AI fallback matches to it.
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
