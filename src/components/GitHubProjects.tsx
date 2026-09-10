import { useEffect, useState } from "react";
import type { GitHubProject } from "../types/github-project";

export default function GitHubProjects() {
  const [projects, setProjects] = useState<GitHubProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    // Public endpoint: do not send the blog's authentication token.
    fetch("/api/github-projects", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load projects");
        const data = await response.json();
        if (!Array.isArray(data.projects)) throw new Error("Invalid projects");
        if (!controller.signal.aborted) setProjects(data.projects);
      })
      .catch(() => { if (!controller.signal.aborted) setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [attempt]);

  return (
    <section className="mb-20" aria-labelledby="github-projects-title">
      <div className="flex items-end justify-between gap-5 flex-wrap mb-7">
        <div>
          <p className="font-mono text-xs text-signal mb-3 tracking-wide">// built by me</p>
          <h2 id="github-projects-title" className="text-2xl sm:text-3xl font-semibold text-ink tracking-tight">From idea to repository.</h2>
          <p className="text-sm text-dim mt-3 max-w-xl leading-relaxed">My latest projects, experiments and open-source tools. Fresh from GitHub.</p>
        </div>
        <a href="https://github.com/lfazioli?tab=repositories" target="_blank" rel="noopener noreferrer" className="text-sm text-signal hover:text-ink transition-colors">All repositories <span aria-hidden="true">↗</span></a>
      </div>

      {loading && <div role="status"><span className="sr-only">Loading GitHub projects...</span><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" aria-hidden="true">{[0, 1, 2].map((item) => <div key={item} className="rounded-xl border border-line bg-panel p-6 h-56 motion-safe:animate-pulse"><div className="w-10 h-10 rounded-lg bg-line mb-6" /><div className="h-4 bg-line rounded w-2/3 mb-4" /><div className="h-3 bg-line rounded w-full" /></div>)}</div></div>}
      {!loading && error && <div role="status" className="rounded-xl border border-line bg-panel p-6 text-sm text-dim">Projects are temporarily unavailable. You can still explore them on GitHub. <button type="button" className="text-signal underline ml-1" onClick={() => { setError(false); setLoading(true); setAttempt((value) => value + 1); }}>Try again</button></div>}
      {!loading && !error && projects.length === 0 && <p className="text-dim text-sm">New projects will appear here as soon as they are shared on GitHub.</p>}
      {!loading && !error && <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((project) => <a key={project.id} href={project.url} target="_blank" rel="noopener noreferrer" className="group flex flex-col rounded-xl border border-line bg-panel p-6 hover:border-signal/60 hover:bg-signal/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal transition-colors">
          <div className="flex items-center justify-between mb-5">
            <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-lg border border-signal/20 bg-signal/10 text-signal font-mono text-lg">{'</>'}</span>
            <span aria-hidden="true" className="text-dim group-hover:text-signal transition-colors">↗</span>
          </div>
          <h3 className="font-semibold text-ink break-words group-hover:text-signal transition-colors">{project.name}</h3>
          <p className="mt-2 text-sm text-dim leading-relaxed line-clamp-3">{project.description}</p>
          {project.topics.length > 0 && <div className="mt-4 flex flex-wrap gap-1.5">{project.topics.map((topic) => <span key={topic} className="max-w-full break-words rounded border border-line px-2 py-0.5 text-[10px] font-mono text-dim">{topic}</span>)}</div>}
          <div className="mt-auto pt-6 flex items-center justify-between gap-3 text-xs text-dim font-mono">
            <span className="flex items-center gap-2"><span aria-hidden="true" className="h-2 w-2 rounded-full bg-signal" />{project.language || "Repository"}</span>
            <span aria-label={`${project.stars} stars`}><span aria-hidden="true">☆ </span>{project.stars}</span>
          </div>
        </a>)}
      </div>}
    </section>
  );
}
