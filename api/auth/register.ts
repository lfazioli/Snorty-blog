import type { VercelRequest, VercelResponse } from "@vercel/node";

// Retired endpoint: old clients and reset links must not create or change accounts.
export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  return res.status(404).json({ error: "Not found" });
}
