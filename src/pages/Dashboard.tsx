// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { apiFetch, ApiError } from "../lib/api";
import type { Post } from "../types/post";
import { publicationLabel } from "../lib/publication";
import Seo from "../components/Seo";

export default function Dashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<Array<{ date: string; title: string }>>([]);

  async function load() {
    try {
      const data = await apiFetch<{ posts: Post[] }>("/api/posts");
      setPosts(data.posts);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // load() only updates state after the await (no synchronous setState):
    // it's defined as a standalone function so it can be reused by a future
    // "retry" button too.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    fetch("/devto-calendar.json")
      .then((response) => response.ok ? response.json() : [])
      .then((entries) => setSchedule(entries))
      .catch(() => setSchedule([]));
  }, []);

  async function handleDelete(slug: string) {
    if (!window.confirm("Delete this post? This action cannot be undone.")) return;
    setDeletingSlug(slug);
    try {
      await apiFetch(`/api/posts/${slug}`, { method: "DELETE" });
      setPosts((prev) => prev.filter((p) => p.slug !== slug));
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Failed to delete the post");
    } finally {
      setDeletingSlug(null);
    }
  }

  return (
    <Layout>
      <Seo title="Dashboard" description="Area di gestione dei contenuti." path="/dashboard" noIndex />
      <nav className="flex gap-4 mb-6 text-sm"><span className="text-signal" aria-current="page">Posts</span><Link to="/dashboard/tools" className="text-dim hover:text-ink">Tools</Link></nav>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="font-mono text-xs text-signal mb-2 tracking-wide">// content management</p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-ink tracking-tight">Posts</h1>
        </div>
        <Link
          to="/dashboard/new"
          className="px-4 py-2 rounded-md bg-signal text-white text-sm font-medium hover:bg-signal-600 transition-colors"
        >
          + New post
        </Link>
      </div>

      {loading && <p className="text-dim text-sm">Loading...</p>}
      {error && <p className="text-danger text-sm">{error}</p>}
      {!loading && !error && posts.length === 0 && (
        <p className="text-dim text-sm">No posts yet. Create one!</p>
      )}

      <section className="mb-8">
        <p className="font-mono text-xs text-signal mb-3 tracking-wide">// dev.to publication schedule</p>
        <div className="rounded-lg border border-line overflow-hidden">
          {schedule.map((entry) => {
            const published = entry.date <= new Date().toISOString().slice(0, 10);
            return (
              <div key={`${entry.date}-${entry.title}`} className="flex items-center justify-between gap-4 px-4 py-3 border-b border-line last:border-b-0 bg-panel">
                <div className="min-w-0">
                  <span className="block text-sm text-ink truncate">{entry.title}</span>
                  <span className={`text-[10px] font-mono ${published ? "text-signal" : "text-dim"}`}>
                    {published ? "published / due" : "scheduled"}
                  </span>
                </div>
                <time className="text-xs font-mono text-dim shrink-0">{entry.date}</time>
              </div>
            );
          })}
          {schedule.length === 0 && (
            <p className="px-4 py-3 text-sm text-dim bg-panel">Publication schedule unavailable.</p>
          )}
        </div>
      </section>

      <div className="flex flex-col gap-2">
        {posts.map((post) => (
          <div
            key={post.slug}
            className="flex items-center justify-between gap-4 p-4 rounded-lg border border-line bg-panel flex-wrap"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-ink truncate">{post.title}</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded border border-line text-signal font-mono">
                  {publicationLabel(post.published, post.publish_at)}
                </span>
              </div>
              <p className="text-xs text-dim font-mono truncate mt-0.5">/post/{post.slug}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to={`/dashboard/edit/${post.slug}`}
                className="px-3 py-1.5 rounded-md border border-line text-dim hover:text-ink hover:border-signal/50 transition-colors text-sm"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(post.slug)}
                disabled={deletingSlug === post.slug}
                className="px-3 py-1.5 rounded-md border border-danger/30 text-danger hover:bg-danger/10 transition-colors text-sm disabled:opacity-50"
              >
                {deletingSlug === post.slug ? "..." : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
