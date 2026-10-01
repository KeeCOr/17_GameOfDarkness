# ChessSummon Asset Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate 39 dark-fantasy game images (12 chess pieces, 19 UI, 2 brand, 6 rank badges) using AI and deploy them to the game's asset folder.

**Architecture:** Each task generates a batch of related images via `codex-image:style-gen` skill, then copies results to both `public/assets/` (game-active) and `assets_current/assets/` (reference archive). No code changes — assets only. Style anchored to two kept reference images.

**Tech Stack:** Phaser 3.87, `codex-image:style-gen` skill, PowerShell file copy

---

## Style Reference Files
- `C:\Development\17_DC\assets_current\assets\ui\title-button-frame.png` — gold ornamental frame style
- `C:\Development\17_DC\assets_current\assets\ui\title-background.png` — dark navy starfield backdrop style

## Output Directories
- Game active: `C:\Development\17_DC\public\assets\{pieces,ui,brand,rank}\`
- Reference: `C:\Development\17_DC\assets_current\assets\{pieces,ui,brand,rank}\`

---

## Task 1: White Chess Pieces (6 images)

**Files:**
- Create: `public/assets/pieces/pawn_w.png`
- Create: `public/assets/pieces/rook_w.png`
- Create: `public/assets/pieces/knight_w.png`
- Create: `public/assets/pieces/bishop_w.png`
- Create: `public/assets/pieces/queen_w.png`
- Create: `public/assets/pieces/king_w.png`

- [ ] **Step 1: Generate pawn_w**

Use `codex-image:style-gen` with:
- style_ref: `assets_current/assets/ui/title-button-frame.png`
- prompt: `Dark fantasy chess PAWN icon, top-down overhead view, gold armor plating with ivory highlights, teal magical gem on chest center, glowing teal aura rim, transparent background, 72x72 pixel game asset, single isolated piece, clean edges, no drop shadow`
- output: `public/assets/pieces/pawn_w.png`

- [ ] **Step 2: Generate rook_w**

Use `codex-image:style-gen` with:
- style_ref: `assets_current/assets/ui/title-button-frame.png`
- prompt: `Dark fantasy chess ROOK tower icon, top-down overhead view, ivory-stone fortress battlements with gold trim, teal crystal window glow at center, magical rune carvings on walls, transparent background, 72x72 pixel game asset, single isolated piece, no drop shadow`
- output: `public/assets/pieces/rook_w.png`

- [ ] **Step 3: Generate knight_w**

Use `codex-image:style-gen` with:
- style_ref: `assets_current/assets/ui/title-button-frame.png`
- prompt: `Dark fantasy chess KNIGHT helm icon, top-down overhead view, golden visor helm with ivory plate armor, teal glowing eye slit, ornate gold plume on top, transparent background, 72x72 pixel game asset, single isolated piece, no drop shadow`
- output: `public/assets/pieces/knight_w.png`

- [ ] **Step 4: Generate bishop_w**

Use `codex-image:style-gen` with:
- style_ref: `assets_current/assets/ui/title-button-frame.png`
- prompt: `Dark fantasy chess BISHOP icon, top-down overhead view, gold ornate mitre hat, ivory flowing holy robes, teal glowing staff tip with divine light, sacred symbols on robe, transparent background, 72x72 pixel game asset, single isolated piece, no drop shadow`
- output: `public/assets/pieces/bishop_w.png`

- [ ] **Step 5: Generate queen_w**

Use `codex-image:style-gen` with:
- style_ref: `assets_current/assets/ui/title-button-frame.png`
- prompt: `Dark fantasy chess QUEEN icon, top-down overhead view, majestic ornate gold crown, flowing ivory magical cloak, large teal gemstone centerpiece radiating light, regal golden jewelry, transparent background, 72x72 pixel game asset, single isolated piece, no drop shadow`
- output: `public/assets/pieces/queen_w.png`

- [ ] **Step 6: Generate king_w**

Use `codex-image:style-gen` with:
- style_ref: `assets_current/assets/ui/title-button-frame.png`
- prompt: `Dark fantasy chess KING icon, top-down overhead view, majestic gold crown with cross finial, resplendent ivory armor, radiating teal magical aura halo, divine golden glow, most powerful piece, transparent background, 72x72 pixel game asset, single isolated piece, no drop shadow`
- output: `public/assets/pieces/king_w.png`

- [ ] **Step 7: Copy to reference archive**

```powershell
Copy-Item "C:\Development\17_DC\public\assets\pieces\*_w.png" -Destination "C:\Development\17_DC\assets_current\assets\pieces\" -Force
```

- [ ] **Step 8: Verify 6 files exist**

```powershell
Get-ChildItem "C:\Development\17_DC\public\assets\pieces\*_w.png" | Measure-Object | Select-Object Count
```
Expected: Count = 6

- [ ] **Step 9: Commit**

```powershell
git add public/assets/pieces/pawn_w.png public/assets/pieces/rook_w.png public/assets/pieces/knight_w.png public/assets/pieces/bishop_w.png public/assets/pieces/queen_w.png public/assets/pieces/king_w.png
git commit -m "assets: add white team dark fantasy chess pieces"
```

---

## Task 2: Dark Chess Pieces (6 images)

**Files:**
- Create: `public/assets/pieces/pawn_d.png`
- Create: `public/assets/pieces/rook_d.png`
- Create: `public/assets/pieces/knight_d.png`
- Create: `public/assets/pieces/bishop_d.png`
- Create: `public/assets/pieces/queen_d.png`
- Create: `public/assets/pieces/king_d.png`

- [ ] **Step 1: Generate pawn_d**

Use `codex-image:style-gen` with:
- style_ref: `assets_current/assets/ui/title-background.png`
- prompt: `Dark fantasy chess PAWN enemy icon, top-down overhead view, matte obsidian black armor, dark metal with jagged edges, purple rune gem on chest glowing with sinister energy, faint purple aura, menacing design, transparent background, 72x72 pixel game asset, single isolated piece, no drop shadow`
- output: `public/assets/pieces/pawn_d.png`

- [ ] **Step 2: Generate rook_d**

Use `codex-image:style-gen` with:
- style_ref: `assets_current/assets/ui/title-background.png`
- prompt: `Dark fantasy chess ROOK enemy tower icon, top-down overhead view, dark iron fortress with crumbling obsidian walls, purple energy cracks running through stone, sinister purple light from window, ominous shadow metal, transparent background, 72x72 pixel game asset, single isolated piece, no drop shadow`
- output: `public/assets/pieces/rook_d.png`

- [ ] **Step 3: Generate knight_d**

Use `codex-image:style-gen` with:
- style_ref: `assets_current/assets/ui/title-background.png`
- prompt: `Dark fantasy chess KNIGHT enemy skull helm icon, top-down overhead view, dark shadow knight with skull-shaped visor, purple smoke wisps emanating from helm, obsidian horns, malevolent purple eye glow, dark metal plate armor, transparent background, 72x72 pixel game asset, single isolated piece, no drop shadow`
- output: `public/assets/pieces/knight_d.png`

- [ ] **Step 4: Generate bishop_d**

Use `codex-image:style-gen` with:
- style_ref: `assets_current/assets/ui/title-background.png`
- prompt: `Dark fantasy chess BISHOP enemy icon, top-down overhead view, dark ceremonial horned hat, tattered black robes, dark-cyan arcane sigil floating above, cursed staff tip with dark cyan eldritch glow, forbidden symbols, transparent background, 72x72 pixel game asset, single isolated piece, no drop shadow`
- output: `public/assets/pieces/bishop_d.png`

- [ ] **Step 5: Generate queen_d**

Use `codex-image:style-gen` with:
- style_ref: `assets_current/assets/ui/title-background.png`
- prompt: `Dark fantasy chess QUEEN enemy icon, top-down overhead view, obsidian jagged spiky crown, flowing dark cloak with void energy tendrils, dark-cyan glowing eyes, corrupted dark jewelry, shadowy aura radiating, transparent background, 72x72 pixel game asset, single isolated piece, no drop shadow`
- output: `public/assets/pieces/queen_d.png`

- [ ] **Step 6: Generate king_d**

Use `codex-image:style-gen` with:
- style_ref: `assets_current/assets/ui/title-background.png`
- prompt: `Dark fantasy chess KING enemy icon, top-down overhead view, horned shadow king crown, dark-cyan spectral aura halo, obsidian armor with rune engravings, ominous silhouette, the most powerful dark piece, purple-dark energy pulsing outward, transparent background, 72x72 pixel game asset, single isolated piece, no drop shadow`
- output: `public/assets/pieces/king_d.png`

- [ ] **Step 7: Copy to reference archive**

```powershell
Copy-Item "C:\Development\17_DC\public\assets\pieces\*_d.png" -Destination "C:\Development\17_DC\assets_current\assets\pieces\" -Force
```

- [ ] **Step 8: Verify 6 files exist**

```powershell
Get-ChildItem "C:\Development\17_DC\public\assets\pieces\*_d.png" | Measure-Object | Select-Object Count
```
Expected: Count = 6

- [ ] **Step 9: Commit**

```powershell
git add public/assets/pieces/pawn_d.png public/assets/pieces/rook_d.png public/assets/pieces/knight_d.png public/assets/pieces/bishop_d.png public/assets/pieces/queen_d.png public/assets/pieces/king_d.png
git commit -m "assets: add dark team dark fantasy chess pieces"
```

---

## Task 3: Board Cells (3 images)

**Files:**
- Create: `public/assets/ui/game-board-cell-light.png`
- Create: `public/assets/ui/game-board-cell-dark.png`
- Create: `public/assets/ui/game-board-fog-cell.png`

- [ ] **Step 1: Generate game-board-cell-light**

Use `codex-image:style-gen` with:
- style_ref: `assets_current/assets/ui/title-background.png`
- prompt: `Chess board square tile, light variant, muted steel blue-grey color #84889c, subtle gold beveled edge on all sides, smooth stone texture, 80x80 pixel tileable game asset, no transparency, flat tile`
- output: `public/assets/ui/game-board-cell-light.png`

