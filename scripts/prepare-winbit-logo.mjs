import path from 'path';
import sharp from 'sharp';

// Turns the official Winbit logo (cream wordmark + green W over a solid black
// canvas) into a tightly cropped PNG with a transparent background, so it can sit
// on the app's near-black surfaces without showing a black box.
//
// Usage: node scripts/prepare-winbit-logo.mjs <source.png> [output.png]

const PADDING = 6;
// Luminance below ALPHA_FLOOR is background, above ALPHA_CEIL is solid artwork.
// In between we ramp alpha so anti-aliased edges stay soft. Colors are left
// untouched: the source is already composited over black, and the app background
// is near-black too, so no halo appears.
const ALPHA_FLOOR = 3;
const ALPHA_CEIL = 30;
const TRIM_THRESHOLD = 6;

const luminance = (pixels, i) =>
  0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2];

const findContentBox = (pixels, width, height, channels) => {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (luminance(pixels, (y * width + x) * channels) <= TRIM_THRESHOLD) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX < 0) throw new Error('No content found in source image');

  return {
    left: Math.max(0, minX - PADDING),
    top: Math.max(0, minY - PADDING),
    right: Math.min(width - 1, maxX + PADDING),
    bottom: Math.min(height - 1, maxY + PADDING),
  };
};

const prepareLogo = async (inputPath, outputPath) => {
  const source = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  const box = findContentBox(
    source.data,
    source.info.width,
    source.info.height,
    source.info.channels,
  );

  const { data, info } = await sharp(inputPath)
    .extract({
      left: box.left,
      top: box.top,
      width: box.right - box.left + 1,
      height: box.bottom - box.top + 1,
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const pixels = new Uint8Array(data);

  for (let i = 0; i < pixels.length; i += channels) {
    const lum = luminance(pixels, i);
    const ratio = (lum - ALPHA_FLOOR) / (ALPHA_CEIL - ALPHA_FLOOR);
    pixels[i + 3] = Math.round(Math.min(1, Math.max(0, ratio)) * 255);
  }

  await sharp(pixels, { raw: { width, height, channels } }).png().toFile(outputPath);
  console.log(`wrote ${path.basename(outputPath)} (${width}x${height})`);
};

const [input, output = 'public/images/login/logo-winbit.png'] = process.argv.slice(2);

if (!input) {
  console.error('Usage: node scripts/prepare-winbit-logo.mjs <source.png> [output.png]');
  process.exit(1);
}

await prepareLogo(path.resolve(input), path.resolve(output));
