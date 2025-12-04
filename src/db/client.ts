// src/db/client.ts
import "dotenv/config";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URK;
if (!databaseUrl) {
  throw new Error("DATABASE_URK non impostata nelle variabili d'ambiente");
}

export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows as T[];
  } finally {
    client.release();
  }
}
