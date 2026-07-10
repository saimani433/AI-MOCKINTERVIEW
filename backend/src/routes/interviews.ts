import axios from 'axios'
import { Router } from 'express'
import { z } from 'zod'
import { query } from '../db/pool.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'
import { analyzeAnswer, buildInterviewReport, generateInterviewQuestions, generateNextQuestion } from '../services/openrouter.js'

const router = Router()
router.use(requireAuth)

const interviewSchema = z.object({
  title: z.string().min(3),
  targetRole: z.string().min(2),
  jobDescription: z.string().default(''),
  difficulty: z.string().default('intermediate'),
  questionCount: z.number().int().min(1).max(10).default(1),
})

const answerSchema = z.object({
  interviewId: z.string().uuid(),
  role: z.string(),
  question: z.string(),
  transcript: z.string(),
  visualSignals: z.record(z.string(), z.unknown()).optional(),
})

router.get('/', async (req: AuthRequest, res) => {
  const result = await query(
    `select i.*,
      coalesce(count(a.id), 0)::int as answered_count
     from interviews i
     left join interview_answers a on a.interview_id = i.id
     where i.user_id = $1
     group by i.id
     order by i.created_at desc
     limit 25`,
    [req.user?.id],
  )
  res.json(result.rows)
})

router.post('/', async (req: AuthRequest, res) => {
  const input = interviewSchema.parse(req.body)
  const generated = await generateInterviewQuestions({
    targetRole: input.targetRole,
    difficulty: input.difficulty,
    jobDescription: input.jobDescription,
    count: input.questionCount,
  })
  const result = await query(
    `insert into interviews (user_id, title, target_role, job_description, difficulty, questions, status)
     values ($1, $2, $3, $4, $5, $6, 'in_progress') returning *`,
    [req.user?.id, input.title, input.targetRole, input.jobDescription, input.difficulty, JSON.stringify(generated.questions)],
  )
  res.status(201).json(result.rows[0])
})

router.post('/generate-questions', async (req, res) => {
  const input = interviewSchema.pick({ targetRole: true, jobDescription: true, difficulty: true, questionCount: true }).parse(req.body)
  const generated = await generateInterviewQuestions({
    targetRole: input.targetRole,
    difficulty: input.difficulty,
    jobDescription: input.jobDescription,
    count: input.questionCount,
  })
  res.json(generated)
})

router.get('/:id', async (req: AuthRequest, res) => {
  const interview = await query('select * from interviews where id = $1 and user_id = $2', [req.params.id, req.user?.id])
  if (!interview.rows[0]) return res.status(404).json({ message: 'Interview not found' })

  const answers = await query(
    'select * from interview_answers where interview_id = $1 order by created_at asc',
    [req.params.id],
  )
  res.json({ interview: interview.rows[0], answers: answers.rows })
})

router.post('/analyze-answer', async (req, res) => {
  const input = answerSchema.parse(req.body)

  const aiResult = await analyzeAnswer(input)
  let cvResult = { attention: 86, posture: 88, confidence: 91 }

  if (process.env.PYTHON_AI_SERVICE_URL) {
    try {
      const response = await axios.post(`${process.env.PYTHON_AI_SERVICE_URL}/analyze-visuals`, {
        visualSignals: input.visualSignals || {},
      })
      cvResult = response.data
    } catch {
      cvResult = { attention: 86, posture: 88, confidence: 91 }
    }
  }

  const cvScore = Math.round((Number(cvResult.attention) + Number(cvResult.posture) + Number(cvResult.confidence)) / 3)
  const nlpScore = Number(aiResult.score || 86)
  const result = await query(
    `insert into interview_answers (interview_id, question, transcript, nlp_score, cv_score, feedback)
     values ($1, $2, $3, $4, $5, $6) returning *`,
    [input.interviewId, input.question, input.transcript, nlpScore, cvScore, JSON.stringify({ aiResult, cvResult })],
  )

  const aggregate = await query<{ avg_score: string; total: string }>(
    `select avg((nlp_score + cv_score) / 2.0)::numeric(10,2) as avg_score, count(*) as total
     from interview_answers
     where interview_id = $1`,
    [input.interviewId],
  )
  await query('update interviews set overall_score = $1, status = $2 where id = $3', [
    Number(aggregate.rows[0]?.avg_score || 0),
    'in_progress',
    input.interviewId,
  ])

  res.status(201).json({ answer: result.rows[0], aiResult, cvResult })
})

router.post('/:id/next-question', async (req: AuthRequest, res) => {
  const interviewResult = await query<{
    id: string
    target_role: string
    difficulty: string
    job_description: string
    questions: Array<{ question: string }>
  }>('select id, target_role, difficulty, job_description, questions from interviews where id = $1 and user_id = $2', [
    req.params.id,
    req.user?.id,
  ])
  const interview = interviewResult.rows[0]
  if (!interview) return res.status(404).json({ message: 'Interview not found' })

  const answers = await query<{
    transcript: string
    feedback: unknown
  }>('select transcript, feedback from interview_answers where interview_id = $1 order by created_at asc', [req.params.id])

  const previous = answers.rows[answers.rows.length - 1]
  const existingQuestions = Array.isArray(interview.questions) ? interview.questions : []
  const nextQuestion = await generateNextQuestion({
    targetRole: interview.target_role,
    difficulty: interview.difficulty,
    jobDescription: interview.job_description,
    questionNumber: existingQuestions.length + 1,
    askedQuestions: existingQuestions.map((item) => item.question),
    previousAnswer: previous?.transcript || '',
    previousFeedback: previous?.feedback,
  })

  const updatedQuestions = [...existingQuestions, nextQuestion]
  await query('update interviews set questions = $1 where id = $2', [JSON.stringify(updatedQuestions), req.params.id])

  res.json({ question: nextQuestion, questions: updatedQuestions })
})

router.post('/:id/complete', async (req: AuthRequest, res) => {
  const interviewResult = await query<{ id: string; target_role: string }>(
    'select id, target_role from interviews where id = $1 and user_id = $2',
    [req.params.id, req.user?.id],
  )
  const interview = interviewResult.rows[0]
  if (!interview) return res.status(404).json({ message: 'Interview not found' })

  const answers = await query<{
    question: string
    transcript: string
    nlp_score: number
    cv_score: number
    feedback: unknown
  }>('select question, transcript, nlp_score, cv_score, feedback from interview_answers where interview_id = $1', [req.params.id])

  const report = await buildInterviewReport({ targetRole: interview.target_role, answers: answers.rows })
  const saved = await query(
    `insert into reports (interview_id, summary, strengths, risks, recommendation, analysis)
     values ($1, $2, $3, $4, $5, $6) returning *`,
    [
      req.params.id,
      report.summary,
      JSON.stringify(report.strengths || []),
      JSON.stringify(report.risks || []),
      report.recommendation || report.decision || 'Review recommended',
      JSON.stringify(report),
    ],
  )

  await query('update interviews set status = $1, completed_at = now(), overall_score = $2 where id = $3', [
    'completed',
    Number(report.roleFitScore || report.overallEvaluation?.interviewScore || 0),
    req.params.id,
  ])

  res.json({ report: saved.rows[0], analysis: report })
})

export { router as interviewsRouter }
