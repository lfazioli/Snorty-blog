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
    <div className="min-h-screen bg-night text-ink font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-night/90 backdrop-blur border-b border-line">
        <div className="mx-auto max-w-[72rem] px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            {/* Left: logo + wordmark */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-3 shrink-0"
              aria-label="Go to home"
            >
              <img src={logo} alt="Logo" className="w-8 h-8 rounded-full border border-line" />
              <span className="font-mono text-sm text-ink tracking-tight">
                snorty<span className="text-signal">@</span>blog
              </span>
            </button>

            {/* Desktop nav */}
            <nav className="hidden sm:flex items-center gap-7 text-sm">
              <Link className="text-dim hover:text-ink transition-colors" to="/">Home</Link>
              <Link className="text-dim hover:text-ink transition-colors" to="/about">About</Link>
              <Link className="text-dim hover:text-ink transition-colors" to="/Posts">Posts</Link>
              {isAdmin && (
                <Link className="text-dim hover:text-ink transition-colors" to="/dashboard">Dashboard</Link>
              )}
            </nav>

            {/* Auth actions */}
            <div className="hidden sm:flex items-center gap-3">
              {user ? (
                <>
                  <span className="text-xs text-dim font-mono truncate max-w-[12rem]">{user.email}</span>
                  <button
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                    className="px-3 py-1.5 rounded-md border border-line text-sm text-dim hover:text-ink hover:border-signal/50 transition-colors"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-md bg-signal text-white text-sm font-medium hover:bg-signal-600 transition-colors"
                >
                  Log in
                </Link>
              )}
            </div>

            {/* Mobile: hamburger */}
            <button
              onClick={() => setOpen((o) => !o)}
              className="sm:hidden inline-flex items-center justify-center w-9 h-9 rounded-md border border-line text-dim hover:text-ink"
              aria-label="Open menu"
              aria-expanded={open}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div className="sm:hidden border-t border-line">
            <div className="px-4 py-3 flex flex-col gap-3 text-sm">
              <Link className="text-dim hover:text-ink" to="/" onClick={() => setOpen(false)}>Home</Link>
              <Link className="text-dim hover:text-ink" to="/about" onClick={() => setOpen(false)}>About</Link>
              <Link className="text-dim hover:text-ink" to="/Posts" onClick={() => setOpen(false)}>Posts</Link>
              {isAdmin && (
                <Link className="text-dim hover:text-ink" to="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
              )}

              <div className="pt-3 border-t border-line flex items-center justify-between">
                {user ? (
                  <>
                    <span className="text-xs text-dim font-mono truncate">{user.email}</span>
                    <button
                      onClick={() => {
                        logout();
                        setOpen(false);
                        navigate("/");
                      }}
                      className="px-3 py-1.5 rounded-md border border-line text-dim hover:text-ink transition-colors"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="px-3.5 py-1.5 rounded-md bg-signal text-white font-medium hover:bg-signal-600 transition-colors"
                  >
                    Log in
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main container */}
      <main className="mx-auto w-full max-w-[52rem] px-4 sm:px-6 py-10 sm:py-14">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-line px-4 sm:px-6 py-6 text-center text-xs text-dim font-mono">
        © {new Date().getFullYear()} snorty — cybersecurity &amp; dev notes
      </footer>
    </div>
  );
}
