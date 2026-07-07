// src/components/Layout.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen bg-[#0a0f0a] text-[#eaffea] font-mono">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0f0a]/90 backdrop-blur border-b border-[#00ff99]/20">
        <div className="mx-auto max-w-[92rem] px-4 sm:px-6 lg:px-8">
          <div className="h-14 sm:h-16 flex items-center justify-between">
            {/* Left: logo + brand */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-3 shrink-0"
              aria-label="Go to home"
            >
              <img
                src={logo}
                alt="Logo"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full ring-2 ring-[#00ff99]"
              />
              <span className="text-[#00ff99] text-sm sm:text-base font-semibold tracking-wide">
                ~snorty/blog
              </span>
            </button>

            {/* Desktop nav */}
            <nav className="hidden sm:flex items-center gap-6">
              <Link className="text-[#00ff99] hover:underline" to="/">Home</Link>
              <Link className="text-[#00ff99] hover:underline" to="/about">About</Link>
              <Link className="text-[#00ff99] hover:underline" to="/Posts">Post</Link>
              {isAdmin && (
                <Link className="text-[#00ff99] hover:underline" to="/dashboard">Dashboard</Link>
              )}
            </nav>

            {/* Auth actions */}
            <div className="hidden sm:flex items-center gap-3">
              {user ? (
                <>
                  <span className="text-xs sm:text-sm text-[#00ff99]/80 truncate max-w-[12rem]">
                    {user.email}
                  </span>
                  <button
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                    className="px-3 py-1.5 rounded bg-[#00ff99] text-black font-semibold hover:bg-[#00cc77] transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded bg-[#00ff99] text-black font-semibold hover:bg-[#00cc77] transition"
                >
                  Login
                </Link>
              )}
            </div>

            {/* Mobile: hamburger */}
            <button
              onClick={() => setOpen((o) => !o)}
              className="sm:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-[#00ff99]/30 text-[#00ff99] hover:bg-[#00ff99]/10"
              aria-label="Apri menu"
              aria-expanded={open}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div className="sm:hidden border-t border-[#00ff99]/20">
            <div className="px-4 py-3 flex flex-col gap-3">
              <Link className="text-[#00ff99]" to="/" onClick={() => setOpen(false)}>Home</Link>
              <Link className="text-[#00ff99]" to="/about" onClick={() => setOpen(false)}>About</Link>
              <Link className="text-[#00ff99]" to="/Posts" onClick={() => setOpen(false)}>Post</Link>
              {isAdmin && (
                <Link className="text-[#00ff99]" to="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
              )}

              <div className="pt-2 border-t border-[#00ff99]/10 flex items-center justify-between">
                {user ? (
                  <>
                    <span className="text-sm text-[#00ff99]/80 truncate">{user.email}</span>
                    <button
                      onClick={() => {
                        logout();
                        setOpen(false);
                        navigate("/");
                      }}
                      className="px-3 py-1.5 rounded bg-[#00ff99] text-black font-semibold hover:bg-[#00cc77] transition"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="px-3 py-1.5 rounded bg-[#00ff99] text-black font-semibold hover:bg-[#00cc77] transition"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main container responsive */}
      <main className="mx-auto w-full max-w-[48rem] px-4 sm:px-6 py-6 sm:py-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="px-4 sm:px-6 py-6 text-center text-xs sm:text-sm opacity-70">
        © {new Date().getFullYear()} - My Hacker Blog
      </footer>
    </div>
  );
}
