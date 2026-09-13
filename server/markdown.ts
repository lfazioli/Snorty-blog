// Markdown -> HTML for the server-rendered article body.
//
// The SPA renders posts with react-markdown, which only runs once 430 KB of
// JavaScript has. Crawlers that do not render JavaScript — and Google's first
// indexing pass, which happens before the render queue — saw an empty
// <div id="root">, so the article's own words never reached the index.
//
// This is deliberately not a general Markdown implementation: it covers the
// constructs the posts actually use (measured across all 27 published posts:
// bullet and numbered lists, h1-h3, fenced code, rules, GFM tables, bold,
// inline code, links, images) and renders them with the same classes as
// src/components/MarkdownComponents.tsx, so the markup React replaces on mount
// looks the same as the markup it replaces it with.
//
// Every character of the source is escaped before any of it is interpreted, so
// a post can no more inject markup here than it can through react-markdown,
// which does not render raw HTML either.

/** Kept identical to src/components/MarkdownComponents.tsx; a test enforces it. */
const CLASS = {
  h1: "text-2xl font-semibold text-ink mt-10 mb-4 tracking-tight",
  h2: "text-xl font-semibold text-ink mt-9 mb-3 tracking-tight",
  h3: "text-base font-semibold text-ink mt-7 mb-2",
  p: "my-4 leading-relaxed text-ink/90",
  a: "text-signal underline underline-offset-2 hover:text-signal-600",
  ul: "list-disc list-outside pl-5 space-y-1.5 my-4",
  ol: "list-decimal list-outside pl-5 space-y-1.5 my-4",
  li: "text-ink/90 leading-relaxed",
  code: "bg-panel2 text-signal px-1.5 py-0.5 rounded text-[13px] font-mono border border-line",
  pre: "bg-panel p-4 rounded-lg overflow-x-auto my-5 border border-line text-[13px]",
  blockquote: "border-l-2 border-signal pl-4 my-5 text-dim italic",
  img: "w-full rounded-lg my-5 border border-line",
  strong: "font-semibold text-ink",
  hr: "border-line my-8",
  tableWrap: "overflow-x-auto my-5",
  table: "min-w-full border border-line text-sm",
  th: "border border-line px-3 py-2 text-left text-ink font-semibold bg-panel2",
  td: "border border-line px-3 py-2 text-ink/90",
};

export function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Only schemes a browser will follow harmlessly; anything else loses its href. */
function safeUrl(value: string) {
  const trimmed = value.trim();
  return /^(https?:\/\/|\/|#|mailto:)/i.test(trimmed) ? trimmed : "";
}

function inlineFragment(text: string) {
  let html = escapeHtml(text);
  html = html.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (whole, alt, src) => {
    const url = safeUrl(src);
    return url ? `<img class="${CLASS.img}" src="${url}" alt="${alt}" loading="lazy" />` : whole;
  });
  html = html.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (whole, label, href) => {
    const url = safeUrl(href);
    return url ? `<a class="${CLASS.a}" href="${url}">${label}</a>` : whole;
  });
  html = html.replace(/\*\*([^*]+)\*\*/g, `<strong class="${CLASS.strong}">$1</strong>`);
  html = html.replace(/(^|[^*\w])\*([^*\n]+)\*(?![*\w])/g, "$1<em>$2</em>");
  return html;
}

