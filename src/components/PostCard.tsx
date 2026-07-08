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
      className="group block rounded-lg border border-line bg-panel overflow-hidden hover:border-signal/50 transition-colors"
    >
      {image && (
        <div className="aspect-video overflow-hidden bg-panel2">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <h3 className="text-[15px] font-semibold text-ink leading-snug">{title}</h3>
          {draft && (
            <span className="text-[10px] px-1.5 py-0.5 rounded border border-warn/40 text-warn font-mono">
              draft
            </span>
          )}
        </div>
        {excerpt && <p className="text-sm text-dim leading-relaxed line-clamp-2 mb-2">{excerpt}</p>}
        <p className="text-xs text-dim font-mono">{date?.slice(0, 10)}</p>
      </div>
    </Link>
  );
}
