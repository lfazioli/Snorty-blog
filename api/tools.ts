import type { VercelRequest, VercelResponse } from "@vercel/node";
import { pool } from "../server/db.js";
import { getSessionFromRequest, requireAdmin } from "../server/auth.js";
import { ensureTools, validateTool } from "../server/tools.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (!["GET", "POST", "PUT", "DELETE"].includes(req.method || "")) {
    res.setHeader("Allow", "GET, POST, PUT, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (req.method !== "GET" && !requireAdmin(req, res)) return;
  const id = req.query.id;
  if ((id !== undefined || req.method === "PUT" || req.method === "DELETE") &&
      (typeof id !== "string" || !/^[1-9]\d*$/.test(id) || (!Number.isSafeInteger(Number(id)) || Number(id) > 2147483647))) {
    return res.status(400).json({ error: "Invalid tool ID" });
  }
  let values: ReturnType<typeof validateTool> = [];
  if (req.method === "POST" || req.method === "PUT") {
    try { values = validateTool(req.body); }
    catch (error) { return res.status(400).json({ error: error instanceof Error ? error.message : "Invalid tool" }); }
  }
  try {
    await ensureTools();
    if (req.method === "GET") {
      const admin = getSessionFromRequest(req)?.role === "admin" && req.query.scope !== "public";
      const { rows } = await pool.query(`SELECT * FROM tools WHERE ($1::boolean OR (published = true AND (publish_at IS NULL OR publish_at <= NOW()))) AND ($2::integer IS NULL OR id = $2) ORDER BY id`, [admin, id || null]);
      if (id) return rows[0] ? res.status(200).json({ tool: rows[0] }) : res.status(404).json({ error: "Tool not found" });
      return res.status(200).json({ tools: rows });
    }
    if (req.method === "POST") {
      const { rows } = await pool.query(`INSERT INTO tools (name,category,description,"howTo",href,image,badge,published,publish_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`, values);
      return res.status(201).json({ tool: rows[0] });
    }
    if (req.method === "PUT") {
      const { rows } = await pool.query(`UPDATE tools SET name=$1,category=$2,description=$3,"howTo"=$4,href=$5,image=$6,badge=$7,published=$8,publish_at=$9 WHERE id=$10 RETURNING *`, [...values, id]);
      return rows[0] ? res.status(200).json({ tool: rows[0] }) : res.status(404).json({ error: "Tool not found" });
    }
    const result = await pool.query("DELETE FROM tools WHERE id=$1 RETURNING id", [id]);
    return result.rowCount ? res.status(200).json({ message: "Tool deleted" }) : res.status(404).json({ error: "Tool not found" });
  } catch (error) {
    console.error("TOOLS_ERROR", error);
    return res.status(500).json({ error: "Unable to process tools. Please try again." });
  }
}
