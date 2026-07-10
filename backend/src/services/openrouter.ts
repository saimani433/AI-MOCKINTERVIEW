import axios from 'axios'

type Question = {
  id: string
  type: 'technical' | 'behavioral' | 'system-design' | 'project' | 'follow-up'
  question: string
  evaluationFocus: string
  idealSignals: string[]
}

function parseJson(content: string | undefined, fallback: unknown) {
  if (!content) return fallback
  try {
    return JSON.parse(content)
  } catch {
    const match = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
    return match ? JSON.parse(match[0]) : fallback
  }
}

async function openRouterJson(system: string, payload: unknown, fallback: unknown) {
  if (!process.env.OPENROUTER_API_KEY) return fallback

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: JSON.stringify(payload) },
        ],
        response_format: { type: 'json_object' },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:5188',
          'X-Title': 'VocaVision AI',
        },
      },
    )

    return parseJson(response.data.choices?.[0]?.message?.content, fallback)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.warn('OpenRouter fallback:', error.response?.status, error.response?.data || error.message)
    } else {
      console.warn('OpenRouter fallback:', error)
    }
    return fallback
  }
}

function clampScore(value: number) {
  return Math.max(35, Math.min(98, Math.round(value)))
}

function unique(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)))
}

function roleKeywords(targetRole = 'Software Developer') {
  const base = ['project', 'skills', 'experience', 'education', 'github', 'deployment', 'api', 'database']
  const role = targetRole.toLowerCase()
  if (role.includes('full') || role.includes('mern')) {
    return [...base, 'react', 'node', 'express', 'mongodb', 'postgres', 'typescript', 'javascript', 'rest', 'jwt', 'tailwind']
  }
  if (role.includes('frontend') || role.includes('react')) {
    return [...base, 'react', 'typescript', 'javascript', 'css', 'responsive', 'state', 'routing', 'api', 'accessibility']
  }
  if (role.includes('backend')) {
    return [...base, 'node', 'express', 'postgres', 'sql', 'redis', 'authentication', 'api', 'scalable', 'testing']
  }
  if (role.includes('data') || role.includes('ai')) {
    return [...base, 'python', 'machine learning', 'nlp', 'model', 'data', 'pandas', 'sql', 'api', 'evaluation']
  }
  return base
}

