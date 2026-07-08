// src/lib/auth.ts
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
  } catch {}
}

export function clearToken() {
  try {
    localStorage.removeItem("token");
  } catch {}
}

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