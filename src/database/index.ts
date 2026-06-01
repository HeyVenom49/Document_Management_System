import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

if (!process.env.DATABASE_URL) {
  throw new Error("Database url missing");
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 3000,
});

export const db = drizzle(pool);

export async function connectDB() {
  try {
    await pool.query("SELECT 1");
  } catch (err) {
    throw new Error(`Failed to connect the database`, { cause: err });
  }
}
