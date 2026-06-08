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
