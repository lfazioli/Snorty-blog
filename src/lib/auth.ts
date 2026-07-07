// src/lib/auth.ts
// Helper per gestire il token JWT nello storage del browser e decodificare il payload

export function getToken(): string | null {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

export function setToken(token: string) {
  try {
    localStorage.setItem("token", token);
  } catch {
    // localStorage potrebbe non essere disponibile (es. modalità privata): ignoriamo.
  }
}

export function clearToken() {
  try {
    localStorage.removeItem("token");
  } catch {
    // localStorage potrebbe non essere disponibile (es. modalità privata): ignoriamo.
  }
}

// Decodifica base del JWT (senza verificare la firma) per leggere email/userId
export function parseJwt<T = unknown>(token: string): T | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload) as T;
  } catch {
    return null;
  }
}
