import multer from 'multer'
import { Router } from 'express'
import { z } from 'zod'
import mammoth from 'mammoth'
import { requireAuth } from '../middleware/auth.js'
import { analyzeResume, generateRoadmap } from '../services/openrouter.js'

const router = Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter(_req, file, callback) {
    const isDocx =
      file.originalname.toLowerCase().endsWith('.docx') &&
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

    if (!isDocx) {
      callback(new Error('Only .docx resume files are allowed.'))
      return
    }

    callback(null, true)
  },
})

router.use(requireAuth)

const roadmapSchema = z.object({
  goal: z.string().min(2),
  currentLevel: z.string().min(2),
  timeline: z.string().min(2),
  hoursPerWeek: z.number().int().min(1).max(80),
})

router.post('/resume/analyze', upload.single('resume'), async (req, res) => {
  const targetRole = String(req.body.targetRole || 'Software Developer')
  const pastedText = String(req.body.resumeText || '')
  if (!req.file && pastedText.trim().length < 80) {
    return res.status(400).json({
      message: 'Upload a .docx resume file. PDF, DOC, TXT, and other formats are not allowed.',
    })
  }

  const fileText = req.file ? (await mammoth.extractRawText({ buffer: req.file.buffer })).value : ''
  const resumeText = `${pastedText}\n${fileText}`.trim()

  if (resumeText.length < 80) {
    return res.status(400).json({
      message: 'Resume content is too short. Use a .docx resume and paste text if the file content cannot be read.',
    })
  }

  const result = await analyzeResume({
    fileName: req.file?.originalname || 'pasted-resume',
    resumeText: resumeText.slice(0, 18000),
    targetRole,
  })

  res.json({
    ...(typeof result === 'object' && result ? result : {}),
    sourceFile: req.file?.originalname || 'pasted-resume',
    extractedCharacters: resumeText.length,
    resumePreview: resumeText.slice(0, 180),
  })
})

router.post('/roadmap/generate', async (req, res) => {
  const input = roadmapSchema.parse(req.body)
  const result = await generateRoadmap(input)
  res.json(result)
})

export { router as careerRouter }
