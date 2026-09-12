import type { VercelRequest, VercelResponse } from "@vercel/node";
import { resolveSiteUrl } from "../server/site-url.js";

// Only routes that exist in src/main.tsx are listed: advertising an
// authentication surface wider than the real one helps nobody.
const DISALLOW = ["/api/", "/dashboard", "/login"];

export default function handler(req: VercelRequest, res: VercelResponse) {
  const origin = resolveSiteUrl(req.headers);
  const lines = ["User-agent: *", "Allow: /", ...DISALLOW.map((path) => `Disallow: ${path}`)];
  if (origin) lines.push("", `Sitemap: ${origin}/sitemap.xml`);
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600");
  return res.status(200).send(`${lines.join("\n")}\n`);
}
