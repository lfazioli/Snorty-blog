// Server-rendered HTML for every route the SPA answers.
//
// The app is client-rendered, so without this every URL served the same 1.4 KB
// shell: one generic title, one generic description, no canonical, no Open
// Graph and an empty <div id="root">. Google renders JavaScript and would
// eventually see what <Seo /> injects, but only on a second pass — and
// Facebook, LinkedIn, X, Slack and WhatsApp never do.
//
// This endpoint keeps the SPA exactly as it is and rewrites the shell before
// serving it: the <head> for every route, plus the article's own words for
// /post/:slug. Naming it statically (rather than /api/page/[...path]) keeps it
// clear of the filesystem handler, same reasoning as api/post.ts.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ensureSchema, pool } from "../server/db.js";
import { requestOrigin, resolveSiteUrl } from "../server/site-url.js";
import { renderMarkdown } from "../server/markdown.js";
import { buildSeoMeta, escapeAttribute, injectSeoMeta, injectShellBody, shellIconHref } from "../src/lib/seo-meta.js";
import { NOT_FOUND_PAGE, adminPage, isArticlePath, normalizePath, publicPage } from "../src/lib/page-meta.js";

type PostRow = {
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  image: string | null;
  publish_at: string | null;
  created_at: string;
  updated_at: string | null;
};

async function fetchShell(origin: string) {
  // The built index.html is served by the filesystem handler, which runs before
  // the catch-all that reaches this function, so this cannot recurse.
  const response = await fetch(`${origin}/index.html`, { headers: { accept: "text/html" } });
  if (!response.ok) throw new Error(`Shell request failed with ${response.status}`);
  return response.text();
}

function isoDate(value: string | Date | null) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** Mirrors the markup src/pages/Post.tsx renders, so the swap on mount is invisible. */
function articleBody(post: PostRow) {
  const date = (post.publish_at || post.created_at || "").slice(0, 10);
  const cover = post.image
    ? `<div class="aspect-video overflow-hidden rounded-lg border border-line bg-panel2 mb-8"><img src="${escapeAttribute(post.image)}" alt="${escapeAttribute(post.title)}" class="w-full h-full object-cover" /></div>`
    : "";
  return `<article>
      <p class="font-mono text-xs text-dim mb-2">${escapeAttribute(date)}</p>
      <h1 class="text-2xl sm:text-3xl font-semibold text-ink leading-snug tracking-tight mb-6">${escapeAttribute(post.title)}</h1>
      ${cover}
      <div class="text-ink">${renderMarkdown(post.content)}</div>
    </article>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requested = Array.isArray(req.query.path) ? req.query.path[0] : req.query.path;
  const path = normalizePath(typeof requested === "string" ? requested : "");
  const deployment = requestOrigin(req.headers);
  const siteUrl = resolveSiteUrl(req.headers);

  let shell: string;
  try {
    shell = await fetchShell(deployment);
  } catch (error) {
    console.error("PAGE_SHELL_ERROR:", error);
    return res.status(502).send("Unable to load the application shell");
  }

  const fallbackImage = shellIconHref(shell);

  const send = (status: number, meta: Parameters<typeof injectSeoMeta>[1], cacheControl: string, body = "") => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", cacheControl);
    return res.status(status).send(injectShellBody(injectSeoMeta(shell, meta), body));
  };

  // A real 404 rather than the soft 404 the SPA catch-all produced: an unknown
  // URL used to answer 200 with the shell, so a crawler had to render the page
  // to find out it did not exist.
  const notFound = () =>
    send(
      404,
      buildSeoMeta({ siteUrl, ...NOT_FOUND_PAGE, path: path || "/", fallbackImage }),
      // Never cached: a post that goes live on a schedule would otherwise keep
      // being served as a 404 until the entry expired.
      "no-store"
    );

  if (!path) return notFound();

  if (!isArticlePath(path)) {
    const page = publicPage(path) || adminPage(path);
    if (!page) return notFound();
    const meta = buildSeoMeta({ siteUrl, ...page, fallbackImage });
    // The shell is the same for every visitor; only a deploy changes it.
    return send(200, meta, page.noIndex ? "no-store" : "public, s-maxage=600, stale-while-revalidate=86400");
  }

  // Vercel has already decoded the query string, so the segment is the slug.
  const slug = path.slice("/post/".length);

  let post: PostRow | undefined;
  try {
    await ensureSchema();
    const { rows } = await pool.query<PostRow>(
      `SELECT slug, title, excerpt, content, image, publish_at, created_at, updated_at
       FROM posts WHERE slug = $1 AND published = true AND (publish_at IS NULL OR publish_at <= NOW())`,
      [slug]
    );
    post = rows[0];
  } catch (error) {
    // Degrade to the client-rendered behaviour rather than to a broken page:
    // the SPA still fetches the post itself and renders it.
    console.error("PAGE_POST_ERROR:", error);
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

  // Short enough that an edit to a published post reaches the crawlers quickly,
  // long enough that the database is not queried for every HTML request.
  return send(200, meta, "public, s-maxage=60, stale-while-revalidate=600", articleBody(post));
}
