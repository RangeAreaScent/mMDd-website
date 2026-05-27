// Central source of truth for off-site URLs.
// Update these when releases ship — every component reads from here so
// there's no scattered href hunting.

// App source repo (private — for "View source" links only, not for downloads).
export const APP_REPO = "https://github.com/RangeAreaScent/mMDd";

// Public binary release repo. DMG / EXE attached as release assets here so
// anonymous visitors can download without GitHub auth.
export const RELEASES_REPO =
  "https://github.com/RangeAreaScent/mMDd-releases";

// Releases landing page — safe fallback when a platform isn't live yet.
export const RELEASES_PAGE = `${RELEASES_REPO}/releases`;

// /latest/download/<asset> URLs redirect to the most recent release's named
// asset. GitHub keeps these stable across version bumps as long as the asset
// filename pattern is preserved.
export const DOWNLOAD = {
  macArm: `${RELEASES_REPO}/releases/latest/download/mMDd-mac-arm64.dmg`,
  macIntel: `${RELEASES_REPO}/releases/latest/download/mMDd-mac-x64.dmg`,
  winInstaller: `${RELEASES_REPO}/releases/latest/download/mMDd-win-setup.exe`,
} as const;

// Per-platform release availability. Flip to true once that platform's asset
// is published in the latest release.
export const MAC_RELEASES_LIVE = true;
export const WIN_RELEASES_LIVE = false;

// Convenience hrefs — pick the right URL based on the live flags.
// Mac defaults to Apple Silicon (dominant since 2020); Intel users can grab
// the x64 build from the Install section / releases page.
export const macDownloadHref = MAC_RELEASES_LIVE
  ? DOWNLOAD.macArm
  : RELEASES_PAGE;

export const macIntelDownloadHref = MAC_RELEASES_LIVE
  ? DOWNLOAD.macIntel
  : RELEASES_PAGE;

export const winDownloadHref = WIN_RELEASES_LIVE
  ? DOWNLOAD.winInstaller
  : RELEASES_PAGE;

// Whether any release is live (controls "Coming soon" copy in the Hero).
export const ANY_RELEASE_LIVE = MAC_RELEASES_LIVE || WIN_RELEASES_LIVE;

// Other off-site links.
export const BMC_URL = "https://buymeacoffee.com/thesignalnews";
export const WEBSITE_REPO = "https://github.com/RangeAreaScent/mMDd-website";
