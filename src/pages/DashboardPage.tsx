import { ArrowUpRight, Bot, CalendarDays, FileText, PlayCircle, Target } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { api, type Interview, type Report } from '../lib/api'

export function DashboardPage() {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/interviews'), api.get('/reports')])
      .then(([interviewRes, reportRes]) => {
        setInterviews(interviewRes.data)
        setReports(reportRes.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const chartData = useMemo(
    () =>
      interviews
        .slice()
        .reverse()
        .map((item, index) => ({
          day: `Round ${index + 1}`,
          score: Number(item.overall_score || 0),
        })),
    [interviews],
  )

  const completed = interviews.filter((item) => item.status === 'completed').length
  const average = interviews.length
    ? Math.round(interviews.reduce((sum, item) => sum + Number(item.overall_score || 0), 0) / interviews.length)
    : 0

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="shine-card rounded-lg bg-ink p-5 text-white shadow-glow sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-mint">Interview workspace</p>
              <h1 className="page-title mt-3 max-w-2xl text-3xl font-black sm:text-4xl">Create a role-specific AI interview and score real answers.</h1>
              <p className="mt-3 max-w-2xl leading-7 text-white/68">This dashboard reads from your backend. Sessions, generated questions, answer analysis, and final reports are saved through the API.</p>
            </div>
            <Link to="/interview" className="neon-button inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-black sm:w-auto">
              <PlayCircle size={18} /> New interview
            </Link>
          </div>
        </div>
        <div className="shine-card app-card shine-card rounded-lg p-5 sm:p-6">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-500">System status</p>
          <div className="mt-5 flex items-center gap-4">
            <span className="grid h-14 w-14 place-items-center rounded-lg bg-mint/15 text-ink">
              <Bot size={28} />
            </span>
            <div>
              <p className="text-2xl font-black">{loading ? 'Loading' : 'API connected'}</p>
              <p className="text-sm text-slate-500">Neon, Express, OpenRouter flow</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Total interviews', interviews.length, 'bg-mint'],
          ['Completed reports', reports.length || completed, 'bg-cyan'],
          ['Average score', `${average}%`, 'bg-coral'],
          ['In progress', interviews.filter((item) => item.status !== 'completed').length, 'bg-amber'],
        ].map(([label, value, color]) => (
          <article key={label} className="shine-card app-card shine-card rounded-lg p-4 sm:p-5">
            <div className={`h-2 w-12 rounded-full ${color}`} />
            <p className="mt-5 text-sm font-bold text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-black">{value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="shine-card app-card shine-card rounded-lg p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-coral">Saved performance</p>
              <h2 className="mt-2 text-2xl font-black">Score trend</h2>
            </div>
            <ArrowUpRight />
          </div>
          <div className="mt-6 h-72">
            {chartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="score" stroke="#07111f" fill="#4cc9f033" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-full place-items-center rounded-lg bg-slate-50 text-center">
                <div>
                  <Target className="mx-auto text-slate-400" />
                  <p className="mt-3 font-black">No interviews yet</p>
                  <p className="text-sm text-slate-500">Start one and your scores appear here.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="shine-card app-card shine-card rounded-lg p-4 sm:p-5">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-500">Recent sessions</p>
          <div className="mt-5 space-y-3">
            {interviews.length === 0 && <p className="rounded-lg bg-slate-50 p-4 text-sm font-bold text-slate-500">No sessions yet. Create your first interview from the Interview page.</p>}
            {interviews.slice(0, 5).map((item) => (
              <article key={item.id} className="shine-card app-card-muted shine-card rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="mobile-safe-text font-black">{item.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{item.target_role} • {item.status}</p>
                  </div>
                  <span className="rounded-md bg-white px-2 py-1 text-sm font-black">{Number(item.overall_score || 0)}%</span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-500">
                  <CalendarDays size={14} /> {new Date(item.created_at).toLocaleString()}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {reports[0] && (
        <section className="shine-card app-card shine-card rounded-lg p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <FileText />
            <h2 className="text-xl font-black">Latest AI report</h2>
          </div>
          <p className="mt-4 leading-7 text-slate-600">{reports[0].summary}</p>
          <Link to="/reports" className="neon-button mt-5 inline-flex w-full justify-center rounded-lg px-4 py-3 text-sm font-black sm:w-auto">View reports</Link>
        </section>
      )}
    </div>
  )
}

