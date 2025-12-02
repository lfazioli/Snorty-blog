import { Link } from "react-router-dom";
import logo from "../assets/logo.png"; // Assicurati che il percorso sia corretto

export default function Navbar() {
  return (
    <nav className="border-b border-[#009966] bg-black/30 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo + Nome blog */}
        <div className="flex items-center gap-3">
          {/* Logo a forma di cerchio */}
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

        {/* Menu + Bottone */}
        <div className="flex gap-4 items-center text-[#eaffea]">
          <Link to="/" className="hover:text-[#00ff99] transition">
            Home
          </Link>
          <Link to="/about" className="hover:text-[#00ff99] transition">
            About
          </Link>
                    <Link to="/post" className="hover:text-[#00ff99] transition">
            Post
          </Link>
  <Link
    to="/login"
    className="bg-[#00ff99] text-black font-semibold px-4 py-2 rounded hover:bg-[#00cc77] transition"
  >
    Login
  </Link>
        </div>
      </div>
    </nav>
  );
}
