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
      <section className="text-white max-w-5xl mx-auto py-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#00ff99] mb-8 animate-fadeIn">
          All Posts
        </h1>

        {loading && <p className="text-gray-400">Caricamento...</p>}
        {error && <p className="text-red-400">{error}</p>}
        {!loading && !error && posts.length === 0 && (
          <p className="text-gray-400">Nessun post ancora.</p>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((post, idx) => (
            <div key={post.slug} className="animate-fadeIn" style={{ animationDelay: `${idx * 150}ms` }}>
              <PostCard
                title={post.title}
                date={post.created_at}
                image={post.image}
                slug={post.slug}
                excerpt={post.excerpt}
                draft={!post.published}
              />
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
