import { runMigrations } from './migrations/migrations.js'

async function main() {
  try {
    await runMigrations()
    console.log('✅ All migrations applied successfully')
    process.exit(0)
  } catch (err) {
    console.error('❌ Migration runner failed:', err)
    process.exit(1)
  }
}

main()
