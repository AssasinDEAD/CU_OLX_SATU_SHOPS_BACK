import pg from 'pg'
import { config } from '../config/env.js'

const { Pool } = pg

export const adminPool = new Pool({
  host: config.PG_HOST,
  port: config.PG_PORT,
  user: config.PG_USER,
  password: config.PG_PASSWORD,
  database: 'postgres', // системная база
})
