# Leggimi prima di sostituire il progetto

## ⚠️ Unica cosa da fare a mano: il logo

Questo zip contiene un `src/assets/logo.png` **placeholder** (un quadratino verde), perché
non ho mai ricevuto il file immagine originale (è un binario, non testo).

Prima di cancellare il tuo progetto vecchio:
1. Copia da qualche parte il tuo `src/assets/logo.png` **reale**.
2. Estrai questo zip al posto del vecchio progetto (sovrascrivi tutto).
3. Rimetti il tuo `logo.png` reale dentro `src/assets/`, sovrascrivendo il placeholder.

Tutto il resto è completo e già testato (build, tsc, eslint, 31 test contro un Postgres reale).

## Dopo aver estratto

```bash
npm install
npm run dev      # per provarlo in locale
npm run build    # build di produzione, la stessa che gira su Vercel
```

## Variabili d'ambiente su Vercel

- `DATABASE_URL`, `JWT_SECRET` → quelle che avevi già.
- `ADMIN_EMAIL` (nuova, consigliata) → l'email con cui accedi per diventare "scrittore" del
  blog. Registrati o rifai login con questa email e ti compare la voce **Dashboard** nel menu.
- `RESEND_API_KEY` (nuova, opzionale) → per inviare davvero le email di reset password
  ([resend.com](https://resend.com), piano gratuito). Senza questa variabile il link di reset
  viene solo loggato nei log della function su Vercel (utile in sviluppo, non arriva via email).
- `RESEND_FROM_EMAIL` (opzionale) → mittente delle email, default `onboarding@resend.dev`.
- `SITE_URL` (opzionale) → es. `https://tuosito.vercel.app`, per il link nelle email di reset.
  Se non impostata viene dedotta automaticamente dall'host della richiesta.
- `VITE_SITE_URL` (consigliata) → lo stesso URL pubblico, es. `https://tuodominio.it`.
  Serve a generare i link canonici e i metadati SEO nel browser. Non inserire la barra finale.

## SEO e indicizzazione

Il sito espone automaticamente `https://tuodominio.it/robots.txt` e una sitemap dinamica
in `https://tuodominio.it/sitemap.xml`, che include gli articoli pubblicati.

Dopo il prossimo deploy su Vercel:
1. imposta `SITE_URL` e `VITE_SITE_URL` sul dominio di produzione;
2. verifica il dominio in [Google Search Console](https://search.google.com/search-console);
3. invia `https://tuodominio.it/sitemap.xml` nella sezione **Sitemap** e usa
   **Controllo URL → Richiedi indicizzazione** per home e articoli importanti.

I metadati aiutano Google a capire le pagine, ma il posizionamento dipende anche da
contenuti originali, autorevolezza e tempo di scansione: l'indicizzazione può richiedere giorni
o settimane e non garantisce le prime posizioni.

## Novità principali
- Gestione articoli dal sito (Dashboard → crea/modifica/elimina, Markdown con anteprima,
  bozze vs pubblicati).
- Fix di sicurezza: il token di reset password non viene più restituito nella risposta API.
- `/post/:slug` ora carica davvero il post giusto dal database (prima mostrava sempre lo
  stesso post hardcodato, a prescindere dallo slug nell'URL).
- `vercel.json` semplificato: le vecchie "routes" richiedevano di elencare ogni endpoint a
  mano (per questo `/api/auth/logout` non funzionava già).
