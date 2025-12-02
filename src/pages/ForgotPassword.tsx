import React, { useState } from "react";
import logo from "../assets/logo.png";
import Layout from "../components/Layout";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Reset password for:", email);
    alert("Link di recupero inviato all'email (demo)!");
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6">
        <img src={logo} alt="Logo" className="w-24 h-24 rounded-full mb-6" />
        <h1 className="text-3xl font-bold text-[#00ff99] mb-6">Forgot Password</h1>
        <form
          onSubmit={handleReset}
          className="bg-black/50 backdrop-blur-md p-8 rounded-lg w-full max-w-sm flex flex-col gap-4"
        >
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

          <button
            type="submit"
            className="mt-4 bg-[#00ff99] text-black font-semibold py-2 rounded hover:bg-[#00cc77] transition"
          >
            Reset Password
          </button>

          <div className="flex justify-between text-xs text-[#00ff99]/80 mt-2">
            <a href="/login" className="hover:underline">
              Back to Login
            </a>
            <a href="/register" className="hover:underline">
              Register
            </a>
          </div>
        </form>
      </div>
    </Layout>
  );
}
