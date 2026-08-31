import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const THRESHOLD = 238;

const isNearWhite = (pixels, idx, channels) => {
  const i = idx * channels;
  return pixels[i] >= THRESHOLD && pixels[i + 1] >= THRESHOLD && pixels[i + 2] >= THRESHOLD;
};

const removeWhiteBackground = async (inputPath, outputPath) => {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const pixels = new Uint8Array(data);
  const visited = new Uint8Array(width * height);
  const queue = [];

  const tryPush = (x, y) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const idx = y * width + x;
    if (visited[idx] || !isNearWhite(pixels, idx, channels)) return;
    visited[idx] = 1;
    queue.push(idx);
  };

  for (let x = 0; x < width; x += 1) {
    tryPush(x, 0);
    tryPush(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    tryPush(0, y);
    tryPush(width - 1, y);
  }

  while (queue.length) {
    const idx = queue.pop();
    const x = idx % width;
    const y = Math.floor(idx / width);
    tryPush(x - 1, y);
    tryPush(x + 1, y);
    tryPush(x, y - 1);
    tryPush(x, y + 1);
  }

  for (let idx = 0; idx < width * height; idx += 1) {
    if (visited[idx]) {
      pixels[idx * channels + 3] = 0;
    }
  }

  await sharp(pixels, { raw: { width, height, channels } }).png().toFile(outputPath);
  console.log(`processed ${path.basename(outputPath)}`);
};

const dir = path.resolve('public/images/operating-assets');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.png'));

for (const file of files) {
  const full = path.join(dir, file);
  const tmp = `${full}.tmp`;
  await removeWhiteBackground(full, tmp);
  fs.renameSync(tmp, full);
}