- [ ] **Step 2: Generate game-board-cell-dark**

Use `codex-image:style-gen` with:
- style_ref: `assets_current/assets/ui/title-background.png`
- prompt: `Chess board square tile, dark variant, deep navy-indigo color #282d55, subtle inner vignette shadow, stone-like texture with faint rune etching, 80x80 pixel tileable game asset, no transparency, flat tile`
- output: `public/assets/ui/game-board-cell-dark.png`

- [ ] **Step 3: Generate game-board-fog-cell**

Use `codex-image:style-gen` with:
- style_ref: `assets_current/assets/ui/title-background.png`
- prompt: `Fog of war chess board tile, dark navy square with swirling mystical fog overlay, semi-transparent grey mist wisps, foggy unknown territory, 80x80 pixel game asset, dark with fog effect, no background needed outside tile`
- output: `public/assets/ui/game-board-fog-cell.png`

- [ ] **Step 4: Copy to reference archive**

```powershell
Copy-Item "C:\Development\17_DC\public\assets\ui\game-board-cell-light.png","C:\Development\17_DC\public\assets\ui\game-board-cell-dark.png","C:\Development\17_DC\public\assets\ui\game-board-fog-cell.png" -Destination "C:\Development\17_DC\assets_current\assets\ui\" -Force
```

