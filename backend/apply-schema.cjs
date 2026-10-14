const fs = require('fs')
const path = require('path')
const mysql = require('mysql2/promise')

async function run() {
  const sqlFile = path.join(__dirname, '..', 'database', 'schema.sql')
  const sql = fs.readFileSync(sqlFile, 'utf8')

  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '1234',
    multipleStatements: true,
  })

  try {
    console.log('Applying schema...')
    await conn.query(sql)
    console.log('Schema applied.')

    const [tables] = await conn.query('SHOW TABLES IN campus_access_pass')
    if (tables.length === 0) {
      console.log('WARNING: No tables found after schema run.')
    } else {
      console.log('Tables created:', tables.map(t => Object.values(t)[0]).join(', '))
    }
  } catch (err) {
    console.error('Schema error:', err.message)
  } finally {
    await conn.end()
  }
}

run()
