// src/pages/Register.tsx
import React, { useState } from "react";
import Layout from "../components/Layout";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch, ApiError } from "../lib/api";

const inputClass =
  "mt-1.5 p-2.5 rounded-md bg-panel border border-line text-ink focus:outline-none focus:border-signal transition-colors";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Le password non coincidono!");
      return;
    }

    setLoading(true);
    try {
      const data = await apiFetch<{ token: string }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      login(data.token);
      navigate("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Errore durante la registrazione.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-sm mx-auto py-8">
        <p className="font-mono text-xs text-signal mb-2 tracking-wide text-center">// crea account</p>
        <h1 className="text-2xl font-semibold text-ink mb-8 text-center tracking-tight">Registrati</h1>

        <form onSubmit={handleRegister} className="rounded-lg border border-line bg-panel p-7 flex flex-col gap-4">
          <label className="flex flex-col text-sm text-dim">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              required
            />
          </label>

          <label className="flex flex-col text-sm text-dim">
            Password
            <input
              type="password"
              value={password}
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
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-signal text-white font-medium py-2.5 rounded-md hover:bg-signal-600 transition-colors disabled:opacity-60"
          >
            {loading ? "Registrazione..." : "Registrati"}
          </button>

          {error && <p className="text-danger text-sm text-center">{error}</p>}

          <div className="text-xs text-dim mt-2 text-center">
            <Link to="/login" className="hover:text-ink transition-colors">Hai già un account? Accedi</Link>
          </div>
        </form>
      </div>
    </Layout>
  );
}
