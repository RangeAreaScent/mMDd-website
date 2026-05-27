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
3×3 grid of cards. Data comes from a local `features` array — title,
body, and a small chip (often a keyboard shortcut). Edits are
data-driven; layout flexes to N items.

### `Themes.astro`
3×3 grid showing all 9 themes. Each card has a mini-window mockup
(window chrome, fake heading + lines + quote + code) rendered in that
theme's actual CSS colors via inline `style="--t-bg:…;…"` variables.
Free themes show a "Free" pill, supporter themes show "Supporter" in the
accent color. Hover lifts the card.

### `Fonts.astro`
2×4 grid showing all 8 fonts. Each card renders a 19px sample paragraph
in the actual typeface (loaded from Google Fonts in Layout). Free vs
Supporter badges as in Themes.

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

No `og:image` yet — should add a 1200×630 PNG once the brand asset is final.

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

_Last updated: 2026-05-27._
