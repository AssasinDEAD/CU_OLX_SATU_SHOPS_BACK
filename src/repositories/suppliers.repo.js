import { pool } from "../db/pool.js";

/**
 * Добавить нового поставщика
 */
export async function addSupplier(name, contactInfo, isPermanent = false) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `INSERT INTO suppliers (name, contact_info, is_permanent)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [name, contactInfo, isPermanent]
    );
    return res.rows[0].id;
  } finally {
    client.release();
  }
}

/**
 * Найти поставщика по имени
 */
export async function findSupplierByName(name) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `SELECT * FROM suppliers WHERE name = $1`,
      [name]
    );
    return res.rows[0] || null;
  } finally {
    client.release();
  }
}
