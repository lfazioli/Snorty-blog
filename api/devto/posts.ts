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

interface ScheduledArticle {
  date: string;
  title: string;
  excerpt: string;
  cover_image?: string;
  canonical_url: string;
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
    const response = await fetch(
      `https://dev.to/api/articles?username=${encodeURIComponent(username)}&per_page=30&_=${Date.now()}`,
      { headers: { Accept: "application/json" } }
    );

    if (!response.ok) {
      console.error("DEVTO_API_ERROR:", response.status, response.statusText);
      return res.status(502).json({ error: "Unable to load dev.to articles" });
    }

    const articles = (await response.json()) as DevToArticle[];

    let scheduledArticles: ScheduledArticle[] = [];
    try {
      const calendarResponse = await fetch(
        "https://www.snorty.space/devto-calendar.json",
        { cache: "no-store", headers: { Accept: "application/json" } }
      );
      if (calendarResponse.ok) {
        scheduledArticles = (await calendarResponse.json()) as ScheduledArticle[];
      }
    } catch (error) {
      console.warn("DEVTO_CALENDAR_FETCH_ERROR:", error);
    }

    const today = new Date().toISOString().slice(0, 10);
    const devTitles = new Set(articles.map((article) => article.title));
    const scheduledFallback = scheduledArticles
      .map((entry, index) => ({
        entry,
        index,
      }))
      .filter(({ entry }) => entry.date <= today)
      .filter(({ entry }) => !devTitles.has(entry.title))
      .map(({ entry, index }) => ({
        id: -(index + 1),
        title: entry.title,
        excerpt: entry.excerpt,
        image: `https://www.snorty.space/devto-covers/${String(
          scheduledArticles.findIndex((item) => item.title === entry.title) + 1
        ).padStart(2, "0")}.jpg`,
        published_at: `${entry.date}T09:00:00Z`,
        url: entry.canonical_url,
        slug: entry.canonical_url.split("/").pop() ?? entry.title.toLowerCase().replace(/\s+/g, "-"),
      }));

    const merged = [
      ...articles.map(({ id, title, description, cover_image, published_at, url, slug }) => ({
        id,
        title,
        excerpt: description,
        image: cover_image,
        published_at,
        url,
        slug,
      })),
      ...scheduledFallback,
    ].sort((a, b) => b.published_at.localeCompare(a.published_at));

    res.setHeader("Cache-Control", "no-store, max-age=0, must-revalidate");
    return res.status(200).json({
      posts: merged,
    });
  } catch (error) {
    console.error("DEVTO_POSTS_ERROR:", error);
    return res.status(502).json({ error: "Unable to load dev.to articles" });
  }
}
