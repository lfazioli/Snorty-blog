const configuredSiteUrl = import.meta.env.VITE_SITE_URL?.trim().replace(/\/$/, "");

/** The public URL used for canonical links. Set VITE_SITE_URL on Vercel. */
export function getSiteUrl() {
  if (configuredSiteUrl) return configuredSiteUrl;
  return typeof window === "undefined" ? "" : window.location.origin;
}
