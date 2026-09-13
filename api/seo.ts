// One function for the three machine-readable files the site publishes:
// /robots.txt, /sitemap.xml and /feed.xml. They were three separate endpoints,
// which is the natural shape but not an affordable one: a Vercel deployment on
// the Hobby plan may contain at most 12 Serverless Functions, and adding the
// feed took the project to 14, so production stopped building entirely.
//
// The public URLs are unchanged — vercel.json already rewrote them onto
// /api/*, and now rewrites all three onto /api/seo with a `kind`.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ensureSchema, pool } from "../server/db.js";
import { resolveSiteUrl } from "../server/site-url.js";
import { SITE_LANGUAGE, SITE_NAME, absoluteUrl } from "../src/lib/seo-meta.js";

function xml(value: string) {
  return value.replace(/[<>&'"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[character]!);
}

// Only routes that exist in src/main.tsx are listed: advertising an
// authentication surface wider than the real one helps nobody.
const DISALLOW = ["/api/", "/dashboard", "/login"];

function robots(req: VercelRequest, res: VercelResponse) {
  const origin = resolveSiteUrl(req.headers);
  const lines = ["User-agent: *", "Allow: /", ...DISALLOW.map((path) => `Disallow: ${path}`)];
  if (origin) lines.push("", `Sitemap: ${origin}/sitemap.xml`);
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600");
  return res.status(200).send(`${lines.join("\n")}\n`);
}

type SitemapPage = {
  path: string;
  priority: string;
  changefreq: string;
  lastmod?: string;
};

async function sitemap(req: VercelRequest, res: VercelResponse) {
  await ensureSchema();
  const origin = resolveSiteUrl(req.headers);
  if (!origin) return res.status(500).send("SITE_URL is not configured");
  const { rows } = await pool.query<{ slug: string; updated_at: Date }>("SELECT slug, updated_at FROM posts WHERE published = true AND (publish_at IS NULL OR publish_at <= NOW()) ORDER BY created_at DESC");
  const pages: SitemapPage[] = [
    { path: "/", priority: "1.0", changefreq: "weekly" },
    { path: "/posts", priority: "0.8", changefreq: "daily" },
    // The toolbox is public, indexable and the only page with substantial
    // original copy outside the posts; it was missing from the sitemap.
    { path: "/tools", priority: "0.8", changefreq: "weekly" },
    { path: "/about", priority: "0.5", changefreq: "monthly" },
    ...rows.map((post) => ({ path: `/post/${encodeURIComponent(post.slug)}`, priority: "0.7", changefreq: "monthly", lastmod: new Date(post.updated_at).toISOString().slice(0, 10) })),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((page) => `  <url><loc>${xml(`${origin}${page.path}`)}</loc>${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ""}<changefreq>${page.changefreq}</changefreq><priority>${page.priority}</priority></url>`).join("\n")}\n</urlset>`;
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).send(body);
}

type FeedRow = { slug: string; title: string; excerpt: string | null; publish_at: string | null; created_at: string };

// RSS 2.0 feed. The data is the same query the sitemap already runs; a technical
// blog without a feed loses aggregators, readers and newsletter pickups.
async function feed(req: VercelRequest, res: VercelResponse) {
  await ensureSchema();
  const origin = resolveSiteUrl(req.headers);
  if (!origin) return res.status(500).send("SITE_URL is not configured");

  const { rows } = await pool.query<FeedRow>(
    `SELECT slug, title, excerpt, publish_at, created_at FROM posts
       WHERE published = true AND (publish_at IS NULL OR publish_at <= NOW())
       ORDER BY COALESCE(publish_at, created_at) DESC LIMIT 50`
  );

  const items = rows.map((post) => {
    const url = absoluteUrl(origin, `/post/${encodeURIComponent(post.slug)}`);
    const date = new Date(post.publish_at || post.created_at);
    return `    <item>
      <title>${xml(post.title)}</title>
      <link>${xml(url)}</link>
      <guid isPermaLink="true">${xml(url)}</guid>
      ${post.excerpt ? `<description>${xml(post.excerpt)}</description>` : ""}
      <pubDate>${date.toUTCString()}</pubDate>
    </item>`;
  });

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xml(SITE_NAME)}</title>
    <link>${xml(absoluteUrl(origin, "/"))}</link>
    <description>Practical guides on cybersecurity, ethical hacking and software development.</description>
    <language>${SITE_LANGUAGE}</language>
    <atom:link href="${xml(absoluteUrl(origin, "/feed.xml"))}" rel="self" type="application/rss+xml" />
${items.join("\n")}
  </channel>
</rss>`;

  res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
  // Same rule as the sitemap: a scheduled post has to show up on time.
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).send(body);
}

const KINDS = { robots, sitemap, feed };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requested = Array.isArray(req.query.kind) ? req.query.kind[0] : req.query.kind;
  const render = requested && Object.prototype.hasOwnProperty.call(KINDS, requested) ? KINDS[requested as keyof typeof KINDS] : null;
  // Reachable only by hand: the three real URLs always carry a kind.
  if (!render) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(404).send("Not found");
  }

  try {
    return await render(req, res);
  } catch (error) {
    console.error(`SEO_${requested!.toUpperCase()}_ERROR:`, error);
    res.setHeader("Cache-Control", "no-store");
    return res.status(500).send(`Unable to generate ${requested}`);
  }
}
