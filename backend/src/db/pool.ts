import 'dotenv/config'
import pg, { type QueryResultRow } from 'pg'

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client:', err)
})

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]) {
  const result = await pool.query<T>(text, params)
  return result
}
