import pg from "pg";
import { config } from "../config/env.js";

const { Pool } = pg;

export const pool = new Pool({
  host: config.PG_HOST,
  port: config.PG_PORT,
  user: config.PG_USER,
  password: config.PG_PASSWORD,
  database: config.PG_DATABASE,
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on("error", (err) => {
  console.error("❌ Unexpected PG pool error:", err.message);
});

/**
 * Получаем клиент с retry и защитой
 */
export async function getClient(retries = 5, delay = 5000) {
  while (retries > 0) {
    try {
      const client = await pool.connect();
      return client;
    } catch (err) {
      console.error(
        `⚠️ DB connection failed (${err.message}). Retries left: ${retries - 1}`
      );
      retries -= 1;
      if (retries === 0) {
        throw new Error("❌ Could not connect to Postgres after retries");
      }
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}
