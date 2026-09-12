// Shared description of a page's SEO metadata.
//
// Kept free of the DOM and of import.meta.env so that the very same model can be
// applied to the live document by <Seo /> and serialised into the HTML shell by
// the /post/:slug prerender function. Social crawlers do not run JavaScript, so
// the tags have to exist in the served markup, not only after hydration.

export const SITE_NAME = "Snorty Blog";
export const SITE_LANGUAGE = "en";
export const SITE_LOCALE = "en_US";
export const AUTHOR_NAME = "Lorenzo Fazioli";

// Google truncates result titles around 60 characters. Past that the brand
// suffix only costs us the end of the real title, which is where the specific
// keyword usually sits, so it is dropped instead.
export const TITLE_LIMIT = 60;
const TITLE_SUFFIX = ` | ${SITE_NAME}`;

const SEO_BLOCK_START = "<!-- seo:start -->";
const SEO_BLOCK_END = "<!-- seo:end -->";

export type SeoInput = {
  /** Absolute origin of the canonical host, e.g. https://www.snorty.space */
  siteUrl: string;
  title: string;
  description: string;
  path?: string;
  image?: string | null;
  /** Used when the page has no image of its own. */
  fallbackImage?: string | null;
  type?: "website" | "article";
  noIndex?: boolean;
  article?: { publishedTime?: string | null; modifiedTime?: string | null };
};

export type MetaTag = { attribute: "name" | "property"; key: string; content: string };
export type StructuredData = { id: string; value: Record<string, unknown> };

export type SeoMeta = {
  title: string;
  canonical: string;
  hreflang: string;
  robots: string;
  tags: MetaTag[];
  structuredData: StructuredData[];
};

export function absoluteUrl(siteUrl: string, path = "/") {
  const base = (siteUrl || "").trim().replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${suffix}` : suffix;
}

/** Appends the brand suffix only while the result still fits a search result. */
export function pageTitle(title: string) {
  return title.length + TITLE_SUFFIX.length <= TITLE_LIMIT ? `${title}${TITLE_SUFFIX}` : title;
}

export function buildSeoMeta(input: SeoInput): SeoMeta {
  const { siteUrl, title, description, path = "/", image, fallbackImage, type = "website", noIndex = false, article } = input;
  const canonical = absoluteUrl(siteUrl, path);
  const fullTitle = pageTitle(title);
  const socialImage = image || fallbackImage || null;
  const robots = noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large";

  const tags: MetaTag[] = [
    { attribute: "name", key: "description", content: description },
    { attribute: "name", key: "robots", content: robots },
    { attribute: "property", key: "og:title", content: fullTitle },
    { attribute: "property", key: "og:description", content: description },
    { attribute: "property", key: "og:type", content: type },
    { attribute: "property", key: "og:url", content: canonical },
    { attribute: "property", key: "og:site_name", content: SITE_NAME },
    { attribute: "property", key: "og:locale", content: SITE_LOCALE },
    { attribute: "name", key: "twitter:card", content: "summary_large_image" },
    { attribute: "name", key: "twitter:title", content: fullTitle },
    { attribute: "name", key: "twitter:description", content: description },
  ];

  if (socialImage) {
    tags.push({ attribute: "property", key: "og:image", content: socialImage });
    tags.push({ attribute: "property", key: "og:image:alt", content: type === "article" ? title : SITE_NAME });
    tags.push({ attribute: "name", key: "twitter:image", content: socialImage });
  }
  if (type === "article" && article?.publishedTime) {
    tags.push({ attribute: "property", key: "article:published_time", content: article.publishedTime });
  }
  if (type === "article" && article?.modifiedTime) {
    tags.push({ attribute: "property", key: "article:modified_time", content: article.modifiedTime });
  }

  const author = { "@type": "Person", name: AUTHOR_NAME, url: absoluteUrl(siteUrl, "/about") };
  const structuredData: StructuredData[] = [
    {
      id: "page",
      value: {
        "@context": "https://schema.org",
        "@type": type === "article" ? "BlogPosting" : "WebPage",
        ...(type === "article"
          ? {
              headline: title,
              description,
              mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
              datePublished: article?.publishedTime,
              dateModified: article?.modifiedTime || article?.publishedTime,
              ...(socialImage ? { image: socialImage } : {}),
              inLanguage: SITE_LANGUAGE,
              author,
              publisher: author,
            }
          : { name: title, description, url: canonical, inLanguage: SITE_LANGUAGE }),
      },
    },
    {
      id: "website",
      value: {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE_NAME,
        url: absoluteUrl(siteUrl, "/"),
        inLanguage: SITE_LANGUAGE,
        publisher: author,
      },
    },
  ];

  return { title: fullTitle, canonical, hreflang: SITE_LANGUAGE, robots, tags, structuredData };
}

function escapeAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Serialises the model into the markup the crawler has to find in the response. */
export function renderSeoMeta(meta: SeoMeta) {
  const lines = [
    `<title>${escapeAttribute(meta.title)}</title>`,
    ...meta.tags.map((tag) => `<meta ${tag.attribute}="${tag.key}" content="${escapeAttribute(tag.content)}" />`),
    `<link rel="canonical" href="${escapeAttribute(meta.canonical)}" />`,
    `<link rel="alternate" hreflang="${escapeAttribute(meta.hreflang)}" href="${escapeAttribute(meta.canonical)}" />`,
    // textContent-equivalent escaping: a title must never be able to close the tag.
    ...meta.structuredData.map(
      (entry) =>
        `<script type="application/ld+json" data-seo="${entry.id}">${JSON.stringify(entry.value).replace(/</g, "\\u003c")}</script>`
    ),
  ];
  return lines.join("\n    ");
}

/**
 * Swaps the default tags of the built index.html for the ones computed for this
 * page. Exact string boundaries rather than a pattern: if the markers are absent
 * (an older build) the shell is returned untouched instead of half-rewritten.
 */
export function injectSeoMeta(shell: string, meta: SeoMeta) {
  const start = shell.indexOf(SEO_BLOCK_START);
  const end = shell.indexOf(SEO_BLOCK_END);
  if (start === -1 || end === -1 || end < start) return shell;
  return shell.slice(0, start) + renderSeoMeta(meta) + shell.slice(end + SEO_BLOCK_END.length);
}

/** The hashed logo emitted by Vite, reused as the default social image. */
export function shellIconHref(shell: string) {
  const match = shell.match(/<link[^>]+rel="icon"[^>]+href="([^"]+)"/);
  return match ? match[1] : null;
}

/**
 * Tags that are only emitted for some pages. Navigating from an article to the
 * home page has to remove the ones left behind, or the previous post's image and
 * dates stay in the head.
 */
export const OPTIONAL_TAG_KEYS = [
  "og:image",
  "og:image:alt",
  "twitter:image",
  "article:published_time",
  "article:modified_time",
] as const;
