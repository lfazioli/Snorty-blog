import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { GitHubProject } from "../src/types/github-project.js";

const username = "lfazioli";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const projects: GitHubProject[] = [];
    const signal = AbortSignal.timeout(8000);
    let page = 1;
    while (projects.length < 6) {
      const response = await fetch(`https://api.github.com/users/${username}/repos?sort=created&direction=desc&per_page=100&page=${page}`, {
        headers: { Accept: "application/vnd.github+json", "User-Agent": "Snorty-Blog", "X-GitHub-Api-Version": "2022-11-28" },
        signal,
      });
      if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
      const repos = await response.json();
      if (!Array.isArray(repos)) throw new Error("Invalid GitHub response");
      for (const repo of repos) {
        if (repo.private !== false || repo.fork || repo.owner?.login?.toLowerCase() !== username) continue;
        projects.push({
          id: repo.id,
          name: repo.name,
          description: repo.description || "Explore the code, documentation and ideas behind this project.",
          url: `https://github.com/${username}/${encodeURIComponent(repo.name)}`,
          language: repo.language || null,
          stars: repo.stargazers_count,
          topics: Array.isArray(repo.topics) ? repo.topics.slice(0, 3) : [],
        });
        if (projects.length === 6) break;
      }
      if (repos.length < 100) break;
      page++;
    }
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=600, stale-while-revalidate=60");
    return res.status(200).json({ projects });
  } catch (error) {
    console.error("GITHUB_PROJECTS_ERROR", error);
    res.setHeader("Cache-Control", "no-store");
    return res.status(502).json({ error: "GitHub projects are temporarily unavailable." });
  }
}
