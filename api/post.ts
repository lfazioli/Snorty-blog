// Static public endpoint for reading one published post. Keeping this endpoint
// non-dynamic makes it immune to the SPA catch-all route used by the frontend.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ensureSchema, pool } from "../server/db.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await ensureSchema();
    const slug = Array.isArray(req.query.slug) ? req.query.slug[0] : req.query.slug;
    if (!slug || typeof slug !== "string") return res.status(400).json({ error: "Missing slug" });

    const { rows } = await pool.query(
      `SELECT id, slug, title, excerpt, content, image, published, created_at, updated_at
       FROM posts WHERE slug = $1 AND published = true`,
      [slug]
    );
    if (!rows[0]) return res.status(404).json({ error: "Post not found" });
    return res.status(200).json({ post: rows[0] });
  } catch (error) {
    console.error("PUBLIC_POST_ERROR:", error);
    return res.status(500).json({ error: "Internal error" });
  }
}