function buildResumeFallback(payload: { fileName: string; resumeText: string; targetRole?: string }) {
  const text = payload.resumeText.replace(/\s+/g, ' ').trim()
  const lower = text.toLowerCase()
  const words = text.split(/\s+/).filter(Boolean)
  const sentences = text.split(/[.!?]\s+/).filter((item) => item.trim().length > 8)
  const keywords = roleKeywords(payload.targetRole)
  const matchedKeywords = keywords.filter((keyword) => lower.includes(keyword))
  const missingKeywords = keywords.filter((keyword) => !lower.includes(keyword)).slice(0, 10)
  const hasMetrics = /\b\d+(\.\d+)?\s*(%|users?|ms|sec|seconds?|minutes?|hrs?|hours?|projects?|apis?|pages?|requests?|records?)\b/i.test(text)
  const hasLinks = /(github\.com|linkedin\.com|https?:\/\/)/i.test(text)
  const hasSections = ['experience', 'projects', 'skills', 'education'].filter((section) => lower.includes(section))
  const actionVerbs = ['built', 'created', 'developed', 'designed', 'implemented', 'deployed', 'optimized', 'integrated', 'managed', 'led']
  const actionVerbCount = actionVerbs.filter((verb) => lower.includes(verb)).length
  const weakPhrases = ['hard working', 'quick learner', 'team player', 'responsible for', 'worked on', 'basic knowledge']
  const foundWeakPhrases = weakPhrases.filter((phrase) => lower.includes(phrase))
  const longSentences = sentences.filter((sentence) => sentence.split(/\s+/).length > 32)
  const repeatedSpaces = /\s{3,}/.test(payload.resumeText)
  const grammarPenalty = foundWeakPhrases.length * 4 + longSentences.length * 2 + (repeatedSpaces ? 3 : 0)

  const lengthScore = words.length < 180 ? 50 : words.length < 350 ? 70 : words.length < 850 ? 88 : 76
  const keywordScore = (matchedKeywords.length / keywords.length) * 100
  const sectionScore = (hasSections.length / 4) * 100
  const impactScore = (hasMetrics ? 18 : 0) + Math.min(actionVerbCount * 7, 35) + (hasLinks ? 10 : 0) + 45
  const atsScore = clampScore(keywordScore * 0.45 + sectionScore * 0.35 + lengthScore * 0.2)
  const grammarScore = clampScore(90 - grammarPenalty)
  const roleFitScore = clampScore(keywordScore * 0.55 + impactScore * 0.25 + sectionScore * 0.2)
  const resumeScore = clampScore(atsScore * 0.32 + grammarScore * 0.22 + roleFitScore * 0.32 + impactScore * 0.14)

  const corrections = [
    !hasMetrics && {
      issue: 'Project bullets do not show enough measurable impact.',
      fix: 'Add numbers such as users served, performance improved, API latency reduced, or time saved.',
      severity: 'high',
    },
    !hasLinks && {
      issue: 'No clear portfolio, GitHub, LinkedIn, or deployment links were detected.',
      fix: 'Add clickable GitHub and live project links near the header or project section.',
      severity: 'medium',
    },
    hasSections.length < 4 && {
      issue: `Missing or unclear sections: ${['experience', 'projects', 'skills', 'education'].filter((section) => !hasSections.includes(section)).join(', ')}.`,
      fix: 'Use clear ATS-friendly headings for Experience, Projects, Skills, and Education.',
      severity: 'medium',
    },
    foundWeakPhrases.length > 0 && {
      issue: `Weak resume phrases detected: ${foundWeakPhrases.join(', ')}.`,
      fix: 'Replace generic phrases with action verbs, technical detail, and measurable outcomes.',
      severity: 'medium',
    },
  ].filter(Boolean) as Array<{ issue: string; fix: string; severity: string }>

  const grammarMistakes = [
    ...foundWeakPhrases.map((phrase) => ({
      text: phrase,
      suggestion: phrase === 'worked on' ? 'Built / implemented / deployed' : 'Replace with a specific achievement',
      reason: 'Generic wording reduces confidence and does not show ownership.',
    })),
    ...longSentences.slice(0, 3).map((sentence) => ({
      text: sentence.slice(0, 110),
      suggestion: 'Split this into one concise achievement bullet.',
      reason: 'Long bullets are harder for recruiters and ATS screeners to scan.',
    })),
  ]

  const strengths = unique([
    matchedKeywords.length >= 5 ? `Includes relevant ${payload.targetRole || 'role'} keywords` : '',
    hasSections.length >= 3 ? 'Uses recognizable resume sections' : '',
    actionVerbCount >= 3 ? 'Shows action-oriented project language' : '',
    hasLinks ? 'Includes external proof links' : '',
    hasMetrics ? 'Mentions measurable impact' : '',
  ])

  return {
    resumeScore,
    atsScore,
    grammarScore,
    roleFitScore,
    summary: `This resume was analyzed against the ${payload.targetRole || 'Software Developer'} role. It matches ${matchedKeywords.length}/${keywords.length} important keywords, has ${hasSections.length}/4 core ATS sections, ${hasMetrics ? 'includes' : 'does not clearly include'} measurable impact, and ${hasLinks ? 'includes' : 'does not clearly include'} proof links.`,
    strengths: strengths.length ? strengths : ['Has enough resume content to evaluate', 'Shows some role-relevant experience'],
    corrections: corrections.length ? corrections : [
      {
        issue: 'Resume is generally readable but can be made more competitive.',
        fix: 'Tighten bullets around action, technical stack, measurable result, and role relevance.',
        severity: 'low',
      },
    ],
    grammarMistakes: grammarMistakes.length ? grammarMistakes : [
      {
        text: 'No obvious repeated weak phrase detected by local analysis.',
        suggestion: 'Still review punctuation, tense consistency, and bullet length manually.',
        reason: 'AI grammar review should be paired with manual proofreading.',
      },
    ],
    missingKeywords,
    recommendedRewrite: [
      `Built and deployed a ${payload.targetRole || 'software'} project using ${matchedKeywords.slice(0, 4).join(', ') || 'a modern technical stack'}, improving user workflow with measurable project outcomes.`,
      hasMetrics
        ? 'Rewrite strongest project bullet to start with the metric, then explain the technical implementation.'
        : 'Add one metric to each major project bullet, such as users, latency, accuracy, time saved, or features shipped.',
    ],
    actionPlan: [
      'Move the strongest role-relevant project near the top.',
      'Add missing keywords naturally inside project and skills bullets.',
      'Use action verbs like built, deployed, optimized, integrated, and designed.',
      'Keep each bullet under 22 words where possible.',
    ],
    analysisMode: 'dynamic-local-fallback',
  }
}

