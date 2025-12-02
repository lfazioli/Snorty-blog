import matter from "gray-matter";

export function getPosts() {
  const files = import.meta.glob("../posts/*.mdx", { as: "raw", eager: true });

  return Object.keys(files).map((path) => {
    const raw = files[path] as string;
    const { data } = matter(raw);

    return {
      title: data.title,
      date: data.date,
      description: data.description,
      slug: path.split("/").pop()?.replace(".mdx", ""),
    };
  });
}
