// server/auth.ts
// Firma/verifica delle sessioni JWT e helper di autorizzazione, condivisi da tutte
// le funzioni in /api. NON importare questo file da src/ (client): usa jsonwebtoken
// e JWT_SECRET, che devono restare lato server.
import jwt from "jsonwebtoken";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const JWT_SECRET = process.env.JWT_SECRET;

export type Role = "admin" | "reader";
export type SessionPayload = { userId: number; email: string; role: Role };

export function signSession(payload: SessionPayload): string {
  if (!JWT_SECRET) throw new Error("JWT_SECRET non impostata nelle variabili d'ambiente");
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifySession(token: string): SessionPayload | null {
  if (!JWT_SECRET) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded && typeof decoded === "object" && "userId" in decoded && "email" in decoded) {
      const d = decoded as Record<string, unknown>;
      return {
        userId: Number(d.userId),
        email: String(d.email),
        role: d.role === "admin" ? "admin" : "reader",
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
 * Verifica che la richiesta provenga da un amministratore (il "writer" del blog).
 * Se non autorizzato, invia GIA' la risposta di errore (401/403) e ritorna null:
 * l'handler chiamante deve semplicemente fare `if (!session) return;` subito dopo.
 */
export function requireAdmin(req: VercelRequest, res: VercelResponse): SessionPayload | null {
  const session = getSessionFromRequest(req);
  if (!session) {
    res.status(401).json({ error: "Autenticazione richiesta" });
    return null;
  }
  if (session.role !== "admin") {
    res.status(403).json({ error: "Permessi insufficienti: solo l'amministratore puo' farlo" });
    return null;
  }
  return session;
}
