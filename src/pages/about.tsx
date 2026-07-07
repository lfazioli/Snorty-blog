import logo from "../assets/logo.png";
import Layout from "../components/Layout";

const skills = [
  "React", "TypeScript", "Vite", "Tailwind CSS", "Python", "C++", "C",
  "HTML", "JavaScript", "CSS", "Bash", "Vercel", "Java", "SQL", "PHP", "Node.js",
];

export default function About() {
  return (
    <Layout>
      <p className="font-mono text-xs text-signal mb-3 tracking-wide">// chi sono</p>
      <h1 className="text-2xl sm:text-3xl font-semibold text-ink mb-10 tracking-tight">About</h1>

      <div className="flex flex-col md:flex-row items-start gap-8 mb-14">
        <img
          src={logo}
          alt="Logo"
          className="w-28 h-28 rounded-full object-cover border border-line shrink-0"
        />

        <div className="space-y-4 text-dim leading-relaxed">
          <p>
            Ciao, sono Lorenzo, online conosciuto come Snorty. Ho 19 anni, vivo a Roma e mi
            occupo di cybersecurity, ethical hacking e programmazione.
          </p>
          <p>
            Mi piace capire come funzionano i sistemi, scomporli, trovarne i punti deboli e
            imparare a renderli più solidi. Tra i progetti più importanti c'è IPScan, un'estensione
            per Raycast che ho costruito per velocizzare le scansioni di rete.
          </p>
          <p>
            Questo blog è lo spazio dove condivido quello che imparo: guide, esperimenti e note
            su sicurezza informatica e sviluppo.
          </p>
        </div>
      </div>

      <div className="mb-14">
        <p className="font-mono text-xs text-signal mb-4 tracking-wide">// competenze</p>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="text-sm px-3 py-1 rounded-md border border-line text-dim font-mono"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="font-mono text-xs text-signal mb-4 tracking-wide">// contatti</p>
        <div className="flex flex-wrap gap-3">
          <a
            href="https://github.com/lfazioli"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-md border border-line text-dim hover:text-ink hover:border-signal/50 transition-colors text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.1 3.29 9.43 7.86 10.96.58.1.79-.25.79-.56v-2.02c-3.2.7-3.87-1.54-3.87-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.73.08-.72.08-.72 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.76.41-1.27.75-1.56-2.55-.29-5.23-1.28-5.23-5.72 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.45-2.69 5.42-5.25 5.7.42.36.8 1.08.8 2.18v3.23c0 .31.21.67.79.56A10.97 10.97 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z"/>
            </svg>
            GitHub
          </a>

          <a
            href="https://www.linkedin.com/in/lorenzo-fazioli/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-md border border-line text-dim hover:text-ink hover:border-signal/50 transition-colors text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.98 3.5c0 1.38-1.12 2.5-2.49 2.5A2.5 2.5 0 0 1 0 3.5C0 2.12 1.12 1 2.49 1A2.5 2.5 0 0 1 4.98 3.5zM.5 23.5h4V7.98h-4V23.5zM8.5 7.98h3.83v2.13h.06c.53-1 1.85-2.06 3.82-2.06 4.09 0 4.84 2.69 4.84 6.19v9.27h-4v-8.22c0-1.96-.03-4.49-2.74-4.49-2.74 0-3.16 2.14-3.16 4.35v8.36h-4V7.98z"/>
            </svg>
            LinkedIn
          </a>

          <a
            href="https://x.com/lorenzofazioli"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-md border border-line text-dim hover:text-ink hover:border-signal/50 transition-colors text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.9 1.5h3.2l-7 8.02 8.2 11.48h-6.4l-5-6.74-5.72 6.74H.5l7.5-8.83L.2 1.5h6.5l4.53 6.07L18.9 1.5zm-2.3 17.3h1.8L7.6 4.2H5.7l10.9 14.6z"/>
            </svg>
            X
          </a>
        </div>
      </div>
    </Layout>
  );
}
