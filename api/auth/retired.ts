// Retired endpoints: old clients and reset links must not create or change
// accounts. /api/auth/register, /forgot and /reset were three files with this
// exact body; vercel.json now points all three here, because a Hobby-plan
// deployment may contain at most 12 Serverless Functions.
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  return res.status(404).json({ error: "Not found" });
}
