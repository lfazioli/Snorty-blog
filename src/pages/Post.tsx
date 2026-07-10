// src/pages/Post.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Layout from "../components/Layout";
import { apiFetch, ApiError } from "../lib/api";
import { markdownComponents } from "../components/MarkdownComponents";
import type { Post as PostType } from "../types/post";
import Seo from "../components/Seo";

export default function Post() {
  const { slug } = useParams();
  const [post, setPost] = useState<PostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    // Resets loading/error when the slug changes (navigating from one post to
    // another without unmounting the component). Standard data-fetching-with-
    // effects pattern; see https://react.dev/learn/synchronizing-with-effects#fetching-data
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError("");
    apiFetch<{ post: PostType }>(`/api/posts/${slug}`)
      .then((data) => setPost(data.post))
      .catch((e) => {
        setError(e instanceof ApiError && e.status === 404 ? "Post not found." : "Failed to load the post.");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <p className="text-dim text-sm text-center py-16">Loading...</p>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout>
        <div className="text-center py-16">
          <p className="text-danger text-sm mb-4">{error || "Post not found."}</p>
          <Link to="/posts" className="text-signal text-sm hover:underline">Back to all posts</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Seo
        title={post.title}
        description={post.excerpt || `Approfondimento su cybersecurity e sviluppo: ${post.title}`}
        path={`/post/${post.slug}`}
        image={post.image}
        type="article"
        article={{ publishedTime: post.created_at, modifiedTime: post.updated_at }}
        noIndex={!post.published}
      />
      <article>
        {!post.published && (
          <p className="font-mono text-[10px] px-2 py-1 inline-block rounded border border-warn/40 text-warn mb-4">
            draft — only visible to you
          </p>
        )}

        <p className="font-mono text-xs text-dim mb-2">{post.created_at?.slice(0, 10)}</p>
        <h1 className="text-2xl sm:text-3xl font-semibold text-ink leading-snug tracking-tight mb-6">
          {post.title}
        </h1>

        {post.image && (
          <img
            src={post.image}
            alt={post.title}
            className="w-full rounded-lg border border-line mb-8"
          />
        )}

        <div className="text-ink">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {post.content}
          </ReactMarkdown>
        </div>
      </article>
    </Layout>
  );
}
