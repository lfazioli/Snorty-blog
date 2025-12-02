import React from "react";
import Layout from "../components/Layout";
import { TypeAnimation } from "react-type-animation";

// Import MDX correttamente (senza require)
// TypeScript may not have a module declaration for .mdx files in this project; ignore the type error for this import.
// @ts-ignore
import HelloPost from "../posts/hello.mdx";

const posts = [
  { slug: "hello", component: <HelloPost /> },
];

export default function Home() {
  return (
    <Layout>
      {/* HERO SECTION */}
      <section className="text-white py-10">
        <h1 className="text-4xl font-bold mb-4 text-[#00ff99]">
          <TypeAnimation
            sequence={[
              "Welcome to my blog 👨‍💻",
              1500,
              "Hacking • Coding • Security • Dev",
              1500,
            ]}
            wrapper="span"
            speed={50}
            repeat={Infinity}
          />
        </h1>

        <p className="opacity-90 max-w-2xl mb-6">
          I write about cybersecurity, ethical hacking, development, and the tools I build.
          If you’re passionate about tech and security, you’ll feel at home here.
        </p>

        {/* Buttons */}
        <div className="flex gap-4 mb-12">
          <a
            href="/about"
            className="px-5 py-2 rounded-md bg-[#00ff99]/20 text-[#00ff99] border border-[#00ff99] hover:bg-[#00ff99]/30 transition"
          >
            About Me
          </a>

          <a
            href="https://github.com/USERNAME"
            target="_blank"
            className="px-5 py-2 rounded-md bg-[#00ff99]/20 text-[#00ff99] border border-[#00ff99] hover:bg-[#00ff99]/30 transition"
          >
            GitHub
          </a>
        </div>
      </section>

      {/* WHAT I DO / FEATURES */}
      <section className="text-white mb-14">
        <h2 className="text-2xl font-bold text-[#00ff99] mb-6">What I Do</h2>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-xl bg-[#00ff99]/10 border border-[#00ff99]/20 hover:bg-[#00ff99]/20 transition">
            <svg
              className="w-10 h-10 mb-4"
              fill="#00ff99"
              viewBox="0 0 24 24"
            >
              <path d="M12 0L1 6v12l11 6 11-6V6L12 0zm0 2.2l8.8 4.8v9.9l-8.8 4.8-8.8-4.8V7l8.8-4.8zM11 7v10l6-5-6-5z"/>
            </svg>
            <h3 className="text-xl font-semibold text-[#00ff99] mb-2">
              Cybersecurity & Hacking
            </h3>
            <p className="opacity-80">
              I explore systems, discover vulnerabilities, and learn how to make them stronger.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-xl bg-[#00ff99]/10 border border-[#00ff99]/20 hover:bg-[#00ff99]/20 transition">
            <svg
              className="w-10 h-10 mb-4"
              fill="#00ff99"
              viewBox="0 0 24 24"
            >
              <path d="M3 3h18v2H3V3zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/>
            </svg>
            <h3 className="text-xl font-semibold text-[#00ff99] mb-2">
              Coding & Development
            </h3>
            <p className="opacity-80">
              I build tools, scripts, and apps using React, TypeScript, Python, and more.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-xl bg-[#00ff99]/10 border border-[#00ff99]/20 hover:bg-[#00ff99]/20 transition">
            <svg
              className="w-10 h-10 mb-4"
              fill="#00ff99"
              viewBox="0 0 24 24"
            >
              <path d="M6 2l12 10L6 22V2z"/>
            </svg>
            <h3 className="text-xl font-semibold text-[#00ff99] mb-2">
              Tools & Experiments
            </h3>
            <p className="opacity-80">
              I create small tools like IPScan for Raycast and experiment with new technologies.
            </p>
          </div>
        </div>
      </section>

      {/* RECENT POSTS */}
      <section className="text-white">
        <h2 className="text-2xl font-bold text-[#00ff99] mb-6">Latest Posts</h2>

        <div className="space-y-6">
          {posts.map((p) => (
            <div
              key={p.slug}
              className="p-6 rounded-xl bg-[#00ff99]/10 border border-[#00ff99]/20 hover:bg-[#00ff99]/20 transition"
            >
              {p.component}
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
