import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ensureSchema, pool } from "../server/db.js";

function siteUrl(req: VercelRequest) {
  const configured = process.env.SITE_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "").split(",")[0];
  const protocol = String(req.headers["x-forwarded-proto"] || "https").split(",")[0];
  return host ? `${protocol}://${host}` : "";
}

function xml(value: string) {
  return value.replace(/[<>&'"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[character]!);
}

type SitemapPage = {
  path: string;
  priority: string;
  changefreq: string;
  lastmod?: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await ensureSchema();
    const origin = siteUrl(req);
    if (!origin) return res.status(500).send("SITE_URL is not configured");
    const { rows } = await pool.query<{ slug: string; updated_at: Date }>("SELECT slug, updated_at FROM posts WHERE published = true ORDER BY created_at DESC");
    const pages: SitemapPage[] = [
      { path: "/", priority: "1.0", changefreq: "weekly" },
      { path: "/posts", priority: "0.8", changefreq: "daily" },
      { path: "/about", priority: "0.5", changefreq: "monthly" },
      ...rows.map((post) => ({ path: `/post/${encodeURIComponent(post.slug)}`, priority: "0.7", changefreq: "monthly", lastmod: new Date(post.updated_at).toISOString().slice(0, 10) })),
    ];
    const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((page) => `  <url><loc>${xml(`${origin}${page.path}`)}</loc>${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ""}<changefreq>${page.changefreq}</changefreq><priority>${page.priority}</priority></url>`).join("\n")}\n</urlset>`;
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).send(body);
  } catch (error) {
    console.error("SITEMAP_ERROR:", error);
    return res.status(500).send("Unable to generate sitemap");
  }
}