- [ ] **Step 5: Commit**

```powershell
git add public/assets/ui/game-board-cell-light.png public/assets/ui/game-board-cell-dark.png public/assets/ui/game-board-fog-cell.png
git commit -m "assets: add dark fantasy board cell tiles"
```

---

## Task 4: Cell Highlights (5 images)

**Files:**
- Create: `public/assets/ui/game-cell-highlight-move.png`
- Create: `public/assets/ui/game-cell-highlight-selected.png`
- Create: `public/assets/ui/game-cell-highlight-movable.png`
- Create: `public/assets/ui/game-cell-highlight-threat.png`
- Create: `public/assets/ui/game-cell-highlight-summon.png`

Note: All highlights are 80×80 px overlay PNGs that sit on top of board cells. They must have transparency so the cell underneath shows through.

- [ ] **Step 1: Generate game-cell-highlight-move**

Use `codex-image:style-gen` with:
- style_ref: `assets_current/assets/ui/title-button-frame.png`
- prompt: `Chess cell movement indicator overlay, 80x80 transparent PNG, teal cyan #00d4ff glowing dot in center with soft radial glow, transparent edges, minimal overlay indicator, pulsing magical movement hint, game UI overlay asset`
- output: `public/assets/ui/game-cell-highlight-move.png`

