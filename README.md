# 📝 Snorty Blog

Blog tecnico su cybersecurity, ethical hacking e sviluppo.

🌐 **Live**: [www.snorty.space](https://www.snorty.space/)

---

## 🚀 Stack

| | |
|---|---|
| **UI** | React 19 + TypeScript, `react-router-dom` 7 (SPA, nessun framework) |
| **Build** | Vite — `rolldown-vite`, non il bundler Vite di default |
| **Stili** | Tailwind CSS 3 + PostCSS |
| **Backend** | Vercel Functions (runtime Node) sotto `api/`, codice condiviso in `server/` |
| **Database** | Postgres (`pg`), schema creato a runtime da `server/db.ts` |
| **Hosting** | Vercel |

> Non è un progetto Next.js: le rotte le gestisce `react-router` nel browser e
> `vercel.json` sul server.

---

## 📁 Struttura

```
api/                    una Vercel Function per file (vedi il limite qui sotto)
├── page.ts             HTML server-side di ogni rotta del sito
├── seo.ts              /robots.txt, /sitemap.xml, /feed.xml
├── post.ts             lettura pubblica di un singolo post
├── posts/              lista e CRUD dei post (admin)
├── tools.ts            CRUD dei tool
├── github-projects.ts  progetti mostrati in home
└── auth/               login, health, endpoint ritirati
server/                 codice condiviso fra le function (non è un server)
├── db.ts               pool Postgres e creazione schema
├── auth.ts             firma e verifica della sessione JWT
├── markdown.ts         Markdown -> HTML per il corpo prerenderizzato
├── site-url.ts         l'host canonico del sito, un posto solo
├── publication.ts      validazione delle date di pubblicazione
├── tools.ts            lettura e scrittura dei tool
└── tool-seed.ts        popolamento iniziale della tabella tools
src/
├── components/         Seo, Layout, MarkdownComponents, PostCard...
├── pages/              una per rotta di react-router
└── lib/
    ├── seo-meta.ts     modello dei meta tag, condiviso client/server
    └── page-meta.ts    titolo e descrizione delle pagine statiche
tests/                  node:test, nessun runner esterno
vercel.json             routing: è qui che si decide chi risponde a cosa
```

---

## 🔧 Setup

```bash
git clone https://github.com/lfazioli/Snorty-blog.git
cd Snorty-blog
npm install          # obbligatorio, vedi la nota sotto
cp .env.example .env.local
npm run dev          # http://localhost:5173
```

> ⚠️ **`npm install` non è opzionale.** `node_modules/` è committato nel
> repository, ma `.gitignore` contiene `dist/`, quindi ai pacchetti committati
> manca la cartella che effettivamente spediscono. Senza `npm install` la build
> fallisce con `Cannot find module '@vercel/analytics'`. Su Vercel non si nota
> perché la piattaforma lancia `npm install` prima di ogni build.

> ⚠️ **`npm run dev` avvia solo Vite: le function sotto `api/` non girano.**
> L'app si carica ma non trova i post, e non vedi nulla del prerender descritto
> più avanti — quello esiste solo dietro `vercel.json`. Per esercitare anche le
> API in locale serve `vercel dev` (con la CLI installata e `DATABASE_URL`
> configurato) oppure un preview deployment.

### Variabili d'ambiente

| Variabile | A cosa serve |
|---|---|
| `SITE_URL` | Host pubblico usato da canonical, `og:url`, sitemap e feed (lato server) |
| `VITE_SITE_URL` | Lo stesso valore lato client, inlined a build time: cambiarlo richiede un redeploy |
| `DATABASE_URL` | Connessione Postgres |
| `ADMIN_EMAIL` | L'unico account che può fare login |
| `JWT_SECRET` | Firma della sessione di amministrazione |

> 🔴 **`SITE_URL` deve essere l'host su cui il sito risponde davvero.**
> `snorty.space` fa un 308 verso `www.snorty.space`: puntarlo all'apex fa sì che
> ogni canonical, ogni `og:url` e ogni URL della sitemap indichino un indirizzo
> che redirige, che per Google è un segnale contraddittorio. Il valore corretto
> è `https://www.snorty.space`.

---

## 📚 Comandi

| Comando | Cosa fa |
|---|---|
| `npm run dev` | Vite in sviluppo (solo SPA, niente `api/`) |
| `npm run build` | `tsc -b && vite build` → `dist/` |
| `npm run preview` | Serve la build di produzione in locale |
| `npm test` | `node --test tests/*.test.cjs` |
| `npm run lint` | ESLint |
| `npm run typecheck:api` | Type-check di `api/` e `server/`, che `tsc -b` non copre |

---

## 🖥️ Come vengono servite le pagine

L'app è client-rendered, ma **l'HTML che arriva al browser non è più lo shell
vuoto**. In `vercel.json` il catch-all non punta a `/index.html` bensì a
`api/page.ts`, che riscrive lo shell prima di servirlo:

- **`<head>` per ogni rotta** — titolo, description, canonical, `hreflang`,
  Open Graph, Twitter Card e JSON-LD, calcolati per quella pagina.
- **Il corpo dell'articolo su `/post/:slug`** — il Markdown del post viene
  renderizzato in HTML da `server/markdown.ts` dentro `<div id="root">`, con le
  stesse classi Tailwind di `MarkdownComponents.tsx`. `createRoot().render()`
  svuota il contenitore al mount, quindi React non deve riconciliare nulla: è
  quello che legge un crawler e quello che vede il visitatore mentre il bundle
  carica.
- **404 veri** — una URL inesistente risponde `404` con `noindex`, non più `200`
  con lo shell.
- **Le schermate admin** (`/login`, `/dashboard/...`) rispondono `200` con
  `noindex`.

I meta della singola pagina sono descritti una volta sola e usati da entrambi i
lati: `api/page.ts` li serve nell'HTML, il componente `<Seo />` li tiene
aggiornati durante la navigazione client.

### Aggiungere una pagina statica

1. Aggiungi il descrittore in `src/lib/page-meta.ts`:
   ```ts
   export const CHANGELOG_PAGE: PageDescriptor = {
     path: "/changelog",
     title: "Changelog",
     description: "Cosa è cambiato, e quando.",
   };
   ```
   e inseriscilo in `PUBLIC_PAGES`.
2. Registra la rotta in `src/main.tsx` e usa il descrittore nella pagina:
   ```tsx
   <Seo {...CHANGELOG_PAGE} />
   ```

Se dimentichi il passo 1, **il test fallisce**: `tests/page.test.cjs` verifica
che ogni `<Route path>` di `main.tsx` sia una rotta a cui il server sa
rispondere. Senza quel controllo la pagina risponderebbe 404 in produzione pur
funzionando in sviluppo.

Una pagina admin (da non indicizzare) si aggiunge invece in `ADMIN_PAGES`, nello
stesso file.

### Modificare il rendering del Markdown

`server/markdown.ts` copre i costrutti che i post usano davvero — liste,
`h1`-`h3`, blocchi di codice, righe orizzontali, tabelle GFM, grassetto, codice
inline, link e immagini — e **fa l'escape di ogni carattere della sorgente prima
di interpretarla**, come `react-markdown`, che non renderizza HTML grezzo. Se
cambi le classi di `MarkdownComponents.tsx`, aggiorna anche quelle qui: un test
confronta le due liste, perché se divergono il passaggio da HTML server a React
diventa visibile.

---

## ⚠️ Il limite delle 12 Serverless Function

**Un deployment sul piano Hobby può contenere al massimo 12 Serverless
Function, e ogni file sotto `api/` è una function.** Superarlo non degrada
niente: la build fallisce del tutto e la produzione smette di aggiornarsi.

È già successo. `tests/vercel-functions.test.cjs` conta le function e fallisce
oltre il limite, e verifica che ogni rewrite `/api` di `vercel.json` punti a un
file che esiste. Oggi il progetto ne usa **10**.

Se serve un nuovo endpoint, prima di aggiungere un file valuta se può stare in
uno esistente: `api/seo.ts` serve tre URL distinti tramite un parametro `kind`,
`api/page.ts` serve tutte le pagine tramite `path`.

---

## 📈 Analytics

Entrambi i beacon sono attivati in `src/main.tsx`:

- **Vercel Web Analytics** (`inject()`) — visite e pagine viste.
- **Vercel Speed Insights** (`injectSpeedInsights()`) — LCP, CLS, INP e TTFB da
  dispositivi reali, che è la metà del quadro che un Lighthouse sintetico non dà.

> Speed Insights va **abilitato una volta** dal dashboard del progetto
> (Settings → Speed Insights), altrimenti i dati vengono raccolti e scartati.

---

## 🧪 Test

```bash
npm test
```

`node:test`, nessun runner esterno. I test caricano i sorgenti TypeScript
transpilandoli al volo e sostituiscono solo le dipendenze esterne (database,
rete), così esercitano il codice vero e non una sua riscrittura.

Prima di aprire una PR: `npm test`, `npm run typecheck:api`, `npm run build`.

---

## 🚀 Deployment

Vercel builda e pubblica automaticamente a ogni push su `main`. Le PR che
arrivano da un fork mostrano il check Vercel in rosso con *"Authorization
required to deploy"*: è il gate sui preview deployment dei fork, non una build
fallita.

---

## 🤝 Contribuire

1. Fai il fork e crea un branch: `git checkout -b fix/qualcosa`
2. Scrivi il codice e i test
3. `npm test && npm run typecheck:api && npm run build`
4. Apri una Pull Request verso `main`

### Linee guida

- TypeScript ovunque, niente `any` nuovi
- Un test per ogni comportamento che non vuoi perdere, in `tests/`
- I commenti spiegano **perché**, non cosa: il cosa si legge dal codice
- Occhio al limite delle 12 function

---

## 🐛 Segnalare un bug

Apri una issue con: descrizione, passi per riprodurlo, comportamento atteso e
osservato, e — se riguarda SEO o rendering — l'output di
`curl -sS https://www.snorty.space/<percorso>`, che è quello che vede un crawler.

---

## 👤 Autore

**Lorenzo Fazioli** — [@lfazioli](https://github.com/lfazioli) · [www.snorty.space](https://www.snorty.space/)

---

<div align="center">

⭐ Se ti piace questo progetto, lascia una stella! ⭐

</div>
