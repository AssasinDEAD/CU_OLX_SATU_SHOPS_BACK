import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: resolve(__dirname, '../../.env') })

export const config = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: Number(process.env.PORT),

  FRONTEND_URL: process.env.FRONTEND_URL,

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRY: process.env.JWT_EXPIRY,

  ESPO_URL: process.env.ESPO_URL,
  ESPO_API_KEY: process.env.ESPO_API_KEY,

  PG_HOST: process.env.PG_HOST,
  PG_PORT: Number(process.env.PG_PORT),
  PG_USER: process.env.PG_USER,
  PG_PASSWORD: String(process.env.PG_PASSWORD),
  PG_DATABASE: process.env.PG_DATABASE,

  OLX_API_URL: process.env.OLX_API_URL,
  SATU_API_URL: process.env.SATU_API_URL,

  CURRENCY_SOURCE_URL: process.env.CURRENCY_SOURCE_URL
}
