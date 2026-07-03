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
const CREAM = "#f7f1e3"; // App-icon foreground cream.
const PAPER = "#f7f7f4"; // Document-icon page background — Newsprint bg.
const INK = "#1a1a1a"; // Document text.

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

// Document-icon SVG — the icon Finder uses for .md / .markdown / .mdown / .mkd
// files (separate from the app icon). Newsprint paper, big serif "MD" with
// a small "md" label, a folded top-right corner for that classic document
// trope, and a tiny mMDd watermark at the bottom tying it back to the brand.
const FOLD = 260; // How far the folded corner cuts in from top-right.
const docSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs>
    <!-- Slight shadow tucked under the folded flap. -->
    <linearGradient id="fold-shadow" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="rgba(0,0,0,0.12)"/>
      <stop offset="1" stop-color="rgba(0,0,0,0)"/>
    </linearGradient>
    <!-- Back-of-page tone for the folded flap — a touch darker than the
         Newsprint bg so the fold reads. -->
    <linearGradient id="flap" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#e0e0da"/>
      <stop offset="1" stop-color="#c9c9c1"/>
    </linearGradient>
  </defs>

  <!-- Page shape: rounded square with top-right corner cut diagonally.
       Flat Newsprint bg — no gradient — so it matches the app's actual
       theme background exactly. -->
  <path d="
    M 0 ${RADIUS}
    Q 0 0 ${RADIUS} 0
    L ${SIZE - FOLD} 0
    L ${SIZE} ${FOLD}
    L ${SIZE} ${SIZE - RADIUS}
    Q ${SIZE} ${SIZE} ${SIZE - RADIUS} ${SIZE}
    L ${RADIUS} ${SIZE}
    Q 0 ${SIZE} 0 ${SIZE - RADIUS}
    Z
  " fill="${PAPER}" stroke="#d3d3cc" stroke-width="1"/>

  <!-- Folded flap (visible because the corner is bent down). -->
  <path d="
    M ${SIZE - FOLD} 0
    L ${SIZE} ${FOLD}
    L ${SIZE - FOLD} ${FOLD}
    Z
  " fill="url(#flap)" stroke="#c9c9c1" stroke-width="1"/>

  <!-- Tiny shadow at the fold crease. -->
  <path d="
    M ${SIZE - FOLD} 0
    L ${SIZE - FOLD} ${FOLD}
    L ${SIZE - FOLD + 30} ${FOLD}
    Z
  " fill="url(#fold-shadow)"/>

  <!-- Large MD, centered on the page — the document's main mark. -->
  <text x="50%" y="480"
        text-anchor="middle"
        dominant-baseline="central"
        font-family="'New York', 'Iowan Old Style', 'Times New Roman', Georgia, serif"
        font-weight="700"
        font-size="580"
        letter-spacing="-24"
        fill="${INK}">MD</text>

  <!-- mMDd watermark — vintage red, low-contrast so it doesn't compete. -->
  <text x="50%" y="900"
        text-anchor="middle"
        dominant-baseline="central"
        font-family="'New York', 'Iowan Old Style', 'Times New Roman', Georgia, serif"
        font-weight="700"
        font-size="60"
        letter-spacing="-1.5"
        fill="${RED}">mMDd</text>
</svg>`;

async function main() {
  const outDir = join(__dirname, "..", "public");
  await mkdir(outDir, { recursive: true });

  // ---- App icon (Dock / Launchpad / About) ----
  const svgPath = join(outDir, "icon.svg");
  await writeFile(svgPath, svg, "utf8");
  console.log("Wrote", svgPath);

  const pngPath = join(outDir, "icon.png");
  await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9 })
    .toFile(pngPath);
  console.log("Wrote", pngPath);

  const png256 = join(outDir, "icon-256.png");
  await sharp(Buffer.from(svg))
    .resize(256, 256)
    .png({ compressionLevel: 9 })
    .toFile(png256);
  console.log("Wrote", png256);

  // ---- Document icon (Finder file representation for .md / .markdown / …) ----
  const docSvgPath = join(outDir, "doc-icon.svg");
  await writeFile(docSvgPath, docSvg, "utf8");
  console.log("Wrote", docSvgPath);

  const docPngPath = join(outDir, "doc-icon.png");
  await sharp(Buffer.from(docSvg))
    .png({ compressionLevel: 9 })
    .toFile(docPngPath);
  console.log("Wrote", docPngPath);

  const docPng256 = join(outDir, "doc-icon-256.png");
  await sharp(Buffer.from(docSvg))
    .resize(256, 256)
    .png({ compressionLevel: 9 })
    .toFile(docPng256);
  console.log("Wrote", docPng256);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
