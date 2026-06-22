const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

const OUT_DIR = path.resolve(__dirname, '../public/assets/ui');
const BRAND_DIR = path.resolve(__dirname, '../public/assets/brand');
const RANK_DIR = path.resolve(__dirname, '../public/assets/rank');
const BOARD_FRAME = path.join(OUT_DIR, 'game-board-frame.png');
const TOP_HUD_FRAME = path.join(OUT_DIR, 'game-top-hud-frame.png');
const BOTTOM_HUD_FRAME = path.join(OUT_DIR, 'game-bottom-hud-frame.png');
const SUMMON_TILE_FRAME = path.join(OUT_DIR, 'game-summon-tile-frame.png');
const MANA_FRAME = path.join(OUT_DIR, 'game-mana-frame.png');
const ACTION_BUTTON_FRAME = path.join(OUT_DIR, 'game-action-button-frame.png');
const RESULT_TROPHY = path.join(OUT_DIR, 'result-trophy.png');
const SUMMON_CARD_FRAME = path.join(OUT_DIR, 'game-summon-card-frame.png');
const BOARD_CELL_LIGHT = path.join(OUT_DIR, 'game-board-cell-light.png');
const BOARD_CELL_DARK = path.join(OUT_DIR, 'game-board-cell-dark.png');
const BOARD_FOG_CELL = path.join(OUT_DIR, 'game-board-fog-cell.png');
const CELL_HIGHLIGHT_MOVE = path.join(OUT_DIR, 'game-cell-highlight-move.png');
const CELL_HIGHLIGHT_SELECTED = path.join(OUT_DIR, 'game-cell-highlight-selected.png');
const CELL_HIGHLIGHT_MOVABLE = path.join(OUT_DIR, 'game-cell-highlight-movable.png');
const CELL_HIGHLIGHT_THREAT = path.join(OUT_DIR, 'game-cell-highlight-threat.png');
const CELL_HIGHLIGHT_SUMMON = path.join(OUT_DIR, 'game-cell-highlight-summon.png');
const MANA_CRYSTAL = path.join(OUT_DIR, 'game-mana-crystal.png');
const CLOCK_CHIP_PLAYER = path.join(OUT_DIR, 'game-clock-chip-player.png');
const CLOCK_CHIP_ENEMY = path.join(OUT_DIR, 'game-clock-chip-enemy.png');
const PIECE_SHADOW = path.join(OUT_DIR, 'game-piece-shadow.png');
const BRAND_MARK = path.join(BRAND_DIR, 'chesssummon-mark.png');
const RANK_ICONS = [
  { file: 'mmr-bronze.png', trim: [174, 96, 52], gem: [196, 113, 57], accent: [90, 188, 225] },
  { file: 'mmr-silver.png', trim: [204, 210, 221], gem: [133, 169, 202], accent: [66, 213, 255] },
  { file: 'mmr-gold.png', trim: [234, 176, 62], gem: [255, 207, 89], accent: [255, 238, 161] },
  { file: 'mmr-platinum.png', trim: [128, 221, 209], gem: [91, 218, 234], accent: [255, 241, 172] },
  { file: 'mmr-diamond.png', trim: [93, 183, 255], gem: [71, 220, 255], accent: [240, 252, 255] },
  { file: 'mmr-master.png', trim: [190, 93, 255], gem: [236, 77, 255], accent: [255, 216, 118] },
];

const rgba = (r, g, b, a = 255) => Jimp.rgbaToInt(r, g, b, a);

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function insideRoundedRect(x, y, width, height, radius) {
  const left = radius;
  const right = width - radius - 1;
  const top = radius;
  const bottom = height - radius - 1;
  if (x >= left && x <= right) return true;
  if (y >= top && y <= bottom) return true;
  const cx = x < left ? left : right;
  const cy = y < top ? top : bottom;
  return (x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2;
}

function inRect(x, y, rect) {
  return x >= rect.x && y >= rect.y && x < rect.x + rect.w && y < rect.y + rect.h;
}

function drawRoundedBand(image, outer, inner, getColor) {
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function scan(x, y, idx) {
    const inOuter = inRect(x, y, outer) && insideRoundedRect(x - outer.x, y - outer.y, outer.w, outer.h, outer.r);
    const inInner = inRect(x, y, inner) && insideRoundedRect(x - inner.x, y - inner.y, inner.w, inner.h, inner.r);
    if (!inOuter || inInner) return;
    const color = getColor(x, y);
    this.bitmap.data[idx] = color.r;
    this.bitmap.data[idx + 1] = color.g;
    this.bitmap.data[idx + 2] = color.b;
    this.bitmap.data[idx + 3] = color.a;
  });
}