- [ ] **Step 2: Generate game-cell-highlight-selected**

Use `codex-image:style-gen` with:
- style_ref: `assets_current/assets/ui/title-button-frame.png`
- prompt: `Chess cell selected indicator overlay, 80x80 transparent PNG, bright gold #e6c56a corner bracket marks at all four corners, L-shaped golden corner indicators, transparent center, selected state game UI overlay`
- output: `public/assets/ui/game-cell-highlight-selected.png`

- [ ] **Step 3: Generate game-cell-highlight-movable**

Use `codex-image:style-gen` with:
- style_ref: `assets_current/assets/ui/title-button-frame.png`
- prompt: `Chess cell movable destination overlay, 80x80 transparent PNG, soft green #27ae60 small upward chevron arrow hint in center, gentle green glow, transparent edges, indicates valid move target, minimal game UI overlay`
- output: `public/assets/ui/game-cell-highlight-movable.png`

- [ ] **Step 4: Generate game-cell-highlight-threat**

Use `codex-image:style-gen` with:
- style_ref: `assets_current/assets/ui/title-button-frame.png`
- prompt: `Chess cell threat danger overlay, 80x80 transparent PNG, crimson red #e74c3c danger ring circle border with pulsing glow, red warning indicator, transparent center, enemy threat warning game UI overlay`
- output: `public/assets/ui/game-cell-highlight-threat.png`

- [ ] **Step 5: Generate game-cell-highlight-summon**

Use `codex-image:style-gen` with:
- style_ref: `assets_current/assets/ui/title-button-frame.png`
- prompt: `Chess cell summoning zone overlay, 80x80 transparent PNG, mana violet #7f5af0 summoning circle rune pattern, magical pentagram or arcane circle outline, purple glow, transparent edges, indicates summon placement zone, game UI overlay`
- output: `public/assets/ui/game-cell-highlight-summon.png`

- [ ] **Step 6: Copy to reference archive**

```powershell
Copy-Item "C:\Development\17_DC\public\assets\ui\game-cell-highlight-*.png" -Destination "C:\Development\17_DC\assets_current\assets\ui\" -Force
```

- [ ] **Step 7: Commit**

```powershell
git add public/assets/ui/game-cell-highlight-move.png public/assets/ui/game-cell-highlight-selected.png public/assets/ui/game-cell-highlight-movable.png public/assets/ui/game-cell-highlight-threat.png public/assets/ui/game-cell-highlight-summon.png
git commit -m "assets: add dark fantasy cell highlight overlays"
```

---

## Task 5: HUD Frames (5 images)

**Files:**
- Create: `public/assets/ui/game-top-hud-frame.png`
- Create: `public/assets/ui/game-bottom-hud-frame.png`
- Create: `public/assets/ui/game-board-frame.png`
- Create: `public/assets/ui/game-mana-frame.png`
- Create: `public/assets/ui/game-action-button-frame.png`

- [ ] **Step 1: Generate game-top-hud-frame**

Use `codex-image:style-gen` with:
- style_ref: `assets_current/assets/ui/title-button-frame.png`
- prompt: `Game top HUD bar panel, 960x60 pixel dark fantasy UI element, thin horizontal panel, dark navy #1a1f3e fill, ornate gold #c8a84b top border line with subtle rune engraving, elegant minimal header bar, dark fantasy game UI frame`
- output: `public/assets/ui/game-top-hud-frame.png`

