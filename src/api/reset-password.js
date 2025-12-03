import postgres from "postgres";
import bcrypt from "bcryptjs";

const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { token, newPassword } = req.body;

  if (!token || !newPassword) return res.status(400).json({ error: "Missing fields" });

  const rows = await sql`
    SELECT * FROM password_resets
    WHERE token = ${token} AND used = false AND expires_at > now()
  `;

  if (rows.length === 0) return res.status(400).json({ error: "Token invalido o scaduto" });

  const reset = rows[0];

  // Aggiorna password
  const hashed = await bcrypt.hash(newPassword, 10);
  await sql`UPDATE users SET password = ${hashed} WHERE id = ${reset.user_id}`;

  // Segna token come usato
  await sql`UPDATE password_resets SET used = true WHERE id = ${reset.id}`;

  res.json({ success: true, message: "Password aggiornata!" });
}