function drawLine(image, x0, y0, x1, y1, width, color) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const steps = Math.max(Math.abs(dx), Math.abs(dy));
  for (let i = 0; i <= steps; i++) {
    const t = steps === 0 ? 0 : i / steps;
    const x = Math.round(x0 + dx * t);
    const y = Math.round(y0 + dy * t);
    for (let oy = -width; oy <= width; oy++) {
      for (let ox = -width; ox <= width; ox++) {
        if (ox * ox + oy * oy > width * width) continue;
        const px = x + ox;
        const py = y + oy;
        if (px >= 0 && py >= 0 && px < image.bitmap.width && py < image.bitmap.height) {
          image.setPixelColor(color, px, py);
        }
      }
    }
  }
}

async function generateBoardFrame() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const size = 404;
  const image = await new Jimp(size, size, rgba(0, 0, 0, 0));
  const outer = { x: 0, y: 0, w: size, h: size, r: 18 };
  const inner = { x: 24, y: 24, w: size - 48, h: size - 48, r: 8 };

  drawRoundedBand(image, outer, inner, (x, y) => {
    const edge = Math.min(x, y, size - 1 - x, size - 1 - y);
    const vertical = y / (size - 1);
    const goldBand = edge > 7 && edge < 14;
    const noise = ((x * 17 + y * 29 + ((x ^ y) * 3)) % 19) - 9;
    if (goldBand) {
      return {
        r: clamp(198 + noise + vertical * 22, 0, 255),
        g: clamp(139 + noise + vertical * 12, 0, 255),
        b: clamp(55 + noise, 0, 255),
        a: 255,
      };
    }
    return {
      r: clamp(14 + noise + edge * 1.2, 0, 54),
      g: clamp(18 + noise + edge * 1.1, 0, 58),
      b: clamp(29 + noise + edge * 1.6, 0, 74),
      a: 252,
    };
  });

  const bevels = [
    { rect: { x: 8, y: 8, w: size - 16, h: size - 16, r: 14 }, color: rgba(255, 226, 148, 210), width: 2 },
    { rect: { x: 19, y: 19, w: size - 38, h: size - 38, r: 8 }, color: rgba(54, 225, 255, 80), width: 1 },
    { rect: { x: 25, y: 25, w: size - 50, h: size - 50, r: 6 }, color: rgba(7, 10, 18, 230), width: 2 },
  ];

  for (const { rect, color, width } of bevels) {
    const x0 = rect.x + rect.r;
    const x1 = rect.x + rect.w - rect.r;
    const y0 = rect.y;
    const y1 = rect.y + rect.h;
    drawLine(image, x0, y0, x1, y0, width, color);
    drawLine(image, x0, y1, x1, y1, width, color);
    drawLine(image, rect.x, rect.y + rect.r, rect.x, rect.y + rect.h - rect.r, width, color);
    drawLine(image, rect.x + rect.w, rect.y + rect.r, rect.x + rect.w, rect.y + rect.h - rect.r, width, color);
  }

  const cornerColor = rgba(235, 176, 78, 215);
  for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
    const cx = sx > 0 ? 38 : size - 39;
    const cy = sy > 0 ? 38 : size - 39;
    drawLine(image, cx, cy - 20 * sy, cx + 20 * sx, cy, 2, cornerColor);
    drawLine(image, cx + 20 * sx, cy, cx, cy + 20 * sy, 2, cornerColor);
    drawLine(image, cx, cy + 20 * sy, cx - 20 * sx, cy, 2, rgba(52, 222, 255, 90));
  }

  await image.writeAsync(BOARD_FRAME);
}

