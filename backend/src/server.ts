import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { ZodError } from 'zod'
import { authRouter } from './routes/auth.js'
import { interviewsRouter } from './routes/interviews.js'
import { reportsRouter } from './routes/reports.js'
import { careerRouter } from './routes/career.js'

const app = express()
const port = Number(process.env.PORT || 5000)

const allowedOrigins = new Set([
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5188',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5188',
].filter(Boolean))

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true)

    if (
      allowedOrigins.has(origin) ||
      origin.endsWith('.loca.lt') ||
      origin.endsWith('.ngrok-free.app') ||
      origin.endsWith('.ngrok.io') ||
      origin === 'capacitor://localhost' ||
      /^http:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(origin)
    ) {
      return callback(null, true)
    }

    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true)
    }

    callback(new Error(`CORS blocked origin: ${origin}`))
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'bypass-tunnel-reminder', 'ngrok-skip-browser-warning', 'x-requested-with'],
}))
app.use(express.json({ limit: '10mb' }))

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'vocavision-api' })
})

app.use('/api/auth', authRouter)
app.use('/api/interviews', interviewsRouter)
app.use('/api/reports', reportsRouter)
app.use('/api/career', careerRouter)

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ message: 'Validation failed', issues: err.issues })
  }
  if (err instanceof Error && err.message.includes('Only .docx')) {
    return res.status(400).json({ message: err.message })
  }
  console.error(err)
  res.status(500).json({ message: 'Something went wrong' })
})

app.listen(port, () => {
  console.log(`VocaVision API running on http://localhost:${port}`)
})
