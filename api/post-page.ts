// Server-rendered <head> for /post/:slug.
//
// The app is a client-rendered SPA, so without this every URL of the site served
// the same 1.4 KB shell: one generic title, one generic description, no canonical
// and no Open Graph. Google renders JavaScript and would eventually see the tags
// <Seo /> injects, but Facebook, LinkedIn, X, Slack and WhatsApp do not — every
// shared link showed the same preview whatever the post.
//
// This endpoint keeps the SPA exactly as it is and only rewrites the head of the
// shell before serving it. Naming it statically (rather than /api/post/[slug])
// keeps it clear of the SPA catch-all, same reasoning as api/post.ts.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ensureSchema, pool } from "../server/db.js";
import { requestOrigin, resolveSiteUrl } from "../server/site-url.js";
import { buildSeoMeta, injectSeoMeta, shellIconHref } from "../src/lib/seo-meta.js";

type PostRow = {
  slug: string;
  title: string;
  excerpt: string | null;
  image: string | null;
  publish_at: string | null;
  created_at: string;
  updated_at: string | null;
};

async function fetchShell(origin: string) {
  // The built index.html is served by the filesystem handler, which no route of
  // ours intercepts, so this cannot recurse back into this function.
  const response = await fetch(`${origin}/index.html`, { headers: { accept: "text/html" } });
  if (!response.ok) throw new Error(`Shell request failed with ${response.status}`);
  return response.text();
}

function isoDate(value: string | Date | null) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const slug = Array.isArray(req.query.slug) ? req.query.slug[0] : req.query.slug;
  const deployment = requestOrigin(req.headers);
  const siteUrl = resolveSiteUrl(req.headers);

  let shell: string;
  try {
    shell = await fetchShell(deployment);
  } catch (error) {
    console.error("POST_PAGE_SHELL_ERROR:", error);
    return res.status(502).send("Unable to load the application shell");
  }

  const fallbackImage = shellIconHref(shell);
  const notFound = () => {
    // A real 404 rather than the soft 404 the SPA catch-all used to produce: the
    // shell still boots and shows the "post not found" screen, but crawlers are
    // told the URL does not exist instead of having to render to find out.
    const meta = buildSeoMeta({
      siteUrl,
      title: "Post not found",
      description: "The post you are looking for is not available.",
      path: typeof slug === "string" ? `/post/${encodeURIComponent(slug)}` : "/post",
      noIndex: true,
    });
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    // Never cached: a post that goes live on a schedule would otherwise keep
    // being served as a 404 until the entry expired.
    res.setHeader("Cache-Control", "no-store");
    return res.status(404).send(injectSeoMeta(shell, meta));
  };

  if (!slug || typeof slug !== "string") return notFound();

  let post: PostRow | undefined;
  try {
    await ensureSchema();
    const { rows } = await pool.query<PostRow>(
      `SELECT slug, title, excerpt, image, publish_at, created_at, updated_at
       FROM posts WHERE slug = $1 AND published = true AND (publish_at IS NULL OR publish_at <= NOW())`,
      [slug]
    );
    post = rows[0];
  } catch (error) {
    // Degrade to today's behaviour rather than to a broken page: the SPA still
    // fetches the post itself and renders it.
    console.error("POST_PAGE_ERROR:", error);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(shell);
  }

  if (!post) return notFound();

  const published = isoDate(post.publish_at) || isoDate(post.created_at);
  const meta = buildSeoMeta({
    siteUrl,
    title: post.title,
    description: post.excerpt || `A practical walkthrough on cybersecurity and development: ${post.title}`,
    path: `/post/${encodeURIComponent(post.slug)}`,
    image: post.image,
    fallbackImage,
    type: "article",
    article: { publishedTime: published, modifiedTime: isoDate(post.updated_at) || published },
  });

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  // Short enough that an edit to a published post reaches the crawlers quickly,
  // long enough that the database is not queried for every HTML request.
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=600");
  return res.status(200).send(injectSeoMeta(shell, meta));
}
