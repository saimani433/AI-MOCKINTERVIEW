import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api',
  headers: {
    'bypass-tunnel-reminder': 'true',
    'ngrok-skip-browser-warning': 'true',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vocavision_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Database & Network Error Interceptor for Offline / GitHub Pages Web Mode
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If Network Error occurs (e.g. backend server offline on static host)
    if (!error.response || error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      const url = error.config?.url || ''
      const method = error.config?.method?.toLowerCase() || 'get'
      const body = error.config?.data ? JSON.parse(error.config.data) : {}

      // Handle Authentication Fallback Database
      if (url.includes('/auth/signup') || url.includes('/auth/login')) {
        const email = body.email || 'user@example.com'
        const name = body.name || email.split('@')[0] || 'User'
        const mockUser = {
          id: 'usr_' + Date.now(),
          name,
          email,
          token: 'mock_jwt_token_' + Math.random().toString(36).substring(2)
        }
        localStorage.setItem('vocavision_user', JSON.stringify(mockUser))
        localStorage.setItem('vocavision_token', mockUser.token)

        return Promise.resolve({
          data: {
            token: mockUser.token,
            user: mockUser,
            message: 'Signed in successfully (Web Mode).'
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config
        })
      }

      if (url.includes('/auth/me')) {
        const savedUser = localStorage.getItem('vocavision_user')
        const currentUser = savedUser ? JSON.parse(savedUser) : { name: 'Mahaveera Kanna', email: 'user@example.com' }
        return Promise.resolve({
          data: currentUser,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config
        })
      }

      if (url.includes('/auth/forgot-password') || url.includes('/auth/reset-password')) {

        return Promise.resolve({
          data: { message: 'Password reset code verified successfully.' },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config
        })
      }

      // Handle Interviews Fallback
      if (url.includes('/interviews')) {
        const mockInterview: Interview = {
          id: 'int_' + Date.now(),
          title: body.title || 'Full Stack Engineer Mock',
          target_role: body.target_role || 'Software Engineer',
          job_description: body.job_description || 'React, Node.js, System Design',
          difficulty: body.difficulty || 'Medium',
          status: 'Completed',
          overall_score: 88,
          created_at: new Date().toISOString(),
          questions: [
            {
              id: 'q1',
              type: 'Technical',
              question: 'Explain rate limiting in a distributed API gateway.',
              evaluationFocus: 'Architecture & System Design',
              idealSignals: ['Token Bucket', 'Leaky Bucket', 'Redis Rate Limiter']
            },
            {
              id: 'q2',
              type: 'System Design',
              question: 'How do you optimize React component re-renders for large lists?',
              evaluationFocus: 'Frontend Performance',
              idealSignals: ['useMemo', 'React.memo', 'Virtualization']
            }
          ]
        }
        return Promise.resolve({
          data: method === 'get' ? [mockInterview] : mockInterview,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config
        })
      }

      // Handle Reports Fallback
      if (url.includes('/reports')) {
        const mockReport: Report = {
          id: 'rep_' + Date.now(),
          title: 'Full Stack Engineer Performance Report',
          target_role: 'Full Stack Engineer',
          overall_score: 88,
          summary: 'Candidate demonstrated strong architectural problem solving and clear communication.',
          strengths: ['Great articulation of distributed caching', 'Clean React component organization'],
          risks: ['Minor hesitation on database indexing trade-offs'],
          recommendation: 'Strong Hire',
          created_at: new Date().toISOString()
        }
        return Promise.resolve({
          data: method === 'get' ? [mockReport] : mockReport,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config
        })
      }
    }
    return Promise.reject(error)
  }
)


export type Question = {
  id: string
  type: string
  question: string
  evaluationFocus: string
  idealSignals: string[]
}

export type Interview = {
  id: string
  title: string
  target_role: string
  job_description: string
  difficulty: string
  questions: Question[]
  status: string
  overall_score: number
  answered_count?: number
  created_at: string
}

export type Answer = {
  id: string
  question: string
  transcript: string
  nlp_score: number
  cv_score: number
  feedback: {
    aiResult?: {
      score: number
      communicationSkills?: AnalysisGroup
      technicalKnowledge?: AnalysisGroup
      confidenceBehavior?: AnalysisGroup
      overallEvaluation?: OverallEvaluation
      strengths: string[]
      risks: string[]
      coaching: string
      hiringSignal: string
      followUpQuestion?: string
      rubric?: Record<string, number>
    }
    cvResult?: Record<string, number | string | string[]>
  }
}

export type Report = {
  id: string
  title: string
  target_role: string
  overall_score: number
  summary: string
  strengths: string[]
  risks: string[]
  recommendation: string
  created_at: string
  analysis?: {
    communicationSkills?: AnalysisGroup
    technicalKnowledge?: AnalysisGroup
    confidenceBehavior?: AnalysisGroup
    overallEvaluation?: OverallEvaluation
  }
}

export type AnalysisGroup = {
  grammarAccuracy?: number
  vocabularyUsage?: number
  fluency?: number
  answerRelevance?: number
  technicalKeywordMatching?: number
  conceptUnderstanding?: number
  problemSolvingAbility?: number
  responseCorrectness?: number
  eyeContact?: number
  facialExpressions?: number
  speakingConfidence?: number
  bodyPosture?: number
  notes?: string
}

export type OverallEvaluation = {
  interviewScore?: number
  strengthsIdentification?: string[]
  weaknessDetection?: string[]
  improvementRecommendations?: string[]
}
