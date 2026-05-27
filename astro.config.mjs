// @ts-check
import { defineConfig } from "astro/config";

// Update `site` once the production domain is purchased so absolute URLs in
// sitemap/og tags resolve correctly.
export default defineConfig({
  // site: "https://mmdd.app",
  trailingSlash: "never",
});
