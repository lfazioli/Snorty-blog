// api/posts/[slug].ts
// GET            /api/posts/:slug -> singolo post (i non pubblicati si vedono solo da admin)
// PUT/PATCH      /api/posts/:slug -> modifica (solo admin)
// DELETE         /api/posts/:slug -> elimina (solo admin)
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { pool, ensureSchema } from "../../server/db";
import { getSessionFromRequest, requireAdmin } from "../../server/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await ensureSchema();

    const { slug } = req.query;
    const slugStr = Array.isArray(slug) ? slug[0] : slug;
    if (!slugStr) return res.status(400).json({ error: "Slug mancante" });

    if (req.method === "GET") {
      const session = getSessionFromRequest(req);
      const isAdmin = session?.role === "admin";

      const result = await pool.query(
        `SELECT id, slug, title, excerpt, content, image, published, created_at, updated_at
         FROM posts WHERE slug = $1`,
        [slugStr]
      );
      const post = result.rows[0];
      if (!post || (!post.published && !isAdmin)) {
        return res.status(404).json({ error: "Post non trovato" });
      }
      return res.status(200).json({ post });
    }

    if (req.method === "PUT" || req.method === "PATCH") {
      const session = requireAdmin(req, res);
      if (!session) return;

      const existing = await pool.query("SELECT id FROM posts WHERE slug = $1", [slugStr]);
      if (existing.rows.length === 0) return res.status(404).json({ error: "Post non trovato" });

      const { title, content, excerpt, image, published } = req.body ?? {};
      if (!title || typeof title !== "string" || !title.trim()) {
        return res.status(400).json({ error: "Il titolo è obbligatorio" });
      }
      if (!content || typeof content !== "string" || !content.trim()) {
        return res.status(400).json({ error: "Il contenuto è obbligatorio" });
      }

      const updated = await pool.query(
        `UPDATE posts SET
           title = $1,
           content = $2,
           excerpt = $3,
           image = $4,
           published = $5,
           updated_at = NOW()
         WHERE slug = $6
         RETURNING id, slug, title, excerpt, image, published, created_at, updated_at`,
        [
          title.trim(),
          content,
          typeof excerpt === "string" ? excerpt.trim() : "",
          typeof image === "string" && image.trim() ? image.trim() : null,
          published !== false,
          slugStr,
        ]
      );

      return res.status(200).json({ post: updated.rows[0] });
    }

    if (req.method === "DELETE") {
      const session = requireAdmin(req, res);
      if (!session) return;

      await pool.query("DELETE FROM posts WHERE slug = $1", [slugStr]);
      return res.status(200).json({ message: "Post eliminato" });
    }

    res.setHeader("Allow", "GET, PUT, PATCH, DELETE");
    return res.status(405).json({ error: "Metodo non permesso" });
  } catch (e: any) {
    console.error("POSTS_SLUG_ERROR:", e?.message || e);
    return res.status(500).json({ error: "Errore interno" });
  }
}
