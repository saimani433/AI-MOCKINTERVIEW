import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { pool } from './pool.js'

async function createUser() {
  const name = 'NewTestUser'
  const email = 'newtestuser@gmail.com'
  const password = 'password123'
  
  // Hash password
  const passwordHash = await bcrypt.hash(password, 12)
  
  let retries = 5
  while (retries > 0) {
    try {
      console.log(`Connecting to database... (Attempts remaining: ${retries})`)
      
      // Check if exists
      const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email])
      if (existing.rows[0]) {
        console.log(`User ${email} already exists in the database.`)
        break
      }

      // Insert user
      const result = await pool.query(
        'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
        [name, email, passwordHash]
      )
      console.log('User created successfully in database:', result.rows[0])
      break
    } catch (error) {
      console.error(`Connection failed: ${(error as Error).message}`)
      retries--
      if (retries === 0) {
        console.error('All retries exhausted.')
      } else {
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }
  }
  
  await pool.end()
}

createUser()
