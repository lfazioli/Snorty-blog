// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { apiFetch, ApiError } from "../lib/api";
import type { Post } from "../types/post";

export default function Dashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  async function load() {
    try {
      const data = await apiFetch<{ posts: Post[] }>("/api/posts");
      setPosts(data.posts);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Errore nel caricamento dei post");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // load() aggiorna lo stato solo dopo l'await (nessun setState sincrono):
    // è definita come funzione a parte perché riutilizzabile anche da un eventuale
    // pulsante "riprova" in futuro.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function handleDelete(slug: string) {
    if (!window.confirm("Eliminare questo post? L'azione non è reversibile.")) return;
    setDeletingSlug(slug);
    try {
      await apiFetch(`/api/posts/${slug}`, { method: "DELETE" });
      setPosts((prev) => prev.filter((p) => p.slug !== slug));
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Errore durante l'eliminazione");
    } finally {
      setDeletingSlug(null);
    }
  }

  return (
    <Layout>
      <section className="text-white max-w-5xl mx-auto py-12">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#00ff99]">Gestione Post</h1>
          <Link
            to="/dashboard/new"
            className="px-4 py-2 rounded bg-[#00ff99] text-black font-semibold hover:bg-[#00cc77] transition"
          >
            + Nuovo Post
          </Link>
        </div>

        {loading && <p className="text-gray-400">Caricamento...</p>}
        {error && <p className="text-red-400">{error}</p>}
        {!loading && !error && posts.length === 0 && (
          <p className="text-gray-400">Nessun post ancora. Creane uno!</p>
        )}

        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <div
              key={post.slug}
              className="flex items-center justify-between gap-4 p-4 rounded-xl bg-[#00ff99]/10 border border-[#00ff99]/20 flex-wrap"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-[#00ff99] truncate">{post.title}</h3>
                  {!post.published && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 shrink-0">
                      Bozza
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 truncate">/post/{post.slug}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/dashboard/edit/${post.slug}`}
                  className="px-3 py-1.5 rounded bg-[#00ff99]/20 text-[#00ff99] border border-[#00ff99]/40 hover:bg-[#00ff99]/30 transition text-sm"
                >
                  Modifica
                </Link>
                <button
                  onClick={() => handleDelete(post.slug)}
                  disabled={deletingSlug === post.slug}
                  className="px-3 py-1.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 transition text-sm disabled:opacity-50"
                >
                  {deletingSlug === post.slug ? "..." : "Elimina"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
