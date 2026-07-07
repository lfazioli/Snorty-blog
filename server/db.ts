// server/db.ts
// Modulo condiviso per l'accesso al database. Usato da tutte le funzioni
// serverless in /api, cosi' non dobbiamo piu' duplicare Pool/schema in ogni file.
import { Pool } from "pg";

function normalizeDatabaseUrl(url?: string): string {
  if (!url) throw new Error("DATABASE_URL non impostata nelle variabili d'ambiente");
  try {
    const u = new URL(url);
    const params = u.searchParams;
    if (!params.get("sslmode")) params.set("sslmode", "require");
    // Alcuni ambienti pg non supportano channel binding: lo rimuoviamo se presente.
    if (params.get("channel_binding")) params.delete("channel_binding");
    u.search = params.toString();
    return u.toString();
  } catch {
    // Se non e' una URL valida, la ritorniamo com'e' (pg accetta comunque una connectionString raw)
    return url;
  }
}

// Un solo Pool per istanza di funzione serverless, riutilizzato tra invocazioni "warm".
// max basso perche' ogni funzione Vercel e' un processo separato: tante funzioni x tante
// connessioni ciascuna puo' saturare in fretta il limite di connessioni del database.
export const pool = new Pool({
  connectionString: normalizeDatabaseUrl(process.env.DATABASE_URL),
  ssl: { rejectUnauthorized: false },
  max: 3,
});

const KALI_POST_CONTENT = `Running Kali Linux inside VirtualBox gives you a full, isolated environment — safe, disposable, and flexible. Choose ISO for full control or OVA for quick setup.

## 📥 Option 1 — Install from ISO

Installare Kali su VirtualBox da zero — massima personalizzazione:

1. Create a new VM: Type Linux → Debian (64‑bit)
2. RAM: 2048MB min (4096MB recommended)
3. Disk: VDI, dynamically allocated, 20‑30 GB
4. Attach Kali ISO and start → choose **Graphical Install**
5. Configure language, keyboard, user/password
6. Partition: guided → install GRUB → reboot
7. Update system: \`sudo apt update && sudo apt upgrade -y\`

![Kali Linux logo](https://images2.alphacoders.com/480/thumb-1920-480538.png)

## 🚀 Option 2 — Use Prebuilt OVA

Per partire subito: importa la VM pre‑configurata su VirtualBox con pochi click.

- Download OVA dal sito ufficiale di Kali.
- VirtualBox → File → Import Appliance → seleziona il file \`.ova\`
- Start VM, login con default credentials e un update rapido.

## 🔧 Recommendations

- Video Memory: 128 MB+, abilita 3D se necessario
- Processors: 2+ cores (se l'host lo consente)
- Network: NAT per internet facile, Bridged per visibilità LAN
- Guest Additions (opzionale): migliorano clipboard condivisa e drag-drop

**With this setup you'll have a clean, isolated lab: ISO = control, OVA = speed. Test ethically, experiment freely.**
`;

let schemaReady: Promise<void> | null = null;

/**
 * Crea/aggiorna lo schema in modo idempotente (CREATE TABLE IF NOT EXISTS...).
 * Il risultato viene tenuto in cache in memoria per la vita della funzione serverless,
 * cosi' le query DDL girano una sola volta per cold start e non ad ogni richiesta.
 */
export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = runMigrations().catch((err) => {
      schemaReady = null; // se fallisce, ritenta al prossimo tentativo invece di restare rotto
      throw err;
    });
  }
  return schemaReady;
}

async function runMigrations() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'reader',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
  // Migrazione per DB creati prima dell'introduzione dei ruoli.
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'reader';`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      excerpt TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL,
      image TEXT,
      published BOOLEAN NOT NULL DEFAULT TRUE,
      author_email TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await promoteConfiguredAdmin();
  await seedInitialPostIfEmpty();
}

// Se ADMIN_EMAIL e' configurata, garantisce che quell'account (se esiste gia') sia admin.
// Il caso "nuova registrazione"/"nuovo login" e' gestito direttamente in register.ts/login.ts;
// questo e' solo un ulteriore controllo di sicurezza eseguito ad ogni cold start, utile ad
// esempio se imposti ADMIN_EMAIL dopo aver gia' creato l'account.
async function promoteConfiguredAdmin() {
  const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  if (!adminEmail) return;
  await pool.query("UPDATE users SET role = 'admin' WHERE email = $1 AND role <> 'admin'", [adminEmail]);
}

async function seedInitialPostIfEmpty() {
  const { rows } = await pool.query("SELECT COUNT(*)::int AS n FROM posts");
  if (rows[0].n > 0) return;

  // Migra il post "Kali Linux on VirtualBox" (prima hardcodato in src/posts/Post1.tsx)
  // cosi' non si perde il contenuto esistente passando al nuovo sistema basato su DB.
  await pool.query(
    `INSERT INTO posts (slug, title, excerpt, content, image, published, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, true, $6, $6)
     ON CONFLICT (slug) DO NOTHING`,
    [
      "kali-virtualbox",
      "⚡ Kali Linux on VirtualBox",
      "Running Kali Linux inside VirtualBox gives you a full, isolated environment — safe, disposable, and flexible.",
      KALI_POST_CONTENT,
      "https://www.kali.org/wallpapers/images/2024/kali-ferrofluid.jpg",
      "2025-12-02T00:00:00.000Z",
    ]
  );
}