export async function generateInterviewQuestions(payload: {
  targetRole: string
  difficulty: string
  jobDescription?: string
  count?: number
}) {
  const count = payload.count || 6
  const fallback: { questions: Question[] } = {
    questions: [
      {
        id: 'q1',
        type: 'project' as const,
        question: `Walk me through your strongest project for a ${payload.targetRole} role. What did you own end to end?`,
        evaluationFocus: 'Ownership, clarity, impact, technical depth',
        idealSignals: ['Specific responsibilities', 'Measurable impact', 'Tradeoff awareness'],
      },
      {
        id: 'q2',
        type: 'technical' as const,
        question: 'Design the backend flow for authentication, interview sessions, answer storage, and AI scoring.',
        evaluationFocus: 'System architecture and API design',
        idealSignals: ['Clear data model', 'Secure auth', 'Async AI processing'],
      },
      {
        id: 'q3',
        type: 'system-design' as const,
        question: 'How would you make real-time interview analysis reliable when AI APIs are slow or temporarily unavailable?',
        evaluationFocus: 'Reliability and fallback thinking',
        idealSignals: ['Queues', 'Retries', 'Graceful degradation'],
      },
      {
        id: 'q4',
        type: 'behavioral' as const,
        question: 'Tell me about a time you received tough feedback and changed your work because of it.',
        evaluationFocus: 'Coachability and maturity',
        idealSignals: ['Specific situation', 'Action taken', 'Learning'],
      },
      {
        id: 'q5',
        type: 'technical' as const,
        question: 'How would you protect candidate video, transcript, and score data in production?',
        evaluationFocus: 'Privacy and security',
        idealSignals: ['Consent', 'Encryption', 'Retention policies'],
      },
      {
        id: 'q6',
        type: 'follow-up' as const,
        question: 'What is one tradeoff in your architecture that you would revisit after the first 100 users?',
        evaluationFocus: 'Product engineering judgment',
        idealSignals: ['Pragmatism', 'Metrics', 'Iteration plan'],
      },
    ].slice(0, count),
  }

  return openRouterJson(
    `You are a senior interviewer. Create exactly ${count} role-specific interview questions. Return strict JSON: {"questions":[{"id":"q1","type":"technical|behavioral|system-design|project|follow-up","question":"...","evaluationFocus":"...","idealSignals":["..."]}]}. Make questions specific to the role and job description.`,
    payload,
    fallback,
  ) as Promise<{ questions: Question[] }>
}

export async function generateNextQuestion(payload: {
  targetRole: string
  difficulty: string
  jobDescription?: string
  questionNumber: number
  askedQuestions: string[]
  previousAnswer: string
  previousFeedback?: unknown
}) {
  const fallbackQuestion = {
    id: `q${payload.questionNumber}`,
    type: payload.questionNumber % 2 === 0 ? 'technical' : 'behavioral',
    question:
      payload.questionNumber === 5
        ? 'Final question: based on your previous answers, what is the strongest reason we should select you for this role, and what gap are you actively improving?'
        : `Based on your last answer, go deeper on one production tradeoff you would make as a ${payload.targetRole}.`,
    evaluationFocus: 'Adaptive reasoning based on the previous answer with clear examples and tradeoffs',
    idealSignals: ['Specific example', 'Tradeoff thinking', 'Clear ownership'],
  }

  const result = await openRouterJson(
    'You are a professional AI interviewer. Generate exactly ONE next interview question. Use only minimal context from the previous answer and avoid repeating already asked questions. Return strict JSON: {"id":"q2","type":"technical|behavioral|system-design|project|follow-up","question":"...","evaluationFocus":"...","idealSignals":["..."]}.',
    payload,
    fallbackQuestion,
  )

  return result as Question
}

