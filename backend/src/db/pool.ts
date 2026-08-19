import 'dotenv/config'
import { Pool, neonConfig } from '@neondatabase/serverless'
import { type QueryResultRow } from 'pg'

// Force connection over HTTPS fetch to bypass network port 5432 restrictions
neonConfig.poolQueryViaFetch = true

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_FILE = path.join(__dirname, '../../db.json')

let isFallbackMode = false

// Initialize db.json if not present
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({
    users: [],
    interviews: [],
    interview_answers: [],
    reports: [],
    password_resets: []
  }, null, 2))
}

function readDb() {
  try {
    const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'))
    if (!data.password_resets) {
      data.password_resets = []
    }
    return data
  } catch {
    return { users: [], interviews: [], interview_answers: [], reports: [], password_resets: [] }
  }
}

function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2))
  } catch (err) {
    console.error('Failed to write to local db.json:', err)
  }
}

console.log('Connecting to DATABASE_URL:', process.env.DATABASE_URL)
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Test the connection at startup
pool.query('SELECT 1')
  .then(() => {
    console.log('[Database] Connected to PostgreSQL Cloud successfully.')
  })
  .catch((err) => {
    console.error('[Database] PostgreSQL connection failed or timed out:', err)
    isFallbackMode = true
  })

pool.on('error', (err: any) => {
  if (!isFallbackMode) {
    console.error('Unexpected error on idle database client:', err)
  }
})

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]): Promise<{ rows: T[] }> {
  if (isFallbackMode) {
    return emulateQuery<T>(text, params || [])
  }
  
  try {
    const result = await pool.query<T>(text, params)
    return result
  } catch (err) {
    console.error('[Database] Query failed on cloud PG, retrying with local fallback...', err)
    isFallbackMode = true
    return emulateQuery<T>(text, params || [])
  }
}

