// src/pages/ForgotPassword.tsx
import React, { useState } from "react";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";
import { apiFetch, ApiError } from "../lib/api";

const inputClass =
  "mt-1.5 p-2.5 rounded-md bg-panel border border-line text-ink focus:outline-none focus:border-signal transition-colors";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const data = await apiFetch<{ message: string }>("/api/auth/forgot", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setMsg(data.message || "Se l'email esiste, riceverai un link di reset.");
    } catch (err) {
      setMsg(err instanceof ApiError ? err.message : "Errore di rete durante la richiesta di reset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-sm mx-auto py-8">
        <p className="font-mono text-xs text-signal mb-2 tracking-wide text-center">// recupero password</p>
        <h1 className="text-2xl font-semibold text-ink mb-8 text-center tracking-tight">Password dimenticata</h1>

        <form onSubmit={handleReset} className="rounded-lg border border-line bg-panel p-7 flex flex-col gap-4">
          <label className="flex flex-col text-sm text-dim">
            Inserisci la tua email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading || !email}
            className="mt-2 bg-signal text-white font-medium py-2.5 rounded-md hover:bg-signal-600 transition-colors disabled:opacity-60"
          >
            {loading ? "Invio in corso..." : "Invia link di reset"}
          </button>

          {msg && <p className="text-sm text-dim mt-1 whitespace-pre-line text-center">{msg}</p>}

          <div className="flex justify-between text-xs text-dim mt-2">
            <Link to="/login" className="hover:text-ink transition-colors">Torna al login</Link>
            <Link to="/register" className="hover:text-ink transition-colors">Registrati</Link>
          </div>
        </form>
      </div>
    </Layout>
  );
}
