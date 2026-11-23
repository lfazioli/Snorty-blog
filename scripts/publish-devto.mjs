import { readFile } from "node:fs/promises";

const apiKey = process.env.DEV_API_KEY;
if (!apiKey) throw new Error("DEV_API_KEY is not configured");

const publishDate = process.env.DEV_PUBLISH_DATE
  || new Date().toISOString().slice(0, 10);

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

const calendar = JSON.parse(await readFile("devto/calendar.json", "utf8"));
const due = calendar.filter((entry) => entry.date === publishDate);
if (!due.length) {
  console.log(`NO_PUBLICATIONS: ${publishDate}`);
  process.exit(0);
}

const existing = await devRequest("/articles/me/all?per_page=100")
  .catch(() => devRequest("/articles/me?per_page=100"));
const existingByTitle = new Map(existing.map((article) => [article.title, article]));

let published = 0;
for (const entry of due) {
  const existingArticle = existingByTitle.get(entry.title);
  if (existingArticle?.published) {
    console.log(`SKIP: ${entry.title}`);
    continue;
  }

  const calendarIndex = calendar.findIndex((item) => item.title === entry.title) + 1;
  const coverImage = `https://www.snorty.space/devto-covers/${String(calendarIndex).padStart(2, "0")}.jpg`;
  const footer = `\n\n---\n\n_Originally published by Lorenzo Fazioli at [Snorty](${entry.canonical_url})._\n`;
  const bodyMarkdown = `---\ntitle: ${JSON.stringify(entry.title)}\npublished: true\ndescription: ${JSON.stringify(entry.title)}\ntags: ${entry.tags.join(", ")}\ncover_image: ${JSON.stringify(coverImage)}\ncanonical_url: ${JSON.stringify(entry.canonical_url)}\n---\n${entry.body_markdown}${footer}`;

  const articlePayload = {
    title: entry.title,
    published: true,
    description: entry.title,
    tags: entry.tags,
    cover_image: coverImage,
    canonical_url: entry.canonical_url,
    body_markdown: bodyMarkdown,
  };

  if (existingArticle) {
    await devRequest(`/articles/${existingArticle.id}`, {
      method: "PUT",
      body: JSON.stringify({ article: articlePayload }),
    });
  } else {
    await devRequest("/articles", {
      method: "POST",
      body: JSON.stringify({ article: articlePayload }),
    });
  }

  existingByTitle.set(entry.title, { ...existingArticle, title: entry.title, published: true });
  published += 1;
  console.log(`PUBLISHED: ${entry.title}`);

  if (due.length > 1) {
    await new Promise((resolve) => setTimeout(resolve, 35_000));
  }
}

console.log(`DEV publish complete for ${publishDate}: ${published} new article(s).`);