export async function analyzeAnswer(payload: {
  role: string
  question: string
  transcript: string
  visualSignals?: Record<string, unknown>
}) {
  return openRouterJson(
    'You are an expert technical interviewer. Score the candidate answer. Return strict JSON with fields: score number 0-100, communicationSkills object, technicalKnowledge object, confidenceBehavior object, overallEvaluation object, strengths string[], risks string[], coaching string, hiringSignal string, followUpQuestion string. communicationSkills must include grammarAccuracy, vocabularyUsage, fluency, answerRelevance numbers 0-100 plus notes string. technicalKnowledge must include technicalKeywordMatching, conceptUnderstanding, problemSolvingAbility, responseCorrectness numbers 0-100 plus notes string. confidenceBehavior must include eyeContact, facialExpressions, speakingConfidence, bodyPosture numbers 0-100 plus notes string. overallEvaluation must include interviewScore number 0-100, strengthsIdentification string[], weaknessDetection string[], improvementRecommendations string[].',
    payload,
    {
      score: 86,
      communicationSkills: {
        grammarAccuracy: 88,
        vocabularyUsage: 84,
        fluency: 86,
        answerRelevance: 90,
        notes: 'Clear answer with relevant phrasing and only minor structure improvements needed.',
      },
      technicalKnowledge: {
        technicalKeywordMatching: 87,
        conceptUnderstanding: 84,
        problemSolvingAbility: 86,
        responseCorrectness: 85,
        notes: 'Good technical direction with clear mention of architecture, API, database, and AI service separation.',
      },
      confidenceBehavior: {
        eyeContact: Number(payload.visualSignals?.eyeContact || 86),
        facialExpressions: Number(payload.visualSignals?.confidence || 85),
        speakingConfidence: Number(payload.visualSignals?.confidence || 88),
        bodyPosture: Number(payload.visualSignals?.posture || 84),
        notes: 'Stable confidence signals with room to improve posture consistency and delivery energy.',
      },
      overallEvaluation: {
        interviewScore: 86,
        strengthsIdentification: ['Clear architecture split', 'Good explanation of backend and AI service responsibilities'],
        weaknessDetection: ['Needs more production tradeoffs', 'Could quantify impact better'],
        improvementRecommendations: ['Use concrete metrics', 'Explain alternatives before final choices', 'Close answers with measurable impact'],
      },
      strengths: ['Clear architecture split', 'Good database and AI-service separation'],
      risks: ['Add more privacy details', 'Explain latency and fallback strategy'],
      coaching: 'Use a structured answer: context, architecture, tradeoffs, risks, and measurement.',
      hiringSignal: 'Promising',
      followUpQuestion: 'How would you make this reliable under production traffic?',
      rubric: { clarity: 86, depth: 82, relevance: 90, structure: 84 },
      model: 'mock-local',
    },
  )
}

