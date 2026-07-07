// src/pages/ResetPassword.tsx
import React, { useState, useMemo } from "react";
import Layout from "../components/Layout";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch, ApiError } from "../lib/api";

const inputClass =
  "mt-1.5 p-2.5 rounded-md bg-panel border border-line text-ink focus:outline-none focus:border-signal transition-colors";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");
  const navigate = useNavigate();

  const canSubmit = useMemo(() => {
    return Boolean(token) && password.length >= 8 && confirmPassword.length >= 8 && password === confirmPassword;
  }, [token, password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");

    if (!token) {
      setMsg("Token mancante o non valido nell'URL.");
      return;
    }
    if (password !== confirmPassword) {
      setMsg("Le password non coincidono.");
      return;
    }
    if (password.length < 8) {
      setMsg("La password deve avere almeno 8 caratteri.");
      return;
    }

    setLoading(true);

    try {
      const data = await apiFetch<{ message: string }>("/api/auth/reset", {
        method: "POST",
        body: JSON.stringify({ token, newPassword: password }),
      });
      setMsg(data.message || "Password aggiornata. Reindirizzamento al login...");
      setTimeout(() => navigate("/login"), 800);
    } catch (err) {
      setMsg(err instanceof ApiError ? err.message : "Errore di rete durante il reset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-sm mx-auto py-8">
        <p className="font-mono text-xs text-signal mb-2 tracking-wide text-center">// nuova password</p>
        <h1 className="text-2xl font-semibold text-ink mb-8 text-center tracking-tight">Reset password</h1>

        <form onSubmit={handleSubmit} className="rounded-lg border border-line bg-panel p-7 flex flex-col gap-4">
          <label className="flex flex-col text-sm text-dim">
            Nuova password
            <input
              type="password"
              value={password}
              minLength={8}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              required
            />
          </label>

          <label className="flex flex-col text-sm text-dim">
            Conferma password
            <input
              type="password"
              value={confirmPassword}
              minLength={8}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="mt-2 bg-signal text-white font-medium py-2.5 rounded-md hover:bg-signal-600 transition-colors disabled:opacity-60"
          >
            {loading ? "Aggiornamento..." : "Aggiorna password"}
          </button>

          {msg && <p className="text-sm text-dim mt-1 whitespace-pre-line text-center">{msg}</p>}
        </form>
      </div>
    </Layout>
  );
}
