export type GitHubProject = {
  id: number;
  name: string;
  description: string;
  url: string;
  language: string | null;
  stars: number;
  topics: string[];
};
