// /api/auth.js
import postgres from "postgres";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const sql = postgres(process.env.DATABASE_URL, {
  ssl: "require",
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { type, email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Missing credentials" });

  // ===== REGISTER =====
  if (type === "register") {
    try {
      const hashed = await bcrypt.hash(password, 10);

      const user = await sql`
        INSERT INTO users (email, password)
        VALUES (${email}, ${hashed})
        RETURNING id, email
      `;

      return res.json({ success: true, user: user[0] });

    } catch (err) {
      return res.status(400).json({ error: "Email already exists" });
    }
  }

  // ===== LOGIN =====
  if (type === "login") {
    const users = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;

    if (users.length === 0)
      return res.status(404).json({ error: "User not found" });

    const user = users[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match)
      return res.status(401).json({ error: "Wrong password" });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({ success: true, token });
  }

  return res.status(400).json({ error: "Unknown request type" });
}
