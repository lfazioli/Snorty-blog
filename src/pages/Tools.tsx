import Layout from "../components/Layout";
import Seo from "../components/Seo";
import netfoxCover from "../assets/tools/netfox-cover.png";
import dataCover from "../assets/tools/data-cover.png";
import osintCover from "../assets/tools/osint-cover.png";
import crtCover from "../assets/tools/crt.png";
import urlscanCover from "../assets/tools/urlscan.png";


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
    category: "Rete locale",
    description: "Monitor nativo per macOS: mostra i dispositivi connessi, la loro cronologia e gli avvisi di rete.",
    howTo: "Installa l'app, concedi i permessi richiesti e apri Devices: dai un nome ai device conosciuti e controlla quelli nuovi.",
    href: "https://netfox.app/",
    image: netfoxCover,
    badge: "macOS",
  },
  {
    name: "urlscan.io",
    category: "Analisi URL",
    description: "Una sandbox web per osservare cosa carica davvero un link prima di aprirlo nel browser.",
    howTo: "Incolla l'URL e scegli con cura la visibilità della scansione; poi guarda screenshot, richieste, domini e IP rilevati.",
    href: "https://urlscan.io/",
    image: urlscanCover,
    badge: "Web",
  },
  {
    name: "crt.sh",
    category: "DNS & certificati",
    description: "Ricerca nei Certificate Transparency logs: utile per trovare sottodomini associati a un dominio.",
    howTo: "Cerca %example.com, sostituendo example.com con il dominio autorizzato; esporta o filtra i risultati e verifica quelli rilevanti.",
    href: "https://crt.sh/",
    image: crtCover,
    badge: "Web",
  },
  {
    name: "CyberChef",
    category: "Analisi dati",
    description: "Un laboratorio nel browser per decodificare, convertire e ispezionare dati senza preparare script.",
    howTo: "Incolla l'input, cerca un'operazione (es. From Base64) e trascinala nella Recipe: l'output si aggiorna subito.",
    href: "https://gchq.github.io/CyberChef/",
    image: dataCover,
    badge: "Web",
  },
  {
    name: "SpiderFoot",
    category: "OSINT",
    description: "Automatizza raccolta e correlazione di informazioni pubbliche per una prima mappa di un asset.",
    howTo: "Eseguilo in locale, crea una scansione su un target che possiedi e parti dai moduli base; valida sempre i risultati manualmente.",
    href: "https://github.com/smicallef/spiderfoot",
    image: osintCover,
    badge: "Open source",
  },
  {
    name: "DNSDumpster",
    category: "Ricognizione",
    description: "Una vista rapida sulle relazioni DNS pubbliche di un dominio, utile per orientarsi durante una verifica.",
    howTo: "Inserisci un dominio di tua proprietà o con autorizzazione e usa la mappa come punto di partenza, non come fonte definitiva.",
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
        description="Una raccolta curata di strumenti per rete, OSINT e analisi web, con guide rapide per iniziare."
        path="/tools"
      />

      <section className="mb-10 sm:mb-14">
        <p className="font-mono text-xs text-signal mb-3 tracking-wide">// toolbox</p>
        <h1 className="text-3xl sm:text-4xl font-semibold text-ink tracking-tight mb-4">Tools che vale la pena conoscere.</h1>
        <p className="max-w-2xl text-dim leading-relaxed">
          Una selezione pratica per esplorare reti, analizzare URL e lavorare con dati. Meno ovvia dei soliti nomi, ma ottima da tenere a portata di mano.
        </p>
      </section>

      <aside className="mb-10 rounded-xl border border-signal/30 bg-signal/5 px-5 py-4 text-sm text-dim leading-relaxed">
        <span className="font-mono text-signal">Nota etica:</span> usa questi strumenti solo su reti, domini e dati che possiedi o per cui hai un'autorizzazione esplicita.
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
                <p className="font-mono text-[11px] uppercase tracking-wide text-ink">Come iniziare</p>
                <p className="mt-1 text-sm leading-relaxed text-dim">{tool.howTo}</p>
              </div>
              <a
                href={tool.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-signal hover:text-ink transition-colors"
              >
                Apri {tool.name}
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </article>
        ))}
      </div>
    </Layout>
  );
}
