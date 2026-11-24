import type { VercelRequest, VercelResponse } from "@vercel/node";

interface DevToArticle {
  id: number;
  title: string;
  description: string;
  cover_image: string | null;
  published_at: string;
  url: string;
  slug: string;
}

interface DevToRssArticle {
  title: string;
  url: string;
  published_at: string;
}

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function parseRssArticles(xml: string): DevToRssArticle[] {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
    .map(([, item]) => {
      const read = (tag: string) => {
        const match = item.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
        return match ? decodeXml(match[1].trim()) : "";
      };
      return {
        title: read("title"),
        url: read("link"),
        published_at: read("pubDate"),
      };
    })
    .filter((article) => article.title && article.url && article.published_at);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Keep the public feed pinned to the site's owner account. An incorrect
  // deployment-level override must not silently switch the displayed author.
  const username = "lfazioli";

  try {
    const [response, rssResponse] = await Promise.all([
      fetch(
        `https://dev.to/api/articles?username=${encodeURIComponent(username)}&per_page=100&_=${Date.now()}`,
        {
          cache: "no-store",
          headers: { Accept: "application/json", "Cache-Control": "no-cache" },
        }
      ),
      fetch(`https://dev.to/feed/${encodeURIComponent(username)}?_=${Date.now()}`, {
        cache: "no-store",
        headers: { Accept: "application/rss+xml, application/xml", "Cache-Control": "no-cache" },
      }),
    ]);

    if (!response.ok) {
      console.error("DEVTO_API_ERROR:", response.status, response.statusText);
      return res.status(502).json({ error: "Unable to load dev.to articles" });
    }

    const articles = (await response.json()) as DevToArticle[];
    const postsByUrl = new Map(
      articles.map(({ id, title, description, cover_image, published_at, url, slug }) => [
        url,
        { id, title, excerpt: description, image: cover_image, published_at, url, slug },
      ])
    );

    if (rssResponse.ok) {
      const rssArticles = parseRssArticles(await rssResponse.text());
      rssArticles.forEach(({ title, url, published_at }, index) => {
        if (!postsByUrl.has(url)) {
          postsByUrl.set(url, {
            id: -(index + 1),
            title,
            excerpt: "",
            image: null,
            published_at: new Date(published_at).toISOString(),
            url,
            slug: url.split("/").pop() ?? title.toLowerCase().replace(/\s+/g, "-"),
          });
        }
      });
    } else {
      console.warn("DEVTO_RSS_ERROR:", rssResponse.status, rssResponse.statusText);
    }

    const posts = [...postsByUrl.values()]
      .sort((a, b) => b.published_at.localeCompare(a.published_at));

    res.setHeader("Cache-Control", "no-store, max-age=0, must-revalidate");
    return res.status(200).json({
      posts,
    });
  } catch (error) {
    console.error("DEVTO_POSTS_ERROR:", error);
    return res.status(502).json({ error: "Unable to load dev.to articles" });
  }
}