- [ ] **Step 2: Generate game-bottom-hud-frame**

Use `codex-image:style-gen` with:
- style_ref: `assets_current/assets/ui/title-button-frame.png`
- prompt: `Game bottom HUD panel, 960x160 pixel dark fantasy UI element, thick horizontal panel, dark navy #0d1128 fill, ornate gold #e6c56a multi-layer border frame with corner ornaments, space for summon cards and action buttons, dark fantasy game UI frame`
- output: `public/assets/ui/game-bottom-hud-frame.png`

- [ ] **Step 3: Generate game-board-frame**

Use `codex-image:style-gen` with:
- style_ref: `assets_current/assets/ui/title-button-frame.png`
- prompt: `Chess board decorative frame border, 640x640 pixel dark fantasy UI element, thick gold ornamental border surrounding chess board, rune inscribed corner pieces, layered gold trim with teal gem accent at each corner, majestic magical frame, transparent interior, dark fantasy game UI`
- output: `public/assets/ui/game-board-frame.png`

- [ ] **Step 4: Generate game-mana-frame**

Use `codex-image:style-gen` with:
- style_ref: `assets_current/assets/ui/title-button-frame.png`
- prompt: `Mana gauge panel frame, 180x48 pixel dark fantasy UI element, small horizontal panel, dark navy fill, violet #7f5af0 accent border, mana crystal icon slot on left, elegant compact design, dark fantasy game UI`
- output: `public/assets/ui/game-mana-frame.png`

- [ ] **Step 5: Generate game-action-button-frame**

Use `codex-image:style-gen` with:
- style_ref: `assets_current/assets/ui/title-button-frame.png`
- prompt: `Action danger button frame, 200x56 pixel dark fantasy UI element, crimson red #c0392b button base with dark red border, aggressive angular edges, danger warning button aesthetic, end turn or attack button frame, dark fantasy game UI`
- output: `public/assets/ui/game-action-button-frame.png`

- [ ] **Step 6: Copy to reference archive**

```powershell
Copy-Item "C:\Development\17_DC\public\assets\ui\game-top-hud-frame.png","C:\Development\17_DC\public\assets\ui\game-bottom-hud-frame.png","C:\Development\17_DC\public\assets\ui\game-board-frame.png","C:\Development\17_DC\public\assets\ui\game-mana-frame.png","C:\Development\17_DC\public\assets\ui\game-action-button-frame.png" -Destination "C:\Development\17_DC\assets_current\assets\ui\" -Force
```

- [ ] **Step 7: Commit**

```powershell
git add public/assets/ui/game-top-hud-frame.png public/assets/ui/game-bottom-hud-frame.png public/assets/ui/game-board-frame.png public/assets/ui/game-mana-frame.png public/assets/ui/game-action-button-frame.png
git commit -m "assets: add dark fantasy HUD frame panels"
```

---

## Task 6: Summon UI + Mana Crystal (3 images)

**Files:**
- Create: `public/assets/ui/game-summon-card-frame.png`
- Create: `public/assets/ui/game-summon-tile-frame.png`
- Create: `public/assets/ui/game-mana-crystal.png`

- [ ] **Step 1: Generate game-summon-card-frame**

Use `codex-image:style-gen` with:
- style_ref: `assets_current/assets/ui/title-button-frame.png`
- prompt: `Summon card portrait frame, 100x140 pixel dark fantasy UI element, vertical card with ornate gold border, dark navy interior, decorative gold corner flourishes, mystical rune border, space for piece portrait inside, medieval fantasy TCG card frame style`
- output: `public/assets/ui/game-summon-card-frame.png`

- [ ] **Step 2: Generate game-summon-tile-frame**

Use `codex-image:style-gen` with:
- style_ref: `assets_current/assets/ui/title-button-frame.png`
- prompt: `Summon tile square frame, 80x80 pixel dark fantasy UI element, square frame with violet #7f5af0 summoning rune border, magical arcane circle inscribed in frame, dark interior, mystical summon slot indicator, game UI asset`
- output: `public/assets/ui/game-summon-tile-frame.png`

