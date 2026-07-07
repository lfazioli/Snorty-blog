// src/components/MarkdownComponents.tsx
// Componenti di rendering per react-markdown, con lo stesso stile "hacker" (verde
// neon su sfondo scuro, monospazio) usato nel resto del sito.
import type { ComponentPropsWithoutRef } from "react";

export const markdownComponents = {
  h1: (props: ComponentPropsWithoutRef<"h1">) => (
    <h1 className="text-3xl font-bold text-[#00ff99] mt-8 mb-4" {...props} />
  ),
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2 className="text-2xl font-bold text-[#00ff99] mt-8 mb-3" {...props} />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3 className="text-xl font-semibold text-[#00ff99] mt-6 mb-2" {...props} />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => <p className="my-3 leading-relaxed" {...props} />,
  a: (props: ComponentPropsWithoutRef<"a">) => (
    <a className="text-[#00ff99] underline hover:text-[#00cc77]" target="_blank" rel="noopener noreferrer" {...props} />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => <ul className="list-disc list-inside space-y-1 my-3" {...props} />,
  ol: (props: ComponentPropsWithoutRef<"ol">) => <ol className="list-decimal list-inside space-y-1 my-3" {...props} />,
  li: (props: ComponentPropsWithoutRef<"li">) => <li className="ml-1" {...props} />,
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code className="bg-black/50 text-[#00ff99] px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
  ),
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre className="bg-black/50 p-4 rounded-lg overflow-x-auto my-4 border border-[#00ff99]/20" {...props} />
  ),
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote className="border-l-4 border-[#00ff99] pl-4 italic my-4 opacity-90" {...props} />
  ),
  img: (props: ComponentPropsWithoutRef<"img">) => (
    <img className="w-full max-w-2xl mx-auto rounded-lg my-4 border border-[#00ff99]/50" {...props} />
  ),
  strong: (props: ComponentPropsWithoutRef<"strong">) => <strong className="font-bold text-[#00ff99]" {...props} />,
  hr: (props: ComponentPropsWithoutRef<"hr">) => <hr className="border-[#00ff99]/20 my-6" {...props} />,
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border border-[#00ff99]/20" {...props} />
    </div>
  ),
  th: (props: ComponentPropsWithoutRef<"th">) => (
    <th className="border border-[#00ff99]/20 px-3 py-2 text-left text-[#00ff99]" {...props} />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => <td className="border border-[#00ff99]/20 px-3 py-2" {...props} />,
};
