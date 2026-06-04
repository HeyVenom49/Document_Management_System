import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { AppError } from "../common/errors/app.error.ts";

if (!process.env.DATABASE_URL) {
  throw new AppError("Database url missing", 500);
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
    console.log("Database connected successfully");
  } catch (err) {
    throw new AppError("Failed to connect the database", 500);
  }
}
