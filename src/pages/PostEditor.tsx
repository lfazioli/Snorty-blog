// src/pages/PostEditor.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Layout from "../components/Layout";
import { apiFetch, ApiError } from "../lib/api";
import { markdownComponents } from "../components/MarkdownComponents";
import type { Post } from "../types/post";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
}

export default function PostEditor() {
  const { slug } = useParams();
  const isEditing = Boolean(slug);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [image, setImage] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(true);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditing || !slug) return;
    (async () => {
      try {
        const data = await apiFetch<{ post: Post }>(`/api/posts/${slug}`);
        setTitle(data.post.title);
        setCustomSlug(data.post.slug);
        setExcerpt(data.post.excerpt || "");
        setImage(data.post.image || "");
        setContent(data.post.content);
        setPublished(data.post.published);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Errore nel caricamento del post");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug, isEditing]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim() || !content.trim()) {
      setError("Titolo e contenuto sono obbligatori.");
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        await apiFetch(`/api/posts/${slug}`, {
          method: "PUT",
          body: JSON.stringify({ title, excerpt, image, content, published }),
        });
      } else {
        await apiFetch(`/api/posts`, {
          method: "POST",
          body: JSON.stringify({ title, slug: customSlug, excerpt, image, content, published }),
        });
      }
      navigate("/dashboard");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Errore durante il salvataggio");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <p className="text-gray-400 text-center py-12">Caricamento...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="text-white max-w-3xl mx-auto py-12">
        <h1 className="text-3xl font-extrabold text-[#00ff99] mb-8">
          {isEditing ? "Modifica Post" : "Nuovo Post"}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col text-sm gap-1">
            Titolo
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!isEditing) setCustomSlug(slugify(e.target.value));
              }}
              className="p-2 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-[#00ff99]"
              required
            />
          </label>

          <label className="flex flex-col text-sm gap-1">
            Slug (URL)
            <input
              value={customSlug}
              onChange={(e) => setCustomSlug(slugify(e.target.value))}
              disabled={isEditing}
              className="p-2 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-[#00ff99] disabled:opacity-50"
            />
            <span className="text-xs text-gray-500">
              /post/{customSlug || "..."}
              {isEditing && " (non modificabile per non rompere i link già condivisi)"}
            </span>
          </label>

          <label className="flex flex-col text-sm gap-1">
            Immagine di copertina (URL, opzionale)
            <input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="p-2 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-[#00ff99]"
              placeholder="https://..."
            />
          </label>

          <label className="flex flex-col text-sm gap-1">
            Estratto (opzionale, mostrato nelle card)
            <input
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="p-2 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-[#00ff99]"
            />
          </label>

          <div>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setTab("write")}
                className={`px-3 py-1 rounded text-sm transition ${
                  tab === "write" ? "bg-[#00ff99] text-black" : "bg-[#00ff99]/10 text-[#00ff99]"
                }`}
              >
                Scrivi
              </button>
              <button
                type="button"
                onClick={() => setTab("preview")}
                className={`px-3 py-1 rounded text-sm transition ${
                  tab === "preview" ? "bg-[#00ff99] text-black" : "bg-[#00ff99]/10 text-[#00ff99]"
                }`}
              >
                Anteprima
              </button>
            </div>

            {tab === "write" ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={16}
                className="w-full p-3 rounded bg-gray-900 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#00ff99]"
                placeholder="Scrivi in Markdown... (# Titolo, **grassetto**, - lista, ecc.)"
                required
              />
            ) : (
              <div className="p-4 rounded bg-black/40 border border-[#00ff99]/20 min-h-[300px] text-white">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {content || "*Niente da mostrare*"}
                </ReactMarkdown>
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="accent-[#00ff99]"
            />
            Pubblicato (disattiva per salvare come bozza, visibile solo a te)
          </label>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 mt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded bg-[#00ff99] text-black font-semibold hover:bg-[#00cc77] transition disabled:opacity-60"
            >
              {saving ? "Salvataggio..." : "Salva"}
            </button>
            <Link
              to="/dashboard"
              className="px-5 py-2 rounded border border-[#00ff99]/40 text-[#00ff99] hover:bg-[#00ff99]/10 transition"
            >
              Annulla
            </Link>
          </div>
        </form>
      </section>
    </Layout>
  );
}
