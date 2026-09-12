// One place that decides which host the site calls itself by. Canonical links,
// the sitemap, the feed and og:url all have to agree on it: a canonical that
// points at a host which redirects is a contradictory signal.

type Headers = Record<string, string | string[] | undefined>;

function headerValue(headers: Headers, name: string) {
  return String(headers[name] || "").split(",")[0].trim();
}

/** The host this deployment is actually answering on. */
export function requestOrigin(headers: Headers) {
  const host = headerValue(headers, "x-forwarded-host") || headerValue(headers, "host");
  const protocol = headerValue(headers, "x-forwarded-proto") || "https";
  return host ? `${protocol}://${host}` : "";
}

/**
 * The public host to publish in canonical links. SITE_URL wins so that preview
 * deployments never advertise themselves as the canonical site.
 */
export function resolveSiteUrl(headers: Headers) {
  const configured = process.env.SITE_URL?.trim().replace(/\/$/, "");
  return configured || requestOrigin(headers);
}