function putPixel(image, x, y, color) {
  if (x < 0 || y < 0 || x >= image.bitmap.width || y >= image.bitmap.height) return;
  image.setPixelColor(color, x, y);
}

function drawRectFrame(image, width, height, options = {}) {
  const {
    radius = 12,
    trim = rgba(224, 166, 72, 235),
    glow = rgba(46, 210, 255, 95),
    redGlow = rgba(215, 48, 34, 70),
    centerGem = true,
    sideGems = true,
  } = options;

  image.scan(0, 0, width, height, function scan(x, y, idx) {
    if (!insideRoundedRect(x, y, width, height, radius)) return;
    const edge = Math.min(x, y, width - 1 - x, height - 1 - y);
    const nx = x / Math.max(1, width - 1);
    const ny = y / Math.max(1, height - 1);
    const noise = ((x * 31 + y * 17 + ((x ^ y) * 7)) % 29) - 14;
    let r = 8 + noise * 0.45 + ny * 16;
    let g = 14 + noise * 0.35 + ny * 12;
    let b = 25 + noise * 0.5 + ny * 18;
    let a = 238;

    if (edge < 7) {
      r = 16 + edge * 11 + noise;
      g = 20 + edge * 8 + noise;
      b = 31 + edge * 5 + noise;
      a = 250;
    }
    if (edge >= 7 && edge <= 11) {
      r = 190 + noise + nx * 28;
      g = 124 + noise + ny * 20;
      b = 48 + noise * 0.5;
      a = 255;
    }
    if (edge > 11 && edge < 16) {
      r = 37 + noise;
      g = 29 + noise;
      b = 26 + noise;
      a = 248;
    }

    this.bitmap.data[idx] = clamp(r, 0, 255);
    this.bitmap.data[idx + 1] = clamp(g, 0, 255);
    this.bitmap.data[idx + 2] = clamp(b, 0, 255);
    this.bitmap.data[idx + 3] = a;
  });

  drawLine(image, 18, 8, width - 18, 8, 1, rgba(255, 230, 156, 210));
  drawLine(image, 18, height - 9, width - 18, height - 9, 1, rgba(71, 39, 17, 210));
  drawLine(image, 10, 18, 10, height - 18, 1, glow);
  drawLine(image, width - 11, 18, width - 11, height - 18, 1, redGlow);

  const corner = rgba(244, 181, 73, 220);
  for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
    const cx = sx > 0 ? 22 : width - 23;
    const cy = sy > 0 ? 20 : height - 21;
    drawLine(image, cx, cy - 10 * sy, cx + 12 * sx, cy, 1, corner);
    drawLine(image, cx + 12 * sx, cy, cx, cy + 10 * sy, 1, corner);
  }

  if (centerGem) {
    const cx = Math.floor(width / 2);
    for (let y = -12; y <= 12; y++) {
      for (let x = -20; x <= 20; x++) {
        if (Math.abs(x) / 20 + Math.abs(y) / 12 > 1) continue;
        putPixel(image, cx + x, 9 + y, trim);
        putPixel(image, cx + x, height - 10 + y, trim);
      }
    }
  }

  if (sideGems) {
    for (const x of [14, width - 15]) {
      const color = x < width / 2 ? glow : redGlow;
      for (let y = Math.floor(height * 0.32); y <= Math.floor(height * 0.68); y++) {
        if (Math.abs(y - height / 2) % 3 === 0) putPixel(image, x, y, color);
      }
    }
  }
}

async function generateFrame(file, width, height, options = {}) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const image = await new Jimp(width, height, rgba(0, 0, 0, 0));
  drawRectFrame(image, width, height, options);
  await image.writeAsync(file);
}

