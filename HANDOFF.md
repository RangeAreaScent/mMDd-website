# mMDd Website — Project Handoff

> Marketing + download site for **mMDd**, the Markdown editor.
> One-page Astro static site at [mmdd.space](https://mmdd.space).

For day-to-day operations (push a new release, edit copy, troubleshoot) see
[MAINTENANCE.md](./MAINTENANCE.md). This file is the architectural overview.

---

## 1. Positioning

- **Site tagline**: _Clean. Light. Free._ A Markdown editor.
- **Visual identity**: Newsprint paper (warm cream `#f7f7f4`, vintage red
  `#b03a2e`, Times-style serif) — exactly mirrors the app's signature
  default theme. Dark toggle swaps to Newsprint-dark.
- **Pro framing**: app is _free forever_; supporters get a thank-you code
  unlocking 5 extra themes + 6 extra fonts. Not a paywall — a gesture.
- **Reference tone**: Typora's homepage (minimal hero, screenshot, feature
  grid) for layout; PasteLight's install card for the unsigned-build
  explanation.

---

## 2. Tech stack

- **Astro 6** — static site generator. Plain `.astro` components with
  scoped CSS, no client framework (no React / Vue / Svelte).
- **Vanilla CSS** — CSS variables for theming, no Tailwind, no preprocessor.
  Scoped per-component via Astro's built-in style isolation.
- **TypeScript** — only for `src/data/links.ts`. Components are plain
  `.astro` with TS-style typing in the frontmatter.
