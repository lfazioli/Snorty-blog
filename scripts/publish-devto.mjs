import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const apiKey = process.env.DEV_API_KEY;
if (!apiKey) throw new Error("DEV_API_KEY is not configured");

const articlesDir = path.resolve("devto/articles");

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error("Missing article frontmatter");

  const metadata = {};
  for (const line of match[1].split("\n")) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    if (value.startsWith("[" ) && value.endsWith("]")) {
      metadata[key] = value.slice(1, -1).split(",").map((item) => item.trim());
    } else if (value === "true" || value === "false") {
      metadata[key] = value === "true";
    } else {
      metadata[key] = value;
    }
  }
  return { metadata, body: match[2] };
}

async function devRequest(endpoint, options = {}) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch(`https://dev.to/api${endpoint}`, {
      ...options,
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        ...(options.headers ?? {}),
      },
    });

    if (response.status !== 429) {
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`DEV API ${response.status}: ${text}`);
      }
      return response.status === 204 ? null : response.json();
    }

    const delayMs = 30_000 * (attempt + 1);
    console.log(`RATE_LIMITED: retrying in ${delayMs / 1000}s`);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  throw new Error("DEV API 429: retries exhausted");
}

const existing = await devRequest("/articles/me/published?per_page=100")
  .catch(() => devRequest("/articles/me?per_page=100"));
const existingTitles = new Set(existing.map((article) => article.title));
const existingByTitle = new Map(existing.map((article) => [article.title, article]));

const files = (await readdir(articlesDir)).filter((file) => file.endsWith(".md")).sort();
let published = 0;

for (const file of files) {
  const markdown = await readFile(path.join(articlesDir, file), "utf8");
  const { metadata, body } = parseFrontmatter(markdown);
  if (!metadata.title) throw new Error(`${file}: missing title`);
  const tags = typeof metadata.tags === "string"
    ? metadata.tags.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 4)
    : [];

  const bodyMarkdown = `---\ntitle: ${JSON.stringify(metadata.title)}\npublished: true\ndescription: ${JSON.stringify(metadata.description ?? "")}\ntags: ${tags.join(", ")}\n---\n${body}`;

  const legacyArticle = metadata.legacy_title
    ? existingByTitle.get(metadata.legacy_title)
    : undefined;

  if (legacyArticle) {
    await devRequest(`/articles/${legacyArticle.id}`, {
      method: "PUT",
      body: JSON.stringify({ article: { title: metadata.title, published: true, body_markdown: bodyMarkdown } }),
    });
    existingTitles.add(metadata.title);
    existingByTitle.set(metadata.title, legacyArticle);
    published += 1;
    console.log(`UPDATED: ${legacyArticle.title} -> ${metadata.title}`);
    continue;
  }

  if (existingTitles.has(metadata.title)) {
    console.log(`SKIP: ${metadata.title}`);
    continue;
  }

  await devRequest("/articles", {
    method: "POST",
    body: JSON.stringify({ article: { title: metadata.title, published: true, body_markdown: bodyMarkdown } }),
  });
  existingTitles.add(metadata.title);
  published += 1;
  console.log(`PUBLISHED: ${metadata.title}`);
}

console.log(`DEV publish complete: ${published} new article(s).`);
