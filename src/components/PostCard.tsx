interface CardProps {
  title: string;
  date: string;
  image: string;
  slug: string;
}

export default function Card({ title, date, image, slug }: CardProps) {
  return (
    <a href={`/posts/${slug}`} className="block p-4 rounded-xl bg-[#00ff99]/10 hover:scale-105 hover:shadow-lg transition transform">
      <img src={image} alt={title} className="w-full rounded-lg mb-2 border border-[#00ff99]/50" />
      <h3 className="text-xl font-bold text-[#00ff99]">{title}</h3>
      <p className="text-gray-400">{date}</p>
    </a>
  );
}
