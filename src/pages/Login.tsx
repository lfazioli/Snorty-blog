// src/pages/Login.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const isJson = res.headers.get("content-type")?.includes("application/json");
      const data = isJson ? await res.json() : null;

      if (!res.ok) {
        alert((data && data.error) || `Errore durante il login (HTTP ${res.status})`);
        return;
      }

      // Imposta stato auth (salva token e decodifica utente)
      login(data.token);

      alert("Login effettuato!");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Errore durante il login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6">
        <img src={logo} alt="Logo" className="w-24 h-24 rounded-full mb-6" />
        <h1 className="text-3xl font-bold text-[#00ff99] mb-6">Login</h1>

        <form
          onSubmit={handleLogin}
          className="bg-black/50 backdrop-blur-md p-8 rounded-lg w-full max-w-sm flex flex-col gap-4"
        >
          <label className="flex flex-col text-white text-sm">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 p-2 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-[#00ff99]"
              required
            />
          </label>

          <label className="flex flex-col text-white text-sm">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 p-2 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-[#00ff99]"
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-[#00ff99] text-black font-semibold py-2 rounded hover:bg-[#00cc77] transition"
          >
            {loading ? "Loading..." : "Login"}
          </button>

          <div className="flex justify-between text-xs text-[#00ff99]/80 mt-2">
            <Link to="/register" className="hover:underline">Register</Link>
            <Link to="/forgot-password" className="hover:underline">Forgot-Password</Link>
          </div>
        </form>
      </div>
    </Layout>
  );
}
