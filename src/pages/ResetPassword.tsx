// src/pages/ResetPassword.tsx
import React, { useState, useMemo } from "react";
import Layout from "../components/Layout";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch, ApiError } from "../lib/api";

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
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6">
        <h1 className="text-3xl font-bold text-[#00ff99] mb-6">Reset Password</h1>
        <form
          onSubmit={handleSubmit}
          className="bg-black/50 backdrop-blur-md p-8 rounded-lg w-full max-w-sm flex flex-col gap-4"
        >
          <label className="flex flex-col text-white text-sm">
            Nuova Password
            <input
              type="password"
              value={password}
              minLength={8}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 p-2 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-[#00ff99]"
              required
            />
          </label>

          <label className="flex flex-col text-white text-sm">
            Conferma Password
            <input
              type="password"
              value={confirmPassword}
              minLength={8}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 p-2 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-[#00ff99]"
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="mt-4 bg-[#00ff99] text-black font-semibold py-2 rounded hover:bg-[#00cc77] transition disabled:opacity-60"
          >
            {loading ? "Aggiornamento..." : "Reset Password"}
          </button>

          {msg && (
            <p className="text-sm text-[#00ff99] mt-2 whitespace-pre-line">
              {msg}
            </p>
          )}
        </form>
      </div>
    </Layout>
  );
}
