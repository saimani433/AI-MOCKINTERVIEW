import { BookOpenCheck, BrainCircuit, CalendarDays, CheckCircle2, Flame, MessageSquareText, PlayCircle, Target, Trophy } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnalysisGrid } from '../components/AnalysisGrid'
import { api, type Interview, type Report } from '../lib/api'

const drills = [
  {
    title: 'STAR answer structure',
    focus: 'Behavioral clarity',
    time: '12 min',
    task: 'Rewrite one weak answer using Situation, Task, Action, Result.',
  },
  {
    title: 'Architecture tradeoff drill',
    focus: 'Technical depth',
    time: '18 min',
    task: 'Explain one backend decision with 2 alternatives and one clear tradeoff.',
  },
  {
    title: 'Concise project pitch',
    focus: 'Communication',
    time: '10 min',
    task: 'Record a 90-second project explanation with impact, stack, and ownership.',
  },
]

export function CoachPage() {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [reports, setReports] = useState<Report[]>([])

  useEffect(() => {
    Promise.all([api.get('/interviews'), api.get('/reports')]).then(([interviewRes, reportRes]) => {
      setInterviews(interviewRes.data)
      setReports(reportRes.data)
    })
  }, [])

  const avgScore = useMemo(() => {
    if (!interviews.length) return 0
    return Math.round(interviews.reduce((sum, item) => sum + Number(item.overall_score || 0), 0) / interviews.length)
  }, [interviews])

  const latestReport = reports[0]
  const risks = latestReport?.risks?.length ? latestReport.risks : ['Answer depth needs more examples', 'Quantify project impact better', 'Explain tradeoffs before final choices']
  const strengths = latestReport?.strengths?.length ? latestReport.strengths : ['Good communication foundation', 'Clear role intent', 'Solid technical direction']

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="shine-card rounded-lg bg-ink p-5 text-white shadow-glow sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-mint">AI coach plan</p>
          <h1 className="page-title mt-3 text-3xl font-black leading-tight sm:text-4xl">Know exactly what to practice before the next interview.</h1>
          <p className="mt-4 max-w-3xl leading-7 text-white/70">
            This page turns interview reports into a focused prep roadmap: weak areas, drills, next practice rounds, and a clear readiness target.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/interview" className="neon-button inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-black sm:w-auto">
              <PlayCircle size={18} /> Start coached round
            </Link>
            <Link to="/reports" className="ghost-button inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-black sm:w-auto">
              <BookOpenCheck size={18} /> Review reports
            </Link>
          </div>
        </div>

        <div className="shine-card app-card shine-card rounded-lg p-5 sm:p-6">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-500">Readiness score</p>
          <div className="mt-5 flex items-end gap-3">
            <p className="text-6xl font-black">{avgScore || 72}</p>
            <p className="pb-2 text-xl font-black text-slate-400">/100</p>
          </div>
          <div className="mt-5 h-3 rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-mint" style={{ width: `${Math.max(avgScore || 72, 12)}%` }} />
          </div>
          <p className="mt-4 text-sm font-semibold leading-6 text-slate-600">
            Target 85+ before applying to high-priority roles. Complete two focused drills and one adaptive mock round.
          </p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="shine-card app-card shine-card rounded-lg p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <Target className="text-coral" />
            <h2 className="text-xl font-black">Priority gaps</h2>
          </div>
          <div className="mt-5 space-y-3">
            {risks.slice(0, 4).map((item) => (
              <div key={item} className="rounded-lg bg-coral/10 p-4 font-bold text-ink">{item}</div>
            ))}
          </div>
        </article>

        <article className="shine-card app-card shine-card rounded-lg p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <Trophy className="text-amber" />
            <h2 className="text-xl font-black">Keep doing</h2>
          </div>
          <div className="mt-5 space-y-3">
            {strengths.slice(0, 4).map((item) => (
              <div key={item} className="rounded-lg bg-mint/10 p-4 font-bold text-ink">{item}</div>
            ))}
          </div>
        </article>

        <article className="shine-card app-card shine-card rounded-lg p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <CalendarDays className="text-cyan" />
            <h2 className="text-xl font-black">7-day plan</h2>
          </div>
          <div className="mt-5 space-y-4">
            {['Day 1: Project pitch', 'Day 2: System design round', 'Day 3: Behavioral stories', 'Day 4: Full AI mock', 'Day 5: Report review'].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 font-bold">
                <CheckCircle2 size={18} className="text-mint" /> {item}
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-coral">Mandatory analysis areas</p>
          <h2 className="mt-2 text-2xl font-black">Track every required evaluation dimension</h2>
        </div>
        <AnalysisGrid
          communicationSkills={latestReport?.analysis?.communicationSkills}
          technicalKnowledge={latestReport?.analysis?.technicalKnowledge}
          confidenceBehavior={latestReport?.analysis?.confidenceBehavior}
          overallEvaluation={latestReport?.analysis?.overallEvaluation}
        />
      </section>

      <section className="shine-card app-card shine-card rounded-lg p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-coral">Practice drills</p>
            <h2 className="mt-2 text-2xl font-black">Recommended next actions</h2>
          </div>
          <span className="neon-button inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-black">
            <Flame size={18} /> {interviews.length || 0} rounds logged
          </span>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {drills.map((drill) => (
            <article key={drill.title} className="shine-card app-card-muted shine-card rounded-lg p-5">
              <BrainCircuit className="text-ink" />
              <h3 className="mt-4 text-lg font-black">{drill.title}</h3>
              <p className="mt-2 text-sm font-bold text-coral">{drill.focus} • {drill.time}</p>
              <p className="mt-4 leading-7 text-slate-600">{drill.task}</p>
              <button className="ghost-button mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-black">
                <MessageSquareText size={17} /> Add to next mock
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

