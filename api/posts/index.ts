// api/posts/index.ts
// GET  /api/posts  -> list of posts (visitors see only published ones, admin sees all)
// POST /api/posts  -> create a new post (admin only)
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { pool, ensureSchema } from "../../server/db.js";
import { getSessionFromRequest, requireAdmin } from "../../server/auth.js";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "")
    .slice(0, 80);
}

async function insertWithUniqueSlug(baseSlug: string, values: {
  title: string;
  excerpt: string;
  content: string;
  image: string | null;
  published: boolean;
  authorEmail: string;
}) {
  let slug = baseSlug || `post-${Date.now()}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const inserted = await pool.query(
        `INSERT INTO posts (slug, title, excerpt, content, image, published, author_email)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING slug, title, excerpt, image, published, created_at, updated_at`,
        [slug, values.title, values.excerpt, values.content, values.image, values.published, values.authorEmail]
      );
      return inserted.rows[0];
    } catch (err: any) {
      // 23505 = unique_violation: another post already has this slug, retry with a suffix.
      if (err?.code === "23505" && attempt < 2) {
        slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
        continue;
      }
      throw err;
    }
  }
  throw new Error("Could not generate a unique slug");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await ensureSchema();

    if (req.method === "GET") {
      const session = getSessionFromRequest(req);
      const isAdmin = session?.role === "admin";

      const { rows } = await pool.query(
        isAdmin
          ? `SELECT slug, title, excerpt, image, published, created_at, updated_at
             FROM posts ORDER BY created_at DESC`
          : `SELECT slug, title, excerpt, image, published, created_at, updated_at
             FROM posts WHERE published = true ORDER BY created_at DESC`
      );
      return res.status(200).json({ posts: rows });
    }

    if (req.method === "POST") {
      const session = requireAdmin(req, res);
      if (!session) return; // requireAdmin already sent 401/403

      const { title, content, excerpt, image, published, slug: slugInput } = req.body ?? {};
      if (!title || typeof title !== "string" || !title.trim()) {
        return res.status(400).json({ error: "Title is required" });
      }
      if (!content || typeof content !== "string" || !content.trim()) {
        return res.status(400).json({ error: "Content is required" });
      }

      const baseSlug = typeof slugInput === "string" && slugInput.trim() ? slugify(slugInput) : slugify(title);

      const post = await insertWithUniqueSlug(baseSlug, {
        title: title.trim(),
        excerpt: typeof excerpt === "string" ? excerpt.trim() : "",
        content,
        image: typeof image === "string" && image.trim() ? image.trim() : null,
        published: published !== false,
        authorEmail: session.email,
      });

      return res.status(201).json({ post });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (e: any) {
    console.error("POSTS_INDEX_ERROR:", e?.message || e);
    return res.status(500).json({ error: "Internal error" });
  }
}
