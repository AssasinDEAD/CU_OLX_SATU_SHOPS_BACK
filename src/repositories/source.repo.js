import { pool } from "../db/pool.js";

/**
 * Сохраняем источник (сырые данные от 1С)
 * @param {Object} payload - объект, пришедший от 1С
 * @param {Object} client - транзакционный клиент (если передан)
 * @returns {UUID} id созданного источника
 */
export async function saveSource(payload, client = null) {
  const executor = client || (await pool.connect());
  try {
    const res = await executor.query(
      `INSERT INTO sources (name, external_ref)
       VALUES ($1, $2)
       RETURNING id`,
      [
        payload.tovar || "unknown",
        payload.Id || null
      ]
    );
    return res.rows[0].id;
  } catch (err) {
    console.error("❌ Error saving source:", err.message);
    throw err;
  } finally {
    if (!client) executor.release();
  }
}