/** Code spans are literal: their contents must not become links or bold. */
export function renderInline(text: string) {
  return text
    .split(/(`[^`\n]+`)/)
    .map((part) =>
      part.startsWith("`") && part.endsWith("`") && part.length > 2
        ? `<code class="${CLASS.code}">${escapeHtml(part.slice(1, -1))}</code>`
        : inlineFragment(part)
    )
    .join("");
}

function renderTable(rows: string[]) {
  const cells = (row: string) =>
    row
      .replace(/^\s*\|/, "")
      .replace(/\|\s*$/, "")
      .split("|")
      .map((cell) => cell.trim());
  const isDivider = (row: string) => /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(row) && row.includes("-");
  const header = cells(rows[0]);
  const body = rows.slice(isDivider(rows[1] || "") ? 2 : 1).map(cells);
  const head = `<thead><tr>${header.map((cell) => `<th class="${CLASS.th}">${renderInline(cell)}</th>`).join("")}</tr></thead>`;
  const rest = body.length
    ? `<tbody>${body.map((row) => `<tr>${row.map((cell) => `<td class="${CLASS.td}">${renderInline(cell)}</td>`).join("")}</tr>`).join("")}</tbody>`
    : "";
  return `<div class="${CLASS.tableWrap}"><table class="${CLASS.table}">${head}${rest}</table></div>`;
}

const HEADING = /^(#{1,6})\s+(.*)$/;
const BULLET = /^\s*[-*+]\s+(.*)$/;
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/;
const RULE = /^\s*(-{3,}|\*{3,}|_{3,})\s*$/;
const QUOTE = /^\s*>\s?(.*)$/;
const TABLE_ROW = /^\s*\|.*\|\s*$/;

/**
 * A leading "# Title" repeats the post title, which api/page.ts already renders
 * as the page's only <h1>. Same demotion react-markdown is given in
 * MarkdownComponents.tsx: a markdown h1 becomes a section heading.
 */
function headingTag(level: number) {
  if (level === 1) return { tag: "h2", className: CLASS.h1 };
  if (level === 2) return { tag: "h2", className: CLASS.h2 };
  return { tag: "h3", className: CLASS.h3 };
}

export function renderMarkdown(source: string) {
  const lines = (source || "").replace(/\r\n?/g, "\n").split("\n");
  const out: string[] = [];
  let index = 0;

  const collect = (test: (line: string) => boolean) => {
    const gathered: string[] = [];
    while (index < lines.length && test(lines[index])) gathered.push(lines[index++]);
    return gathered;
  };

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) { index++; continue; }

    if (line.trimStart().startsWith("```")) {
      index++;
      const code = collect((next) => !next.trimStart().startsWith("```"));
      if (index < lines.length) index++; // closing fence, if the post has one
      out.push(`<pre class="${CLASS.pre}"><code>${escapeHtml(code.join("\n"))}</code></pre>`);
      continue;
    }

    if (RULE.test(line)) { out.push(`<hr class="${CLASS.hr}" />`); index++; continue; }

    const heading = HEADING.exec(line);
    if (heading) {
      const { tag, className } = headingTag(heading[1].length);
      out.push(`<${tag} class="${className}">${renderInline(heading[2].trim())}</${tag}>`);
      index++;
      continue;
    }

    if (TABLE_ROW.test(line)) {
      out.push(renderTable(collect((next) => TABLE_ROW.test(next))));
      continue;
    }

    if (QUOTE.test(line)) {
      const quoted = collect((next) => QUOTE.test(next)).map((next) => QUOTE.exec(next)![1]);
      out.push(`<blockquote class="${CLASS.blockquote}"><p class="${CLASS.p}">${renderInline(quoted.join(" ").trim())}</p></blockquote>`);
      continue;
    }

    const list = BULLET.test(line) ? { pattern: BULLET, tag: "ul", className: CLASS.ul } : NUMBERED.test(line) ? { pattern: NUMBERED, tag: "ol", className: CLASS.ol } : null;
    if (list) {
      const items = collect((next) => list.pattern.test(next)).map((next) => list.pattern.exec(next)![1]);
      out.push(`<${list.tag} class="${list.className}">${items.map((item) => `<li class="${CLASS.li}">${renderInline(item.trim())}</li>`).join("")}</${list.tag}>`);
      continue;
    }

    const paragraph = collect(
      (next) => Boolean(next.trim()) && !HEADING.test(next) && !RULE.test(next) && !BULLET.test(next) && !NUMBERED.test(next) && !QUOTE.test(next) && !TABLE_ROW.test(next) && !next.trimStart().startsWith("```")
    );
    out.push(`<p class="${CLASS.p}">${renderInline(paragraph.join(" ").trim())}</p>`);
  }

  return out.join("\n");
}

export const MARKDOWN_CLASS_NAMES = CLASS;