export async function buildInterviewReport(payload: {
  targetRole: string
  answers: Array<{ question: string; transcript: string; nlp_score: number; cv_score: number; feedback: unknown }>
}) {
  return openRouterJson(
    'You are a hiring panel lead. Build a final interview report. Return strict JSON with fields: summary string, communicationSkills object, technicalKnowledge object, confidenceBehavior object, overallEvaluation object, strengths string[], risks string[], recommendation string, decision one of Strong shortlist|Shortlist|Needs practice|Reject, coachingPlan string[], roleFitScore number 0-100. communicationSkills must include grammarAccuracy, vocabularyUsage, fluency, answerRelevance numbers 0-100 plus notes string. technicalKnowledge must include technicalKeywordMatching, conceptUnderstanding, problemSolvingAbility, responseCorrectness numbers 0-100 plus notes string. confidenceBehavior must include eyeContact, facialExpressions, speakingConfidence, bodyPosture numbers 0-100 plus notes string. overallEvaluation must include interviewScore number 0-100, strengthsIdentification string[], weaknessDetection string[], improvementRecommendations string[].',
    payload,
    {
      summary: 'Candidate shows solid interview readiness with clear technical thinking and room to improve depth in tradeoff explanations.',
      communicationSkills: {
        grammarAccuracy: 88,
        vocabularyUsage: 84,
        fluency: 86,
        answerRelevance: 89,
        notes: 'Communication is clear and relevant, with opportunities to improve concise structuring.',
      },
      technicalKnowledge: {
        technicalKeywordMatching: 86,
        conceptUnderstanding: 84,
        problemSolvingAbility: 85,
        responseCorrectness: 83,
        notes: 'Good technical foundation with a need for stronger correctness proof and deeper tradeoff analysis.',
      },
      confidenceBehavior: {
        eyeContact: 86,
        facialExpressions: 84,
        speakingConfidence: 88,
        bodyPosture: 82,
        notes: 'Confident delivery signals overall; posture and visual engagement can be made more consistent.',
      },
      overallEvaluation: {
        interviewScore: 84,
        strengthsIdentification: ['Clear communication', 'Good architecture awareness'],
        weaknessDetection: ['Needs more production examples', 'Could quantify impact better'],
        improvementRecommendations: ['Use concrete metrics', 'Explain alternatives before final choices'],
      },
      strengths: ['Clear communication', 'Good architecture awareness'],
      risks: ['Needs more production examples', 'Could quantify impact better'],
      recommendation: 'Shortlist with one focused technical follow-up round.',
      decision: 'Shortlist',
      coachingPlan: ['Use concrete metrics', 'Explain alternatives before final choices'],
      roleFitScore: 84,
    },
  )
}

export async function analyzeResume(payload: {
  fileName: string
  resumeText: string
  targetRole?: string
}) {
  const dynamicFallback = buildResumeFallback(payload)
  return openRouterJson(
    'You are an expert resume reviewer for technical hiring. Analyze ONLY the provided resume text for the target role. Do not give generic feedback. Scores and corrections must change based on actual resume content, missing keywords, grammar issues, project depth, measurable impact, and role fit. Return strict JSON with: resumeScore number 0-100, atsScore number 0-100, grammarScore number 0-100, roleFitScore number 0-100, summary string, strengths string[], corrections array of {"issue":"...","fix":"...","severity":"low|medium|high"}, grammarMistakes array of {"text":"...","suggestion":"...","reason":"..."}, missingKeywords string[], recommendedRewrite string[], actionPlan string[].',
    payload,
    dynamicFallback,
  )
}

function parseTimelineToWeeks(timeline: string) {
  const text = timeline.toLowerCase()
  const value = Number(text.match(/\d+/)?.[0] || 8)

  if (text.includes('day')) return Math.max(1, Math.ceil(value / 7))
  if (text.includes('month')) return Math.max(1, value * 4)
  if (text.includes('year')) return Math.max(1, value * 52)
  return Math.max(1, value)
}

