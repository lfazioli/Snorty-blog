// src/pages/ForgotPassword.tsx
import React, { useState } from "react";
import logo from "../assets/logo.png";
import Layout from "../components/Layout";
import { Link, useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const isJson = res.headers.get("content-type")?.includes("application/json");
      const data = isJson ? await res.json() : null;

      if (!res.ok) {
        alert((data && data.error) || "Errore durante la richiesta di reset.");
      } else {
        alert(data.message || "Controlla la tua email per il link di reset.");
        if (data.resetLink) {
          navigate(data.resetLink); // es. /reset-password/<token>
        }
      }
    } catch (err) {
      console.error(err);
      alert("Errore durante la richiesta di reset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6">
        <img src={logo} alt="Logo" className="w-24 h-24 rounded-full mb-6" />
        <h1 className="text-3xl font-bold text-[#00ff99] mb-6">Forgot Password</h1>

        <form onSubmit={handleReset} className="bg-black/50 backdrop-blur-md p-8 rounded-lg w-full max-w-sm flex flex-col gap-4">
          <label className="flex flex-col text-white text-sm">
            Inserisci la tua email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 p-2 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-[#00ff99]"
              required
            />
          </label>

          <button type="submit" disabled={loading} className="mt-4 bg-[#00ff99] text-black font-semibold py-2 rounded hover:bg-[#00cc77] transition">
            {loading ? "Invio in corso..." : "Reset Password"}
          </button>

          <div className="flex justify-between text-xs text-[#00ff99]/80 mt-2">
            <Link to="/login" className="hover:underline">Back to Login</Link>
            <Link to="/register" className="hover:underline">Register</Link>
          </div>
        </form>
      </div>
    </Layout>
  );
}
