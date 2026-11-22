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

const existing = await devRequest("/articles/me/published?per_page=100")
  .catch(() => devRequest("/articles/me?per_page=100"));
const existingTitles = new Set(existing.map((article) => article.title));

let published = 0;
for (const entry of due) {
  if (existingTitles.has(entry.title)) {
    console.log(`SKIP: ${entry.title}`);
    continue;
  }

  const footer = `\n\n---\n\n_Originally published by Lorenzo Fazioli at [Snorty](${entry.canonical_url})._\n`;
  const bodyMarkdown = `---\ntitle: ${JSON.stringify(entry.title)}\npublished: true\ndescription: ${JSON.stringify(entry.excerpt)}\ntags: ${entry.tags.join(", ")}\ncover_image: ${JSON.stringify(entry.cover_image ?? "")}\ncanonical_url: ${JSON.stringify(entry.canonical_url)}\n---\n${entry.body_markdown}${footer}`;

  await devRequest("/articles", {
    method: "POST",
    body: JSON.stringify({
      article: {
        title: entry.title,
        published: true,
        description: entry.excerpt,
        tags: entry.tags,
        cover_image: entry.cover_image || undefined,
        canonical_url: entry.canonical_url,
        body_markdown: bodyMarkdown,
      },
    }),
  });

  existingTitles.add(entry.title);
  published += 1;
  console.log(`PUBLISHED: ${entry.title}`);

  if (due.length > 1) {
    await new Promise((resolve) => setTimeout(resolve, 35_000));
  }
}

console.log(`DEV publish complete for ${publishDate}: ${published} new article(s).`);
