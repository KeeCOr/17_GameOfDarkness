const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

const OUT_DIR = path.resolve(__dirname, '../public/assets/ui');
const BOARD_FRAME = path.join(OUT_DIR, 'game-board-frame.png');

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

generateBoardFrame().catch(error => {
  console.error(error);
  process.exit(1);
});
