// src/types/post.ts
export interface Post {
  id?: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string | null;
  published: boolean;
  publish_at: string | null;
  created_at: string;
  updated_at?: string;
}