- [ ] **Step 3: Generate game-mana-crystal**

Use `codex-image:style-gen` with:
- style_ref: `assets_current/assets/ui/title-button-frame.png`
- prompt: `Mana crystal icon, 32x32 pixel dark fantasy game asset, glowing violet #7f5af0 faceted gem crystal, bright magical inner glow, transparent background, clean gem shape with light refraction, mana resource icon`
- output: `public/assets/ui/game-mana-crystal.png`

- [ ] **Step 4: Copy to reference archive**

```powershell
Copy-Item "C:\Development\17_DC\public\assets\ui\game-summon-card-frame.png","C:\Development\17_DC\public\assets\ui\game-summon-tile-frame.png","C:\Development\17_DC\public\assets\ui\game-mana-crystal.png" -Destination "C:\Development\17_DC\assets_current\assets\ui\" -Force
```

- [ ] **Step 5: Commit**

```powershell
git add public/assets/ui/game-summon-card-frame.png public/assets/ui/game-summon-tile-frame.png public/assets/ui/game-mana-crystal.png
git commit -m "assets: add summon UI frames and mana crystal"
```

---

## Task 7: Clock Chips + Trophy (4 images)

**Files:**
- Create: `public/assets/ui/game-clock-chip-player.png`
- Create: `public/assets/ui/game-clock-chip-enemy.png`
- Create: `public/assets/ui/result-trophy.png`

- [ ] **Step 1: Generate game-clock-chip-player**

Use `codex-image:style-gen` with:
- style_ref: `assets_current/assets/ui/title-button-frame.png`
- prompt: `Player timer chip UI element, 140x40 pixel dark fantasy game UI, horizontal pill-shaped chip, teal #00d4ff accent border glow, dark navy fill, hourglass icon on left, player turn timer indicator, elegant compact design`
- output: `public/assets/ui/game-clock-chip-player.png`

- [ ] **Step 2: Generate game-clock-chip-enemy**

Use `codex-image:style-gen` with:
- style_ref: `assets_current/assets/ui/title-button-frame.png`
- prompt: `Enemy timer chip UI element, 140x40 pixel dark fantasy game UI, horizontal pill-shaped chip, purple #7f5af0 accent border glow, dark navy fill, skull or enemy hourglass icon on left, enemy turn timer indicator, sinister design`
- output: `public/assets/ui/game-clock-chip-enemy.png`

- [ ] **Step 3: Generate result-trophy**

Use `codex-image:style-gen` with:
- style_ref: `assets_current/assets/ui/title-button-frame.png`
- prompt: `Victory trophy icon, 200x200 pixel dark fantasy game asset, ornate golden trophy cup with chess king silhouette engraved on cup body, glowing golden aura radiating outward, dark background, triumphant victory symbol, majestic and epic, transparent background`
- output: `public/assets/ui/result-trophy.png`

- [ ] **Step 4: Copy to reference archive**

```powershell
Copy-Item "C:\Development\17_DC\public\assets\ui\game-clock-chip-player.png","C:\Development\17_DC\public\assets\ui\game-clock-chip-enemy.png","C:\Development\17_DC\public\assets\ui\result-trophy.png" -Destination "C:\Development\17_DC\assets_current\assets\ui\" -Force
```

- [ ] **Step 5: Commit**

```powershell
git add public/assets/ui/game-clock-chip-player.png public/assets/ui/game-clock-chip-enemy.png public/assets/ui/result-trophy.png
git commit -m "assets: add clock chips and result trophy"
```

---

## Task 8: Brand Images (2 images)

**Files:**
- Create: `public/assets/brand/chesssummon-mark.png`
- Create: `public/assets/brand/title-logo-ornament.png`

- [ ] **Step 1: Generate chesssummon-mark**

Use `codex-image:style-gen` with:
- style_ref: `assets_current/assets/ui/title-button-frame.png`
- prompt: `ChessSummon game icon mark, 128x128 pixel dark fantasy app icon, chess king piece silhouette in gold centered in an ornate summoning circle with rune inscriptions, dark navy background, teal magical glow, epic game brand mark, square format`
- output: `public/assets/brand/chesssummon-mark.png`

