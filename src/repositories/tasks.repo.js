import { pool } from "../db/pool.js";
import { saveSource } from "./source.repo.js";

/**
 * Сохраняем задачу, связанную с источником
 * @param {Object} payload - объект задачи
 * @returns {UUID} id созданной задачи
 */
export async function saveTask(payload) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const key = payload.Id || null;

    if (key) {
      const check = await client.query(
        "SELECT 1 FROM idempotency_keys WHERE key = $1",
        [key]
      );
      if (check.rowCount > 0) {
        console.log("⚠️ Duplicate task skipped:", key);
        await client.query("ROLLBACK");
        return null;
      }
    }

    const sourceId = await saveSource(payload, client);

    const taskRes = await client.query(
      `INSERT INTO tasks (source_id, name, specs, quantity, status, idempotency_key)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        sourceId,
        payload.tovar || "unknown",
        payload.specific ? JSON.stringify(payload.specific) : null,
        payload.qty ? Number(payload.qty) : null,
        "new",
        key
      ]
    );
    const taskId = taskRes.rows[0].id;

    if (key) {
      await client.query(
        `INSERT INTO idempotency_keys (key, task_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [key, taskId]
      );
    }

    await client.query("COMMIT");
    console.log("✅ Task saved:", key || taskId);
    return taskId;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("❌ Error saving task:", err.message);
    throw err;
  } finally {
    client.release();
  }
}
