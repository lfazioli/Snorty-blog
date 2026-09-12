import { useEffect } from "react";
import { getSiteUrl } from "../lib/site";
import { OPTIONAL_TAG_KEYS, buildSeoMeta, type MetaTag } from "../lib/seo-meta";
import logo from "../assets/logo.png";

type SeoProps = {
  title: string;
  description: string;
  path?: string;
  image?: string | null;
  type?: "website" | "article";
  noIndex?: boolean;
  article?: { publishedTime?: string; modifiedTime?: string };
};

function selectorFor(tag: Pick<MetaTag, "attribute" | "key">) {
  return `meta[${tag.attribute}="${tag.key}"]`;
}

function applyMeta(tag: MetaTag) {
  let element = document.head.querySelector<HTMLMetaElement>(selectorFor(tag));
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(tag.attribute, tag.key);
    document.head.appendChild(element);
  }
  element.content = tag.content;
}

function applyLink(rel: string, href: string, extra?: { hreflang: string }) {
  const selector = extra ? `link[rel="${rel}"][hreflang="${extra.hreflang}"]` : `link[rel="${rel}"]`;
  let element = document.head.querySelector<HTMLLinkElement>(selector);
  if (!element) {
    element = document.createElement("link");
    element.rel = rel;
    if (extra) element.hreflang = extra.hreflang;
    document.head.appendChild(element);
  }
  element.href = href;
}

function applyStructuredData(id: string, value: Record<string, unknown>) {
  let element = document.head.querySelector<HTMLScriptElement>(`script[data-seo="${id}"]`);
  if (!element) {
    element = document.createElement("script");
    element.type = "application/ld+json";
    element.dataset.seo = id;
    document.head.appendChild(element);
  }
  // textContent avoids interpreting values coming from article titles as HTML.
  element.textContent = JSON.stringify(value).replace(/</g, "\\u003c");
}

/**
 * Keeps the document head in sync during client-side navigation. For /post/:slug
 * the same metadata is already present in the served HTML (api/post-page.ts) —
 * this updates it in place rather than duplicating it, because every tag is
 * matched by the selector the server used to emit it.
 */
export default function Seo({ title, description, path = "/", image, type = "website", noIndex = false, article }: SeoProps) {
  // Read through to primitives: an inline `article` object would be a new value
  // on every render and would re-run the effect each time.
  const publishedTime = article?.publishedTime;
  const modifiedTime = article?.modifiedTime;

  useEffect(() => {
    const meta = buildSeoMeta({
      siteUrl: getSiteUrl(),
      title,
      description,
      path,
      image,
      fallbackImage: logo,
      type,
      noIndex,
      article: { publishedTime, modifiedTime },
    });

    document.title = meta.title;
    meta.tags.forEach(applyMeta);

    const present = new Set(meta.tags.map((tag) => tag.key));
    for (const key of OPTIONAL_TAG_KEYS) {
      if (present.has(key)) continue;
      document.head.querySelector(`meta[name="${key}"]`)?.remove();
      document.head.querySelector(`meta[property="${key}"]`)?.remove();
    }

    applyLink("canonical", meta.canonical);
    applyLink("alternate", meta.canonical, { hreflang: meta.hreflang });
    meta.structuredData.forEach((entry) => applyStructuredData(entry.id, entry.value));
  }, [description, image, modifiedTime, noIndex, path, publishedTime, title, type]);

  return null;
}
