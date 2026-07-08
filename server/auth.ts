// server/auth.ts
// Signs/verifies JWT sessions and provides authorization helpers for the /api routes.
import jwt from "jsonwebtoken";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const JWT_SECRET = process.env.JWT_SECRET;

export type Role = "admin" | "reader";
export type SessionPayload = { userId: number; email: string; role: Role };

export function signSession(payload: SessionPayload): string {
  if (!JWT_SECRET) throw new Error("JWT_SECRET is not set");
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifySession(token: string): SessionPayload | null {
  if (!JWT_SECRET) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === "object" && decoded && "userId" in decoded && "email" in decoded) {
      return {
        userId: (decoded as any).userId,
        email: (decoded as any).email,
        role: (decoded as any).role === "admin" ? "admin" : "reader",
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function getSessionFromRequest(req: VercelRequest): SessionPayload | null {
  const header = req.headers["authorization"];
  const value = Array.isArray(header) ? header[0] : header;
  if (!value || !value.startsWith("Bearer ")) return null;
  const token = value.slice(7).trim();
  if (!token) return null;
  return verifySession(token);
}

/**
 * Checks that the request comes from an admin.
 * If unauthorized, it already sends the error response and returns null:
 * the calling handler should simply `return` in that case.
 */
export function requireAdmin(req: VercelRequest, res: VercelResponse): SessionPayload | null {
  const session = getSessionFromRequest(req);
  if (!session) {
    res.status(401).json({ error: "Authentication required" });
    return null;
  }
  if (session.role !== "admin") {
    res.status(403).json({ error: "Insufficient permissions" });
    return null;
  }
  return session;
}
