import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const configured = process.env.SITE_URL?.trim().replace(/\/$/, "");
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "").split(",")[0];
  const protocol = String(req.headers["x-forwarded-proto"] || "https").split(",")[0];
  const origin = configured || (host ? `${protocol}://${host}` : "");
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600");
  return res.status(200).send(`User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /dashboard\nDisallow: /login\nDisallow: /register\nDisallow: /forgot-password\nDisallow: /reset-password\n${origin ? `\nSitemap: ${origin}/sitemap.xml\n` : ""}`);
}
