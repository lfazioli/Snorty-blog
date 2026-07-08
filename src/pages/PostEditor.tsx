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

const inputClass =
  "p-2.5 rounded-md bg-panel border border-line text-ink placeholder:text-dim/60 focus:outline-none focus:border-signal transition-colors";

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
        setError(e instanceof ApiError ? e.message : "Failed to load the post");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug, isEditing]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
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
      setError(e instanceof ApiError ? e.message : "Failed to save the post");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <p className="text-dim text-sm text-center py-12">Loading...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <p className="font-mono text-xs text-signal mb-2 tracking-wide">
        // {isEditing ? "edit" : "new"} post
      </p>
      <h1 className="text-2xl sm:text-3xl font-semibold text-ink tracking-tight mb-8">
        {isEditing ? "Edit post" : "New post"}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col text-sm gap-1.5 text-dim">
          Title
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!isEditing) setCustomSlug(slugify(e.target.value));
            }}
            className={inputClass}
            required
          />
        </label>

        <label className="flex flex-col text-sm gap-1.5 text-dim">
          Slug (URL)
          <input
            value={customSlug}
            onChange={(e) => setCustomSlug(slugify(e.target.value))}
            disabled={isEditing}
            className={`${inputClass} disabled:opacity-50 font-mono text-sm`}
          />
          <span className="text-xs text-dim/70 font-mono">
            /post/{customSlug || "..."}
            {isEditing && " — cannot be changed"}
          </span>
        </label>

        <label className="flex flex-col text-sm gap-1.5 text-dim">
          Cover image (URL, optional)
          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className={inputClass}
            placeholder="https://..."
          />
        </label>

        <label className="flex flex-col text-sm gap-1.5 text-dim">
          Excerpt (optional, shown on the cards)
          <input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className={inputClass} />
        </label>

        <div>
          <div className="flex gap-1 mb-2 border border-line rounded-md p-1 w-fit">
            <button
              type="button"
              onClick={() => setTab("write")}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                tab === "write" ? "bg-signal text-white" : "text-dim hover:text-ink"
              }`}
            >
              Write
            </button>
            <button
              type="button"
              onClick={() => setTab("preview")}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                tab === "preview" ? "bg-signal text-white" : "text-dim hover:text-ink"
              }`}
            >
              Preview
            </button>
          </div>

          {tab === "write" ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={16}
              className={`${inputClass} w-full font-mono text-sm`}
              placeholder="Write in Markdown... (# Heading, **bold**, - list, etc.)"
              required
            />
          ) : (
            <div className="p-4 rounded-md bg-panel border border-line min-h-[300px] text-ink">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {content || "*Nothing to show*"}
              </ReactMarkdown>
            </div>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-dim">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="accent-signal"
          />
          Published (turn off to save as a draft, only visible to you)
        </label>

        {error && <p className="text-danger text-sm">{error}</p>}

        <div className="flex gap-3 mt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-md bg-signal text-white text-sm font-medium hover:bg-signal-600 transition-colors disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <Link
            to="/dashboard"
            className="px-5 py-2 rounded-md border border-line text-dim hover:text-ink transition-colors text-sm"
          >
            Cancel
          </Link>
        </div>
      </form>
    </Layout>
  );
}