async function generateHudFrames() {
  await generateFrame(TOP_HUD_FRAME, 416, 82, { radius: 18, centerGem: true, sideGems: true });
  await generateFrame(BOTTOM_HUD_FRAME, 416, 306, { radius: 20, centerGem: true, sideGems: true });
  await generateFrame(SUMMON_CARD_FRAME, 420, 150, { radius: 14, centerGem: true, sideGems: true });
  await generateFrame(SUMMON_TILE_FRAME, 152, 236, { radius: 10, centerGem: false, sideGems: false });
  await generateFrame(MANA_FRAME, 380, 52, { radius: 14, centerGem: true, sideGems: false });
  await generateFrame(ACTION_BUTTON_FRAME, 300, 88, { radius: 12, centerGem: true, sideGems: true });
}

function fillEllipse(image, cx, cy, rx, ry, color) {
  for (let y = -ry; y <= ry; y++) {
    for (let x = -rx; x <= rx; x++) {
      if ((x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1) {
        putPixel(image, cx + x, cy + y, color);
      }
    }
  }
}

function fillPolygon(image, points, color) {
  const minY = Math.floor(Math.min(...points.map(p => p.y)));
  const maxY = Math.ceil(Math.max(...points.map(p => p.y)));
  for (let y = minY; y <= maxY; y++) {
    const intersections = [];
    for (let i = 0; i < points.length; i++) {
      const a = points[i];
      const b = points[(i + 1) % points.length];
      if ((a.y <= y && b.y > y) || (b.y <= y && a.y > y)) {
        const t = (y - a.y) / (b.y - a.y);
        intersections.push(a.x + t * (b.x - a.x));
      }
    }
    intersections.sort((a, b) => a - b);
    for (let i = 0; i < intersections.length; i += 2) {
      for (let x = Math.ceil(intersections[i]); x <= Math.floor(intersections[i + 1]); x++) {
        putPixel(image, x, y, color);
      }
    }
  }
}

async function generateResultTrophy() {
  const size = 96;
  const image = await new Jimp(size, size, rgba(0, 0, 0, 0));
  const gold = rgba(232, 174, 67, 255);
  const goldLight = rgba(255, 235, 158, 255);
  const goldDark = rgba(116, 67, 20, 255);
  const blue = rgba(45, 209, 255, 125);

  fillEllipse(image, 48, 50, 25, 24, gold);
  fillPolygon(image, [{ x: 25, y: 29 }, { x: 71, y: 29 }, { x: 64, y: 63 }, { x: 32, y: 63 }], gold);
  fillPolygon(image, [{ x: 30, y: 33 }, { x: 66, y: 33 }, { x: 61, y: 57 }, { x: 35, y: 57 }], goldLight);
  fillPolygon(image, [{ x: 38, y: 63 }, { x: 58, y: 63 }, { x: 55, y: 75 }, { x: 41, y: 75 }], goldDark);
  fillEllipse(image, 48, 78, 24, 7, gold);
  fillEllipse(image, 48, 77, 18, 4, goldLight);

  for (let t = 0; t <= 1; t += 0.02) {
    const ly = Math.round(42 + Math.sin(t * Math.PI) * 20);
    const ry = ly;
    const lx = Math.round(26 - Math.sin(t * Math.PI) * 16);
    const rx = Math.round(70 + Math.sin(t * Math.PI) * 16);
    putPixel(image, lx, ly, goldLight);
    putPixel(image, rx, ry, goldLight);
    putPixel(image, lx + 1, ly, gold);
    putPixel(image, rx - 1, ry, gold);
  }

  drawLine(image, 25, 29, 71, 29, 2, goldLight);
  drawLine(image, 32, 63, 64, 63, 2, goldDark);
  drawLine(image, 37, 28, 30, 15, 2, blue);
  drawLine(image, 59, 28, 66, 15, 2, blue);
  fillEllipse(image, 48, 35, 6, 10, rgba(255, 245, 186, 175));

  await image.writeAsync(RESULT_TROPHY);
}

function shadeColor(base, amount) {
  return base.map(value => clamp(value + amount, 0, 255));
}

function drawRimmedPolygon(image, points, fill, rim, highlight) {
  fillPolygon(image, points, fill);
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    drawLine(image, Math.round(a.x), Math.round(a.y), Math.round(b.x), Math.round(b.y), 2, rim);
    drawLine(image, Math.round(a.x), Math.round(a.y - 1), Math.round(b.x), Math.round(b.y - 1), 1, highlight);
  }
}

