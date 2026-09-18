// Every route the SPA answers, described once so that the server can serve the
// right <head> before React runs and the client can keep it in sync afterwards.
//
// Until this existed only /post/:slug was prerendered: /, /posts, /tools and
// /about all served the same shell, so a crawler saw four indexable pages with
// an identical <title>, no canonical and no structured data — and any unknown
// URL answered 200 with the shell, which is a soft 404.

export type PageDescriptor = {
  path: string;
  title: string;
  description: string;
  noIndex?: boolean;
};

export const HOME_PAGE: PageDescriptor = {
  path: "/",
  title: "Cybersecurity, ethical hacking and development",
  description: "Practical guides, security research and the development tools I build, by Lorenzo Fazioli.",
};

export const POSTS_PAGE: PageDescriptor = {
  path: "/posts",
  title: "Articles on dev.to",
  description: "Cybersecurity, ethical hacking and development articles published on dev.to by Lorenzo Fazioli.",
};

export const TOOLS_PAGE: PageDescriptor = {
  path: "/tools",
  title: "Tools",
  description: "A curated collection of tools for networks, OSINT, and web analysis, with quick guides to get started.",
};

export const ABOUT_PAGE: PageDescriptor = {
  path: "/about",
  title: "About Lorenzo Fazioli",
  description: "Developer from Rome writing about cybersecurity, ethical hacking and programming, and building tools like IPScan for Raycast.",
};

/**
 * The public, indexable pages that are not articles. Each page component spreads
 * its own descriptor into <Seo />, so the tags the server serves and the ones the
 * client keeps in sync cannot drift apart.
 */
export const PUBLIC_PAGES: PageDescriptor[] = [HOME_PAGE, POSTS_PAGE, TOOLS_PAGE, ABOUT_PAGE];

/**
 * Admin screens. They are real pages, so they must answer 200 rather than the
 * 404 an unknown path gets — but nothing on them is worth indexing, and
 * robots.txt already disallows /dashboard and /login.
 */
const ADMIN_PAGES: { pattern: RegExp; title: string }[] = [
  { pattern: /^\/login$/, title: "Admin login" },
  { pattern: /^\/dashboard$/, title: "Dashboard" },
  { pattern: /^\/dashboard\/new$/, title: "New post" },
  { pattern: /^\/dashboard\/edit\/[^/]+$/, title: "Edit post" },
  { pattern: /^\/dashboard\/tools$/, title: "Tools dashboard" },
  { pattern: /^\/dashboard\/tools\/new$/, title: "New tool" },
  { pattern: /^\/dashboard\/tools\/edit\/[^/]+$/, title: "Edit tool" },
];

export const NOT_FOUND_PAGE: PageDescriptor = {
  path: "/",
  title: "Page not found",
  description: "The page you are looking for is not available.",
  noIndex: true,
};

/** `/posts/` and `/posts` are the same page; `//x` is nobody's page. */
export function normalizePath(path: string) {
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  const withoutQuery = path.split(/[?#]/)[0];
  const trimmed = withoutQuery.length > 1 ? withoutQuery.replace(/\/+$/, "") : withoutQuery;
  return trimmed || "/";
}

export function publicPage(path: string) {
  return PUBLIC_PAGES.find((page) => page.path === path) || null;
}

export function adminPage(path: string): PageDescriptor | null {
  const match = ADMIN_PAGES.find((page) => page.pattern.test(path));
  return match ? { path, title: match.title, description: "Administration area.", noIndex: true } : null;
}

/** True for the routes api/page.ts serves from the database rather than from here. */
export function isArticlePath(path: string) {
  return /^\/post\/[^/]+$/.test(path);
}
