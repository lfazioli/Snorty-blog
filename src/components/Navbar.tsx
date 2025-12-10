import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="border-b border-[#009966] bg-black/30 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo + Nome Snorty */}
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="Logo"
            className="w-10 h-10 rounded-full object-cover"
          />
          <Link
            to="/"
            className="text-[#00ff99] text-xl font-bold hover:opacity-80"
          >
            ~snorty/blog
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6 items-center text-[#eaffea]">
          <Link to="/" className="hover:text-[#00ff99] transition">Home</Link>
          <Link to="/about" className="hover:text-[#00ff99] transition">About</Link>
          <Link to="/Posts" className="hover:text-[#00ff99] transition">Post</Link>

          <Link
            to="/login"
            className="bg-[#00ff99] text-black font-semibold px-4 py-2 rounded hover:bg-[#00cc77] transition"
          >
            Login
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-[#00ff99] text-3xl"
          onClick={() => setOpen(!open)}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-black/50 backdrop-blur-md border-t border-[#009966] px-6 py-4 space-y-4 text-[#eaffea] animate-fadeIn">
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="block hover:text-[#00ff99] transition"
          >
            Home
          </Link>

          <Link
            to="/about"
            onClick={() => setOpen(false)}
            className="block hover:text-[#00ff99] transition"
          >
            About
          </Link>

          <Link
            to="/Posts"
            onClick={() => setOpen(false)}
            className="block hover:text-[#00ff99] transition"
          >
            Post
          </Link>

          <Link
            to="/login"
            onClick={() => setOpen(false)}
            className="block bg-[#00ff99] text-black text-center font-semibold px-4 py-2 rounded hover:bg-[#00cc77] transition"
          >
            Login
          </Link>
        </div>
      )}
    </nav>
  );
}