function addGemNoise(image, width, height, intensity = 28) {
  image.scan(0, 0, width, height, function scan(x, y, idx) {
    if (this.bitmap.data[idx + 3] === 0) return;
    const n = ((x * 47 + y * 31 + ((x ^ y) * 11)) % (intensity * 2)) - intensity;
    this.bitmap.data[idx] = clamp(this.bitmap.data[idx] + n * 0.65, 0, 255);
    this.bitmap.data[idx + 1] = clamp(this.bitmap.data[idx + 1] + n * 0.52, 0, 255);
    this.bitmap.data[idx + 2] = clamp(this.bitmap.data[idx + 2] + n * 0.8, 0, 255);
  });
}

async function generateBrandMark() {
  fs.mkdirSync(BRAND_DIR, { recursive: true });
  const size = 144;
  const image = await new Jimp(size, size, rgba(0, 0, 0, 0));
  const gold = rgba(231, 174, 72, 255);
  const goldLight = rgba(255, 231, 151, 255);
  const blue = rgba(42, 209, 255, 205);
  const dark = rgba(7, 13, 23, 250);

  fillEllipse(image, 72, 76, 52, 54, rgba(3, 8, 16, 235));
  fillEllipse(image, 72, 76, 46, 48, rgba(11, 27, 43, 245));
  drawRimmedPolygon(image, [
    { x: 72, y: 16 }, { x: 116, y: 45 }, { x: 105, y: 112 }, { x: 72, y: 132 }, { x: 39, y: 112 }, { x: 28, y: 45 },
  ], dark, gold, goldLight);
  drawRimmedPolygon(image, [
    { x: 72, y: 28 }, { x: 102, y: 50 }, { x: 94, y: 102 }, { x: 72, y: 116 }, { x: 50, y: 102 }, { x: 42, y: 50 },
  ], rgba(13, 40, 60, 245), rgba(42, 209, 255, 150), rgba(255, 238, 166, 165));

  fillPolygon(image, [
    { x: 41, y: 63 }, { x: 55, y: 34 }, { x: 67, y: 57 }, { x: 72, y: 24 }, { x: 78, y: 57 }, { x: 90, y: 34 }, { x: 104, y: 63 },
    { x: 91, y: 56 }, { x: 82, y: 75 }, { x: 62, y: 75 }, { x: 53, y: 56 },
  ], gold);
  drawLine(image, 43, 64, 103, 64, 2, goldLight);
  drawLine(image, 58, 79, 86, 79, 2, rgba(111, 63, 18, 230));
  fillEllipse(image, 72, 64, 7, 9, blue);
  drawLine(image, 39, 105, 72, 36, 1, rgba(255, 255, 255, 65));
  drawLine(image, 105, 105, 72, 36, 1, rgba(255, 92, 68, 72));
  addGemNoise(image, size, size, 34);
  await image.writeAsync(BRAND_MARK);
}

