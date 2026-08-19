import bcrypt from 'bcryptjs'
import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import nodemailer from 'nodemailer'
import { query } from '../db/pool.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'

const router = Router()

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const isSmtpConfigured = () => {
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  return (
    user &&
    pass &&
    user !== 'your-email@gmail.com' &&
    pass !== 'your-google-app-password' &&
    pass !== 'your-gmail-app-password-here' &&
    pass.trim() !== ''
  )
}


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

const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body)
    
    // Check if user exists
    const userResult = await query<{ id: string }>('select id from users where email = $1', [email])
    if (!userResult.rows[0]) {
      return res.status(404).json({ message: 'No account with this email address exists.' })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

    await query(
      'insert into password_resets (email, otp, expires_at) values ($1, $2, $3)',
      [email, otp, expiresAt]
    )

    if (isSmtpConfigured()) {
      try {
        await transporter.sendMail({
          from: `"VocaVision AI" <${process.env.SMTP_USER}>`,
          to: email,
          subject: 'Reset your password - VocaVision AI',
          text: `Your password reset code is: ${otp}. This code will expire in 10 minutes.`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
              <h2 style="color: #2b2b2b; text-align: center;">VocaVision AI Password Reset</h2>
              <p>Hello,</p>
              <p>We received a request to reset the password for your account. Please use the following One-Time Password (OTP) to proceed:</p>
              <div style="background-color: #f7f7f7; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4f46e5;">${otp}</span>
              </div>
              <p style="color: #666; font-size: 14px;">This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
              <p style="color: #999; font-size: 12px; text-align: center;">VocaVision AI Interview Platform</p>
            </div>
          `,
        })
        console.log(`[SMTP] Real OTP email sent to ${email}`)
      } catch (mailErr) {
        console.error('SMTP email sending failed. Falling back to console log...', mailErr)
        console.log(`\n========================================\n[OTP EMAIL FALLBACK]\nSent OTP to: ${email}\nOTP Code: ${otp}\n========================================\n`)
      }
    } else {
      console.log(`\n========================================\n[OTP EMAIL SIMULATOR]\nSent OTP to: ${email}\nOTP Code: ${otp}\n========================================\n`)
    }

    res.json({ message: 'OTP sent successfully to your email.' })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.issues[0]?.message || 'Invalid input' })
    }
    console.error('Forgot password error:', error)
    res.status(500).json({ message: 'Failed to process forgot password request.' })
  }
})

const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  newPassword: z.string().min(6),
})

router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = resetPasswordSchema.parse(req.body)

    // Verify OTP
    const resetResult = await query<{ email: string; otp: string; expires_at: string }>(
      'select * from password_resets where email = $1 and otp = $2',
      [email, otp]
    )
    const resetRecord = resetResult.rows[0]

    if (!resetRecord) {
      return res.status(400).json({ message: 'Invalid OTP or email address.' })
    }

    if (new Date(resetRecord.expires_at) < new Date()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' })
    }

    // Update password
    const passwordHash = await bcrypt.hash(newPassword, 12)
    await query('update users set password_hash = $1 where email = $2', [passwordHash, email])

    // Cleanup OTPs
    await query('delete from password_resets where email = $1', [email])

    res.json({ message: 'Password has been reset successfully. You can now login.' })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.issues[0]?.message || 'Invalid input' })
    }
    console.error('Reset password error:', error)
    res.status(500).json({ message: 'Failed to reset password.' })
  }
})

export { router as authRouter }
