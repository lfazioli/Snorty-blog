// RSS 2.0 feed. The data is the same query the sitemap already runs; a technical
// blog without a feed loses aggregators, readers and newsletter pickups.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ensureSchema, pool } from "../server/db.js";
import { resolveSiteUrl } from "../server/site-url.js";
import { SITE_LANGUAGE, SITE_NAME, absoluteUrl } from "../src/lib/seo-meta.js";

function xml(value: string) {
  return value.replace(/[<>&'"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[character]!);
}

type FeedRow = { slug: string; title: string; excerpt: string | null; publish_at: string | null; created_at: string };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
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
  } catch (error) {
    console.error("FEED_ERROR:", error);
    return res.status(500).send("Unable to generate the feed");
  }
}
