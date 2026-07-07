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
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="font-mono text-xs text-signal mb-2 tracking-wide">// gestione contenuti</p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-ink tracking-tight">Articoli</h1>
        </div>
        <Link
          to="/dashboard/new"
          className="px-4 py-2 rounded-md bg-signal text-white text-sm font-medium hover:bg-signal-600 transition-colors"
        >
          + Nuovo articolo
        </Link>
      </div>

      {loading && <p className="text-dim text-sm">Caricamento...</p>}
      {error && <p className="text-danger text-sm">{error}</p>}
      {!loading && !error && posts.length === 0 && (
        <p className="text-dim text-sm">Nessun post ancora. Creane uno!</p>
      )}

      <div className="flex flex-col gap-2">
        {posts.map((post) => (
          <div
            key={post.slug}
            className="flex items-center justify-between gap-4 p-4 rounded-lg border border-line bg-panel flex-wrap"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-ink truncate">{post.title}</h3>
                {!post.published && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded border border-warn/40 text-warn font-mono shrink-0">
                    bozza
                  </span>
                )}
              </div>
              <p className="text-xs text-dim font-mono truncate mt-0.5">/post/{post.slug}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to={`/dashboard/edit/${post.slug}`}
                className="px-3 py-1.5 rounded-md border border-line text-dim hover:text-ink hover:border-signal/50 transition-colors text-sm"
              >
                Modifica
              </Link>
              <button
                onClick={() => handleDelete(post.slug)}
                disabled={deletingSlug === post.slug}
                className="px-3 py-1.5 rounded-md border border-danger/30 text-danger hover:bg-danger/10 transition-colors text-sm disabled:opacity-50"
              >
                {deletingSlug === post.slug ? "..." : "Elimina"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
