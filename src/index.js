import express from 'express'
import { config } from './config/env.js'
import { ensureDatabaseExists } from './db/ensureDatabase.js'
import { runMigrations } from './db/migrations/migrations.js'
import { pool } from './db/pool.js'

const app = express()
app.use(express.json())

// Healthcheck
app.get('/health', async (req, res) => {
  try {
    const client = await pool.connect()
    await client.query('SELECT 1')
    client.release()
    res.json({
      status: 'ok',
      db: 'connected',
      port: config.PORT,
      timestamp: new Date().toISOString()
    })
  } catch (err) {
    res.json({
      status: 'ok',
      db: 'unavailable',
      port: config.PORT,
      timestamp: new Date().toISOString()
    })
  }
})

async function startServer() {
  try {
    await ensureDatabaseExists()   // проверяем/создаём базу
    await runMigrations()          // создаём таблицы
    console.log('✅ Миграции выполнены')
  } catch (err) {
    console.error('⚠️ Ошибка миграций:', err.message)
  }

  app.listen(config.PORT, '0.0.0.0', () => {
    console.log(`🚀 API запущен на порту ${config.PORT}`)
  })
}

startServer()
