import { Loader2, Search, Sparkles } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { api, type Question } from '../lib/api'

export function LibraryPage() {
  const [form, setForm] = useState({
    targetRole: 'Backend Engineer',
    difficulty: 'intermediate',
    questionCount: 6,
    jobDescription: 'Node.js, Express, Postgres, Redis, scalable APIs, authentication, and AI integrations.',
  })
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)

  const generate = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/interviews/generate-questions', form)
      setQuestions(res.data.questions || [])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-coral">AI question studio</p>
          <h1 className="page-title mt-2 text-3xl font-black">Generate role-specific interview sets</h1>
          <p className="mt-2 max-w-2xl text-slate-600">This is no longer a static question bank. It calls your backend, uses OpenRouter, and returns customized questions with evaluation focus and scoring signals.</p>
        </div>
      </div>

      <form onSubmit={generate} className="shine-card app-card shine-card rounded-lg p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_150px]">
          <label className="flex items-center gap-3 rounded-lg border border-black/10 px-4 py-3">
            <Search size={18} className="text-slate-400" />
            <input className="w-full outline-none" value={form.targetRole} onChange={(e) => setForm({ ...form, targetRole: e.target.value })} placeholder="Role, for example React Developer" />
          </label>
          <select className="rounded-lg border border-black/10 px-4 py-3 outline-none" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="senior">Senior</option>
          </select>
          <input className="rounded-lg border border-black/10 px-4 py-3 outline-none" type="number" min={3} max={10} value={form.questionCount} onChange={(e) => setForm({ ...form, questionCount: Number(e.target.value) })} />
        </div>
        <textarea className="mt-3 min-h-28 w-full rounded-lg border border-black/10 px-4 py-3 outline-none" value={form.jobDescription} onChange={(e) => setForm({ ...form, jobDescription: e.target.value })} />
        <button disabled={loading} className="neon-button mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-black disabled:opacity-60 sm:w-auto">
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />} Generate questions
        </button>
      </form>

      <div className="grid gap-4 lg:grid-cols-2">
        {questions.length === 0 && (
          <div className="shine-card app-card shine-card rounded-lg border-dashed p-6 text-center sm:p-8 lg:col-span-2">
            <p className="font-black">Generate a set to see real AI questions here.</p>
            <p className="mt-2 text-sm text-slate-500">Use this page to build and test question sets before starting a full interview session.</p>
          </div>
        )}
        {questions.map((question) => (
          <article key={question.id || question.question} className="shine-card app-card shine-card rounded-lg p-5 sm:p-6">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-md bg-ink px-2 py-1 text-xs font-black text-white">{form.targetRole}</span>
              <span className="rounded-md bg-cyan/10 px-2 py-1 text-xs font-black text-ink">{question.type}</span>
              <span className="rounded-md bg-coral/10 px-2 py-1 text-xs font-black text-ink">{form.difficulty}</span>
            </div>
            <h2 className="mobile-safe-text mt-5 text-xl font-black leading-tight">{question.question}</h2>
            <p className="mt-3 leading-7 text-slate-600">{question.evaluationFocus}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {question.idealSignals?.map((signal) => <span key={signal} className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold">{signal}</span>)}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

