import React, { useState } from "react";
import logo from "../assets/logo.png";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Le password non coincidono!");
      return;
    }
    console.log("Register:", { email, password });
    alert("Registrazione eseguita (demo)!");
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6">
        <img src={logo} alt="Logo" className="w-24 h-24 rounded-full mb-6" />
        <h1 className="text-3xl font-bold text-[#00ff99] mb-6">Register</h1>
        <form
          onSubmit={handleRegister}
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

          <label className="flex flex-col text-white text-sm">
            Conferma Password
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 p-2 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-[#00ff99]"
              required
            />
          </label>

          <button
            type="submit"
            className="mt-4 bg-[#00ff99] text-black font-semibold py-2 rounded hover:bg-[#00cc77] transition"
          >
            Register
          </button>

          <div className="flex justify-between text-xs text-[#00ff99]/80 mt-2">
 <Link to="/login" className="hover:underline">Already have an account?</Link>
          </div>
        </form>
      </div>
    </Layout>
  );
}