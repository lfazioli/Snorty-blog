// src/pages/Post.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Layout from "../components/Layout";
import { apiFetch, ApiError } from "../lib/api";
import { markdownComponents } from "../components/MarkdownComponents";
import type { Post as PostType } from "../types/post";

export default function Post() {
  const { slug } = useParams();
  const [post, setPost] = useState<PostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    // Reimposta loading/error quando cambia lo slug (navigazione da un post a un altro
    // senza smontare il componente). Pattern standard di data-fetching con effetti;
    // vedi https://react.dev/learn/synchronizing-with-effects#fetching-data
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError("");
    apiFetch<{ post: PostType }>(`/api/posts/${slug}`)
      .then((data) => setPost(data.post))
      .catch((e) => {
        setError(e instanceof ApiError && e.status === 404 ? "Post non trovato." : "Errore nel caricamento del post.");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <p className="text-gray-400 text-center py-16">Caricamento...</p>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout>
        <div className="text-center py-16">
          <p className="text-red-400 mb-4">{error || "Post non trovato."}</p>
          <Link to="/Posts" className="text-[#00ff99] hover:underline">Torna a tutti i post</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <article className="max-w-3xl mx-auto py-10 px-4 text-white space-y-6 leading-relaxed">
        {!post.published && (
          <p className="text-xs px-2 py-1 inline-block rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/40">
            Bozza (visibile solo a te)
          </p>
        )}

        <h1 className="text-3xl md:text-4xl font-bold text-center text-[#00ff99]">{post.title}</h1>
        <p className="text-center text-gray-400 text-sm">{post.created_at?.slice(0, 10)}</p>

        {post.image && (
          <img
            src={post.image}
            alt={post.title}
            className="w-full max-w-2xl mx-auto rounded-lg shadow-2xl border border-[#00ff99]/50"
          />
        )}

        <div className="max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {post.content}
          </ReactMarkdown>
        </div>
      </article>
    </Layout>
  );
}