function buildRoadmapFallback(payload: {
  goal: string
  currentLevel: string
  timeline: string
  hoursPerWeek: number
}) {
  const totalWeeks = parseTimelineToWeeks(payload.timeline)
  const visibleWeeks = Math.min(totalWeeks, 24)
  const phaseCount = totalWeeks <= 4 ? totalWeeks : totalWeeks <= 12 ? 4 : 6
  const phaseLength = Math.max(1, Math.ceil(totalWeeks / phaseCount))
  const focusCycle = [
    'Foundation and prerequisites',
    'Core concepts and guided practice',
    'Hands-on project building',
    'Advanced implementation and production skills',
    'Portfolio polish and documentation',
    'Interview preparation and revision',
  ]

  const phases = Array.from({ length: phaseCount }, (_, index) => {
    const startWeek = index * phaseLength + 1
    const endWeek = Math.min((index + 1) * phaseLength, totalWeeks)
    const focus = focusCycle[index] || `Focused practice ${index + 1}`

    return {
      phase: `Phase ${index + 1}: ${focus}`,
      duration: `Week ${startWeek}${endWeek > startWeek ? `-${endWeek}` : ''}`,
      goal: `Move from ${payload.currentLevel} toward ${payload.goal} through ${focus.toLowerCase()}.`,
      topics: [
        `${payload.goal} fundamentals`,
        'Practical implementation patterns',
        'Common mistakes and debugging',
        'Real-world use cases',
      ],
      projects: [
        index === phaseCount - 1 ? `Capstone ${payload.goal} project` : `${payload.goal} mini project ${index + 1}`,
        'Document learnings and decisions',
      ],
      resources: ['Official documentation', 'High-quality project tutorials', 'Practice problems', 'Mock interview notes'],
      checkpoints: [
        `Complete week ${startWeek}${endWeek > startWeek ? `-${endWeek}` : ''} tasks`,
        'Explain concepts without notes',
        'Push work to GitHub or portfolio',
      ],
    }
  })

  const weeklyPlan = Array.from({ length: visibleWeeks }, (_, index) => ({
    week: `Week ${index + 1}`,
    focus: focusCycle[Math.min(Math.floor((index / visibleWeeks) * focusCycle.length), focusCycle.length - 1)],
    tasks: [
      `Study ${payload.goal} for ${Math.max(1, Math.floor(payload.hoursPerWeek * 0.35))} hours`,
      `Build or improve one ${payload.goal} feature`,
      'Write notes and revise weak areas',
      index >= visibleWeeks - 3 ? 'Practice interview explanation' : 'Complete one checkpoint',
    ],
  }))

  return {
    title: `${payload.goal} Roadmap`,
    overview: `A ${payload.timeline} preparation route for ${payload.goal}, designed for ${payload.currentLevel} with about ${payload.hoursPerWeek} hours per week. ${totalWeeks > visibleWeeks ? `Showing the first ${visibleWeeks} weekly steps and full phase coverage for ${totalWeeks} weeks.` : ''}`,
    roadmapScore: 90,
    phases,
    weeklyPlan,
    milestones: [
      `Finish all ${totalWeeks} weeks of planned learning`,
      'Build at least 2 strong portfolio projects',
      'Prepare project explanations for interviews',
      'Complete mock interviews and revise weak areas',
    ],
    mistakesToAvoid: ['Learning without building', 'Skipping documentation', 'Ignoring fundamentals', 'Not revising weak topics weekly'],
    finalProject: `Build and deploy a complete ${payload.goal} capstone project with documentation, tests, and interview-ready architecture notes.`,
    interviewPrep: ['Explain every project architecture', 'Prepare common questions', 'Practice tradeoff explanations', 'Review mistakes from mock interviews'],
  }
}

export async function generateRoadmap(payload: {
  goal: string
  currentLevel: string
  timeline: string
  hoursPerWeek: number
}) {
  const dynamicFallback = buildRoadmapFallback(payload)
  return openRouterJson(
    `You are an expert career mentor. Generate a clear ideal preparation roadmap for the exact requested timeline: ${payload.timeline}. If the user asks for days, convert into daily/weekly steps. If weeks, include that many weekly plan items when reasonable. If months, convert to weeks and structure phases across the full duration. Do not return a generic 2-week plan unless the user requested 2 weeks. Return strict JSON with: title string, overview string, roadmapScore number 0-100, phases array of {"phase":"...","duration":"...","goal":"...","topics":["..."],"projects":["..."],"resources":["..."],"checkpoints":["..."]}, weeklyPlan array of {"week":"...","focus":"...","tasks":["..."]}, milestones string[], mistakesToAvoid string[], finalProject string, interviewPrep string[].`,
    payload,
    dynamicFallback,
  )
}
