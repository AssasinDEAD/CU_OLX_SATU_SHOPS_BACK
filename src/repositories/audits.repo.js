import { pool } from "../db/pool.js";

/**
 * Записать аудит
 */
export async function recordAudit(traceId, entityType, entityId, action, payload) {
  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO audits (trace_id, entity_type, entity_id, action, payload)
       VALUES ($1,$2,$3,$4,$5)`,
      [
        traceId,
        entityType,
        entityId,
        action,
        payload ? JSON.stringify(payload) : null
      ]
    );
  } finally {
    client.release();
  }
}
