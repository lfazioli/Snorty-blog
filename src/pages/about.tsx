
import logo from "../assets/logo.png";
import Layout from "../components/Layout";

export default function About() {
  return (
    <Layout>
      <section className="max-w-4xl mx-auto py-12 px-6 text-white">
        {/* Titolo */}
        <h1 className="text-4xl font-bold text-[#00ff99] mb-8">About Me</h1>

        {/* Contenitore principale */}
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Immagine */}
          <img
            src={logo}
            alt="Logo"
            className="w-40 h-40 rounded-full object-cover border-4 border-[#00ff99]"
          />

          {/* Testo descrittivo */}
          <div className="flex-1 space-y-4">
            <p className="text-lg opacity-90">
              Hi! I’m Lorenzo, also known online as Snorty. I’m an 18-year-old tech enthusiast from Rome, Italy, with a strong passion for cybersecurity, ethical hacking, and programming.
            </p>
            <p className="text-lg opacity-90">
              I love exploring how systems work, breaking them down, understanding their weaknesses, and learning how to make them stronger. Over the years, I’ve worked on several projects — one of the most notable being IPScan, a Raycast extension I built to speed up and simplify network scanning tasks.
            </p>
            <p className="text-lg opacity-90">
              This blog is my space to share what I learn: tips, guides, experiments, and ideas related to cybersecurity and computer science. Whether it’s a concept I’ve mastered or something that could help others in the field, I enjoy turning my knowledge into useful content for anyone who shares my enthusiasm.
            </p>
            <p className="text-lg opacity-90">
              If you’re passionate about tech, hacking, or programming, you’re in the right place. Welcome to my corner of the internet.
            </p>
          </div>
        </div>

        {/* Skills */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-[#00ff99] mb-4">Skills</h2>
          <div className="flex flex-wrap gap-4">
            <span className="bg-[#00ff99]/20 text-[#00ff99] px-3 py-1 rounded-full">React</span>
            <span className="bg-[#00ff99]/20 text-[#00ff99] px-3 py-1 rounded-full">TypeScript</span>
            <span className="bg-[#00ff99]/20 text-[#00ff99] px-3 py-1 rounded-full">Vite</span>
            <span className="bg-[#00ff99]/20 text-[#00ff99] px-3 py-1 rounded-full">Tailwind CSS</span>
            <span className="bg-[#00ff99]/20 text-[#00ff99] px-3 py-1 rounded-full">MDX</span>
            <span className="bg-[#00ff99]/20 text-[#00ff99] px-3 py-1 rounded-full">Python</span>
            <span className="bg-[#00ff99]/20 text-[#00ff99] px-3 py-1 rounded-full">C++</span>
            <span className="bg-[#00ff99]/20 text-[#00ff99] px-3 py-1 rounded-full">C</span>
            <span className="bg-[#00ff99]/20 text-[#00ff99] px-3 py-1 rounded-full">HTML</span>
            <span className="bg-[#00ff99]/20 text-[#00ff99] px-3 py-1 rounded-full">JavaScript</span>
            <span className="bg-[#00ff99]/20 text-[#00ff99] px-3 py-1 rounded-full">CSS</span>
            <span className="bg-[#00ff99]/20 text-[#00ff99] px-3 py-1 rounded-full">Bash</span>
            <span className="bg-[#00ff99]/20 text-[#00ff99] px-3 py-1 rounded-full">Vercel</span>
            <span className="bg-[#00ff99]/20 text-[#00ff99] px-3 py-1 rounded-full">Java</span>
            <span className="bg-[#00ff99]/20 text-[#00ff99] px-3 py-1 rounded-full">SQL</span>
            <span className="bg-[#00ff99]/20 text-[#00ff99] px-3 py-1 rounded-full">PHP</span>
            <span className="bg-[#00ff99]/20 text-[#00ff99] px-3 py-1 rounded-full">Node.js</span>
          </div>
        </div>

{/* Social Links */}
<div className="mt-12">
  <h2 className="text-2xl font-bold text-[#00ff99] mb-4">Find me online</h2>

  <div className="flex flex-wrap gap-4">

    {/* GitHub */}
    <a
      href="https://github.com/lfazioli"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 bg-[#00ff99]/20 text-[#00ff99] px-4 py-2 rounded-full font-medium hover:bg-[#00ff99]/30 transition"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        fill="#00ff99"
        viewBox="0 0 24 24"
      >
        <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.1 3.29 9.43 7.86 10.96.58.1.79-.25.79-.56v-2.02c-3.2.7-3.87-1.54-3.87-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.73.08-.72.08-.72 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.76.41-1.27.75-1.56-2.55-.29-5.23-1.28-5.23-5.72 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.45-2.69 5.42-5.25 5.7.42.36.8 1.08.8 2.18v3.23c0 .31.21.67.79.56A10.97 10.97 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z"/>
      </svg>
      GitHub
    </a>

    {/* LinkedIn */}
    <a
      href="https://www.linkedin.com/in/lorenzo-fazioli/"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 bg-[#00ff99]/20 text-[#00ff99] px-4 py-2 rounded-full font-medium hover:bg-[#00ff99]/30 transition"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        fill="#00ff99"
        viewBox="0 0 24 24"
      >
        <path d="M4.98 3.5c0 1.38-1.12 2.5-2.49 2.5A2.5 2.5 0 0 1 0 3.5C0 2.12 1.12 1 2.49 1A2.5 2.5 0 0 1 4.98 3.5zM.5 23.5h4V7.98h-4V23.5zM8.5 7.98h3.83v2.13h.06c.53-1 1.85-2.06 3.82-2.06 4.09 0 4.84 2.69 4.84 6.19v9.27h-4v-8.22c0-1.96-.03-4.49-2.74-4.49-2.74 0-3.16 2.14-3.16 4.35v8.36h-4V7.98z"/>
      </svg>
      LinkedIn
    </a>

    {/* X (Twitter) */}
    <a
      href="https://x.com/lorenzofazioli"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 bg-[#00ff99]/20 text-[#00ff99] px-4 py-2 rounded-full font-medium hover:bg-[#00ff99]/30 transition"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        fill="#00ff99"
        viewBox="0 0 24 24"
      >
        <path d="M18.9 1.5h3.2l-7 8.02 8.2 11.48h-6.4l-5-6.74-5.72 6.74H.5l7.5-8.83L.2 1.5h6.5l4.53 6.07L18.9 1.5zm-2.3 17.3h1.8L7.6 4.2H5.7l10.9 14.6z"/>
      </svg>
      X
    </a>

  </div>
</div>

      </section>
    </Layout>
  );
}
