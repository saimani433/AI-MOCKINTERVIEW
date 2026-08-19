import { FileSearch, Loader2, Sparkles, UploadCloud } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { api } from '../lib/api'

type ResumeResult = {
  resumeScore: number
  atsScore: number
  grammarScore: number
  roleFitScore: number
  summary: string
  strengths: string[]
  corrections: Array<{ issue: string; fix: string; severity: string }>
  grammarMistakes: Array<{ text: string; suggestion: string; reason: string }>
  missingKeywords: string[]
  recommendedRewrite: string[]
  actionPlan: string[]
  sourceFile?: string
  extractedCharacters?: number
  resumePreview?: string
  analysisMode?: string
}

function ScoreCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/10 p-5 text-white shadow-glow backdrop-blur">
      <p className="text-sm font-black uppercase tracking-[0.14em] text-white/50">{label}</p>
      <p className="mt-3 text-4xl font-black">{value || 0}%</p>
      <div className="mt-4 h-2 rounded-full bg-white/10">
        <div className="h-full rounded-full bg-mint" style={{ width: `${Math.max(5, Math.min(value || 0, 100))}%` }} />
      </div>
    </div>
  )
}

export function ResumePage() {
  const [targetRole, setTargetRole] = useState('Full Stack Developer')
  const [resumeText, setResumeText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ResumeResult | null>(null)

  const selectFile = (selectedFile?: File) => {
    setError('')
    if (!selectedFile) {
      setFile(null)
      return
    }

    if (!selectedFile.name.toLowerCase().endsWith('.docx')) {
      setFile(null)
      setError('Only .docx resume files are allowed. PDF, DOC, TXT, and other formats are blocked.')
      return
    }

    setFile(selectedFile)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('targetRole', targetRole)
      formData.append('resumeText', resumeText)
      if (file) formData.append('resume', file)
      const res = await api.post('/career/resume/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(res.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Resume analysis failed. Paste resume text and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-lg bg-ink p-6 text-white shadow-glow sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-mint">Resume analysis</p>
          <h1 className="mt-3 text-4xl font-black leading-tight">Upload your resume and get a hiring-ready score.</h1>
          <p className="mt-4 leading-7 text-white/70">Only .docx resumes are accepted for accurate analysis. Scores ATS strength, role fit, grammar quality, missing keywords, corrections, and rewritten bullet suggestions.</p>
        </div>

        <form onSubmit={submit} className="rounded-lg border border-white/10 bg-white/10 p-6 text-white shadow-glow backdrop-blur">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-bold text-white/70">Target role</span>
              <input className="mt-2 w-full rounded-lg border border-white/10 bg-ink/70 px-4 py-3 text-white outline-none placeholder:text-white/35" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-white/70">Upload resume</span>
              <label className="mt-2 flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-white/20 bg-ink/70 px-4 py-3 font-bold text-white/70">
                <UploadCloud size={19} />
                <span className="truncate">{file?.name || 'DOCX only'}</span>
                <input className="hidden" type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => selectFile(e.target.files?.[0])} />
              </label>
            </label>
          </div>
          <label className="mt-4 block">
            <span className="text-sm font-bold text-white/70">Optional extracted text / notes</span>
            <textarea className="mt-2 min-h-44 w-full rounded-lg border border-white/10 bg-ink/70 px-4 py-3 leading-7 text-white outline-none placeholder:text-white/35" value={resumeText} onChange={(e) => setResumeText(e.target.value)} placeholder="Paste resume content here..." />
          </label>
          {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
          <button disabled={loading} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-black text-white disabled:opacity-60">
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />} Analyze resume
          </button>
        </form>
      </section>

      {result && (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ScoreCard label="Resume score" value={result.resumeScore} />
            <ScoreCard label="ATS score" value={result.atsScore} />
            <ScoreCard label="Grammar score" value={result.grammarScore} />
            <ScoreCard label="Role fit" value={result.roleFitScore} />
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-lg border border-white/10 bg-white/10 p-6 text-white shadow-glow backdrop-blur">
              <div className="flex items-center gap-3">
                <FileSearch />
                <h2 className="text-xl font-black">Summary</h2>
              </div>
              <p className="mt-4 leading-7 text-white/70">{result.summary}</p>
              <div className="mt-4 rounded-lg bg-ink/70 p-3 text-xs font-bold leading-5 text-white/55">
                <p>Source: {result.sourceFile || 'resume.docx'} • Extracted: {result.extractedCharacters || 0} characters</p>
                {result.resumePreview && <p className="mt-2 text-white/70">{result.resumePreview}...</p>}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">{result.strengths?.map((item) => <span key={item} className="rounded-md bg-mint/10 px-2 py-1 text-xs font-black">{item}</span>)}</div>
            </article>

            <article className="rounded-lg border border-white/10 bg-white/10 p-6 text-white shadow-glow backdrop-blur">
              <h2 className="text-xl font-black">Missing keywords</h2>
              <div className="mt-4 flex flex-wrap gap-2">{result.missingKeywords?.map((item) => <span key={item} className="rounded-md bg-coral/10 px-3 py-2 text-sm font-bold">{item}</span>)}</div>
            </article>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-lg border border-white/10 bg-white/10 p-6 text-white shadow-glow backdrop-blur">
              <h2 className="text-xl font-black">Corrections</h2>
              <div className="mt-5 space-y-3">{result.corrections?.map((item) => <div key={item.issue} className="rounded-lg bg-ink/70 p-4"><p className="font-black">{item.issue}</p><p className="mt-2 text-sm leading-6 text-white/65">{item.fix}</p></div>)}</div>
            </article>
            <article className="rounded-lg border border-white/10 bg-white/10 p-6 text-white shadow-glow backdrop-blur">
              <h2 className="text-xl font-black">Grammar mistakes</h2>
              <div className="mt-5 space-y-3">{result.grammarMistakes?.map((item) => <div key={item.text} className="rounded-lg bg-ink/70 p-4"><p className="font-black">{item.text}</p><p className="mt-2 text-sm font-bold text-mint">{item.suggestion}</p><p className="mt-1 text-sm text-white/65">{item.reason}</p></div>)}</div>
            </article>
          </section>

          <section className="rounded-lg border border-white/10 bg-white/10 p-6 text-white shadow-glow backdrop-blur">
            <h2 className="text-xl font-black">Recommended rewrites and action plan</h2>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="space-y-3">{result.recommendedRewrite?.map((item) => <p key={item} className="rounded-lg bg-mint/10 p-4 font-bold leading-7">{item}</p>)}</div>
              <div className="space-y-3">{result.actionPlan?.map((item) => <p key={item} className="rounded-lg bg-ink/70 p-4 font-bold leading-7">{item}</p>)}</div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
