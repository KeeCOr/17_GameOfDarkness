# ChessSummon Asset Regeneration — Design Spec
**Date:** 2026-06-23  
**Scope:** 39 game images (12 chess pieces + 19 UI + 2 brand + 6 rank)  
**Method:** Full AI generation via `codex-image:style-gen`

---

## Visual Language

### Palette
| Token | Hex | Usage |
|-------|-----|-------|
| Deep Navy | `#0d1128` ~ `#1a1f3e` | Backgrounds, panel fills |
| Gold / Amber | `#c8a84b` ~ `#e6c56a` | Borders, ornaments, active states |
| Teal Glow | `#00d4ff` ~ `#00ffee` | Gem accents, player energy, highlights |
| Shadow Mist | `#1a0a2e` | Dark team energy base |
| Crimson | `#c0392b` | Threat/danger highlights |
| Mana Violet | `#7f5af0` | Mana crystal, summon glow |

### Mood
Dark fantasy — magical, epic, layered atmosphere. Glowing rune inscriptions on panels. Rich metallic textures. Depth via multiple layers of ornamental borders.

### Style Reference Files
- `assets_current/assets/ui/title-button-frame.png` — gold ornamental frame
- `assets_current/assets/ui/title-background.png` — dark navy starfield backdrop

---

## Section 1: Chess Pieces (12 images)
**Size:** 72 × 72 px, transparent PNG  
**Style:** Icon-style top-down view, no cast shadow, centered on transparent

### White Team (Player) — Gold / Ivory / Magical Glow
Warm gold metallic body, ivory/cream highlights, soft teal-cyan magical aura/glow rim.

| File | Description |
|------|-------------|
| `pieces/pawn_w.png` | Gold-armored pawn with teal gem on chest |
| `pieces/rook_w.png` | Ivory-stone fortress tower, gold battlements, teal crystal window |
| `pieces/knight_w.png` | Golden knight helm with visor, teal eye-glow |
| `pieces/bishop_w.png` | Gold mitre hat, ivory robes, teal holy light staff tip |
| `pieces/queen_w.png` | Ornate gold crown, flowing ivory cloak, teal gem centerpiece |
| `pieces/king_w.png` | Majestic gold crown, ivory armor, radiating teal magic aura |

### Dark Team (Enemy) — Obsidian / Shadow Metal / Purple-Dark Cyan Energy
Matte dark metal / obsidian body, purple/dark-cyan energy channels, sinister glow.

| File | Description |
|------|-------------|
| `pieces/pawn_d.png` | Obsidian-armored grunt with purple rune gem |
| `pieces/rook_d.png` | Dark iron tower with purple energy cracks |
| `pieces/knight_d.png` | Shadow knight skull helm, purple smoke emanating |
| `pieces/bishop_d.png` | Dark ceremonial hat, black robes, dark-cyan arcane sigil |
| `pieces/queen_d.png` | Obsidian jagged crown, dark cloak, dark-cyan eye glow |
| `pieces/king_d.png` | Horned shadow king crown, dark-cyan spectral aura, ominous silhouette |

---

## Section 2: UI Images (19 images)

### Board Cells (3 images) — 80 × 80 px
| File | Description |
|------|-------------|
| `ui/game-board-cell-light.png` | Soft `#84889c` square with subtle gold edge |
| `ui/game-board-cell-dark.png` | Deep `#282d55` square with subtle inner vignette |
| `ui/game-board-fog-cell.png` | Dark cell with swirling fog overlay, opacity mask style |

### Cell Highlights (5 images) — 80 × 80 px overlay, mostly transparent
| File | Color / Style |
|------|--------------|
| `ui/game-cell-highlight-move.png` | Teal `#00d4ff` pulsing dot center |
| `ui/game-cell-highlight-selected.png` | Gold `#e6c56a` bright corner marks |
| `ui/game-cell-highlight-movable.png` | Soft green `#27ae60` chevron arrow hint |
| `ui/game-cell-highlight-threat.png` | Crimson `#e74c3c` danger ring |
| `ui/game-cell-highlight-summon.png` | Mana violet `#7f5af0` summoning circle |

### HUD Frames (5 images)
| File | Size | Description |
|------|------|-------------|
| `ui/game-top-hud-frame.png` | 960 × 60 px | Thin dark panel, gold top edge, turn info area |
| `ui/game-bottom-hud-frame.png` | 960 × 160 px | Thick dark panel, ornate gold border, summon card area |
| `ui/game-board-frame.png` | 640 × 640 px | Ornate gold border around chess board, rune corner decorations |
| `ui/game-mana-frame.png` | 180 × 48 px | Small panel with mana gauge, violet accents |
| `ui/game-action-button-frame.png` | 200 × 56 px | Crimson/red button frame, danger variant |

### Summon UI (2 images)
| File | Size | Description |
|------|------|-------------|
| `ui/game-summon-card-frame.png` | 100 × 140 px | Portrait card frame, gold ornate border, dark fill |
| `ui/game-summon-tile-frame.png` | 80 × 80 px | Square tile with violet summoning rune border |

### Other UI (4 images)
| File | Size | Description |
|------|------|-------------|
| `ui/game-mana-crystal.png` | 32 × 32 px | Glowing violet mana gem, faceted crystal shape |
| `ui/game-clock-chip-player.png` | 140 × 40 px | Teal-accented timer chip, "PLAYER" label area |
| `ui/game-clock-chip-enemy.png` | 140 × 40 px | Purple-accented timer chip, "ENEMY" label area |
| `ui/result-trophy.png` | 200 × 200 px | Fantasy golden trophy with chess king silhouette, glowing aura |

---

## Section 3: Brand Images (2 images)

| File | Size | Description |
|------|------|-------------|
| `brand/chesssummon-mark.png` | 128 × 128 px | App icon mark — chess king piece silhouette with summoning circle, gold on dark |
| `brand/title-logo-ornament.png` | 600 × 80 px | Horizontal decorative banner — thin gold line with central diamond gem and flanking rune patterns |

---

## Section 4: Rank Badges (6 images)
**Size:** 64 × 64 px  
**Style:** Circular or shield emblem with material + chess motif  
**Progression:** Bronze → Silver → Gold → Platinum → Diamond → Master

| File | Material | Color Scheme |
|------|----------|-------------|
| `rank/mmr-bronze.png` | Worn copper/bronze | `#b87333` warm amber |
| `rank/mmr-silver.png` | Polished silver | `#c0c0c0` cool chrome |
| `rank/mmr-gold.png` | Gleaming gold | `#ffd700` rich gold |
| `rank/mmr-platinum.png` | Platinum alloy | `#e8e8e8` + blue tint |
| `rank/mmr-diamond.png` | Faceted diamond | `#00ffee` teal-white brilliance |
| `rank/mmr-master.png` | Dark master crown | `#7f5af0` purple aura + dark metal |

Each badge has: outer circle, material texture, chess king piece miniature in center, rank name below.

---

## Delivery

All generated images go to:
- `public/assets/{brand,pieces,rank,ui}/` — game active folder
- `assets_current/assets/{brand,pieces,rank,ui}/` — reference archive

Images that are already acceptable in `assets_current/assets/ui/` and should NOT be regenerated:
- `title-background.png`, `title-button-frame.png`, `game-background.png`, `game-piece-shadow.png`, `battle-entry-plate.png`
- `brand/chesssummon-logo.png`
- All 12 pieces in `pieces/` (will be replaced by dark fantasy versions)
