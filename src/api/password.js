import postgres from "postgres";
import crypto from "crypto";

const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "Missing email" });

  // Controlla se utente esiste
  const users = await sql`SELECT * FROM users WHERE email = ${email}`;
  if (users.length === 0) return res.status(404).json({ error: "User not found" });

  const user = users[0];

  // Genera token casuale
  const token = crypto.randomBytes(32).toString("hex");
  const expires_at = new Date(Date.now() + 60 * 60 * 1000); // 1h

  // Salva token su DB
  await sql`
    INSERT INTO password_resets (user_id, token, expires_at)
    VALUES (${user.id}, ${token}, ${expires_at})
  `;

  // TODO: invia email all’utente con link di reset
  // Link esempio: https://tuosito.com/reset-password/${token}
  console.log(`Reset password link: https://tuosito.com/reset-password/${token}`);

  res.json({ success: true, message: "Link di reset inviato via email (demo)" });
}
