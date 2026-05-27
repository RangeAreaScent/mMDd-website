# mMDd website

Landing page for **mMDd** — the clean, light, free Markdown editor.

## Develop

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output to ./dist
npm run preview
```

## Stack

- Astro 6 (static, no JS framework)
- Vanilla CSS using the same theme variables as the app
- Google Fonts for the supporter-font samples (Inter, Merriweather, Noto
  Serif, JetBrains Mono, Nanum Gothic Coding, VT323)

## Deploy

- Push to GitHub
- Import the repo into Vercel — it auto-detects Astro, no config needed
- Once a domain is purchased, set the production domain in Vercel **and**
  update `site` in `astro.config.mjs`

## Updating the download buttons

The Mac / Windows buttons in the Hero currently link to `#download`
(an anchor that scrolls to the redeem-code instructions) with
`aria-disabled="true"` as a "Coming soon" stub. Once a GitHub Release is
published with the `.dmg` and `.exe`, replace the two `href`s in
`src/components/Hero.astro` with the latest-release URLs:

```
https://github.com/<owner>/<repo>/releases/latest/download/mMDd-<ver>.dmg
https://github.com/<owner>/<repo>/releases/latest/download/mMDd-Setup-<ver>.exe
```

…and remove the `aria-disabled` attribute from each anchor.
