import { getClient } from '../pool.js'

export async function runMigrations() {
  const client = await getClient()
  try {
    await client.query('BEGIN')

    // sources
    await client.query(`
      CREATE TABLE IF NOT EXISTS sources (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        external_ref TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `)

    // suppliers
    await client.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        contact_info TEXT,
        is_permanent BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `)

    // tasks
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        specs JSONB,
        quantity INT,
        status TEXT,
        idempotency_key TEXT UNIQUE,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `)

    // products
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        marketplace TEXT NOT NULL,
        external_id TEXT,
        title TEXT NOT NULL,
        normalized_specs JSONB,
        price NUMERIC,
        currency TEXT,
        usd_kzt_rate NUMERIC(10,4) NOT NULL DEFAULT 0.0000,
        seller JSONB,
        url TEXT,
        supplier_id UUID REFERENCES suppliers(id) ON UPDATE CASCADE ON DELETE SET NULL,
        snapshot_at TIMESTAMPTZ DEFAULT now()
      );
    `)

    // task_matches
    await client.query(`
      CREATE TABLE IF NOT EXISTS task_matches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        score NUMERIC,
        rank INT,
        selected BOOLEAN DEFAULT FALSE
      );
    `)

    // orders
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
        marketplace TEXT NOT NULL,
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        supplier_id UUID REFERENCES suppliers(id) ON UPDATE CASCADE ON DELETE SET NULL,
        quantity INT NOT NULL,
        unit_price NUMERIC NOT NULL,
        currency TEXT NOT NULL,
        usd_kzt_rate NUMERIC(10,4) NOT NULL DEFAULT 0.0000,
        status TEXT,
        external_order_ref TEXT,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `)

    // idempotency_keys
    await client.query(`
      CREATE TABLE IF NOT EXISTS idempotency_keys (
        key TEXT PRIMARY KEY,
        task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `)

    // audits
    await client.query(`
      CREATE TABLE IF NOT EXISTS audits (
        id BIGSERIAL PRIMARY KEY,
        trace_id TEXT,
        entity_type TEXT,
        entity_id TEXT,
        action TEXT,
        payload JSONB,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `)

    // индексы
    await client.query(`CREATE INDEX IF NOT EXISTS idx_tasks_source ON tasks(source_id);`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_task_matches_task ON task_matches(task_id);`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_task_matches_product ON task_matches(product_id);`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_orders_task ON orders(task_id);`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_orders_product ON orders(product_id);`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_audits_entity_time ON audits(entity_type, created_at);`)

    await client.query('COMMIT')
    console.log('Database migrations completed')
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {})
    console.error('Migration failed', err)
    throw err
  } finally {
    client.release()
  }
}
