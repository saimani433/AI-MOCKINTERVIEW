import bcrypt from 'bcryptjs'
import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { query } from '../db/pool.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'

const router = Router()

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

function createToken(user: { id: string; email: string }) {
  return jwt.sign(user, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' })
}

router.post('/signup', async (req, res) => {
  const input = signupSchema.parse(req.body)
  const passwordHash = await bcrypt.hash(input.password, 12)
  const existing = await query<{ id: string }>('select id from users where email = $1', [input.email])
  if (existing.rows[0]) {
    return res.status(409).json({ message: 'An account with this email already exists. Login instead.' })
  }

  const result = await query<{ id: string; email: string; name: string }>(
    'insert into users (name, email, password_hash) values ($1, $2, $3) returning id, email, name',
    [input.name, input.email, passwordHash],
  )
  const user = result.rows[0]
  res.status(201).json({ user, token: createToken(user) })
})

router.post('/login', async (req, res) => {
  const input = loginSchema.parse(req.body)
  const result = await query<{ id: string; email: string; name: string; password_hash: string }>(
    'select id, email, name, password_hash from users where email = $1',
    [input.email],
  )
  const user = result.rows[0]
  if (!user || !(await bcrypt.compare(input.password, user.password_hash))) {
    return res.status(401).json({ message: 'Invalid email or password' })
  }

  res.json({
    user: { id: user.id, email: user.email, name: user.name },
    token: createToken({ id: user.id, email: user.email }),
  })
})

router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  const result = await query<{ id: string; email: string; name: string; role: string; created_at: string }>(
    'select id, email, name, role, created_at from users where id = $1',
    [req.user?.id],
  )
  res.json(result.rows[0])
})

export { router as authRouter }
