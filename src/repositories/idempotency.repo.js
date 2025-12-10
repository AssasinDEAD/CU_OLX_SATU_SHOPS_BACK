import { pool } from "../db/pool.js";

export async function isKeyUsed(client, key) {
  if (!key) return false;
  const res = await client.query(
    `SELECT 1 FROM idempotency_keys WHERE key = $1`,
    [key]
  );
  return res.rowCount > 0;
}

export async function recordKey(client, key, taskId) {
  if (!key || !taskId) return;
  await client.query(
    `INSERT INTO idempotency_keys (key, task_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [key, taskId]
  );
}
