import { config } from '../config/env.js'
import { adminPool } from './adminPool.js'

export async function ensureDatabaseExists() {
  if (!config.PG_PASSWORD || typeof config.PG_PASSWORD !== 'string') {
    throw new Error('PG_PASSWORD is missing or invalid string')
  }

  const dbName = config.PG_DATABASE
  const res = await adminPool.query(
    `SELECT 1 FROM pg_database WHERE datname = $1`,
    [dbName]
  )

  if (res.rowCount === 0) {
    console.log(`⚠️ Database "${dbName}" not found, creating...`)
    await adminPool.query(`CREATE DATABASE "${dbName}"`)
    console.log(`✅ Database "${dbName}" created`)
  } else {
    console.log(`✅ Database "${dbName}" already exists`)
  }
}
