import 'dotenv/config'
import pg from 'pg'

const newUrl = 'postgresql://neondb_owner:npg_IVL16MKjaybp@ep-raspy-sound-ap78cr8t-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
const oldUrl = 'postgresql://neondb_owner:npg_kdqX0aQ3tnPN@ep-withered-flower-apnqrsn5-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

async function checkDbs() {
  console.log('Checking database contents...')
  
  // Check Old Db
  try {
    const poolOld = new pg.Pool({ connectionString: oldUrl, ssl: { rejectUnauthorized: false } })
    const resultOld = await poolOld.query('SELECT id, name, email FROM users ORDER BY created_at DESC LIMIT 5')
    console.log('--- LATEST IN OLD DB (Withered Flower) ---')
    console.table(resultOld.rows)
    await poolOld.end()
  } catch (e) {
    console.error('Error querying old DB:', (e as Error).message)
  }

  // Check New Db
  try {
    const poolNew = new pg.Pool({ connectionString: newUrl, ssl: { rejectUnauthorized: false } })
    const resultNew = await poolNew.query('SELECT id, name, email FROM users ORDER BY created_at DESC LIMIT 5')
    console.log('--- LATEST IN NEW DB (Raspy Sound) ---')
    console.table(resultNew.rows)
    await poolNew.end()
  } catch (e) {
    console.error('Error querying new DB:', (e as Error).message)
  }
}

checkDbs()
