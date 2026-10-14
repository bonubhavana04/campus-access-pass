// Verify all backend prerequisites before starting the server
require('dotenv').config()
const mysql = require('mysql2/promise')

async function verify() {
  const checks = []

  // 1. JWT_SECRET
  const secret = process.env.JWT_SECRET
  if (secret && secret.length >= 32) {
    checks.push('✓ JWT_SECRET set (' + secret.length + ' chars)')
  } else {
    checks.push('✗ JWT_SECRET missing or too short (need >= 32 chars, got: ' + (secret?.length ?? 0) + ')')
  }

  // 2. DB config
  checks.push('✓ DB_HOST=' + (process.env.DB_HOST || 'localhost'))
  checks.push('✓ DB_PORT=' + (process.env.DB_PORT || '3306'))
  checks.push('✓ DB_USER=' + (process.env.DB_USER || 'root'))
  checks.push('✓ DB_NAME=' + (process.env.DB_NAME || 'campus_access_pass'))
  checks.push('✓ PORT=' + (process.env.PORT || '5000'))

  // 3. DB connection
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'campus_access_pass',
    })
    const [tables] = await conn.query('SHOW TABLES')
    checks.push('✓ DB connected — ' + tables.length + ' tables found')
    await conn.end()
  } catch (e) {
    checks.push('✗ DB connection failed: ' + e.message)
  }

  checks.forEach(c => console.log(c))
}

verify()
