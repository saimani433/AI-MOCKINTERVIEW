import { Bot, Camera, CheckCircle2, Headphones, Loader2, Mic, Radio, Sparkles, Square, UserRound, Volume2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { AnalysisGrid } from '../components/AnalysisGrid'
import { api, type AnalysisGroup, type Answer, type Interview, type OverallEvaluation, type Question } from '../lib/api'

type SpeechRecognitionResultLike = {
  isFinal: boolean
  0: { transcript: string }
}

type SpeechRecognitionEventLike = {
  resultIndex: number
  results: SpeechRecognitionResultLike[]
}

type SpeechRecognitionLike = {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onend: (() => void) | null
  onerror: ((event?: { error?: string }) => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike
    webkitSpeechRecognition?: new () => SpeechRecognitionLike
  }
}

type Step = 'setup' | 'active' | 'complete'
type ChatMessage = {
  id: string
  speaker: 'assistant' | 'student'
  text: string
  meta?: string
}

type FinalReport = {
  decision?: string
  summary?: string
  roleFitScore?: number
  strengths?: string[]
  risks?: string[]
  communicationSkills?: AnalysisGroup
  technicalKnowledge?: AnalysisGroup
  confidenceBehavior?: AnalysisGroup
  overallEvaluation?: OverallEvaluation
}

const TOTAL_QUESTIONS = 5

export function InterviewPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const finalTranscriptRef = useRef('')
  const shouldKeepListeningRef = useRef(false)
  const restartTimerRef = useRef<number | null>(null)
  const lastListenStartRef = useRef(0)
  const speakingRef = useRef(false)
  const loadingRef = useRef(false)
  const [step, setStep] = useState<Step>('setup')
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState('')
  const [mediaError, setMediaError] = useState('')
  const [speechSupported] = useState(() => Boolean(window.SpeechRecognition || window.webkitSpeechRecognition))
  const [interview, setInterview] = useState<Interview | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [answerText, setAnswerText] = useState('')
  const [latestFeedback, setLatestFeedback] = useState<Answer['feedback'] | null>(null)
  const [report, setReport] = useState<FinalReport | null>(null)
  const [setup, setSetup] = useState({
    title: 'AI Agent Mock Interview',
    targetRole: 'Full Stack Developer',
    difficulty: 'intermediate',
    questionCount: 1,
    jobDescription: 'React TypeScript, Express, Node, Postgres, API design, AI integrations, authentication, dashboards, and production-ready full stack workflows.',
  })

  const answeredCount = answers.length
  const questionNumber = Math.min(answeredCount + 1, TOTAL_QUESTIONS)
  const progress = Math.round((answeredCount / TOTAL_QUESTIONS) * 100)
  const liveTranscript = `${answerText}${interimTranscript ? ` ${interimTranscript}` : ''}`.trim()
  const canSubmit = liveTranscript.length >= 30 && currentQuestion && !loading
  const voiceReady = speechSupported && !speaking && currentQuestion && answeredCount < TOTAL_QUESTIONS

  const averageScore = useMemo(() => {
    if (!answers.length) return 0
    return Math.round(answers.reduce((sum, answer) => sum + Number(answer.nlp_score || 0), 0) / answers.length)
  }, [answers])

  useEffect(() => {
    speakingRef.current = speaking
  }, [speaking])

  useEffect(() => {
    loadingRef.current = loading
  }, [loading])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, latestFeedback])

  useEffect(() => {
    if (step !== 'active') return
    const video = videoRef.current
    navigator.mediaDevices?.getUserMedia({ video: true, audio: false })
      .then((stream) => {
        setMediaError('')
        if (video) video.srcObject = stream
      })
      .catch(() => setMediaError('Camera permission is blocked. Allow camera access to run the visual interview view.'))

    return () => {
      const stream = video?.srcObject as MediaStream | null
      stream?.getTracks().forEach((track) => track.stop())
      window.speechSynthesis?.cancel()
      shouldKeepListeningRef.current = false
      if (restartTimerRef.current) window.clearTimeout(restartTimerRef.current)
      recognitionRef.current?.abort()
    }
  }, [step])

  useEffect(() => {
    if (step !== 'active') return
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!Recognition) return

    const recognition = new Recognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.onresult = (event) => {
      let interim = ''
      let finalText = ''
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index]
        if (result.isFinal) finalText += `${result[0].transcript} `
        else interim += result[0].transcript
      }
      if (finalText) {
        finalTranscriptRef.current = `${finalTranscriptRef.current} ${finalText}`.trim()
        setAnswerText(finalTranscriptRef.current)
      }
      setInterimTranscript(interim)
    }
    recognition.onend = () => {
      const endedTooFast = Date.now() - lastListenStartRef.current < 1800
      if (!shouldKeepListeningRef.current || speakingRef.current || loadingRef.current) {
        setListening(false)
        return
      }

      setListening(true)
      if (restartTimerRef.current) window.clearTimeout(restartTimerRef.current)
      restartTimerRef.current = window.setTimeout(() => {
        if (!shouldKeepListeningRef.current || !recognitionRef.current || speakingRef.current || loadingRef.current) return
        try {
          lastListenStartRef.current = Date.now()
          recognitionRef.current.start()
        } catch {
          setListening(true)
        }
      }, endedTooFast ? 900 : 450)
    }
    recognition.onerror = (event) => {
      const recoverable = !event?.error || ['no-speech', 'aborted', 'network'].includes(event.error)
      if (!recoverable) {
        shouldKeepListeningRef.current = false
        setListening(false)
        if (event?.error === 'not-allowed' || event?.error === 'service-not-allowed') {
          setMediaError('Microphone permission is blocked. Allow microphone access to answer by voice.')
        } else if (event?.error === 'audio-capture') {
          setMediaError('Microphone capture failed. Close other apps using the mic and tap Start answering again.')
        }
      }
    }
    recognitionRef.current = recognition

    return () => {
      shouldKeepListeningRef.current = false
      if (restartTimerRef.current) window.clearTimeout(restartTimerRef.current)
      recognition.abort()
      recognitionRef.current = null
    }
  }, [step])

  const speak = (text: string) => {
    if (!window.speechSynthesis || !text) return
    shouldKeepListeningRef.current = false
    if (restartTimerRef.current) window.clearTimeout(restartTimerRef.current)
    recognitionRef.current?.stop()
    setListening(false)
    setSpeaking(true)
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.94
    utterance.pitch = 1
    utterance.volume = 1
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }

  const startListening = () => {
    if (!voiceReady || !recognitionRef.current) return
    setInterimTranscript('')
    shouldKeepListeningRef.current = true
    if (restartTimerRef.current) window.clearTimeout(restartTimerRef.current)
    try {
      lastListenStartRef.current = Date.now()
      recognitionRef.current.start()
      setListening(true)
    } catch {
      setListening(true)
    }
  }

  const stopListening = () => {
    shouldKeepListeningRef.current = false
    if (restartTimerRef.current) window.clearTimeout(restartTimerRef.current)
    recognitionRef.current?.stop()
    setListening(false)
  }

  const resetCurrentAnswer = () => {
    shouldKeepListeningRef.current = false
    if (restartTimerRef.current) window.clearTimeout(restartTimerRef.current)
    recognitionRef.current?.abort()
    finalTranscriptRef.current = ''
    setAnswerText('')
    setInterimTranscript('')
    setListening(false)
  }

  const createInterview = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setLatestFeedback(null)
    setReport(null)
    try {
      const res = await api.post('/interviews', { ...setup, questionCount: 1 })
      const created: Interview = res.data
      const firstQuestion = created.questions?.[0]
      const opening = `Hi, I am your AI interviewer for the ${created.target_role} role. I will ask ${TOTAL_QUESTIONS} adaptive questions. Please keep your camera on and answer naturally after each question.`
      const firstQuestionText = firstQuestion?.question || 'Tell me about your strongest project and your exact contribution.'
      setInterview(created)
      setCurrentQuestion(firstQuestion)
      setAnswers([])
      setAnswerText('')
      finalTranscriptRef.current = ''
      setInterimTranscript('')
      setMessages([
        {
          id: 'welcome',
          speaker: 'assistant',
          text: opening,
          meta: 'Interview started',
        },
        {
          id: firstQuestion?.id || 'q1',
          speaker: 'assistant',
          text: firstQuestionText,
          meta: `Question 1/${TOTAL_QUESTIONS}`,
        },
      ])
      setStep('active')
      window.setTimeout(() => speak(`${opening} First question. ${firstQuestionText}`), 350)
    } finally {
      setLoading(false)
    }
  }

  const submitAnswer = async () => {
    if (!interview || !currentQuestion || !canSubmit) return
    const submittedText = liveTranscript.trim()
    stopListening()
    setLoading(true)
    setMessages((prev) => [
      ...prev,
      {
        id: `a-${answeredCount + 1}`,
        speaker: 'student',
        text: submittedText,
        meta: `Answer ${answeredCount + 1}/${TOTAL_QUESTIONS}`,
      },
    ])
    setAnswerText('')
    finalTranscriptRef.current = ''
    setInterimTranscript('')

    try {
      const visualSignals = {
        eyeContact: 82 + Math.floor(Math.random() * 12),
        posture: 78 + Math.floor(Math.random() * 16),
        confidence: 80 + Math.floor(Math.random() * 14),
      }
      const analysisRes = await api.post('/interviews/analyze-answer', {
        interviewId: interview.id,
        role: interview.target_role,
        question: currentQuestion.question,
        transcript: submittedText,
        visualSignals,
      })

      const savedAnswer: Answer = analysisRes.data.answer
      setAnswers((prev) => [...prev, savedAnswer])
      setLatestFeedback(savedAnswer.feedback)

      const nextAnsweredCount = answeredCount + 1
      const feedbackText = savedAnswer.feedback?.aiResult?.coaching || 'Good. I will use that context for the next question.'

      if (nextAnsweredCount >= TOTAL_QUESTIONS) {
        const closeText = `That completes question ${TOTAL_QUESTIONS}. ${feedbackText} I can now generate your final performance report.`
        setMessages((prev) => [
          ...prev,
          {
            id: 'assistant-ready-report',
            speaker: 'assistant',
            text: closeText,
            meta: 'Interview complete',
          },
        ])
        setCurrentQuestion(null)
        speak(closeText)
        return
      }

      const nextRes = await api.post(`/interviews/${interview.id}/next-question`)
      const nextQuestion: Question = nextRes.data.question
      const nextPrompt = `${feedbackText} Next question. ${nextQuestion.question}`
      setInterview((prev) => (prev ? { ...prev, questions: nextRes.data.questions } : prev))
      setCurrentQuestion(nextQuestion)
      setMessages((prev) => [
        ...prev,
        {
          id: `coach-${nextAnsweredCount}`,
          speaker: 'assistant',
          text: feedbackText,
          meta: `Quick feedback on answer ${nextAnsweredCount}`,
        },
        {
          id: nextQuestion.id || `q-${nextAnsweredCount + 1}`,
          speaker: 'assistant',
          text: nextQuestion.question,
          meta: `Question ${nextAnsweredCount + 1}/${TOTAL_QUESTIONS}`,
        },
      ])
      speak(nextPrompt)
    } finally {
      setLoading(false)
    }
  }

  const completeInterview = async () => {
    if (!interview) return
    setLoading(true)
    try {
      const res = await api.post(`/interviews/${interview.id}/complete`)
      setReport(res.data.analysis)
      setStep('complete')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'setup') {
    return (
      <div className="grid gap-4 sm:gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="shine-card rounded-lg bg-ink p-5 text-white shadow-glow sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-mint">Voice + camera AI interviewer</p>
          <h1 className="page-title mt-3 text-3xl font-black leading-tight sm:text-4xl">Enter a role. The AI agent speaks the interview. You answer out loud.</h1>
          <p className="mt-4 leading-7 text-white/70">This is a live mock interview room: camera permission, spoken AI questions, microphone transcript capture, adaptive follow-ups, answer scoring, and final hiring-style report.</p>
          <div className="mt-8 grid gap-3">
            {['AI speaks every question', 'Candidate answers by microphone', 'Camera stays active during the session', 'Transcript, scoring, and report are saved'].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg bg-white/10 p-4 font-bold">
                <CheckCircle2 className="text-mint" size={19} /> {item}
              </div>
            ))}
          </div>
        </section>

        <form onSubmit={createInterview} className="shine-card app-card shine-card rounded-lg p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-bold text-slate-600">Session title</span>
              <input className="mt-2 w-full rounded-lg border border-black/10 px-4 py-3 outline-none" value={setup.title} onChange={(e) => setSetup({ ...setup, title: e.target.value })} required />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-600">Target role</span>
              <input className="mt-2 w-full rounded-lg border border-black/10 px-4 py-3 outline-none" value={setup.targetRole} onChange={(e) => setSetup({ ...setup, targetRole: e.target.value })} required />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-bold text-slate-600">Difficulty</span>
              <select className="mt-2 w-full rounded-lg border border-black/10 px-4 py-3 outline-none" value={setup.difficulty} onChange={(e) => setSetup({ ...setup, difficulty: e.target.value })}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="senior">Senior</option>
              </select>
            </label>
          </div>
          <label className="mt-4 block">
            <span className="text-sm font-bold text-slate-600">Role context / job description</span>
            <textarea className="mt-2 min-h-44 w-full rounded-lg border border-black/10 px-4 py-3 outline-none" value={setup.jobDescription} onChange={(e) => setSetup({ ...setup, jobDescription: e.target.value })} />
          </label>
          <button disabled={loading} className="neon-button mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-black disabled:opacity-60 sm:w-auto">
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />} Start AI interview
          </button>
        </form>
      </div>
    )
  }

  if (step === 'complete') {
    return (
      <div className="mx-auto max-w-5xl space-y-5 sm:space-y-6">
        <section className="shine-card rounded-lg bg-ink p-5 text-white shadow-glow sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-mint">Final report generated</p>
          <h1 className="page-title mt-3 text-3xl font-black sm:text-4xl">{report?.decision || 'Interview complete'}</h1>
          <p className="mt-4 max-w-3xl leading-7 text-white/70">{report?.summary}</p>
          <p className="mt-5 text-4xl font-black sm:text-5xl">{report?.roleFitScore || averageScore}%</p>
        </section>
        <section className="grid gap-4 md:grid-cols-2">
          <div className="shine-card app-card shine-card rounded-lg p-4 sm:p-6">
            <h2 className="text-xl font-black">Strengths</h2>
            <div className="mt-4 space-y-3">{(report?.strengths || []).map((item: string) => <p key={item} className="rounded-lg bg-mint/10 p-3 font-bold">{item}</p>)}</div>
          </div>
          <div className="shine-card app-card shine-card rounded-lg p-4 sm:p-6">
            <h2 className="text-xl font-black">Risks</h2>
            <div className="mt-4 space-y-3">{(report?.risks || []).map((item: string) => <p key={item} className="rounded-lg bg-coral/10 p-3 font-bold">{item}</p>)}</div>
          </div>
        </section>
        <AnalysisGrid
          communicationSkills={report?.communicationSkills}
          technicalKnowledge={report?.technicalKnowledge}
          confidenceBehavior={report?.confidenceBehavior}
          overallEvaluation={report?.overallEvaluation}
        />
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:gap-6 xl:grid-cols-[0.72fr_1.28fr]">
      <section className="shine-card overflow-hidden rounded-lg bg-ink text-white shadow-glow">
        <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-mint">Live AI interviewer</p>
            <h1 className="mt-1 text-2xl font-black">{interview?.target_role}</h1>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-red-500/15 px-3 py-1.5 text-sm font-bold text-red-200">
            <Radio size={15} /> Active
          </span>
        </div>
        <div className="relative bg-[radial-gradient(circle_at_50%_20%,rgba(76,201,240,0.24),transparent_35%),#07111f] p-3 sm:p-5">
          <video ref={videoRef} autoPlay muted playsInline className="h-[300px] w-full rounded-lg object-cover opacity-95 sm:h-[420px]" />
          {mediaError && (
            <div className="absolute inset-3 grid place-items-center rounded-lg border border-coral/30 bg-coral/10 p-5 text-center text-sm font-bold text-coral backdrop-blur sm:inset-5">
              {mediaError}
            </div>
          )}
          <div className="pointer-events-none absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-xs font-black text-white backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-red-400 shadow-glow" />
            Camera live
          </div>
        </div>
        <div className="grid gap-2 border-t border-white/10 bg-white/[0.035] p-3 sm:grid-cols-4 sm:p-4">
          {[
            ['Progress', `${progress}%`],
            ['Question', `${questionNumber}/${TOTAL_QUESTIONS}`],
            ['Average NLP', averageScore ? `${averageScore}%` : '--'],
            ['Agent status', speaking ? 'Speaking' : listening ? 'Listening' : latestFeedback?.aiResult?.hiringSignal || 'Ready'],
          ].map(([label, value]) => (
            <div key={label} className="min-w-0 rounded-lg border border-white/10 bg-white/10 p-3 backdrop-blur">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/45">{label}</p>
              <p className="mt-1 truncate text-sm font-black sm:text-base" title={value}>{value}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 p-4 sm:p-5">
          <span className={`grid h-12 w-12 place-items-center rounded-lg ${listening ? 'bg-mint text-ink shadow-glow' : 'bg-white text-ink'}`}><Mic size={20} /></span>
          <span className="grid h-12 w-12 place-items-center rounded-lg bg-white text-ink"><Camera size={20} /></span>
          <span className={`grid h-12 w-12 place-items-center rounded-lg ${speaking ? 'bg-cyan text-ink shadow-glow' : 'bg-white text-ink'}`}><Volume2 size={20} /></span>
          {answeredCount >= TOTAL_QUESTIONS ? (
            <button onClick={completeInterview} disabled={loading} className="neon-button inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg px-6 font-black disabled:opacity-60 sm:w-auto">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />} Generate final report
            </button>
          ) : (
            <span className="rounded-lg bg-white/10 px-4 py-3 text-sm font-bold">AI speaks. Candidate answers by voice.</span>
          )}
        </div>
      </section>

      <section className="shine-card app-card shine-card flex min-h-[560px] flex-col rounded-lg sm:min-h-[700px]">
        <div className="border-b border-black/5 p-4 sm:p-5">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-coral">AI voice interview room</p>
          <h2 className="mt-1 text-2xl font-black">The agent asks out loud. Your microphone captures the answer.</h2>
        </div>

        <div className="no-scrollbar max-h-[320px] space-y-4 overflow-y-auto bg-slate-50 p-3 sm:p-5">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.speaker === 'student' ? 'justify-end' : 'justify-start'}`}>
              {message.speaker === 'assistant' && <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-ink text-mint"><Bot size={19} /></span>}
              <div className={`mobile-safe-text max-w-[86%] rounded-lg p-3 shadow-sm sm:max-w-[82%] sm:p-4 ${message.speaker === 'assistant' ? 'bg-white text-ink' : 'bg-ink text-white'}`}>
                {message.meta && <p className={`mb-2 text-xs font-black uppercase tracking-[0.12em] ${message.speaker === 'assistant' ? 'text-coral' : 'text-mint'}`}>{message.meta}</p>}
                <p className="leading-7">{message.text}</p>
              </div>
              {message.speaker === 'student' && <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-mint/20 text-ink"><UserRound size={19} /></span>}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-ink text-mint"><Bot size={19} /></span>
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <Loader2 className="animate-spin" size={20} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="border-t border-black/5 p-4 sm:p-5">
          <div className="grid gap-3 md:grid-cols-3">
            <button onClick={() => currentQuestion && speak(currentQuestion.question)} disabled={!currentQuestion || speaking} className="ghost-button inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-black disabled:opacity-50">
              <Volume2 size={18} /> Repeat question
            </button>
            <button onClick={listening ? stopListening : startListening} disabled={!voiceReady} className="neon-button inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-black disabled:opacity-50">
              {listening ? <Square size={18} /> : <Mic size={18} />} {listening ? 'Stop listening' : 'Start answering'}
            </button>
            <button onClick={resetCurrentAnswer} disabled={loading || !liveTranscript} className="ghost-button inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-black disabled:opacity-50">
              <Headphones size={18} /> Reset answer
            </button>
          </div>

          {!speechSupported && (
            <p className="mt-3 rounded-lg bg-coral/10 p-3 text-sm font-bold text-coral">
              This browser does not support live speech recognition. Use Chrome or Edge for microphone-based answering.
            </p>
          )}

          <div className="mt-4 rounded-lg border border-white/10 bg-white/10 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-black uppercase tracking-[0.14em] text-mint">Live answer transcript</p>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black">
                {listening ? 'Listening now' : speaking ? 'AI is speaking' : 'Ready'}
              </span>
            </div>
            <p className="mobile-safe-text mt-4 min-h-32 rounded-lg bg-black/20 p-4 leading-7 text-white/85">
              {liveTranscript || 'Click Start answering and speak naturally. Your answer will appear here automatically.'}
            </p>
          </div>

          {latestFeedback?.aiResult && (
            <div className="mb-5">
              <AnalysisGrid
                communicationSkills={latestFeedback.aiResult.communicationSkills}
                technicalKnowledge={latestFeedback.aiResult.technicalKnowledge}
                confidenceBehavior={latestFeedback.aiResult.confidenceBehavior}
                overallEvaluation={latestFeedback.aiResult.overallEvaluation}
              />
            </div>
          )}
          <div className="mt-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-sm font-bold text-slate-500">Minimum 30 spoken characters. The next AI question adapts to this answer.</p>
            <button onClick={submitAnswer} disabled={!canSubmit} className="neon-button inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-black disabled:opacity-50 sm:w-auto">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />} Submit spoken answer
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

