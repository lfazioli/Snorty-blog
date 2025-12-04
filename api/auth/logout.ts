// api/auth/logout.ts
import type { IncomingMessage, ServerResponse } from "http";

export type VercelRequest = IncomingMessage & {
    body?: any;
    query?: Record<string, string | string[]>;
    cookies?: Record<string, string>;
};

export type VercelResponse = ServerResponse & {
    status?: (code: number) => VercelResponse;
    json?: (body: any) => void;
};

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader("Set-Cookie", `session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);

  const payload = { message: "Logout ok" };

  // If the helper methods exist, use them safely.
  if (typeof res.status === "function") {
    const r = res.status(200);
    if (r && typeof r.json === "function") {
      r.json(payload);
      return r;
    }
    return r;
  }

  if (typeof res.json === "function") {
    res.json(payload);
    return res;
  }

  // Fallback to native ServerResponse behavior
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}