async function generateRankIcon({ file, trim, gem, accent }, index) {
  fs.mkdirSync(RANK_DIR, { recursive: true });
  const size = 128;
  const image = await new Jimp(size, size, rgba(0, 0, 0, 0));
  const trimColor = rgba(trim[0], trim[1], trim[2], 255);
  const trimLight = rgba(...shadeColor(trim, 38), 245);
  const gemColor = rgba(gem[0], gem[1], gem[2], 235);
  const accentColor = rgba(accent[0], accent[1], accent[2], 220);

  fillEllipse(image, 64, 64, 46, 50, rgba(3, 7, 15, 226));
  drawRimmedPolygon(image, [
    { x: 64, y: 10 }, { x: 104, y: 34 }, { x: 96, y: 92 }, { x: 64, y: 119 }, { x: 32, y: 92 }, { x: 24, y: 34 },
  ], rgba(10, 16, 26, 248), trimColor, trimLight);
  drawRimmedPolygon(image, [
    { x: 64, y: 23 }, { x: 91, y: 40 }, { x: 84, y: 84 }, { x: 64, y: 103 }, { x: 44, y: 84 }, { x: 37, y: 40 },
  ], rgba(18, 26, 35, 245), rgba(67, 50, 36, 230), accentColor);
  fillPolygon(image, [
    { x: 64, y: 36 }, { x: 79, y: 57 }, { x: 72, y: 83 }, { x: 64, y: 92 }, { x: 56, y: 83 }, { x: 49, y: 57 },
  ], gemColor);
  drawLine(image, 64, 37, 64, 91, 1, rgba(255, 255, 255, 98));
  drawLine(image, 49, 57, 79, 57, 1, rgba(255, 244, 175, 115));
  drawLine(image, 43, 95, 85, 95, 2, trimLight);
  for (let i = 0; i <= index; i++) {
    fillEllipse(image, 49 + i * 6, 102, 2, 2, accentColor);
  }
  if (index >= 5) {
    fillPolygon(image, [{ x: 43, y: 38 }, { x: 53, y: 21 }, { x: 64, y: 37 }, { x: 75, y: 21 }, { x: 85, y: 38 }], trimLight);
  }
  addGemNoise(image, size, size, 30);
  await image.writeAsync(path.join(RANK_DIR, file));
}

async function generateRankIcons() {
  for (let i = 0; i < RANK_ICONS.length; i++) {
    await generateRankIcon(RANK_ICONS[i], i);
  }
}

async function generateResultTrophyRich() {
  const size = 128;
  const image = await new Jimp(size, size, rgba(0, 0, 0, 0));
  const gold = rgba(231, 174, 67, 255);
  const goldLight = rgba(255, 235, 158, 255);
  const goldDark = rgba(105, 58, 18, 255);
  const blue = rgba(45, 209, 255, 145);

  fillEllipse(image, 64, 68, 40, 38, rgba(11, 12, 16, 210));
  fillEllipse(image, 64, 68, 34, 33, gold);
  fillPolygon(image, [{ x: 29, y: 36 }, { x: 99, y: 36 }, { x: 88, y: 82 }, { x: 40, y: 82 }], gold);
  fillPolygon(image, [{ x: 38, y: 43 }, { x: 90, y: 43 }, { x: 82, y: 73 }, { x: 46, y: 73 }], goldLight);
  fillPolygon(image, [{ x: 52, y: 83 }, { x: 76, y: 83 }, { x: 72, y: 101 }, { x: 56, y: 101 }], goldDark);
  fillEllipse(image, 64, 106, 34, 9, gold);
  fillEllipse(image, 64, 104, 24, 5, goldLight);

  for (let t = 0; t <= 1; t += 0.012) {
    const bend = Math.sin(t * Math.PI);
    const y = Math.round(52 + bend * 27);
    const lx = Math.round(31 - bend * 21);
    const rx = Math.round(97 + bend * 21);
    putPixel(image, lx, y, goldLight);
    putPixel(image, rx, y, goldLight);
    putPixel(image, lx + 1, y, gold);
    putPixel(image, rx - 1, y, gold);
    if (Math.round(t * 100) % 5 === 0) {
      putPixel(image, lx + 2, y + 1, goldDark);
      putPixel(image, rx - 2, y + 1, goldDark);
    }
  }

  drawLine(image, 28, 36, 100, 36, 2, goldLight);
  drawLine(image, 39, 82, 89, 82, 2, goldDark);
  drawLine(image, 48, 35, 35, 14, 2, blue);
  drawLine(image, 80, 35, 93, 14, 2, blue);
  drawLine(image, 64, 33, 64, 13, 2, rgba(255, 236, 164, 180));
  fillEllipse(image, 64, 50, 8, 13, rgba(255, 248, 197, 185));
  addGemNoise(image, size, size, 32);
  await image.writeAsync(RESULT_TROPHY);
}
async function generateBoardCell(file, options = {}) {
  const size = 96;
  const image = await new Jimp(size, size, rgba(0, 0, 0, 0));
  const { light = false, fog = false } = options;
  image.scan(0, 0, size, size, function scan(x, y, idx) {
    const edge = Math.min(x, y, size - 1 - x, size - 1 - y);
    const nx = x / (size - 1);
    const ny = y / (size - 1);
    const noise = ((x * 37 + y * 19 + ((x ^ y) * 5)) % 35) - 17;
    let base = light ? 76 : 22;
    let r = base + noise * 0.55 + ny * (light ? 18 : 10);
    let g = base + (light ? 10 : 4) + noise * 0.45 + nx * (light ? 10 : 5);
    let b = base + (light ? 24 : 14) + noise * 0.6 + ny * 12;
    let a = fog ? 232 : 245;
    if (fog) {
      r = 4 + noise * 0.2 + edge * 0.55;
      g = 8 + noise * 0.2 + edge * 0.7;
      b = 17 + noise * 0.35 + edge * 1.05;
    }
    if (edge < 4) {
      r += light ? 38 : 18;
      g += light ? 28 : 17;
      b += light ? 10 : 22;
      a = fog ? 235 : 255;
    }
    this.bitmap.data[idx] = clamp(r, 0, 255);
    this.bitmap.data[idx + 1] = clamp(g, 0, 255);
    this.bitmap.data[idx + 2] = clamp(b, 0, 255);
    this.bitmap.data[idx + 3] = a;
  });
  drawLine(image, 5, 5, size - 6, 5, 1, rgba(255, 227, 152, light ? 116 : 72));
  drawLine(image, 5, size - 6, size - 6, size - 6, 1, rgba(18, 12, 8, 120));
  if (fog) {
    fillEllipse(image, size / 2, size / 2, 30, 23, rgba(31, 47, 78, 58));
    drawLine(image, 18, 18, 78, 78, 1, rgba(43, 219, 255, 38));
  }
  await image.writeAsync(file);
}

