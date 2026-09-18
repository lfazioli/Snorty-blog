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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const username = process.env.DEVTO_USERNAME?.trim();
  if (!username) {
    return res.status(500).json({ error: "DEVTO_USERNAME is not configured" });
  }

  try {
    const response = await fetch(
      `https://dev.to/api/articles?username=${encodeURIComponent(username)}&per_page=30`,
      { headers: { Accept: "application/json" } }
    );

    if (!response.ok) {
      console.error("DEVTO_API_ERROR:", response.status, response.statusText);
      return res.status(502).json({ error: "Unable to load dev.to articles" });
    }

    const articles = (await response.json()) as DevToArticle[];
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json({
      posts: articles.map(({ id, title, description, cover_image, published_at, url, slug }) => ({
        id,
        title,
        excerpt: description,
        image: cover_image,
        published_at,
        url,
        slug,
      })),
    });
  } catch (error) {
    console.error("DEVTO_POSTS_ERROR:", error);
    return res.status(502).json({ error: "Unable to load dev.to articles" });
  }
}
