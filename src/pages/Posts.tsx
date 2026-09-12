import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import PostCard from "../components/PostCard";
import { apiFetch } from "../lib/api";
import type { Post } from "../types/post";
import Seo from "../components/Seo";

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    apiFetch<{ posts: Post[] }>("/api/posts?scope=public")
      .then((data) => setPosts(data.posts))
      .catch(() => setError("Failed to load posts."))
      .finally(() => setLoading(false));
  }, []);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query
      .trim()
      .toLocaleLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    if (!normalizedQuery) return posts;

    return posts.filter((post) =>
      [post.title, post.excerpt]
        .filter(Boolean)
        .some((value) =>
          value
            .toLocaleLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .includes(normalizedQuery)
        )
    );
  }, [posts, query]);

  return (
    <Layout>
      <Seo title="Articles on cybersecurity and development" description="Every article, guide and experiment on Snorty Blog: cybersecurity, ethical hacking and software development." path="/posts" />
      <p className="font-mono text-xs text-signal mb-3 tracking-wide">// all posts</p>
      <h1 className="text-2xl sm:text-3xl font-semibold text-ink mb-8 tracking-tight">
        Posts
      </h1>

      <div className="relative mb-8">
        <label htmlFor="post-search" className="sr-only">
          Search the posts
        </label>
        <svg
          aria-hidden="true"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-dim"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <circle cx="11" cy="11" r="6.5" strokeWidth="2" />
          <path d="m16 16 4 4" strokeLinecap="round" strokeWidth="2" />
        </svg>
        <input
          id="post-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search for a post..."
          className="w-full rounded-lg border border-line bg-panel py-3 pl-10 pr-4 text-sm text-ink placeholder:text-dim transition-colors hover:border-signal/50 focus:border-signal focus:outline-none"
        />
      </div>

      {loading && <p className="text-dim text-sm">Loading...</p>}
      {error && <p className="text-danger text-sm">{error}</p>}
      {!loading && !error && posts.length === 0 && (
        <p className="text-dim text-sm">No posts yet.</p>
      )}

      {!loading && !error && posts.length > 0 && filteredPosts.length === 0 && (
        <p className="text-dim text-sm">No posts found for “{query.trim()}”.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {filteredPosts.map((post) => (
          <PostCard
            key={post.slug}
            title={post.title}
            date={post.publish_at || post.created_at}
            image={post.image}
            slug={post.slug}
            excerpt={post.excerpt}
            draft={!post.published}
          />
        ))}
      </div>
    </Layout>
  );
}
