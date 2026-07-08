import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import PostCard from "../components/PostCard";
import { TypeAnimation } from "react-type-animation";
import { apiFetch } from "../lib/api";
import { Link } from "react-router-dom";
import type { Post } from "../types/post";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ posts: Post[] }>("/api/posts")
      .then((data) => setPosts(data.posts.slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      {/* HERO */}
      <section className="mb-20">
        <p className="font-mono text-xs text-signal mb-4 tracking-wide">
          snorty@blog:~$ whoami
        </p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-ink leading-tight mb-5 tracking-tight">
          <TypeAnimation
            sequence={[
              "Cybersecurity & ethical hacking notes",
              2000,
              "Coding, tools and security research",
              2000,
            ]}
            wrapper="span"
            speed={50}
            repeat={Infinity}
          />
        </h1>

        <p className="text-dim text-base sm:text-lg leading-relaxed max-w-xl mb-8">
          I write about cybersecurity, ethical hacking and development: practical
          guides, experiments and the tools I build along the way.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/about"
            className="px-4 py-2 rounded-md bg-signal text-white text-sm font-medium hover:bg-signal-600 transition-colors"
          >
            About me
          </Link>
          <a
            href="https://github.com/lfazioli"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-md border border-line text-sm text-dim hover:text-ink hover:border-signal/50 transition-colors"
          >
            GitHub
          </a>
        </div>
      </section>

      {/* WHAT I DO */}
      <section className="mb-20">
        <p className="font-mono text-xs text-signal mb-3 tracking-wide">// what I do</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-line rounded-lg overflow-hidden border border-line">
          <div className="bg-panel p-6">
            <h3 className="text-sm font-semibold text-ink mb-2">Cybersecurity</h3>
            <p className="text-sm text-dim leading-relaxed">
              System analysis, vulnerability research and hardening.
            </p>
          </div>
          <div className="bg-panel p-6">
            <h3 className="text-sm font-semibold text-ink mb-2">Development</h3>
            <p className="text-sm text-dim leading-relaxed">
              Tools and applications with React, TypeScript, Python.
            </p>
          </div>
          <div className="bg-panel p-6">
            <h3 className="text-sm font-semibold text-ink mb-2">Tools & experiments</h3>
            <p className="text-sm text-dim leading-relaxed">
              IPScan for Raycast and other ongoing experiments.
            </p>
          </div>
        </div>
      </section>

      {/* LATEST POSTS */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <p className="font-mono text-xs text-signal tracking-wide">// latest posts</p>
          <Link to="/Posts" className="text-xs text-dim hover:text-ink transition-colors">
            View all →
          </Link>
        </div>

        {loading && <p className="text-dim text-sm">Loading...</p>}
        {!loading && posts.length === 0 && <p className="text-dim text-sm">No posts yet.</p>}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {posts.map((p) => (
            <PostCard
              key={p.slug}
              title={p.title}
              date={p.created_at}
              image={p.image}
              slug={p.slug}
              excerpt={p.excerpt}
              draft={!p.published}
            />
          ))}
        </div>
      </section>
    </Layout>
  );
}
