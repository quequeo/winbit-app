/* eslint-env node */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const logoPath = path.join(root, 'public/images/login/logo-winbit.png');
const markPath = path.join(root, 'public/images/login/logo-winbit-w.png');
const publicDir = path.join(root, 'public');

const BRAND_BG = { r: 13, g: 15, b: 14, alpha: 1 };
const GAP_BEFORE_WORDMARK = 8;

const luminance = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

const findWordmarkStart = (data, width, height, channels) => {
  for (let x = 0; x < width; x += 1) {
    let maxL = 0;
    let count = 0;

    for (let y = 0; y < height; y += 1) {
      const i = (y * width + x) * channels;
      const alpha = data[i + 3];
      if (alpha < 20) continue;

      const lum = luminance(data[i], data[i + 1], data[i + 2]);
      if (lum > 8) {
        maxL = Math.max(maxL, lum);
        count += 1;
      }
    }

    if (maxL > 170 && count > height * 0.15) {
      return x;
    }
  }

  return Math.round(width * 0.34);
};

const findMarkBounds = (data, width, height, channels, maxX) => {
  let left = width;
  let right = 0;
  let top = height;
  let bottom = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < maxX; x += 1) {
      const i = (y * width + x) * channels;
      const alpha = data[i + 3];
      if (alpha < 20) continue;

      const lum = luminance(data[i], data[i + 1], data[i + 2]);
      if (lum <= 12) continue;

      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
  }

  if (right < left) {
    throw new Error('Could not detect Winbit W mark in logo-winbit.png');
  }

  return { left, top, right, bottom };
};

const extractMark = async () => {
  const source = await sharp(logoPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = source.info;
  const wordmarkStart = findWordmarkStart(source.data, width, height, channels);
  const bounds = findMarkBounds(
    source.data,
    width,
    height,
    channels,
    Math.max(0, wordmarkStart - GAP_BEFORE_WORDMARK),
  );

  const markWidth = bounds.right - bounds.left + 1;
  const markHeight = bounds.bottom - bounds.top + 1;
  const padding = 12;
  const squareSize = Math.max(markWidth, markHeight) + padding * 2;

  const markBuffer = await sharp(logoPath)
    .extract({ left: bounds.left, top: bounds.top, width: markWidth, height: markHeight })
    .png()
    .toBuffer();

  const left = Math.round((squareSize - markWidth) / 2);
  const top = Math.round((squareSize - markHeight) / 2);

  await sharp({
    create: {
      width: squareSize,
      height: squareSize,
      channels: 4,
      background: BRAND_BG,
    },
  })
    .composite([{ input: markBuffer, left, top }])
    .png()
    .toFile(markPath);

  return markPath;
};

const writeSquareIcon = async (size, outputName, markSource) => {
  const logoBuffer = await sharp(markSource)
    .resize(Math.round(size * 0.82), null, { fit: 'inside' })
    .png()
    .toBuffer();
  const logoMeta = await sharp(logoBuffer).metadata();

  const left = Math.round((size - logoMeta.width) / 2);
  const top = Math.round((size - logoMeta.height) / 2);

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BRAND_BG,
    },
  })
    .composite([{ input: logoBuffer, left, top }])
    .png()
    .toFile(path.join(publicDir, outputName));
};

const markSource = await extractMark();

await writeSquareIcon(512, 'icon-512x512.png', markSource);
await writeSquareIcon(192, 'icon-192x192.png', markSource);
await writeSquareIcon(180, 'apple-touch-icon.png', markSource);

await sharp(path.join(publicDir, 'icon-192x192.png'))
  .resize(32, 32)
  .png()
  .toFile(path.join(publicDir, 'favicon.ico'));

console.log('W mark saved to public/images/login/logo-winbit-w.png');
console.log('PWA icons generated in public/');
