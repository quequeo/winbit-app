import path from 'path';
import sharp from 'sharp';

// Converts the portfolio card graphic (teal bars over an opaque black canvas,
// often saved as a misnamed JPEG) into a real PNG with transparent background.
// Soft luminance ramp preserves bar-edge AA and teal/white base glow.
//
// Usage: node scripts/prepare-portfolio-value-bg.mjs [source] [output]

const ALPHA_FLOOR = 3;
const ALPHA_CEIL = 28;

const luminance = (pixels, i) =>
  0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2];

const prepare = async (inputPath, outputPath) => {
  const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({
    resolveWithObject: true,
  });

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

const [input = 'public/images/dashboard/portfolio-value-bg.png', output = input] =
  process.argv.slice(2);

await prepare(path.resolve(input), path.resolve(output));
