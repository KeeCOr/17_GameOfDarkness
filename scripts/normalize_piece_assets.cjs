const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

const OUT_DIR = path.resolve(__dirname, '../public/assets/pieces');
const SOURCE_DIR = path.join(OUT_DIR, 'source');
const TARGET_SIZE = 256;
const TARGET_COVERAGE = Object.freeze({ pawn: 0.73, default: 0.91 });
const PIECES = ['pawn', 'knight', 'bishop', 'rook', 'queen', 'king'];
const SIDES = ['w', 'd'];

function alphaBounds(image) {
  const width = image.getWidth();
  const height = image.getHeight();
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  image.scan(0, 0, width, height, function scan(x, y, idx) {
    if (this.bitmap.data[idx + 3] <= 10) return;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  });

  if (maxX < minX || maxY < minY) return null;
  return { minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

function softenTransparentEdges(image) {
  const width = image.getWidth();
  const height = image.getHeight();
  image.scan(0, 0, width, height, function scan(x, y, idx) {
    const alpha = this.bitmap.data[idx + 3];
    if (alpha === 0 || alpha === 255) return;
    this.bitmap.data[idx + 3] = Math.max(0, Math.min(255, Math.round(alpha * 1.08)));
  });
}

async function normalizePiece(file) {
  const sourcePath = path.join(SOURCE_DIR, file);
  const image = await Jimp.read(sourcePath);
  const bounds = alphaBounds(image);
  if (!bounds) throw new Error(`No visible pixels in ${file}`);

  const type = file.split('_')[0];
  const coverage = TARGET_COVERAGE[type] || TARGET_COVERAGE.default;
  const padX = Math.ceil(bounds.width * 0.08);
  const padTop = Math.ceil(bounds.height * 0.06);
  const padBottom = Math.ceil(bounds.height * 0.035);
  const cropX = Math.max(0, bounds.minX - padX);
  const cropY = Math.max(0, bounds.minY - padTop);
  const cropW = Math.min(image.getWidth() - cropX, bounds.width + padX * 2);
  const cropH = Math.min(image.getHeight() - cropY, bounds.height + padTop + padBottom);

  const cropped = image.clone().crop(cropX, cropY, cropW, cropH);
  const targetVisibleH = Math.round(TARGET_SIZE * coverage);
  const maxVisibleW = Math.round(TARGET_SIZE * (type === 'pawn' ? 0.68 : 0.78));
  const scale = Math.min(targetVisibleH / cropped.getHeight(), maxVisibleW / cropped.getWidth());
  const scaledW = Math.max(1, Math.round(cropped.getWidth() * scale));
  const scaledH = Math.max(1, Math.round(cropped.getHeight() * scale));
  cropped.resize(scaledW, scaledH, Jimp.RESIZE_LANCZOS3);
  softenTransparentEdges(cropped);

  const output = await new Jimp(TARGET_SIZE, TARGET_SIZE, Jimp.rgbaToInt(0, 0, 0, 0));
  const bottomPadding = type === 'pawn' ? 28 : 12;
  const x = Math.round((TARGET_SIZE - scaledW) / 2);
  const y = TARGET_SIZE - bottomPadding - scaledH;
  output.composite(cropped, x, y);
  await output.writeAsync(path.join(OUT_DIR, file));
  return { file, source: `${bounds.width}x${bounds.height}`, output: `${scaledW}x${scaledH}`, bottomPadding };
}

async function main() {
  if (!fs.existsSync(SOURCE_DIR)) throw new Error(`Missing source directory: ${SOURCE_DIR}`);
  const results = [];
  for (const piece of PIECES) {
    for (const side of SIDES) {
      const file = `${piece}_${side}.png`;
      results.push(await normalizePiece(file));
    }
  }
  for (const result of results) {
    console.log(`${result.file}: ${result.source} -> ${result.output}, bottom ${result.bottomPadding}`);
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
