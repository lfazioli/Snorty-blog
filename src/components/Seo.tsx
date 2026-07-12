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

function removeMeta(selector: string) {
  document.head.querySelector(selector)?.remove();
}

function setStructuredData(id: string, value: Record<string, unknown>) {
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
    setMeta('meta[property="og:image:alt"]', "property", "og:image:alt", type === "article" ? title : "Snorty Blog");
    setMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", fullTitle);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    setMeta('meta[name="twitter:image"]', "name", "twitter:image", socialImage);

    if (type === "article" && article?.publishedTime) {
      setMeta('meta[property="article:published_time"]', "property", "article:published_time", article.publishedTime);
    } else {
      removeMeta('meta[property="article:published_time"]');
    }
    if (type === "article" && article?.modifiedTime) {
      setMeta('meta[property="article:modified_time"]', "property", "article:modified_time", article.modifiedTime);
    } else {
      removeMeta('meta[property="article:modified_time"]');
    }

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    let alternate = document.head.querySelector<HTMLLinkElement>('link[rel="alternate"][hreflang="it"]');
    if (!alternate) {
      alternate = document.createElement("link");
      alternate.rel = "alternate";
      alternate.hreflang = "it";
      document.head.appendChild(alternate);
    }
    alternate.href = canonicalUrl;

    setStructuredData("page", {
      "@context": "https://schema.org",
      "@type": type === "article" ? "BlogPosting" : "WebPage",
      ...(type === "article"
        ? {
            headline: title,
            description,
            mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
            datePublished: article?.publishedTime,
            dateModified: article?.modifiedTime || article?.publishedTime,
            image: socialImage,
            inLanguage: "it-IT",
            author: { "@type": "Person", name: "Lorenzo Fazioli", url: `${getSiteUrl()}/about` },
            publisher: { "@type": "Person", name: "Lorenzo Fazioli", url: `${getSiteUrl()}/about` },
          }
        : { name: title, description, url: canonicalUrl, inLanguage: "it-IT" }),
    });

    setStructuredData("website", {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Snorty Blog",
      url: getSiteUrl(),
      inLanguage: "it-IT",
      publisher: { "@type": "Person", name: "Lorenzo Fazioli", url: `${getSiteUrl()}/about` },
    });
  }, [article?.modifiedTime, article?.publishedTime, description, image, noIndex, path, title, type]);

  return null;
}