function emulateQuery<T>(text: string, params: any[]): { rows: T[] } {
  const db = readDb()
  const cleanSql = text.toLowerCase().replace(/\s+/g, ' ').trim()

  // 1. SELECT ID FROM USERS WHERE EMAIL = $1
  if (cleanSql.includes('select id from users where email =')) {
    const email = params[0]
    const user = db.users.find((u: any) => u.email === email)
    return { rows: (user ? [{ id: user.id }] : []) as T[] }
  }

  // 2. INSERT INTO USERS (name, email, password_hash)
  if (cleanSql.includes('insert into users (name, email, password_hash)')) {
    const [name, email, passwordHash] = params
    const newUser = {
      id: crypto.randomUUID(),
      name,
      email,
      password_hash: passwordHash,
      role: 'candidate',
      created_at: new Date().toISOString()
    }
    db.users.push(newUser)
    writeDb(db)
    return { rows: [{ id: newUser.id, email: newUser.email, name: newUser.name }] as T[] }
  }

  // 3. SELECT ID, EMAIL, NAME, PASSWORD_HASH FROM USERS WHERE EMAIL = $1
  if (cleanSql.includes('select id, email, name, password_hash from users where email =')) {
    const email = params[0]
    const user = db.users.find((u: any) => u.email === email)
    return { rows: (user ? [user] : []) as T[] }
  }

  // 4. SELECT ID, EMAIL, NAME, ROLE, CREATED_AT FROM USERS WHERE ID = $1
  if (cleanSql.includes('select id, email, name, role, created_at from users where id =')) {
    const id = params[0]
    const user = db.users.find((u: any) => u.id === id)
    return { rows: (user ? [user] : []) as T[] }
  }

  // 5. SELECT I.*, COALESCE(COUNT(A.ID), 0)::INT AS ANSWERED_COUNT FROM INTERVIEWS...
  if (cleanSql.includes('select i.*, coalesce(count(a.id)')) {
    const userId = params[0]
    const userInterviews = db.interviews.filter((i: any) => i.user_id === userId)
    const rows = userInterviews.map((i: any) => {
      const answeredCount = db.interview_answers.filter((a: any) => a.interview_id === i.id).length
      return { ...i, answered_count: answeredCount }
    })
    rows.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return { rows: rows as T[] }
  }

  // 6. INSERT INTO INTERVIEWS
  if (cleanSql.includes('insert into interviews') && cleanSql.includes('returning *')) {
    const [userId, title, targetRole, jobDescription, difficulty, questions] = params
    const newInterview = {
      id: crypto.randomUUID(),
      user_id: userId,
      title,
      target_role: targetRole,
      job_description: jobDescription,
      difficulty,
      questions: JSON.parse(questions),
      status: 'in_progress',
      overall_score: 0,
      created_at: new Date().toISOString()
    }
    db.interviews.push(newInterview)
    writeDb(db)
    return { rows: [newInterview] as T[] }
  }

  // 7. SELECT * FROM INTERVIEWS WHERE ID = $1 AND USER_ID = $2
  if (cleanSql.includes('select * from interviews where id =') && cleanSql.includes('user_id =')) {
    const [id, userId] = params
    const interview = db.interviews.find((i: any) => i.id === id && i.user_id === userId)
    return { rows: (interview ? [interview] : []) as T[] }
  }

  // 8. SELECT * FROM INTERVIEW_ANSWERS WHERE INTERVIEW_ID = $1 ORDER BY CREATED_AT ASC
  if (cleanSql.includes('select * from interview_answers where interview_id =')) {
    const interviewId = params[0]
    const answers = db.interview_answers.filter((a: any) => a.interview_id === interviewId)
    answers.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    return { rows: answers as T[] }
  }

  // 9. INSERT INTO INTERVIEW_ANSWERS
  if (cleanSql.includes('insert into interview_answers') && cleanSql.includes('returning *')) {
    const [interviewId, question, transcript, nlpScore, cvScore, feedback] = params
    const newAnswer = {
      id: crypto.randomUUID(),
      interview_id: interviewId,
      question,
      transcript,
      nlp_score: nlpScore,
      cv_score: cvScore,
      feedback: JSON.parse(feedback),
      created_at: new Date().toISOString()
    }
    db.interview_answers.push(newAnswer)
    writeDb(db)
    return { rows: [newAnswer] as T[] }
  }

  // 10. SELECT AVG((NLP_SCORE + CV_SCORE) / 2.0) AS AVG_SCORE, COUNT(*) AS TOTAL FROM INTERVIEW_ANSWERS...
  if (cleanSql.includes('select avg((nlp_score + cv_score)')) {
    const interviewId = params[0]
    const answers = db.interview_answers.filter((a: any) => a.interview_id === interviewId)
    const total = answers.length
    const sum = answers.reduce((acc: number, curr: any) => acc + (Number(curr.nlp_score) + Number(curr.cv_score)) / 2.0, 0)
    const avgScore = total > 0 ? (sum / total).toFixed(2) : "0"
    return { rows: [{ avg_score: avgScore, total: total.toString() }] as T[] }
  }

  // 11. UPDATE INTERVIEWS SET OVERALL_SCORE = $1, STATUS = $2 WHERE ID = $3
  if (cleanSql.includes('update interviews set overall_score =') && cleanSql.includes('status =')) {
    const [overallScore, status, id] = params
    const interview = db.interviews.find((i: any) => i.id === id)
    if (interview) {
      interview.overall_score = overallScore
      interview.status = status
      writeDb(db)
    }
    return { rows: [] as T[] }
  }

  // 12. SELECT ID, TARGET_ROLE, DIFFICULTY, JOB_DESCRIPTION, QUESTIONS FROM INTERVIEWS WHERE ID = $1 AND USER_ID = $2
  if (cleanSql.includes('select id, target_role, difficulty, job_description, questions from interviews')) {
    const [id, userId] = params
    const interview = db.interviews.find((i: any) => i.id === id && i.user_id === userId)
    return { rows: (interview ? [interview] : []) as T[] }
  }

  // 13. SELECT TRANSCRIPT, FEEDBACK FROM INTERVIEW_ANSWERS WHERE INTERVIEW_ID = $1
  if (cleanSql.includes('select transcript, feedback from interview_answers where interview_id =')) {
    const interviewId = params[0]
    const answers = db.interview_answers.filter((a: any) => a.interview_id === interviewId)
    answers.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    const rows = answers.map((a: any) => ({ transcript: a.transcript, feedback: a.feedback }))
    return { rows: rows as T[] }
  }

  // 14. UPDATE INTERVIEWS SET QUESTIONS = $1 WHERE ID = $2
  if (cleanSql.includes('update interviews set questions =') && cleanSql.includes('where id =')) {
    const [questions, id] = params
    const interview = db.interviews.find((i: any) => i.id === id)
    if (interview) {
      interview.questions = JSON.parse(questions)
      writeDb(db)
    }
    return { rows: [] as T[] }
  }

  // 15. SELECT ID, TARGET_ROLE FROM INTERVIEWS WHERE ID = $1 AND USER_ID = $2
  if (cleanSql.includes('select id, target_role from interviews where id =')) {
    const [id, userId] = params
    const interview = db.interviews.find((i: any) => i.id === id && i.user_id === userId)
    return { rows: (interview ? [interview] : []) as T[] }
  }

  // 16. SELECT QUESTION, TRANSCRIPT, NLP_SCORE, CV_SCORE, FEEDBACK FROM INTERVIEW_ANSWERS WHERE INTERVIEW_ID = $1
  if (cleanSql.includes('select question, transcript, nlp_score, cv_score, feedback from interview_answers')) {
    const interviewId = params[0]
    const answers = db.interview_answers.filter((a: any) => a.interview_id === interviewId)
    const rows = answers.map((a: any) => ({
      question: a.question,
      transcript: a.transcript,
      nlp_score: a.nlp_score,
      cv_score: a.cv_score,
      feedback: a.feedback
    }))
    return { rows: rows as T[] }
  }

  // 17. INSERT INTO REPORTS
  if (cleanSql.includes('insert into reports') && cleanSql.includes('returning *')) {
    const [interviewId, summary, strengths, risks, recommendation, analysis] = params
    const newReport = {
      id: crypto.randomUUID(),
      interview_id: interviewId,
      summary,
      strengths: JSON.parse(strengths || '[]'),
      risks: JSON.parse(risks || '[]'),
      recommendation,
      analysis: analysis ? JSON.parse(analysis) : {},
      created_at: new Date().toISOString()
    }
    db.reports.push(newReport)
    writeDb(db)
    return { rows: [newReport] as T[] }
  }

  // 18. SELECT R.*, I.TITLE, I.TARGET_ROLE... FROM REPORTS
  if (cleanSql.includes('select r.*, i.title, i.target_role')) {
    const rows = db.reports.map((r: any) => {
      const interview = db.interviews.find((i: any) => i.id === r.interview_id)
      return {
        ...r,
        title: interview ? interview.title : 'Deleted Interview',
        target_role: interview ? interview.target_role : 'N/A',
        overall_score: interview ? interview.overall_score : 0,
        status: interview ? interview.status : 'completed',
        interview_created_at: interview ? interview.created_at : r.created_at
      }
    })
    rows.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return { rows: rows as T[] }
  }

  // 19. INSERT INTO PASSWORD_RESETS
  if (cleanSql.includes('insert into password_resets')) {
    const [email, otp, expiresAt] = params
    const newReset = {
      id: crypto.randomUUID(),
      email,
      otp,
      expires_at: expiresAt,
      created_at: new Date().toISOString()
    }
    db.password_resets.push(newReset)
    writeDb(db)
    return { rows: [newReset] as T[] }
  }

  // 20. SELECT * FROM PASSWORD_RESETS WHERE EMAIL = $1 AND OTP = $2
  if (cleanSql.includes('select * from password_resets where email =') && cleanSql.includes('otp =')) {
    const [email, otp] = params
    const resets = db.password_resets.filter((r: any) => r.email === email && r.otp === otp)
    resets.sort((a: any, b: any) => new Date(b.expires_at).getTime() - new Date(a.expires_at).getTime())
    return { rows: resets as T[] }
  }

  // 21. DELETE FROM PASSWORD_RESETS WHERE EMAIL = $1
  if (cleanSql.includes('delete from password_resets where email =')) {
    const email = params[0]
    db.password_resets = db.password_resets.filter((r: any) => r.email !== email)
    writeDb(db)
    return { rows: [] }
  }

  // 22. UPDATE USERS SET PASSWORD_HASH = $1 WHERE EMAIL = $2
  if (cleanSql.includes('update users set password_hash =') && cleanSql.includes('where email =')) {
    const [passwordHash, email] = params
    const user = db.users.find((u: any) => u.email === email)
    if (user) {
      user.password_hash = passwordHash
      writeDb(db)
    }
    return { rows: [] }
  }

  return { rows: [] }
}
