import { pool } from "../db/pool.js";

/**
 * Сохранить продукт
 */
export async function saveProduct(product) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `INSERT INTO products (marketplace, external_id, title, normalized_specs, price, currency, usd_kzt_rate, seller, url, supplier_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING id`,
      [
        product.marketplace,
        product.external_id,
        product.title,
        product.normalized_specs ? JSON.stringify(product.normalized_specs) : null,
        product.price,
        product.currency,
        product.usd_kzt_rate || 0,
        product.seller ? JSON.stringify(product.seller) : null,
        product.url,
        product.supplier_id || null
      ]
    );
    return res.rows[0].id;
  } finally {
    client.release();
  }
}