- [ ] **Step 2: Generate title-logo-ornament**

Use `codex-image:style-gen` with:
- style_ref: `assets_current/assets/ui/title-button-frame.png`
- prompt: `Decorative title banner ornament, 600x80 pixel dark fantasy UI element, horizontal thin gold line with central diamond-shaped teal gem, flanking symmetrical rune pattern scrollwork, decorative divider for title screen, gold on dark transparent background`
- output: `public/assets/brand/title-logo-ornament.png`

- [ ] **Step 3: Copy to reference archive**

```powershell
Copy-Item "C:\Development\17_DC\public\assets\brand\chesssummon-mark.png","C:\Development\17_DC\public\assets\brand\title-logo-ornament.png" -Destination "C:\Development\17_DC\assets_current\assets\brand\" -Force
```

- [ ] **Step 4: Commit**

```powershell
git add public/assets/brand/chesssummon-mark.png public/assets/brand/title-logo-ornament.png
git commit -m "assets: add brand mark and title ornament"
```

---

## Task 9: Rank Badges (6 images)

**Files:**
- Create: `public/assets/rank/mmr-bronze.png`
- Create: `public/assets/rank/mmr-silver.png`
- Create: `public/assets/rank/mmr-gold.png`
- Create: `public/assets/rank/mmr-platinum.png`
- Create: `public/assets/rank/mmr-diamond.png`
- Create: `public/assets/rank/mmr-master.png`

- [ ] **Step 1: Generate mmr-bronze**

Use `codex-image:style-gen` with:
- style_ref: `assets_current/assets/ui/title-button-frame.png`
- prompt: `Chess rank badge Bronze tier, 64x64 pixel dark fantasy game asset, circular shield emblem, worn copper-bronze metal texture #b87333, chess king miniature at center, bronze laurel wreath border, BRONZE tier rank badge, transparent background`
- output: `public/assets/rank/mmr-bronze.png`

- [ ] **Step 2: Generate mmr-silver**

Use `codex-image:style-gen` with:
- style_ref: `assets_current/assets/ui/title-button-frame.png`
- prompt: `Chess rank badge Silver tier, 64x64 pixel dark fantasy game asset, circular shield emblem, polished silver-chrome metal texture #c0c0c0, chess king miniature at center, silver laurel wreath border, SILVER tier rank badge, transparent background`
- output: `public/assets/rank/mmr-silver.png`

- [ ] **Step 3: Generate mmr-gold**

Use `codex-image:style-gen` with:
- style_ref: `assets_current/assets/ui/title-button-frame.png`
- prompt: `Chess rank badge Gold tier, 64x64 pixel dark fantasy game asset, circular shield emblem, gleaming gold metal texture #ffd700, chess king miniature at center, gold laurel wreath border, glowing gold aura, GOLD tier rank badge, transparent background`
- output: `public/assets/rank/mmr-gold.png`

- [ ] **Step 4: Generate mmr-platinum**

Use `codex-image:style-gen` with:
- style_ref: `assets_current/assets/ui/title-button-frame.png`
- prompt: `Chess rank badge Platinum tier, 64x64 pixel dark fantasy game asset, circular shield emblem, platinum alloy metal texture #e8e8ff with cool blue tint, chess king miniature at center, platinum wreath with ice crystals, PLATINUM tier rank badge, transparent background`
- output: `public/assets/rank/mmr-platinum.png`

- [ ] **Step 5: Generate mmr-diamond**

Use `codex-image:style-gen` with:
- style_ref: `assets_current/assets/ui/title-button-frame.png`
- prompt: `Chess rank badge Diamond tier, 64x64 pixel dark fantasy game asset, circular shield emblem with faceted diamond texture, teal-white #00ffee brilliance and sparkle, chess king miniature at center, diamond crystal wreath, radiant light refraction, DIAMOND tier rank badge, transparent background`
- output: `public/assets/rank/mmr-diamond.png`

- [ ] **Step 6: Generate mmr-master**

