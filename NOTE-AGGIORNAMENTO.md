# Note per applicare questo aggiornamento

## 1. File da ELIMINARE dal progetto
Queste funzionalità sono state sostituite/spostate e i vecchi file vanno rimossi:

- `api/auth/logout.ts`  → non serviva già a nulla: non era mai chiamato dal frontend, e non
  era nemmeno raggiungibile in produzione (mancava dalle vecchie "routes" in vercel.json).
  Con i JWT in localStorage non c'è una sessione server-side da invalidare: il "logout" resta
  puramente client-side (già gestito da `AuthContext.logout()`).
- `src/lib/jwt.ts`       → firma/verifica del JWT spostate in `server/auth.ts`. Questo file era
  già "morto" (non veniva importato da nessuna parte), ma teneva `JWT_SECRET` dentro `src/`,
  cosa pericolosa se mai finisse per sbaglio nel bundle del browser.
- `src/db/client.ts`     → connessione al DB spostata in `server/db.ts`. Stesso discorso: codice
  che usa `pg` non deve stare sotto `src/` (bundle del browser).
- `src/posts/posts.tsx`  → i post ora vivono nel database, non più hardcodati come componenti.
- `src/posts/Post1.tsx`  → il contenuto è stato migrato automaticamente nel DB al primo avvio
  (vedi `server/db.ts`, funzione `seedInitialPostIfEmpty`), non perdi il post su Kali Linux.
- `src/components/Navbar.tsx` → non era mai usato (Layout.tsx ha la sua nav integrata).

## 2. Variabili d'ambiente su Vercel

- `ADMIN_EMAIL` (NUOVA, consigliata) → l'email con cui ti registri/accedi per diventare
  automaticamente lo "scrittore" del blog. Se hai già un account con questa email, ti basta
  rifare login: la promozione ad admin avviene in automatico.
- `RESEND_API_KEY` (NUOVA, opzionale) → per inviare davvero le email di reset password
  (resend.com, piano gratuito). Senza questa variabile, il link di reset viene solo loggato
  nei log della function su Vercel (utile per test, ma non arriva via email).
- `RESEND_FROM_EMAIL` (opzionale) → mittente delle email, default `onboarding@resend.dev`.
- `SITE_URL` (opzionale) → es. `https://tuosito.vercel.app`, usato per costruire il link nelle
  email di reset. Se non impostata, viene dedotta automaticamente dall'host della richiesta.
- `DATABASE_URL` e `JWT_SECRET` → invariate, quelle che avevi già.

## 3. Come diventare "scrittore"
1. Imposta `ADMIN_EMAIL` su Vercel con la tua email.
2. Registrati (o rifai login se hai già un account) con quella email.
3. Nel menu in alto ti comparirà la voce "Dashboard" → gestione completa dei post.

## 4. Verifiche fatte prima di consegnare
- `tsc` pulito sia sul frontend (`src/`) che sulle funzioni serverless (`api/` + `server/`).
- `eslint` pulito.
- Build di produzione (`vite build`) completata senza errori.
- 31 test di integrazione eseguiti contro un vero Postgres locale: schema, migrazione,
  registrazione/login, ruoli admin/reader, creazione/lettura/modifica/eliminazione post,
  visibilità bozze, e soprattutto: verificato che il token di reset password non compaia
  MAI nella risposta HTTP di `/api/auth/forgot`.
