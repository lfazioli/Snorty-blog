import { useEffect } from "react";
import { absoluteUrl, getSiteUrl } from "../lib/site";
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

function setMeta(selector: string, attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

export default function Seo({ title, description, path = "/", image, type = "website", noIndex = false, article }: SeoProps) {
  useEffect(() => {
    const canonicalUrl = absoluteUrl(path);
    const socialImage = image || absoluteUrl(logo);
    const fullTitle = `${title} | Snorty Blog`;

    document.title = fullTitle;
    setMeta('meta[name="description"]', "name", "description", description);
    setMeta('meta[name="robots"]', "name", "robots", noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large");
    setMeta('meta[property="og:title"]', "property", "og:title", fullTitle);
    setMeta('meta[property="og:description"]', "property", "og:description", description);
    setMeta('meta[property="og:type"]', "property", "og:type", type);
    setMeta('meta[property="og:url"]', "property", "og:url", canonicalUrl);
    setMeta('meta[property="og:image"]', "property", "og:image", socialImage);
    setMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", fullTitle);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    setMeta('meta[name="twitter:image"]', "name", "twitter:image", socialImage);

    if (article?.publishedTime) setMeta('meta[property="article:published_time"]', "property", "article:published_time", article.publishedTime);
    if (article?.modifiedTime) setMeta('meta[property="article:modified_time"]', "property", "article:modified_time", article.modifiedTime);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    let structuredData = document.head.querySelector<HTMLScriptElement>('script[data-seo="website"]');
    if (!structuredData) {
      structuredData = document.createElement("script");
      structuredData.type = "application/ld+json";
      structuredData.dataset.seo = "website";
      document.head.appendChild(structuredData);
    }
    structuredData.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": type === "article" ? "BlogPosting" : "WebSite",
      name: title,
      description,
      url: canonicalUrl,
      ...(type === "article" ? { datePublished: article?.publishedTime, dateModified: article?.modifiedTime || article?.publishedTime, image: socialImage, author: { "@type": "Person", name: "Lorenzo Fazioli", url: getSiteUrl() } } : { publisher: { "@type": "Person", name: "Lorenzo Fazioli" } }),
    });
  }, [article?.modifiedTime, article?.publishedTime, description, image, noIndex, path, title, type]);

  return null;
}
