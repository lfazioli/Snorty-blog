// src/lib/jwt.ts
import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET!;
if (!secret) throw new Error("JWT_SECRET non impostata");

export type SessionPayload = { userId: number; email: string };

export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifySession(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, secret) as SessionPayload;
  } catch {
    return null;
  }
}
