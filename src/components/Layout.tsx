// src/components/Layout.tsx
import React from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0f0a] text-[#eaffea] font-mono">
      <header className="border-b border-[#00ff99]/30">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <nav className="flex gap-4">
            <Link to="/" className="text-[#00ff99] hover:underline">Home</Link>
            <Link to="/about" className="text-[#00ff99] hover:underline">About</Link>
            <Link to="/Posts" className="text-[#00ff99] hover:underline">Post</Link>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-[#00ff99]/80">{user.email}</span>
                <button
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="px-3 py-1 rounded bg-[#00ff99] text-black font-semibold hover:bg-[#00cc77] transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-3 py-1 rounded bg-[#00ff99] text-black font-semibold hover:bg-[#00cc77] transition"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">{children}</main>
      <footer className="text-center py-6 text-sm opacity-70">
        © {new Date().getFullYear()} - My Hacker Blog
      </footer>
    </div>
  );
}
