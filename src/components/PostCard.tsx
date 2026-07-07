import { Link } from "react-router-dom";

interface PostCardProps {
  title: string;
  date: string;
  image?: string | null;
  slug: string;
  excerpt?: string;
  draft?: boolean;
}

export default function PostCard({ title, date, image, slug, excerpt, draft }: PostCardProps) {
  return (
    <Link
      to={`/post/${slug}`}
      className="block p-4 rounded-xl bg-[#00ff99]/10 border border-[#00ff99]/20 hover:bg-[#00ff99]/20 hover:scale-105 hover:shadow-lg transition transform"
    >
      {image && (
        <img
          src={image}
          alt={title}
          className="w-full aspect-video object-cover rounded-lg mb-2 border border-[#00ff99]/50"
        />
      )}
      <div className="flex items-center gap-2 flex-wrap">
        <h3 className="text-xl font-bold text-[#00ff99]">{title}</h3>
        {draft && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/40">
            Bozza
          </span>
        )}
      </div>
      {excerpt && <p className="text-gray-300 text-sm mt-1 line-clamp-2">{excerpt}</p>}
      <p className="text-gray-400 text-sm mt-1">{date?.slice(0, 10)}</p>
    </Link>
  );
}
