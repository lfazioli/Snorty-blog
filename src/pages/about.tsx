import logo from "../assets/logo.png";
import Layout from "../components/Layout";
import { Window } from "@gfazioli/mantine-window";

export default function About() {
  return (
    <Layout>
      <section className="max-w-4xl mx-auto py-12 px-6 text-white">
        {/* Title */}
        <h1 className="text-4xl font-bold text-[#00ff99] mb-8">About Me</h1>

        {/* Main Container */}
        <div className="flex flex-col md:flex-row items-start gap-8">
          
          {/* Image */}
          <img
            src={logo}
            alt="Logo"
            className="w-40 h-40 rounded-full object-cover border-4 border-[#00ff99]"
          />

          {/* Mantine Window */}
          <div className="relative w-full min-h-[300px]">
            <Window
              title="About Me"
              defaultSize={{ width: 420, height: 320 }}
              defaultPosition={{ x: 0, y: 0 }}
              opened
              withinPortal={false}
            >
              <div className="p-2 text-black leading-relaxed">
                <p className="mb-2">
                  Hi! I’m Lorenzo, also known online as <strong>Snorty</strong>. I’m an
                  18-year-old tech enthusiast from Rome, Italy, with a strong passion for
                  cybersecurity, ethical hacking, and programming.
                </p>

                <p className="mb-2">
                  I love exploring how systems work, breaking them down, understanding their
                  weaknesses, and learning how to make them stronger.
                </p>

                <p className="mb-2">
                  One of my favorite projects is <strong>IPScan</strong>, a Raycast extension
                  I built to speed up and simplify network scanning tasks.
                </p>

                <p className="mb-2">
                  This blog is my space to share what I learn: tips, guides, experiments, and
                  ideas related to cybersecurity and computer science.
                </p>

                <p>
                  If you’re passionate about tech, hacking, or programming, welcome to my
                  corner of the internet.
                </p>
              </div>
            </Window>
          </div>
        </div>

        {/* Skills */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-[#00ff99] mb-4">Skills</h2>
          <div className="flex flex-wrap gap-4">
            {[
              "React", "TypeScript", "Vite", "Tailwind CSS", "MDX",
              "Python", "C++", "C", "HTML", "JavaScript", "CSS",
              "Bash", "Vercel", "Java", "SQL", "PHP", "Node.js",
            ].map((skill) => (
              <span
                key={skill}
                className="bg-[#00ff99]/20 text-[#00ff99] px-3 py-1 rounded-full"
              >
                {skill}
              </span>
            ))}
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
              GitHub
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/lorenzo-fazioli/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#00ff99]/20 text-[#00ff99] px-4 py-2 rounded-full font-medium hover:bg-[#00ff99]/30 transition"
            >
              LinkedIn
            </a>

            {/* X */}
            <a
              href="https://x.com/lorenzofazioli"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#00ff99]/20 text-[#00ff99] px-4 py-2 rounded-full font-medium hover:bg-[#00ff99]/30 transition"
            >
              X (Twitter)
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
