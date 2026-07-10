import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vocavision_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

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
