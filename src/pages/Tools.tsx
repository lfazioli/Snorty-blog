import Layout from "../components/Layout";
import Seo from "../components/Seo";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import type { Tool } from "../types/tool";

export default function Tools() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    apiFetch<{ tools: Tool[] }>("/api/tools?scope=public")
      .then((data) => { if (active) setTools(data.tools); })
      .catch(() => { if (active) setError("Unable to load tools. Please try again."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attempt]);
  const categories = [...new Set(tools.map((tool) => tool.category))].sort();
  const filtered = tools.filter((tool) => (!category || tool.category === category) &&
    `${tool.name} ${tool.description} ${tool.category} ${tool.badge}`.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <Layout>
      <Seo
        title="Tools"
        description="A curated collection of tools for networks, OSINT, and web analysis, with quick guides to get started."
        path="/tools"
      />

      <section className="mb-10 sm:mb-14">
        <p className="font-mono text-xs text-signal mb-3 tracking-wide">// toolbox</p>
        <h1 className="text-3xl sm:text-4xl font-semibold text-ink tracking-tight mb-4">Tools worth knowing.</h1>
        <p className="max-w-2xl text-dim leading-relaxed">
          A practical selection for exploring networks, analysing URLs, and working with data. Less obvious than the usual names, but great to keep close at hand.
        </p>
      </section>

      <aside className="mb-10 rounded-xl border border-signal/30 bg-signal/5 px-5 py-4 text-sm text-dim leading-relaxed">
        <span className="font-mono text-signal">Ethical note:</span> only use these tools on networks, domains, and data you own or have explicit permission to assess.
      </aside>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <label className="flex-1 text-sm text-dim">Search tools
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or keyword..." className="mt-2 w-full rounded-md border border-line bg-panel p-3 text-ink focus:outline-none focus:border-signal" />
        </label>
        <label className="text-sm text-dim">Category
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-2 block w-full rounded-md border border-line bg-panel p-3 text-ink">
            <option value="">All categories</option>
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
      </div>
      {loading && <p className="text-dim" role="status">Loading tools...</p>}
      {error && <div role="alert" className="text-danger mb-6">{error} <button className="underline" onClick={() => { setError(""); setLoading(true); setAttempt((n) => n + 1); }}>Retry</button></div>}
      {!loading && !error && <p className="text-sm text-dim mb-6" role="status">{filtered.length} tools found</p>}
      {!loading && !error && filtered.length === 0 && <div className="text-dim mb-6">No tools match your search. <button className="text-signal underline" onClick={() => { setQuery(""); setCategory(""); }}>Clear filters</button></div>}
      <div className="grid gap-6 sm:grid-cols-2">
        {filtered.map((tool) => (
          <article key={tool.id} className="group overflow-hidden rounded-xl border border-line bg-panel transition-colors hover:border-signal/50">
            {tool.image ? <img src={tool.image} alt={`Screenshot di ${tool.name}`} loading="lazy" decoding="async" className="h-40 w-full object-cover opacity-90 transition duration-300 group-hover:opacity-100" /> : <div className="h-40 bg-signal/5 flex items-center justify-center font-mono text-signal text-xl" aria-hidden="true">{tool.name}</div>}
            <div className="p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="font-mono text-xs text-signal">{tool.category}</p>
                <span className="rounded border border-line px-2 py-0.5 font-mono text-[10px] text-dim">{tool.badge}</span>
              </div>
              <h2 className="text-xl font-semibold text-ink">{tool.name}</h2>
              <p className="mt-2 text-sm leading-relaxed text-dim">{tool.description}</p>
              <div className="mt-5 border-l-2 border-signal/70 pl-3">
                <p className="font-mono text-[11px] uppercase tracking-wide text-ink">Getting started</p>
                <p className="mt-1 text-sm leading-relaxed text-dim">{tool.howTo}</p>
              </div>
              <a
                href={tool.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-signal hover:text-ink transition-colors"
              >
                Open {tool.name}
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </article>
        ))}
      </div>
    </Layout>
  );
}
