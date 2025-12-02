import { Link } from "react-router-dom";

export default function PostCard({ meta }: any) {
  return (
    <Link
      to={`/post/${meta.slug}`}
      className="block border border-[#009966] rounded-lg p-4 hover:bg-[#00ff9915] transition duration-200"
    >
      <h2 className="text-2xl font-semibold">{meta.title}</h2>
      <p className="opacity-70 text-sm">{meta.date}</p>
      {meta.excerpt && <p className="mt-2 opacity-90">{meta.excerpt}</p>}
    </Link>
  );
}
