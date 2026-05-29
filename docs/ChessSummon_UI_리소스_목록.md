# Chess Summon UI Resource List

## Goal

Make combat state changes readable at a glance. The first polish pass focuses on three moments that currently feel too quiet:

- Check: the player must instantly notice the king is under threat.
- Capture: a defeated piece should feel like a decisive hit, not a silent replacement.
- Promotion: reaching the back rank should feel like a reward moment.

## Required UI Resources

| ID | Type | File | Purpose |
| --- | --- | --- | --- |
| `button-primary` | Button frame | `public/assets/ui/button-primary.svg` | Primary actions, menu choices, confirmation buttons |
| `button-danger` | Button frame | `public/assets/ui/button-danger.svg` | Surrender/destructive action buttons |
| `frame-hud-panel` | Panel frame | `public/assets/ui/frame-hud-panel.svg` | Right HUD and modal frame reference |
| `state-check-alert` | State indicator | `public/assets/ui/state-check-alert.svg` | Check warning visual language |
| `fx-capture-impact` | Combat effect | `public/assets/ui/fx-capture-impact.svg` | Capture slash and impact reference |
| `fx-promotion-burst` | Combat effect | `public/assets/ui/fx-promotion-burst.svg` | Promotion burst/crown reference |

## Implementation Notes

- Current game effects are code-native Phaser graphics, so they scale cleanly without introducing bitmap blur.
- SVG files are saved as reusable visual references and future asset hooks.
- `src/ui/effects.js` owns the resource catalog and combat feedback helpers.
- `GameScene` now calls dedicated effects for capture, promotion, and check.

## Follow-Up Candidates

- Add short sound cues for check, capture, promotion, and game over.
- Replace code-native effects with sprite sheets only if animation quality needs frame-by-frame control.
- Add result screen variants for king capture versus checkmate.
