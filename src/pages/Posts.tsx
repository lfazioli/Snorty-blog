import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import PostCard from "../components/PostCard";
import { apiFetch } from "../lib/api";
import type { Post } from "../types/post";

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<{ posts: Post[] }>("/api/posts")
      .then((data) => setPosts(data.posts))
      .catch(() => setError("Errore nel caricamento dei post."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <p className="font-mono text-xs text-signal mb-3 tracking-wide">// tutti gli articoli</p>
      <h1 className="text-2xl sm:text-3xl font-semibold text-ink mb-8 tracking-tight">
        Articoli
      </h1>

      {loading && <p className="text-dim text-sm">Caricamento...</p>}
      {error && <p className="text-danger text-sm">{error}</p>}
      {!loading && !error && posts.length === 0 && (
        <p className="text-dim text-sm">Nessun post ancora.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {posts.map((post) => (
          <PostCard
            key={post.slug}
            title={post.title}
            date={post.created_at}
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
