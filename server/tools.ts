import { pool } from "./db.js";
import { initialTools } from "./tool-seed.js";

let ready: Promise<void> | null = null;
export function ensureTools(): Promise<void> {
  if (!ready) ready = migrate().catch((error) => { ready = null; throw error; });
  return ready;
}
async function migrate() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(73628194)");
    await client.query(`CREATE TABLE IF NOT EXISTS tools (
      id SERIAL PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL,
      description TEXT NOT NULL, "howTo" TEXT NOT NULL, href TEXT NOT NULL,
      image TEXT NOT NULL DEFAULT '', badge TEXT NOT NULL DEFAULT '',
      published BOOLEAN NOT NULL DEFAULT TRUE
    )`);
    await client.query("CREATE TABLE IF NOT EXISTS tool_migrations (name TEXT PRIMARY KEY)");
    const applied = await client.query("SELECT name FROM tool_migrations WHERE name = 'initial-tools-v1'");
    if (!applied.rowCount) {
      for (const tool of initialTools) {
        await client.query(`INSERT INTO tools (name, category, description, "howTo", href, image, badge) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [tool.name, tool.category, tool.description, tool.howTo, tool.href, tool.image, tool.badge]);
      }
      await client.query("INSERT INTO tool_migrations (name) VALUES ('initial-tools-v1')");
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally { client.release(); }
}

export function validateTool(body: unknown) {
  if (!body || typeof body !== "object") throw new Error("Invalid tool");
  const data = body as Record<string, unknown>;
  const text = (key: string, max: number, required = true): string => {
    const value = data[key];
    if (!required && (value === undefined || value === null)) return "";
    if (typeof value !== "string" || (required && !value.trim()) || value.length > max) throw new Error(`Invalid ${key}`);
    return value.trim();
  };
  const name = text("name", 120), category = text("category", 80);
  const description = text("description", 2000), howTo = text("howTo", 4000);
  const href = text("href", 2048), image = text("image", 2048, false), badge = text("badge", 80, false);
  const httpUrl = (value: string) => { try { return ["https:", "http:"].includes(new URL(value).protocol); } catch { return false; } };
  if (!httpUrl(href)) throw new Error("Tool URL must start with https:// or http://");
  if (image && !httpUrl(image) && !/^\/(?!\/)[a-zA-Z0-9/_.-]+$/.test(image)) throw new Error("Invalid image URL");
  if (typeof data.published !== "boolean") throw new Error("Invalid publication status");
  return [name, category, description, howTo, href, image, badge, data.published];
}
