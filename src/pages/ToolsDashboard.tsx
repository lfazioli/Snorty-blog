// src/pages/ToolsDashboard.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { apiFetch, ApiError } from "../lib/api";
import type { Tool } from "../types/tool";
import Seo from "../components/Seo";

export default function ToolsDashboard() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function load() {
    try {
      const data = await apiFetch<{ tools: Tool[] }>("/api/tools");
      setTools(data.tools);
      setError("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load tools");
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
  }, []);

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this tool? This action cannot be undone.")) return;
    setDeletingId(id);
    try {
      await apiFetch(`/api/tools?id=${id}`, { method: "DELETE" });
      setTools((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Failed to delete the tool");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Layout>
      <Seo title="Dashboard" description="Area di gestione dei contenuti." path="/dashboard/tools" noIndex />
      <nav className="flex gap-4 mb-6 text-sm"><Link to="/dashboard" className="text-dim hover:text-ink">Posts</Link><span className="text-signal" aria-current="page">Tools</span></nav>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="font-mono text-xs text-signal mb-2 tracking-wide">// content management</p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-ink tracking-tight">Tools</h1>
        </div>
        <Link
          to="/dashboard/tools/new"
          className="px-4 py-2 rounded-md bg-signal text-white text-sm font-medium hover:bg-signal-600 transition-colors"
        >
          + New tool
        </Link>
      </div>

      {loading && <p className="text-dim text-sm">Loading...</p>}
      {error && <p role="alert" className="text-danger text-sm">{error} <button className="underline" onClick={() => { setLoading(true); void load(); }}>Retry</button></p>}
      {!loading && !error && tools.length === 0 && (
        <p className="text-dim text-sm">No tools yet. Create one!</p>
      )}

      <div className="flex flex-col gap-2">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className="flex items-center justify-between gap-4 p-4 rounded-lg border border-line bg-panel flex-wrap"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-ink truncate">{tool.name}</h3>
                {!tool.published && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded border border-warn/40 text-warn font-mono shrink-0">
                    draft
                  </span>
                )}
              </div>
              <p className="text-xs text-dim font-mono truncate mt-0.5">{tool.category}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to={`/dashboard/tools/edit/${tool.id}`}
                className="px-3 py-1.5 rounded-md border border-line text-dim hover:text-ink hover:border-signal/50 transition-colors text-sm"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(tool.id)}
                disabled={deletingId === tool.id}
                className="px-3 py-1.5 rounded-md border border-danger/30 text-danger hover:bg-danger/10 transition-colors text-sm disabled:opacity-50"
              >
                {deletingId === tool.id ? "..." : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
