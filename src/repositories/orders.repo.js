import { pool } from "../db/pool.js";

/**
 * Создать заказ
 */
export async function createOrder(order) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `INSERT INTO orders (task_id, marketplace, product_id, supplier_id, quantity, unit_price, currency, usd_kzt_rate, status, external_order_ref)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING id`,
      [
        order.task_id,
        order.marketplace,
        order.product_id,
        order.supplier_id || null,
        order.quantity,
        order.unit_price,
        order.currency,
        order.usd_kzt_rate || 0,
        order.status || "new",
        order.external_order_ref || null
      ]
    );
    return res.rows[0].id;
  } finally {
    client.release();
  }
}
