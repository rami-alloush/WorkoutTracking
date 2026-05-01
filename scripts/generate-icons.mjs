// Generates all raster assets from resources/*.svg
// - resources/icon.png, resources/icon-foreground.png, resources/icon-background.png,
//   resources/splash.png, resources/splash-dark.png  (consumed by @capacitor/assets)
// - store/app-store-icon-1024.png   (iOS App Store, no alpha)
// - store/play-store-icon-512.png   (Google Play)
// - store/play-feature-graphic-1024x500.png (Google Play feature graphic)
// - public/favicon.png, public/favicon-16.png, public/favicon-32.png,
//   public/apple-touch-icon.png, public/icon-192.png, public/icon-512.png,
//   public/icon-maskable-512.png  (web / PWA)
import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const R = (p) => resolve(root, p);

async function ensureDir(p) {
  await mkdir(dirname(p), { recursive: true });
}

async function svgToPng(svgPath, outPath, size, { flatten } = {}) {
  await ensureDir(outPath);
  const svg = await readFile(svgPath);
  let pipe = sharp(svg, { density: 384 }).resize(size, size, { fit: 'contain' });
  if (flatten) pipe = pipe.flatten({ background: flatten });
  const buf = await pipe.png().toBuffer();
  await writeFile(outPath, buf);
  console.log(`✓ ${outPath} (${size}x${size})`);
}

async function svgToPngRect(svgPath, outPath, w, h, { flatten } = {}) {
  await ensureDir(outPath);
  const svg = await readFile(svgPath);
  let pipe = sharp(svg, { density: 384 }).resize(w, h, { fit: 'contain' });
  if (flatten) pipe = pipe.flatten({ background: flatten });
  const buf = await pipe.png().toBuffer();
  await writeFile(outPath, buf);
  console.log(`✓ ${outPath} (${w}x${h})`);
}

async function main() {
  // ---- @capacitor/assets source files (1024x1024, 2732x2732)
  await svgToPng(R('resources/icon-only.svg'), R('resources/icon.png'), 1024);
  await svgToPng(R('resources/icon-foreground.svg'), R('resources/icon-foreground.png'), 1024);
  await svgToPng(R('resources/icon-background.svg'), R('resources/icon-background.png'), 1024);
  await svgToPng(R('resources/splash.svg'), R('resources/splash.png'), 2732);
  await svgToPng(R('resources/splash-dark.svg'), R('resources/splash-dark.png'), 2732);

  // ---- Store deliverables
  // iOS App Store marketing icon must have NO alpha channel
  await svgToPng(R('resources/icon-only.svg'), R('store/app-store-icon-1024.png'), 1024, {
    flatten: '#10B981',
  });
  await svgToPng(R('resources/icon-only.svg'), R('store/play-store-icon-512.png'), 512);
  // Play feature graphic 1024x500 (dedicated banner layout, no transparency)
  await svgToPngRect(
    R('resources/feature-graphic.svg'),
    R('store/play-feature-graphic-1024x500.png'),
    1024,
    500,
    { flatten: '#10B981' }
  );

  // ---- Web / PWA
  await svgToPng(R('resources/icon-only.svg'), R('public/favicon.png'), 64);
  await svgToPng(R('resources/icon-only.svg'), R('public/favicon-16.png'), 16);
  await svgToPng(R('resources/icon-only.svg'), R('public/favicon-32.png'), 32);
  await svgToPng(R('resources/icon-only.svg'), R('public/apple-touch-icon.png'), 180);
  await svgToPng(R('resources/icon-only.svg'), R('public/icon-192.png'), 192);
  await svgToPng(R('resources/icon-only.svg'), R('public/icon-512.png'), 512);
  // Maskable PWA icon (full-bleed background + safe-zone foreground baked into icon-only.svg)
  await svgToPng(R('resources/icon-only.svg'), R('public/icon-maskable-512.png'), 512);

  // Multi-resolution favicon.ico (16/32/48)
  const icoBuf = await pngToIco([
    R('public/favicon-16.png'),
    R('public/favicon-32.png'),
    R('public/favicon.png'),
  ]);
  await writeFile(R('public/favicon.ico'), icoBuf);
  console.log(`✓ ${R('public/favicon.ico')} (multi-size)`);

  console.log('\nAll assets generated.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
