
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { posts } from "../posts/posts";

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Trova il post corrispondente
  const post = posts.find(p => p.slug === slug);

  if (!post)
    return (
      <Layout>
        <div className="text-white text-center py-20">
          <p className="mb-4">Post not found...</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-[#00ff99]/20 border border-[#00ff99] text-[#00ff99] rounded-md hover:bg-[#00ff99]/30 transition transform hover:scale-105"
          >
            Go Back Home
          </button>
        </div>
      </Layout>
    );

  return (
    <Layout>
      <section className="text-white max-w-4xl mx-auto py-12 animate-fadeIn">
        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-extrabold text-[#00ff99] drop-shadow-[0_0_15px_#00ff99] mb-2 animate-fadeIn">
          {post.title}
        </h1>

        {/* Date */}
        <p className="text-gray-400 mb-8">{post.date}</p>

        {/* Image (if exists) */}
        {post.image && (
          <img
            src={post.image}
            alt={post.title}
            className="w-full rounded-xl shadow-2xl border border-[#00ff99]/50 mb-8 animate-fadeIn"
          />
        )}

        {/* Post Content */}
        <article className="prose prose-invert max-w-none space-y-6 animate-fadeIn">
          {/* Se post.content è JSX, renderizzalo direttamente */}
          {React.isValidElement(post.content) ? post.content : <>{post.content}</>}
        </article>

        {/* Back Button */}
        <div className="mt-12">
          <button
            onClick={() => navigate("/")}
            className="px-5 py-2 rounded-md bg-[#00ff99]/20 text-[#00ff99] border border-[#00ff99] hover:bg-[#00ff99]/30 transition transform hover:scale-105"
          >
            ← Back to Home
          </button>
        </div>
      </section>
    </Layout>
  );
}
