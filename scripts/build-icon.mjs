// Generate the mMDd app icon — same red rounded square + "mMDd" serif
// glyph used as the site favicon and nav logo, but at 1024×1024 for
// Electron / electron-builder.
//
// Output: ../mMDd_website/public/icon.png  (also copied into the app
//          repo's build/icon.png by hand or by the apply-icon script).
//
// Usage:
//   node scripts/build-icon.mjs
//
// Requires: sharp (already a transitive dep via Astro's image tooling).

import sharp from "sharp";
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SIZE = 1024;
const RADIUS = 230; // ~22.5% — close to the macOS Sonoma squircle.
const RED = "#b03a2e";
const CREAM = "#f7f1e3";

// Vector source. Text uses the system serif stack so libvips picks up
// New York / Times / Iowan depending on what's installed. The glyph
// shape ("mMDd") stays consistent across renderers because we set an
// explicit fallback and weight.
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#c4493b"/>
      <stop offset="0.55" stop-color="${RED}"/>
      <stop offset="1" stop-color="#94301f"/>
    </linearGradient>
    <linearGradient id="shine" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="white" stop-opacity="0.18"/>
      <stop offset="0.5" stop-color="white" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <!-- App tile -->
  <rect x="0" y="0" width="${SIZE}" height="${SIZE}" rx="${RADIUS}" ry="${RADIUS}" fill="url(#bg)"/>
  <rect x="0" y="0" width="${SIZE}" height="${SIZE}" rx="${RADIUS}" ry="${RADIUS}" fill="url(#shine)"/>

  <!-- Logotype — sized so the cap-height sits comfortably inside
       the squircle with ~17% safe area on each side. -->
  <text x="50%" y="54%"
        text-anchor="middle"
        dominant-baseline="central"
        font-family="'New York', 'Iowan Old Style', 'Times New Roman', Georgia, serif"
        font-weight="700"
        font-size="300"
        letter-spacing="-8"
        fill="${CREAM}">mMDd</text>
</svg>`;

async function main() {
  const outDir = join(__dirname, "..", "public");
  await mkdir(outDir, { recursive: true });

  // Save the SVG source too — handy for re-exporting at other sizes
  // or for the favicon.
  const svgPath = join(outDir, "icon.svg");
  await writeFile(svgPath, svg, "utf8");
  console.log("Wrote", svgPath);

  // Rasterize to PNG at the icon's intrinsic size (1024×1024).
  const pngPath = join(outDir, "icon.png");
  await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9 })
    .toFile(pngPath);
  console.log("Wrote", pngPath);

  // Also emit a small 256 for OG / PWA / favicon scaling.
  const png256 = join(outDir, "icon-256.png");
  await sharp(Buffer.from(svg))
    .resize(256, 256)
    .png({ compressionLevel: 9 })
    .toFile(png256);
  console.log("Wrote", png256);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
