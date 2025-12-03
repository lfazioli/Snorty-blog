import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { posts } from "../posts/posts";

export default function PostsPage() {
  const navigate = useNavigate();

  return (
    <Layout>
      <section className="text-white max-w-5xl mx-auto py-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#00ff99] mb-8 animate-fadeIn">
          All Posts
        </h1>

        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((post, idx) => (
            <div
              key={post.slug}
              onClick={() => navigate(`/post/${post.slug}`)}
              className="cursor-pointer p-6 rounded-xl bg-[#00ff99]/10 border border-[#00ff99]/20 hover:bg-[#00ff99]/20 hover:scale-105 hover:shadow-xl transition-transform animate-fadeIn"
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              {post.image && (
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full rounded-lg mb-4 border border-[#00ff99]/50"
                />
              )}
              <h2 className="text-xl font-bold text-[#00ff99] mb-2">{post.title}</h2>
              <p className="text-gray-400">{post.date}</p>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
