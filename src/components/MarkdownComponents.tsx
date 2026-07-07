// src/components/MarkdownComponents.tsx
// Componenti di rendering per react-markdown, coerenti con la palette
// grafite/blu-segnale del sito.
import type { ComponentPropsWithoutRef } from "react";

export const markdownComponents = {
  h1: (props: ComponentPropsWithoutRef<"h1">) => (
    <h1 className="text-2xl font-semibold text-ink mt-10 mb-4 tracking-tight" {...props} />
  ),
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2 className="text-xl font-semibold text-ink mt-9 mb-3 tracking-tight" {...props} />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3 className="text-base font-semibold text-ink mt-7 mb-2" {...props} />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => <p className="my-4 leading-relaxed text-ink/90" {...props} />,
  a: (props: ComponentPropsWithoutRef<"a">) => (
    <a className="text-signal underline underline-offset-2 hover:text-signal-600" target="_blank" rel="noopener noreferrer" {...props} />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => <ul className="list-disc list-outside pl-5 space-y-1.5 my-4" {...props} />,
  ol: (props: ComponentPropsWithoutRef<"ol">) => <ol className="list-decimal list-outside pl-5 space-y-1.5 my-4" {...props} />,
  li: (props: ComponentPropsWithoutRef<"li">) => <li className="text-ink/90 leading-relaxed" {...props} />,
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code className="bg-panel2 text-signal px-1.5 py-0.5 rounded text-[13px] font-mono border border-line" {...props} />
  ),
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre className="bg-panel p-4 rounded-lg overflow-x-auto my-5 border border-line text-[13px]" {...props} />
  ),
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote className="border-l-2 border-signal pl-4 my-5 text-dim italic" {...props} />
  ),
  img: (props: ComponentPropsWithoutRef<"img">) => (
    <img className="w-full rounded-lg my-5 border border-line" {...props} />
  ),
  strong: (props: ComponentPropsWithoutRef<"strong">) => <strong className="font-semibold text-ink" {...props} />,
  hr: (props: ComponentPropsWithoutRef<"hr">) => <hr className="border-line my-8" {...props} />,
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="overflow-x-auto my-5">
      <table className="min-w-full border border-line text-sm" {...props} />
    </div>
  ),
  th: (props: ComponentPropsWithoutRef<"th">) => (
    <th className="border border-line px-3 py-2 text-left text-ink font-semibold bg-panel2" {...props} />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => <td className="border border-line px-3 py-2 text-ink/90" {...props} />,
};
