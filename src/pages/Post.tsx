import React from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { getPosts } from "../lib/posts";

export default function Post() {
  const { slug } = useParams();
  const [post, setPost] = React.useState<any>(null);

  React.useEffect(() => {
    if (!slug) return;
    const posts = getPosts();
    const found = posts.find((p: any) => p.meta?.slug === slug);
    setPost(found ?? null);
  }, [slug]);

  if (!post) return <Layout><p>Caricamento...</p></Layout>;

  const MDXContent = post.content;

  return (
    <Layout>
      <h1 className="text-4xl mb-4 font-bold text-[#00ff99]">{post.meta.title}</h1>
      <article className="prose prose-invert max-w-none">
        <MDXContent />
      </article>
    </Layout>
  );
}
