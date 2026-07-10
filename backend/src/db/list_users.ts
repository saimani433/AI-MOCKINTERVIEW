import 'dotenv/config'
import { pool } from './pool.js'

try {
  const result = await pool.query('SELECT id, name, email, role, created_at FROM users')
  console.log('--- Registered Users in Database ---')
  console.table(result.rows)
} catch (error) {
  console.error('Error fetching users:', error)
} finally {
  await pool.end()
}
