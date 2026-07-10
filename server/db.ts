// server/db.ts
// Shared database module. Used by every serverless function in /api, so we don't
// duplicate the Pool/schema setup in every single file.
import { Pool } from "pg";

function normalizeDatabaseUrl(url?: string): string {
  if (!url) throw new Error("DATABASE_URL is not set");
  try {
    const u = new URL(url);
    const params = u.searchParams;
    // `require` will change semantics in pg v9. `verify-full` preserves strict
    // certificate and hostname validation and avoids the deprecation warning.
    const sslmode = params.get("sslmode");
    if (!sslmode || ["prefer", "require", "verify-ca"].includes(sslmode)) {
      params.set("sslmode", "verify-full");
    }
    // Some pg environments don't support channel binding: strip it if present.
    if (params.get("channel_binding")) params.delete("channel_binding");
    u.search = params.toString();
    return u.toString();
  } catch {
    // Not a valid URL: return as-is (pg still accepts a raw connectionString)
    return url;
  }
}

// A single Pool per serverless function instance, reused across "warm" invocations.
// Low max because each Vercel function is a separate process: many functions x many
// connections each can quickly saturate the database's connection limit.
export const pool = new Pool({
  connectionString: normalizeDatabaseUrl(process.env.DATABASE_URL),
  max: 3,
});

const KALI_POST_CONTENT = `Running Kali Linux inside VirtualBox gives you a full, isolated environment — safe, disposable, and flexible. Choose ISO for full control or OVA for quick setup.

## 📥 Option 1 — Install from ISO

Installing Kali from scratch on VirtualBox — full customization:

1. Create a new VM: Type Linux → Debian (64‑bit)
2. RAM: 2048MB min (4096MB recommended)
3. Disk: VDI, dynamically allocated, 20‑30 GB
4. Attach Kali ISO and start → choose **Graphical Install**
5. Configure language, keyboard, user/password
6. Partition: guided → install GRUB → reboot
7. Update system: \`sudo apt update && sudo apt upgrade -y\`

![Kali Linux logo](https://images2.alphacoders.com/480/thumb-1920-480538.png)

## 🚀 Option 2 — Use Prebuilt OVA

To get started right away: import the pre-configured VM into VirtualBox in a few clicks.

- Download the OVA from the official Kali website.
- VirtualBox → File → Import Appliance → select the \`.ova\` file
- Start the VM, log in with the default credentials, and run a quick update.

## 🔧 Recommendations

- Video Memory: 128 MB+, enable 3D acceleration if needed
- Processors: 2+ cores (if your host allows it)
- Network: NAT for easy internet access, Bridged for LAN visibility
- Guest Additions (optional): improve shared clipboard and drag-and-drop

**With this setup you'll have a clean, isolated lab: ISO = control, OVA = speed. Test ethically, experiment freely.**
`;

let schemaReady: Promise<void> | null = null;

/**
 * Creates/updates the schema idempotently (CREATE TABLE IF NOT EXISTS...).
 * The result is cached in memory for the lifetime of the serverless function,
 * so the DDL queries run once per cold start, not on every request.
 */
export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = runMigrations().catch((err) => {
      schemaReady = null; // if it fails, retry on the next attempt instead of staying broken
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
  // Migration for databases created before roles were introduced.
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

// If ADMIN_EMAIL is configured, makes sure that account (if it already exists) is admin.
// The "new registration"/"new login" case is handled directly in register.ts/login.ts;
// this is just an extra safety check that runs on every cold start, useful for
// example if you set ADMIN_EMAIL after the account already exists.
async function promoteConfiguredAdmin() {
  const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  if (!adminEmail) return;
  await pool.query("UPDATE users SET role = 'admin' WHERE email = $1 AND role <> 'admin'", [adminEmail]);
}

async function seedInitialPostIfEmpty() {
  const { rows } = await pool.query("SELECT COUNT(*)::int AS n FROM posts");
  if (rows[0].n > 0) return;

  // Migrates the "Kali Linux on VirtualBox" post (previously hardcoded in
  // src/posts/Post1.tsx) so the existing content isn't lost when moving to the
  // new DB-backed system.
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