Use `codex-image:style-gen` with:
- style_ref: `assets_current/assets/ui/title-button-frame.png`
- prompt: `Chess rank badge Master tier, 64x64 pixel dark fantasy game asset, circular shield emblem, dark master aesthetic with purple #7f5af0 magical aura, dark metal crown with purple energy glow, chess king miniature with crown at center, elite MASTER tier rank badge, transparent background, most prestigious rank`
- output: `public/assets/rank/mmr-master.png`

- [ ] **Step 7: Copy to reference archive**

```powershell
New-Item -ItemType Directory -Path "C:\Development\17_DC\assets_current\assets\rank" -Force
Copy-Item "C:\Development\17_DC\public\assets\rank\mmr-*.png" -Destination "C:\Development\17_DC\assets_current\assets\rank\" -Force
```

- [ ] **Step 8: Verify 6 rank files exist**

```powershell
Get-ChildItem "C:\Development\17_DC\public\assets\rank\mmr-*.png" | Measure-Object | Select-Object Count
```
Expected: Count = 6

- [ ] **Step 9: Commit**

```powershell
git add public/assets/rank/
git commit -m "assets: add dark fantasy rank badge set (bronze through master)"
```

---

## Task 10: Final Verification + Build

- [ ] **Step 1: Verify all 39 game assets exist**

```powershell
$pieces = (Get-ChildItem "C:\Development\17_DC\public\assets\pieces\*.png" | Where-Object { $_.Name -match "^(pawn|rook|knight|bishop|queen|king)_(w|d)\.png$" }).Count
$ui = (Get-ChildItem "C:\Development\17_DC\public\assets\ui\*.png").Count
$brand = (Get-ChildItem "C:\Development\17_DC\public\assets\brand\*.png").Count
$rank = (Get-ChildItem "C:\Development\17_DC\public\assets\rank\*.png").Count
Write-Host "Pieces: $pieces (expect 12), UI: $ui (expect 24+), Brand: $brand (expect 3+), Rank: $rank (expect 6)"
```

Expected: pieces=12, rank=6, brand has chesssummon-mark.png + title-logo-ornament.png

- [ ] **Step 2: Bump patch version**

Edit `C:\Development\17_DC\package.json` — increment patch version (e.g., `0.1.0` → `0.1.1`)

- [ ] **Step 3: Build**

```powershell
cd C:\Development\17_DC; npm run dist
```
Expected: Build succeeds, outputs `release\ChessSummon_v0.1.1_portable.exe`

- [ ] **Step 4: Move EXE to project root**

```powershell
Remove-Item "C:\Development\17_DC\ChessSummon_v*.exe" -ErrorAction SilentlyContinue
Copy-Item "C:\Development\17_DC\release\ChessSummon_v0.1.1_portable.exe" -Destination "C:\Development\17_DC\" -Force
```

- [ ] **Step 5: Upload to Google Drive**

```powershell
$src = "C:\Development\17_DC\release\ChessSummon_v0.1.1_portable.exe"
Remove-Item "G:\내 드라이브\실행파일\17_ChessSummon\17_ChessSummon_v*.exe" -ErrorAction SilentlyContinue
Copy-Item $src -Destination "G:\내 드라이브\실행파일\17_ChessSummon\17_ChessSummon_v0.1.1_portable.exe" -Force
```

- [ ] **Step 6: Final commit**

```powershell
git add package.json
git commit -m "chore: bump version to 0.1.1 — dark fantasy asset refresh"
```

---

## Summary

| Category | Count | Tasks |
|----------|-------|-------|
| White chess pieces | 6 | Task 1 |
| Dark chess pieces | 6 | Task 2 |
| Board cells | 3 | Task 3 |
| Cell highlights | 5 | Task 4 |
| HUD frames | 5 | Task 5 |
| Summon UI + mana | 3 | Task 6 |
| Clock chips + trophy | 3 | Task 7 |
| Brand | 2 | Task 8 |
| Rank badges | 6 | Task 9 |
| Build + deploy | — | Task 10 |
| **Total** | **39** | |
