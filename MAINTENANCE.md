# mMDd Website — Maintenance Guide

Day-to-day operations for [mmdd.doie.cc](https://mmdd.doie.cc). Architecture and
"why" lives in [HANDOFF.md](./HANDOFF.md) — this file is "how do I do X".

---

## 0. The three repos

| repo | role | visibility |
|---|---|---|
| [`RangeAreaScent/mMDd`](https://github.com/RangeAreaScent/mMDd) | App source (Electron) | **Private** — has Pro code |
| [`RangeAreaScent/mMDd-releases`](https://github.com/RangeAreaScent/mMDd-releases) | DMG / EXE binaries | Public — anonymous download |
| [`RangeAreaScent/mMDd-website`](https://github.com/RangeAreaScent/mMDd-website) | This site | Public |

You're in the **website** repo. Don't push DMGs here. Don't push app source
here. Don't put release notes here — they go on the releases repo.

---

## 1. Local setup

```bash
cd ~/Library/Mobile\ Documents/com~apple~CloudDocs/App\ Projects/mMDd/mMDd_website
npm install         # one-time, or after dependency changes
npm run dev         # localhost:4321 with hot reload
npm run build       # static output → dist/
npm run preview     # serve the built site locally
```

Node 22.12+ required (see `package.json` `engines`).

---

## 2. Deploy flow

Vercel watches `main` on this repo. **Any push to `main` triggers an
automatic rebuild + deploy.** No manual deploy step.

```bash
# make change
git add <files>
git commit -m "Tighten Hero subhead copy"
git push                       # Vercel rebuilds in ~60s
```

Vercel preview URLs are also auto-generated for pull requests — useful for
reviewing visual changes before merging.

---

## 3. Editing copy

Almost every word lives in a component under `src/components/`. Find the
section, edit the JSX-style markup, push.

| To change… | Edit |
|---|---|
| Hero headline / subhead / buttons | `src/components/Hero.astro` |
| Feature cards (9 items) | `src/components/Features.astro` — `features` array |
| Theme cards (9 items, name/colors) | `src/components/Themes.astro` — `themes` array |
| Font cards (8 items, sample text) | `src/components/Fonts.astro` — `fonts` array + `sample` |
| Support / BMC tone | `src/components/Support.astro` |
| Install steps + xattr command | `src/components/Install.astro` |
| Footer links | `src/components/Footer.astro` |
| Nav links | `src/components/Nav.astro` |
| `<title>` and `<meta>` | `src/layouts/Layout.astro` |

For pure styling tweaks (colors, padding), edit the `<style>` block at the
bottom of the same component — styles are scoped to that file.

---

## 4. The single source of truth: `src/data/links.ts`

Every off-site URL on the site reads from this one file. **Update here,
update everywhere.**

```ts
APP_REPO              // App source repo
RELEASES_REPO         // Binary releases repo
RELEASES_PAGE         // /releases — safe fallback
DOWNLOAD.macArm       // /releases/latest/download/mMDd-mac-arm64.dmg
DOWNLOAD.macIntel     // /releases/latest/download/mMDd-mac-x64.dmg
DOWNLOAD.winInstaller // /releases/latest/download/mMDd-win-setup.exe
MAC_RELEASES_LIVE     // bool — show direct Mac download?
WIN_RELEASES_LIVE     // bool — show Windows button at all?
BMC_URL               // Buy Me a Coffee
```

The live flags toggle whether buttons go direct vs. to the releases page,
and whether the Windows button shows at all.

---

## 5. Shipping a new app release

End-to-end flow when you've built a new DMG in the `mMDd/dist/` folder:

### 5.1. Rename DMGs to the canonical pattern

Electron-builder spits out `mMDd-1.0.X-arm64.dmg` (as of `productName: "mMDd"`).
We host them as `mMDd-mac-arm64.dmg` so the site's `/latest/download/<name>`
URL stays stable across versions.

```bash
cd ~/Library/Mobile\ Documents/com~apple~CloudDocs/App\ Projects/mMDd
cp dist/mMDd-1.0.1-arm64.dmg dist/mMDd-mac-arm64.dmg
cp dist/mMDd-1.0.1.dmg       dist/mMDd-mac-x64.dmg
```

(Use `cp`, not `mv`, so the original-named files stay for your records.)

> **Overwriting an existing release** (e.g. you only changed the icon and
> want to keep the v1.0.0 tag): use `gh release upload --clobber` instead of
> `gh release create`. Same asset names just get replaced in place.

### 5.2. Create the release on the **public** repo

```bash
gh release create v1.0.1 \
  dist/mMDd-mac-arm64.dmg \
  dist/mMDd-mac-x64.dmg \
  --repo RangeAreaScent/mMDd-releases \
  --title "mMDd 1.0.1" \
  --notes-file release-notes-v1.0.1.md
```

Where `release-notes-v1.0.1.md` is a short markdown file with the changes.
Or use `--notes "..."` inline for a one-liner.

### 5.3. Clean up

```bash
rm dist/mMDd-mac-arm64.dmg dist/mMDd-mac-x64.dmg
```

(Originals like `mmdd-1.0.1-arm64.dmg` stay.)

### 5.4. That's it

The site's `/latest/download/mMDd-mac-arm64.dmg` URL automatically points
to the new build. **No website change needed for routine version bumps.**

---

## 6. Adding Windows support

When the Windows EXE is ready:

### 6.1. Build + rename

```bash
cd ~/Library/Mobile\ Documents/com~apple~CloudDocs/App\ Projects/mMDd
npm run dist:win
cp "dist/mMDd Setup 1.0.X.exe" dist/mMDd-win-setup.exe
```

### 6.2. Attach to the current (or new) release

```bash
gh release upload v1.0.X dist/mMDd-win-setup.exe \
  --repo RangeAreaScent/mMDd-releases
```

### 6.3. Flip the flag

```bash
cd mMDd_website
# Edit src/data/links.ts:
#   export const WIN_RELEASES_LIVE = true;
git commit -am "Enable Windows download"
git push
```

The Windows button reappears on the Hero. The "Windows build coming soon"
aside in the hero note disappears automatically.

---

## 7. Adding a new theme to the site

When the app gains a 10th theme:

1. Open `src/components/Themes.astro`
2. Add a new entry to the `themes` array:
   ```ts
   {
     id: "your-theme-id",
     label: "Display Name",
     pro: true,           // or false for free
     dark: true,          // or false for light
     bg: "#…",
     fg: "#…",
     fgSoft: "#…",
     accent: "#…",
     border: "#…",
     codeBg: "#…",
   }
   ```
3. Pull the actual hex values from
   `mMDd/src/styles/themes.css` so the site and app stay pixel-identical.

The grid layout flexes — adding cards just expands the grid; no other
changes needed.

---

## 8. Adding a new font to the site

1. Add the Google Fonts URL to `src/layouts/Layout.astro`'s
   `<link href="...">` (the long Google Fonts URL). Append the family name.
2. Open `src/components/Fonts.astro` and add to the `fonts` array:
   ```ts
   {
     id: "your-font-id",
     label: "Font Display Name",
     pro: true,
     stack: '"Your Font Name", fallback, monospace',
   }
   ```
3. If the font isn't on Google Fonts, you'll need to host it. For 1–2 fonts
   that's fine via `public/fonts/` + a custom `@font-face` declaration in
   `src/styles/global.css`. For more, follow the same pattern the app uses.

---

## 9. Changing the domain

If `mmdd.doie.cc` ever moves to another domain:

1. Update `astro.config.mjs`'s `site` value
2. Update DNS at the new registrar to point at Vercel
3. In Vercel dashboard → Project → Settings → Domains, swap the domain
4. Commit + push the `astro.config.mjs` change

The `site` value is what Astro uses to build absolute URLs in sitemaps and
OG meta tags. If you don't update it, social link previews keep pointing to
the old domain.

---

## 9b. Regenerating the brand icon

The app icon, favicon, and a 256px helper are all generated from one SVG
in `scripts/build-icon.mjs`. To tweak the design (color, radius, font size):

```bash
# Edit the SVG inside scripts/build-icon.mjs, then:
node scripts/build-icon.mjs

# Apply to the app too:
cp public/icon.png ../build/icon.png

# Commit both repos (this one + the app repo). Next dist:mac picks it up.
```

Outputs land in `public/`:

- `icon.svg` — vector source (also handy for OG image scaffolding)
- `icon.png` — 1024×1024 master (what electron-builder rasterizes from)
- `icon-256.png` — small bitmap (favicon fallback, social previews)

`public/favicon.svg` has the same gradient + glyph as `icon.svg` and should
stay in sync when the icon changes.

---

## 10. Light / dark theme

The site has two themes that mirror the app:

- **Newsprint** (default, the signature look) — `data-theme="newsprint"` or
  unset (CSS `:root` defaults are Newsprint)
- **Dark** — `data-theme="dark"`

The toggle in the nav swaps between them and writes to `localStorage` as
`mmdd-site-theme`. The site **does not** auto-detect `prefers-color-scheme`
— Newsprint is the brand and visitors should see it first.

To change the default to "follow system": edit the inline script in
`src/layouts/Layout.astro` to read the media query. (Currently disabled
intentionally.)

---

## 11. Troubleshooting

### iCloud sync conflicts (`favicon 2.svg` etc.)

iCloud sometimes creates "filename 2.ext" copies during sync. They'll show
as untracked in `git status`. Delete them:

```bash
find . -name "* 2.*" -not -path "./node_modules/*" -delete
```

Already covered in `.gitignore` for tracked files, but the duplicate files
themselves need a manual sweep.

### "EPERM: operation not permitted"

macOS TCC (Privacy & Security) revoked Full Disk Access from your shell.
Re-grant it: System Settings → Privacy & Security → Full Disk Access →
enable the terminal/editor. May need to toggle off/on to re-apply.

If it persists, the `mMDd_website` folder might be evicted from iCloud
local cache. Open it in Finder; sync indicator will trigger a redownload.

### Vercel build fails

Check the Vercel deployment logs. Common causes:
- A new dependency in `package.json` not in `package-lock.json` — run
  `npm install` locally and commit the updated lock
- An `import` referencing a file that doesn't exist (typo or moved file)
- Astro version mismatch — `package.json` engines requires Node 22.12+

### Buttons point to a 404

You forgot to flip `RELEASES_LIVE` in `src/data/links.ts` after publishing,
or the asset name on GitHub doesn't match the URL pattern in `DOWNLOAD`.
Verify the actual asset filename:

```bash
gh release view v1.0.X --repo RangeAreaScent/mMDd-releases \
  --json assets -q '.assets[].name'
```

Should match exactly `mMDd-mac-arm64.dmg` / `mMDd-mac-x64.dmg` /
`mMDd-win-setup.exe`.

### Site shows old content after push

Vercel cache. Hard-refresh (⌘⇧R on Mac) bypasses browser cache. If Vercel
itself is stale, trigger a redeploy from the Vercel dashboard (the latest
commit will show with a "Redeploy" button).

### `npm run dist:mac` fails late with `which python`

macOS Sequoia ships `python3` only — no bare `python`. `@electron/rebuild`
shells out to `which python` during its native-deps step and exits
non-zero, which kills the build (often after one arch is already
packaged, leaving an incomplete `dist/`). mMDd has no native modules,
so the lookup is gratuitous.

Fix: point the build at `python3` explicitly.

```bash
PYTHON=$(which python3) npm run dist:mac
```

Make it permanent by adding to your shell rc (`~/.zshrc` / `~/.bashrc`):

```bash
export PYTHON=/usr/bin/python3
```

Or via npm config:

```bash
npm config set python python3
```

### `.md` files still open with the old editor after install

macOS Launch Services caches every app's file-type claims. If a previous
`mmdd.app` (lowercase) was installed, the cache may still route `.md` to
it — even after dragging the new `mMDd.app` into Applications.

Modern macOS (Sequoia+) removed `lsregister -kill`, so the old "nuke the
whole LS database" trick is gone. Targeted cleanup instead:

```bash
rm -rf /Applications/mmdd.app                # remove any old copy

# Force-register the current install
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister \
  -f /Applications/mMDd.app

killall Finder Dock
```

Then right-click a `.md` file → Get Info → "Open with" → mMDd → "Change
All…". The current build registers Editor + Owner rank, so the preference
sticks against rival apps (VS Code, Obsidian, etc.).

### `mMDd` doesn't appear in Recommended Applications

Real cause: **ghost LS registrations** of `com.mmdd.app` at multiple paths.
Every time `npm run dist:mac` runs, the new `dist/mac-arm64/mMDd.app` and
`dist/mac/mMDd.app` get auto-registered alongside the proper
`/Applications/mMDd.app`. Same bundle ID claiming Owner rank from 3–5
locations confuses Launch Services so it surfaces *none* of them in the
user-facing "Recommended" list.

Symptoms: the Open With menu's recommended section skips mMDd entirely,
and Always Open With doesn't stick.

Verify the duplicates:

```bash
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister \
  -dump 2>/dev/null | grep -E "^path:.*mMDd\.app$|^path:.*mMDd\.app \(" | grep -v Helper
```

Expected: one line (`/Applications/mMDd.app`). If you see entries under
`/Volumes/`, `~/.../dist/`, or anywhere else, those are the ghosts.

Fix:

```bash
# 1. Eject any mounted mMDd DMG (drag /Volumes/mMDd*/ to Trash or use ⌘E)

# 2. Delete the dist/mac* folders — keep the DMG files, drop the .app dirs
rm -rf dist/mac dist/mac-arm64

# 3. Deregister each ghost path
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister \
  -u "/Volumes/mMDd 1.0.0/mMDd.app"
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister \
  -u "/Users/ryan/.../dist/mac-arm64/mMDd.app"   # paths from the -dump above

# 4. Force-register only the installed copy
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister \
  -f /Applications/mMDd.app

# 5. Refresh the UI
killall Finder Dock
```

**Prevent recurrence**: after every `npm run dist:mac`, eject any mounted
DMG and delete `dist/mac*` once the DMGs are uploaded. The DMG files
themselves are fine to keep.

### Vercel deployment failing on `sharp`

`scripts/build-icon.mjs` uses `sharp` to render the icon SVG. The script
runs locally, not on Vercel — but if you ever wire it into the build
step, Vercel needs the right native binary for its Linux runtime. Easier
fix: commit the rendered `public/icon.png` so deploys never need to run
the generator.

### Local dev server serves stale CSS

Astro's Vite HMR sometimes hangs onto an old stylesheet after big edits
(e.g. renaming classes). Symptom: the new HTML is there but cards have
no styling. Fix: stop the dev server (q + Enter), then `npm run dev`
again. Don't rely on hot reload across structural changes.

---

## 12. Quick reference

```bash
# Run locally
npm run dev

# Build + check static output
npm run build && npm run preview

# Cut a website release (just push)
git add -A && git commit -m "..." && git push

# Cut an app release (binary)
cd ../mMDd
cp dist/mmdd-X.Y.Z-arm64.dmg dist/mMDd-mac-arm64.dmg
cp dist/mmdd-X.Y.Z.dmg dist/mMDd-mac-x64.dmg
gh release create vX.Y.Z \
  dist/mMDd-mac-arm64.dmg \
  dist/mMDd-mac-x64.dmg \
  --repo RangeAreaScent/mMDd-releases \
  --title "mMDd X.Y.Z" \
  --notes "..."

# Inspect what's actually published
gh release view vX.Y.Z --repo RangeAreaScent/mMDd-releases
curl -sIL "https://github.com/RangeAreaScent/mMDd-releases/releases/latest/download/mMDd-mac-arm64.dmg" | head
```
