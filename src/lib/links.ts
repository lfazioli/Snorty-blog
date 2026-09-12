/**
 * Decides whether a link found in post markdown can be handed to the router.
 *
 * Same-origin paths that the backend serves — /feed.xml, /sitemap.xml,
 * /robots.txt, /api/* — must stay plain anchors: the router would swallow the
 * navigation and render the not-found screen instead of the file.
 */
export function isClientRoute(href: string) {
  if (!href.startsWith("/") || href.startsWith("//") || href.startsWith("/api/")) return false;
  const lastSegment = href.split(/[?#]/)[0].split("/").pop() || "";
  return !lastSegment.includes(".");
}
