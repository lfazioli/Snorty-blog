import Layout from "../components/Layout";
import Seo from "../components/Seo";
import netfoxCover from "../assets/tools/netfox-cover.png";
import dataCover from "../assets/tools/data-cover.png";
import osintCover from "../assets/tools/osint-cover.png";
import crtCover from "../assets/tools/crt.png";
import urlscanCover from "../assets/tools/urlscan.png";
import passwordCrackerCover from "../assets/tools/pwd.png";


type Tool = {
  name: string;
  category: string;
  description: string;
  howTo: string;
  href: string;
  image: string;
  badge: string;
};

const tools: Tool[] = [
  {
    name: "Netfox",
    category: "Local network",
    description: "A native macOS monitor that shows connected devices, their history, and network alerts.",
    howTo: "Install the app, grant the required permissions, then open Devices: name the devices you recognise and review any new ones.",
    href: "https://netfox.app/",
    image: netfoxCover,
    badge: "macOS",
  },
  {
    name: "urlscan.io",
    category: "URL analysis",
    description: "A web sandbox for seeing what a link actually loads before opening it in your browser.",
    howTo: "Paste the URL and choose the scan visibility carefully; then review the screenshot, requests, domains, and detected IPs.",
    href: "https://urlscan.io/",
    image: urlscanCover,
    badge: "Web",
  },
  {
    name: "crt.sh",
    category: "DNS & certificates",
    description: "Searches Certificate Transparency logs, making it useful for discovering subdomains associated with a domain.",
    howTo: "Search for %example.com, replacing example.com with an authorised domain; filter the results and verify the relevant entries.",
    href: "https://crt.sh/",
    image: crtCover,
    badge: "Web",
  },
  {
    name: "CyberChef",
    category: "Data analysis",
    description: "A browser-based lab for decoding, converting, and inspecting data without writing a script.",
    howTo: "Paste your input, find an operation such as From Base64, and drag it into the Recipe: the output updates instantly.",
    href: "https://gchq.github.io/CyberChef/",
    image: dataCover,
    badge: "Web",
  },
  {
    name: "Password Cracker",
    category: "Password security",
    description: "A project by lfazioli for exploring password strength and password-security concepts in a controlled environment.",
    howTo: "Use it only with passwords, hashes, or test data you own or are explicitly authorised to assess; start with a safe sample and review the result.",
    href: "https://password-cracker-pearl.vercel.app/",
    image: passwordCrackerCover,
    badge: "Your project",
  },
  {
    name: "SpiderFoot",
    category: "OSINT",
    description: "Automates the collection and correlation of public information for an initial asset map.",
    howTo: "Run it locally, create a scan for a target you own, and start with the core modules; always validate results manually.",
    href: "https://github.com/smicallef/spiderfoot",
    image: osintCover,
    badge: "Open source",
  },
  {
    name: "DNSDumpster",
    category: "Reconnaissance",
    description: "A quick view of a domain's public DNS relationships, useful for getting oriented during an assessment.",
    howTo: "Enter a domain you own or are authorised to assess, and use the map as a starting point—not as a definitive source.",
    href: "https://dnsdumpster.com/",
    image: crtCover,
    badge: "Web",
  },
];

export default function Tools() {
  return (
    <Layout>
      <Seo
        title="Tools"
        description="A curated collection of tools for networks, OSINT, and web analysis, with quick guides to get started."
        path="/tools"
      />

      <section className="mb-10 sm:mb-14">
        <p className="font-mono text-xs text-signal mb-3 tracking-wide">// toolbox</p>
        <h1 className="text-3xl sm:text-4xl font-semibold text-ink tracking-tight mb-4">Tools worth knowing.</h1>
        <p className="max-w-2xl text-dim leading-relaxed">
          A practical selection for exploring networks, analysing URLs, and working with data. Less obvious than the usual names, but great to keep close at hand.
        </p>
      </section>

      <aside className="mb-10 rounded-xl border border-signal/30 bg-signal/5 px-5 py-4 text-sm text-dim leading-relaxed">
        <span className="font-mono text-signal">Ethical note:</span> only use these tools on networks, domains, and data you own or have explicit permission to assess.
      </aside>

      <div className="grid gap-6 sm:grid-cols-2">
        {tools.map((tool) => (
          <article key={tool.name} className="group overflow-hidden rounded-xl border border-line bg-panel transition-colors hover:border-signal/50">
            <img src={tool.image} alt="" className="h-40 w-full object-cover opacity-90 transition duration-300 group-hover:opacity-100" />
            <div className="p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="font-mono text-xs text-signal">{tool.category}</p>
                <span className="rounded border border-line px-2 py-0.5 font-mono text-[10px] text-dim">{tool.badge}</span>
              </div>
              <h2 className="text-xl font-semibold text-ink">{tool.name}</h2>
              <p className="mt-2 text-sm leading-relaxed text-dim">{tool.description}</p>
              <div className="mt-5 border-l-2 border-signal/70 pl-3">
                <p className="font-mono text-[11px] uppercase tracking-wide text-ink">Getting started</p>
                <p className="mt-1 text-sm leading-relaxed text-dim">{tool.howTo}</p>
              </div>
              <a
                href={tool.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-signal hover:text-ink transition-colors"
              >
                Open {tool.name}
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </article>
        ))}
      </div>
    </Layout>
  );
}
