import { Router } from 'express'
import { z } from 'zod'
import { query } from '../db/pool.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

const reportSchema = z.object({
  interviewId: z.string().uuid(),
  summary: z.string().min(10),
  strengths: z.array(z.string()).default([]),
  risks: z.array(z.string()).default([]),
  recommendation: z.string().min(3),
})

router.get('/', async (_req, res) => {
  const result = await query(
    `select r.*, i.title, i.target_role, i.overall_score, i.status, i.created_at as interview_created_at
     from reports r
     join interviews i on i.id = r.interview_id
     order by r.created_at desc
     limit 25`,
  )
  res.json(result.rows)
})

router.post('/', async (req, res) => {
  const input = reportSchema.parse(req.body)
  const result = await query(
    `insert into reports (interview_id, summary, strengths, risks, recommendation)
     values ($1, $2, $3, $4, $5) returning *`,
    [input.interviewId, input.summary, JSON.stringify(input.strengths), JSON.stringify(input.risks), input.recommendation],
  )
  res.status(201).json(result.rows[0])
})

export { router as reportsRouter }