async function generateCellHighlight(file, color, options = {}) {
  const size = 96;
  const image = await new Jimp(size, size, rgba(0, 0, 0, 0));
  const [r, g, b] = color;
  const { danger = false } = options;
  image.scan(0, 0, size, size, function scan(x, y, idx) {
    const cx = size / 2;
    const cy = size / 2;
    const dx = Math.abs(x - cx);
    const dy = Math.abs(y - cy);
    const edge = Math.max(dx, dy);
    const inner = edge < 34;
    const border = edge >= 35 && edge <= 43;
    if (!inner && !border) return;
    const noise = ((x * 23 + y * 41 + ((x ^ y) * 13)) % 31) - 15;
    const alpha = border ? 210 : 72;
    this.bitmap.data[idx] = clamp(r + noise, 0, 255);
    this.bitmap.data[idx + 1] = clamp(g + noise, 0, 255);
    this.bitmap.data[idx + 2] = clamp(b + noise, 0, 255);
    this.bitmap.data[idx + 3] = alpha;
  });
  drawLine(image, 16, 12, 80, 12, 2, rgba(255, 242, 182, danger ? 130 : 170));
  drawLine(image, 16, 84, 80, 84, 2, rgba(r, g, b, 170));
  drawLine(image, 12, 18, 12, 78, 1, rgba(48, 220, 255, danger ? 50 : 100));
  drawLine(image, 84, 18, 84, 78, 1, rgba(255, 74, 52, danger ? 130 : 60));
  await image.writeAsync(file);
}

