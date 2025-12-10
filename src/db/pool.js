import pg from 'pg'
import { config } from '../config/env.js'

const { Pool } = pg

export const pool = new Pool({
  host: config.PG_HOST,
  port: config.PG_PORT,
  user: config.PG_USER,
  password: config.PG_PASSWORD,
  database: config.PG_DATABASE,
  max: 10,
  idleTimeoutMillis: 30000,
})

export async function getClient() {
  return pool.connect()
}
