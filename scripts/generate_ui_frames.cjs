const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

const OUT_DIR = path.resolve(__dirname, '../public/assets/ui');
const BOARD_FRAME = path.join(OUT_DIR, 'game-board-frame.png');
const TOP_HUD_FRAME = path.join(OUT_DIR, 'game-top-hud-frame.png');
const BOTTOM_HUD_FRAME = path.join(OUT_DIR, 'game-bottom-hud-frame.png');
const SUMMON_TILE_FRAME = path.join(OUT_DIR, 'game-summon-tile-frame.png');
const MANA_FRAME = path.join(OUT_DIR, 'game-mana-frame.png');
const ACTION_BUTTON_FRAME = path.join(OUT_DIR, 'game-action-button-frame.png');
const RESULT_TROPHY = path.join(OUT_DIR, 'result-trophy.png');

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

async function main() {
  await generateBoardFrame();
  await generateHudFrames();
  await generateResultTrophy();
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
