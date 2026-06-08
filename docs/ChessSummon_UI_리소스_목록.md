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
- v0.1.46 aligns the stage background, logo, and brand mark with the dark metal/gold button palette so the UI no longer feels visually split.
- v0.1.45 button frames use edge-focused highlights and dark centers so text remains readable on 9:16 mobile layouts.

## Follow-Up Candidates

- Add short sound cues for check, capture, promotion, and game over.
- Replace code-native effects with sprite sheets only if animation quality needs frame-by-frame control.
- Add result screen variants for king capture versus checkmate.
