// Central source of truth for off-site URLs.
// Update these once GitHub Releases are published — every component reads
// from here so no scattered href hunting.

// App repo (where DMG/EXE are released). Adjust if the final repo name differs.
export const APP_REPO = "https://github.com/RangeAreaScent/mMDd";

// Releases landing page — safe pre-release default (won't 404 once repo exists).
export const RELEASES_PAGE = `${APP_REPO}/releases`;

// Once a release is tagged with the canonical asset names below, these
// /latest/download/<asset> URLs will redirect to the most recent build.
// Until then they 404 — switch the Hero buttons to RELEASES_PAGE in the meantime.
export const DOWNLOAD = {
  macUniversal: `${APP_REPO}/releases/latest/download/mMDd-mac-universal.dmg`,
  macArm: `${APP_REPO}/releases/latest/download/mMDd-mac-arm64.dmg`,
  macIntel: `${APP_REPO}/releases/latest/download/mMDd-mac-x64.dmg`,
  winInstaller: `${APP_REPO}/releases/latest/download/mMDd-win-setup.exe`,
} as const;

// Set to true once at least one release exists. Until then, buttons point to
// RELEASES_PAGE so visitors land somewhere useful instead of a 404.
export const RELEASES_LIVE = false;

// Convenience: pick the right URL based on RELEASES_LIVE.
export const macDownloadHref = RELEASES_LIVE
  ? DOWNLOAD.macUniversal
  : RELEASES_PAGE;
export const winDownloadHref = RELEASES_LIVE
  ? DOWNLOAD.winInstaller
  : RELEASES_PAGE;

// Other links.
export const BMC_URL = "https://buymeacoffee.com/thesignalnews";
export const WEBSITE_REPO = "https://github.com/RangeAreaScent/mMDd-website";
