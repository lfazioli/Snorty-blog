
import Navbar from "./Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0f0a] text-[#eaffea] font-mono">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-10">{children}</main>
      <footer className="text-center py-6 text-sm opacity-70">
        © {new Date().getFullYear()} - My Hacker Blog
      </footer>
    </div>
  );
}