- **Google Fonts** — loaded via `<link>` in `Layout.astro`. iA Writer
  Quattro (the app's default) isn't on Google Fonts, so the site
  approximates with Inter for that one preview.
- **No JS framework runtime** — all interactivity (theme toggle, copy
  button) is small inline `<script>` blocks in the relevant component.

Hosting: **Vercel** (static deploy from `RangeAreaScent/mMDd-website` →
`main`). DNS for `mmdd.space` points at Vercel.

---

## 3. File layout

```
mMDd_website/
├── astro.config.mjs        Site URL + trailing-slash policy
├── package.json
├── tsconfig.json
├── public/
│   └── favicon.svg         Red rounded square with "mMDd" glyph
├── src/
│   ├── data/
│   │   └── links.ts        Single source of truth for off-site URLs
│   ├── layouts/
│   │   └── Layout.astro    <html> shell, <head>, theme-restore script
│   ├── components/
│   │   ├── Logo.astro      The red rounded-square mark
│   │   ├── Nav.astro       Sticky nav, theme toggle, GitHub link
│   │   ├── Hero.astro      Headline + download buttons + window mockup
│   │   ├── Features.astro  9 feature cards (data-driven)
│   │   ├── Themes.astro    9 theme preview cards (palette-accurate)
│   │   ├── Fonts.astro     8 font samples (each in its own typeface)
│   │   ├── Support.astro   BMC + thank-you tone + redeem steps
│   │   ├── Install.astro   First-time install (Gatekeeper workaround)
│   │   └── Footer.astro    Brand + nav + "no tracking" line
│   ├── pages/
│   │   └── index.astro     Composes all sections in order
│   └── styles/
│       └── global.css      Theme variables, layout primitives, .btn
├── HANDOFF.md              (this file)
├── MAINTENANCE.md          How-to for daily ops
└── .gitignore              Includes macOS/iCloud metadata patterns
```

---

## 4. Page composition

`src/pages/index.astro` is just a layout container:

```
Layout
├── Nav
├── main
│   ├── Hero
│   ├── Features
│   ├── Themes
│   ├── Fonts
│   ├── Support
│   └── Install
└── Footer
```

Each section is a self-contained component with its own styles. **There are
no shared CSS classes between sections except the ones in `global.css`**
(`.container`, `.section-head`, `.eyebrow`, `.lede`, `.btn`, `.badge`).

---

## 5. Theme system

Two themes, declared as CSS variable sets on `<html>`:

```
<html data-theme="newsprint">  /* default, also when attribute is missing */
<html data-theme="dark">        /* user toggled */
```

Variables (defined in `src/styles/global.css`):

| Var | Newsprint | Dark |
|---|---|---|
| `--bg` | `#f7f7f4` | `#1c1a17` |
| `--fg` | `#2b2b2b` | `#e8e3d6` |
| `--fg-soft` | `#6b6b6b` | `#a09b8e` |
| `--accent` | `#b03a2e` | `#d2876d` |
| `--border` | `#e0e0da` | `#2e2a26` |
| `--code-bg` | `#ededea` | `#26221e` |
| `--panel-bg` | `#f7f7f4` | `#26221e` |
| `--chip-bg` | `#ededea` | `#2e2a26` |
| `--hr` | `#d3d3cc` | `#2e2a26` |

These mirror the app's `themes.css` Newsprint + Newsprint-dark blocks
exactly, so the site looks like the app rendering itself.

**Why not auto-detect prefers-color-scheme?** Newsprint is the brand. First
impression should be the paper theme. The `Layout.astro` boot script reads
`localStorage["mmdd-site-theme"]` and only switches if the user has
explicitly toggled. (See §11 in MAINTENANCE.md to flip this.)

---

## 6. Data layer — `src/data/links.ts`

Every external URL lives here. The hero buttons, Install section,
Support section, and Footer all import from this file. Toggling
`MAC_RELEASES_LIVE` / `WIN_RELEASES_LIVE` flips the corresponding download
button between "go direct" and "go to releases page", and hides the
Windows button when off.

Why centralized:

- URL renames (asset filename changes, repo moves) need one edit
- Per-platform release readiness is explicit
- Tests / preview environments can stub the entire links module if needed

---

## 7. Download infrastructure

**Three GitHub repos:**

| repo | role | visibility |
|---|---|---|
| `RangeAreaScent/mMDd` | App source | **Private** |
| `RangeAreaScent/mMDd-releases` | Binary releases | Public |
| `RangeAreaScent/mMDd-website` | This site | Public |

**Why a separate releases repo?** Release assets on private repos are
auth-gated — anonymous users can't download. Splitting the binaries into a
public repo keeps the app source private (Pro code `MMDD-COFFEE-2026` is
hardcoded) while letting downloads work for everyone.

**Canonical asset naming:**

- `mMDd-mac-arm64.dmg` (Apple Silicon)
- `mMDd-mac-x64.dmg` (Intel)
- `mMDd-win-setup.exe` (Windows, future)

GitHub's `/releases/latest/download/<name>` URL redirects to the newest
release with that exact asset name. So upgrading versions is just
"publish a new release with the same asset names" — site doesn't change.

---

## 8. Components — what each one does

### `Logo.astro`
A red rounded-square with "mMDd" text inside (Times-style serif). Single
prop: `size`. Used in the Nav, Hero, Footer.

### `Nav.astro`
Sticky top nav. Brand mark + section links (`#features`, `#themes`, …) +
GitHub icon + theme toggle. Backdrop-blurred where supported, solid bg as
fallback. Mobile (≤720px): hides the section links, keeps brand + actions.

### `Hero.astro`
The first thing visitors see.
- **Left**: 64px logo, headline ("Clean. Light. _Free._ A Markdown
  editor."), lede paragraph, Mac download button, optional Windows
  button (hidden when `WIN_RELEASES_LIVE === false`), small note about
  arch / coming-soon.
- **Right**: a CSS-only mockup of the app showing the split view —
  window chrome with macOS traffic lights, fake tabs, an editor pane
  with markdown source, a preview pane with rendered output. All
  hand-coded; no PNG, so it themes with the page.

### `Features.astro`
Typora-style 3×3 grid. Each card has a small CSS/SVG illustration (a
mini-mockup of the feature — split view panes, tabs row, outline
sidebar, find bar with a highlighted match, task list, focus mode,
image→PDF export icons, auto-save status rows with a pulsing dirty
dot, and a YAML front-matter snippet) sitting above a vintage-red
title and a short body. No card chrome — just spacing and the
illustration tile (`.art` class) on a chip-bg background. Edits are
inline rather than data-driven because each illustration is bespoke.

### `Themes.astro`
Single-row cascade of all 9 themes. Each "window" card is positioned
absolutely at `left: var(--idx) * 78px` with z-index increasing
left-to-right, so the rightmost card (Newsprint, the default) is
fully visible while the others peek out from behind with just their
title bars and a strip of content. Each card uses inline
`style="--t-bg:…;…"` CSS variables to render its preview content
(heading, copy, link, quote, code) in that theme's palette. Static
display — no hover, no caption, no 3D tilt; cards just fade in
left-to-right when the section scrolls into view. Falls back to a
horizontal scroll-snap carousel below 680px.

### `Fonts.astro`
4×2 specimen wall — 8 cells in a tight grid with hairline dividers.
Each cell shows the font's **name** rendered in its own typeface
(`font-size: 20px`), plus an optional small note ("Default", "Pairs
with Matrix"). No sample sentence, no Supporter badge — the
free/supporter split lives only in the section lede. Padding is
tight (16px vertical, 22px horizontal, 90px min-height) so the
section stays scannable. iA Writer Quattro isn't on Google Fonts,
so it approximates with Inter for that one cell.

### `Support.astro`
The thank-you / BMC card. Left: copy ("mMDd is free. Forever.") + BMC
button + "How to redeem a code" steps. Right: a CSS-only coffee mug
illustration with animated steam (CSS keyframes). The redeem steps live
here so visitors who already have a code can find it without scrolling
to a separate page.

### `Install.astro`
First-time install panel modeled on PasteLight. Three numbered steps,
the `xattr -dr com.apple.quarantine /Applications/mMDd.app` command in
a dark code block with a COPY button, and a friendly note clarifying
the command's scope. Includes an Intel-Mac fallback link when
`MAC_RELEASES_LIVE === true`.

### `Footer.astro`
Centered: brand mark, section links + BMC, "© year mMDd · Made with
care.", "No tracking. No telemetry. Just Markdown."

---

## 9. Decision log

| Decision | Why |
|---|---|
| Astro vs plain HTML/CSS/JS | 9 theme cards + 8 font cards + 9 feature cards is enough repetition that data-driven components win. Component sharing keeps the file <1000 lines per concern. |
| Vanilla CSS vs Tailwind | Site has ~9 sections, each with its own style scope. Tailwind would add ~10 KB of utilities for marginal benefit. CSS variables already do theming. |
| No client JS framework | One-page static site with two small interactions (theme toggle, copy button). A framework runtime would be larger than the rest of the JS combined. |
| Newsprint default, not OS theme | First-impression branding. Dark mode users still get one click to switch, but they see what makes mMDd visually distinct first. |
| Inline window mockup vs screenshot | A screenshot would be stale the moment the app updates. The CSS mockup themes with the page (light/dark) and uses real CSS variables — automatic consistency. |
| Two-button hero (Mac + Win) collapsed to one | Win build doesn't exist yet, and one big primary button looks more decisive than two with one disabled. Hidden cleanly via `WIN_RELEASES_LIVE`. |
| Separate public releases repo | Keeps app source private while making DMG downloads work for anonymous visitors. Common indie-Mac pattern. |
| Canonical asset naming (`mMDd-mac-arm64.dmg`) | The `/releases/latest/download/<name>` URL pattern stays stable across versions. No website redeploy needed for routine releases. |
| `links.ts` as single source of truth | Easier mental model than chasing hrefs through 9 components. One file to update when repo names / domains change. |
| No analytics / no cookies | "No tracking. No telemetry." in the footer. Matches the app's positioning. If analytics ever needed, use Plausible or similar privacy-friendly option. |
| Themes: single-row cascade, not bookshelf or 3D isometric | Tried both — bookshelf's 3 rows broke the "nine themes at a glance" promise, and the isometric tilt caused cards to collapse visually under perspective. A flat z-stacked row reads instantly: "Newsprint is the default, others exist." |
| Themes: no hover-to-front, no caption | Each card already shows its theme name inside the window title bar. A separate caption + interactive selector added cognitive load without adding info. Visitors aren't shopping themes here, they're absorbing variety. |
| Features: per-card bespoke illustrations | A unified icon set would be easier to maintain but less convincing — Typora's strength is that each feature card looks like a tiny screenshot of that feature. CSS mockups (window chrome, fake content rendered in theme colors) get most of that effect without bundling images. |
| Fonts: name-in-its-own-face, no sample sentence | The sample sentence repeated 8 times was filler. The font's own name set in its own typeface conveys character with no extra reading. The free/supporter split moved to the lede because per-card badges drew the eye away from the typefaces. |
| Icon source in this repo (not the app repo) | The same SVG drives the favicon, the `<Logo>` component's visual reference, and the app's `build/icon.png`. Keeping the generator (`scripts/build-icon.mjs`) in the public website repo means anyone can audit the brand mark; the app repo just consumes the generated PNG. |

---

## 10. Performance

Static site, ~5700px tall, ~30 KB of CSS (split across components),
~3 KB of JS (theme toggle + copy button), ~7 KB favicon + 0 PNGs in the
critical path.

Google Fonts adds ~80–120 KB depending on what's in cache. Could be
inlined if site grows traffic enough to justify the bandwidth.

---

## 11. SEO + meta

- `<title>` and `<meta name="description">` defined in `Layout.astro`'s
  `Props` interface — components can override per-page if multi-page later.
- Open Graph + Twitter card tags included.
- `astro.config.mjs` has `site: "https://mmdd.space"` so sitemap and
  absolute URLs resolve correctly. **Update this if the domain changes.**

No `og:image` yet — should add a 1200×630 PNG. `scripts/build-icon.mjs`
can be extended to emit one once the social preview design is settled.

---

## 12. Outstanding

Optional polish for later:

- **og:image** — 1200×630 social preview PNG
- **Sitemap + robots.txt** — Astro can generate via the sitemap integration
- **Analytics** — privacy-friendly (Plausible) if/when traffic justifies
- **Changelog page** — currently release notes live only on the
  `mMDd-releases` repo. A `/changelog` page generated from Astro content
  collections would be a clean follow-up
- **Multi-language** — Korean version, since the dev's primary audience is
  Korean-speaking. Astro has good i18n support
- **Server-side Pro-code purchase flow** — currently honor-system. A
  Stripe-or-similar checkout that emails a code would be a real
  monetization step

None of these block the v1 site from being useful.

---

## 13. The relationship to the app

This site is intentionally **un-coupled** from the app's source:

- It doesn't import anything from `mMDd/`
- Theme colors and feature copy are duplicated, not shared
- Version numbers aren't synced — site doesn't display the current version
  beyond release titles

This is deliberate. The site needs to deploy independently, survive app
refactors, and stay buildable on Vercel without access to the (private)
app source.

If a feature is added to the app, **the site doesn't change automatically.**
Add a card to `Features.astro` and push.

---

_Last updated: 2026-05-29._
