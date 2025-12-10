import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: resolve(__dirname, '../../.env') })

export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 3001,

  FRONTEND_URL: process.env.FRONTEND_URL,

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRY: process.env.JWT_EXPIRY || '1h',

  ESPO_URL: process.env.ESPO_URL,
  ESPO_API_KEY: process.env.ESPO_API_KEY,

  PG_HOST: process.env.PG_HOST || 'db',
  PG_PORT: Number(process.env.PG_PORT) || 5432,
  PG_USER: process.env.PG_USER || 'postgres',
  PG_PASSWORD: String(process.env.PG_PASSWORD || 'postgres'),
  PG_DATABASE: process.env.PG_DATABASE || 'shopdb',

  OLX_API_URL: process.env.OLX_API_URL,
  SATU_API_URL: process.env.SATU_API_URL,

  CURRENCY_SOURCE_URL: process.env.CURRENCY_SOURCE_URL
}
