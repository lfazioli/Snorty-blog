// src/lib/api.ts
// Helper condiviso per le chiamate alle API: aggiunge automaticamente il token di
// autenticazione e uniforma la gestione degli errori. Sostituisce la logica fetch
// (try/catch + parsing JSON) che prima era duplicata in ogni pagina.
import { getToken } from "./auth";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let res: Response;
  try {
    res = await fetch(path, { ...options, headers });
  } catch {
    throw new ApiError("Errore di rete. Controlla la connessione e riprova.", 0);
  }

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message = (data && (data.error || data.message)) || `Errore HTTP ${res.status}`;
    throw new ApiError(message, res.status);
  }

  return data as T;
}
