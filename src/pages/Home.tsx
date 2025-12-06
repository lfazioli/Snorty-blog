import Layout from "../components/Layout";
import { TypeAnimation } from "react-type-animation";
import { posts } from "../posts/posts";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <Layout>
      {/* HERO SECTION */}
      <section className="text-white py-16 px-4 md:px-8 animate-fadeIn text-center md:text-left max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-[#00ff99] animate-bounce leading-tight">
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

        <p className="opacity-90 mb-8 animate-slideIn mx-auto md:mx-0 max-w-xl text-base sm:text-lg leading-relaxed">
          I write about cybersecurity, ethical hacking, development, and the tools I build.
          If you're passionate about tech and security, you'll feel at home here.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12 justify-center md:justify-start">
          <Link
            to="/about"
            className="px-5 py-2 rounded-md bg-[#00ff99]/20 text-[#00ff99] border border-[#00ff99] text-center hover:bg-[#00ff99]/30 transition transform hover:scale-105"
          >
            About Me
          </Link>

          <a
            href="https://github.com/lfazioli"
            target="_blank"
            className="px-5 py-2 rounded-md bg-[#00ff99]/20 text-[#00ff99] border border-[#00ff99] text-center hover:bg-[#00ff99]/30 transition transform hover:scale-105"
          >
            GitHub
          </a>
        </div>
      </section>

      {/* WHAT I DO / FEATURES */}
      <section className="text-white mb-14 px-4 md:px-8 max-w-5xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#00ff99] mb-6 animate-fadeIn text-center md:text-left">
          What I Do
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-xl bg-[#00ff99]/10 border border-[#00ff99]/20 hover:bg-[#00ff99]/20 hover:scale-105 hover:shadow-xl transition-transform duration-300 animate-slideInLeft text-center md:text-left">
            <svg className="w-10 h-10 mb-4 animate-spin-slow mx-auto md:mx-0" fill="#00ff99" viewBox="0 0 24 24">
              <path d="M12 0L1 6v12l11 6 11-6V6L12 0zm0 2.2l8.8 4.8v9.9l-8.8 4.8-8.8-4.8V7l8.8-4.8zM11 7v10l6-5-6-5z"/>
            </svg>
            <h3 className="text-xl font-semibold text-[#00ff99] mb-2">Cybersecurity & Hacking</h3>
            <p className="opacity-80">I explore systems, discover vulnerabilities, and learn how to make them stronger.</p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-xl bg-[#00ff99]/10 border border-[#00ff99]/20 hover:bg-[#00ff99]/20 hover:scale-105 hover:shadow-xl transition duration-300 animate-slideInUp text-center md:text-left">
            <svg className="w-10 h-10 mb-4 animate-pulse mx-auto md:mx-0" fill="#00ff99" viewBox="0 0 24 24">
              <path d="M3 3h18v2H3V3zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/>
            </svg>
            <h3 className="text-xl font-semibold text-[#00ff99] mb-2">Coding & Development</h3>
            <p className="opacity-80">I build tools, scripts, and apps using React, TypeScript, Python, and more.</p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-xl bg-[#00ff99]/10 border border-[#00ff99]/20 hover:bg-[#00ff99]/20 hover:scale-105 hover:shadow-xl transition duration-300 animate-slideInRight text-center md:text-left">
            <svg className="w-10 h-10 mb-4 animate-spin-slow mx-auto md:mx-0" fill="#00ff99" viewBox="0 0 24 24">
              <path d="M6 2l12 10L6 22V2z"/>
            </svg>
            <h3 className="text-xl font-semibold text-[#00ff99] mb-2">Tools & Experiments</h3>
            <p className="opacity-80">I create IPScan for Raycast and experiment with new technologies.</p>
          </div>
        </div>
      </section>

      {/* RECENT POSTS */}
      <section className="text-white px-4 md:px-8 max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#00ff99] mb-6 animate-fadeIn text-center md:text-left">
          Latest Posts
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {posts.map((p, idx) => (
            <Link
              key={p.slug}
              to={`/post/${p.slug}`}
              className="block p-6 rounded-xl bg-[#00ff99]/10 border border-[#00ff99]/20 hover:bg-[#00ff99]/20 hover:scale-105 hover:shadow-xl transition-transform animate-fadeIn"
              style={{ animationDelay: `${idx * 200}ms` }}
            >
              <img src={p.image} alt={p.title} className="w-full rounded-lg mb-4 border border-[#00ff99]/50" />
              <h3 className="text-xl font-bold text-[#00ff99] mb-2">{p.title}</h3>
              <p className="text-gray-400">{p.date}</p>
            </Link>
          ))}
        </div>
      </section>
    </Layout>
  );
}