async function generateManaCrystal() {
  const size = 96;
  const image = await new Jimp(size, size, rgba(0, 0, 0, 0));
  fillEllipse(image, 48, 52, 22, 31, rgba(5, 18, 31, 105));
  fillPolygon(image, [
    { x: 48, y: 5 }, { x: 74, y: 34 }, { x: 62, y: 84 }, { x: 48, y: 94 }, { x: 34, y: 84 }, { x: 22, y: 34 },
  ], rgba(17, 181, 255, 238));
  fillPolygon(image, [{ x: 48, y: 9 }, { x: 62, y: 35 }, { x: 48, y: 80 }, { x: 34, y: 35 }], rgba(100, 235, 255, 240));
  fillPolygon(image, [{ x: 23, y: 35 }, { x: 35, y: 35 }, { x: 48, y: 82 }, { x: 34, y: 83 }], rgba(0, 104, 201, 190));
  fillPolygon(image, [{ x: 73, y: 35 }, { x: 61, y: 35 }, { x: 48, y: 82 }, { x: 62, y: 83 }], rgba(0, 74, 162, 180));
  drawLine(image, 48, 7, 48, 90, 1, rgba(245, 255, 255, 180));
  drawLine(image, 24, 35, 72, 35, 1, rgba(220, 250, 255, 170));
  drawLine(image, 35, 84, 61, 84, 2, rgba(0, 72, 132, 190));
  drawLine(image, 29, 25, 47, 8, 1, rgba(255, 255, 255, 95));
  drawLine(image, 67, 25, 49, 8, 1, rgba(255, 255, 255, 72));
  addGemNoise(image, size, size, 34);
  await image.writeAsync(MANA_CRYSTAL);
}

async function generateClockChip(file, side = 'player') {
  const width = 184;
  const height = 58;
  const image = await new Jimp(width, height, rgba(0, 0, 0, 0));
  const accent = side === 'player' ? rgba(65, 224, 255, 165) : rgba(255, 79, 56, 150);
  drawRectFrame(image, width, height, { radius: 12, centerGem: false, sideGems: true, glow: accent, redGlow: accent });
  fillEllipse(image, 28, 29, 15, 15, rgba(7, 10, 16, 170));
  drawLine(image, 28, 19, 28, 29, 2, rgba(255, 237, 176, 185));
  drawLine(image, 28, 29, 38, 29, 2, accent);
  await image.writeAsync(file);
}

async function generatePieceShadow() {
  const width = 160;
  const height = 56;
  const image = await new Jimp(width, height, rgba(0, 0, 0, 0));
  image.scan(0, 0, width, height, function scan(x, y, idx) {
    const dx = (x - width / 2) / (width / 2);
    const dy = (y - height / 2) / (height / 2);
    const radius = dx * dx + dy * dy;
    if (radius > 1) return;
    const falloff = Math.max(0, 1 - radius);
    const edgeNoise = ((x * 29 + y * 17 + ((x ^ y) * 5)) % 17) - 8;
    this.bitmap.data[idx] = 0;
    this.bitmap.data[idx + 1] = 0;
    this.bitmap.data[idx + 2] = 0;
    this.bitmap.data[idx + 3] = clamp(118 * falloff + edgeNoise, 0, 128);
  });
  fillEllipse(image, 80, 30, 45, 12, rgba(8, 4, 2, 82));
  drawLine(image, 34, 25, 126, 25, 1, rgba(255, 218, 128, 26));
  await image.writeAsync(PIECE_SHADOW);
}
async function generateGameplaySkins() {
  await generateBoardCell(BOARD_CELL_LIGHT, { light: true });
  await generateBoardCell(BOARD_CELL_DARK, { light: false });
  await generateBoardCell(BOARD_FOG_CELL, { fog: true });
  await generateCellHighlight(CELL_HIGHLIGHT_MOVE, [69, 219, 255]);
  await generateCellHighlight(CELL_HIGHLIGHT_SELECTED, [248, 201, 78]);
  await generateCellHighlight(CELL_HIGHLIGHT_MOVABLE, [98, 240, 178]);
  await generateCellHighlight(CELL_HIGHLIGHT_THREAT, [255, 72, 55], { danger: true });
  await generateCellHighlight(CELL_HIGHLIGHT_SUMMON, [104, 255, 144]);
  await generateManaCrystal();
  await generateClockChip(CLOCK_CHIP_PLAYER, 'player');
  await generateClockChip(CLOCK_CHIP_ENEMY, 'enemy');
  await generatePieceShadow();
}

async function main() {
  await generateBoardFrame();
  await generateHudFrames();
  await generateResultTrophyRich();
  await generateBrandMark();
  await generateRankIcons();
  await generateGameplaySkins();
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});


