import { Download, FileText, TrendingUp } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AnalysisGrid } from '../components/AnalysisGrid'
import { api, type Report } from '../lib/api'

export function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])

  useEffect(() => {
    api.get('/reports').then((res) => setReports(res.data))
  }, [])

  const data = useMemo(
    () =>
      reports.slice(0, 6).map((report) => ({
        area: report.target_role.split(' ')[0],
        score: Number(report.overall_score || 0),
      })),
    [reports],
  )

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="shine-card rounded-lg bg-ink p-5 text-white shadow-glow sm:p-8">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-mint">Saved candidate analytics</p>
        <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="page-title text-3xl font-black">Performance reports</h1>
            <p className="mt-2 max-w-2xl text-white/65">Reports are generated after completing an interview and stored in Postgres with strengths, risks, recommendation, and final score.</p>
          </div>
          <button onClick={() => window.print()} className="neon-button inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-black sm:w-auto"><Download size={18} /> Print / PDF</button>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="shine-card app-card shine-card rounded-lg p-4 sm:p-5">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-500">Report scores</p>
          <div className="mt-5 h-80">
            {data.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="area" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#07111f" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-full place-items-center rounded-lg bg-slate-50 text-center text-sm font-bold text-slate-500">Complete an interview to create your first report.</div>
            )}
          </div>
        </div>
        <div className="shine-card app-card shine-card overflow-hidden rounded-lg">
          <div className="flex items-center justify-between border-b border-black/5 p-5">
            <h2 className="text-xl font-black">Generated reports</h2>
            <TrendingUp size={20} />
          </div>
          <div className="divide-y divide-black/5">
            {reports.length === 0 && <p className="p-6 text-sm font-bold text-slate-500">No reports yet. Finish an interview and the final AI report will appear here.</p>}
            {reports.map((report) => (
              <article key={report.id} className="p-5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <h3 className="mobile-safe-text text-lg font-black">{report.title}</h3>
                    <p className="mt-1 text-sm font-bold text-slate-500">{report.target_role} - {new Date(report.created_at).toLocaleString()}</p>
                  </div>
                  <span className="rounded-md bg-mint/15 px-3 py-1 text-sm font-black">{Number(report.overall_score || 0)}%</span>
                </div>
                <p className="mt-4 leading-7 text-slate-600">{report.summary}</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.12em] text-slate-500">Strengths</p>
                    <div className="mt-2 flex flex-wrap gap-2">{report.strengths?.map((item) => <span key={item} className="rounded-md bg-mint/10 px-2 py-1 text-xs font-bold">{item}</span>)}</div>
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.12em] text-slate-500">Risks</p>
                    <div className="mt-2 flex flex-wrap gap-2">{report.risks?.map((item) => <span key={item} className="rounded-md bg-coral/10 px-2 py-1 text-xs font-bold">{item}</span>)}</div>
                  </div>
                </div>
                <p className="mobile-safe-text mt-4 inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 font-bold"><FileText size={14} /> {report.recommendation}</p>
                {report.analysis && (
                  <div className="mt-5">
                    <AnalysisGrid
                      communicationSkills={report.analysis.communicationSkills}
                      technicalKnowledge={report.analysis.technicalKnowledge}
                      confidenceBehavior={report.analysis.confidenceBehavior}
                      overallEvaluation={report.analysis.overallEvaluation}
                    />
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

