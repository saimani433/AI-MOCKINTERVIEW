import { CalendarDays, CheckCircle2, GitBranch, Loader2, Map, Rocket, Sparkles, Target, TriangleAlert } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { api } from '../lib/api'

type RoadmapResult = {
  title: string
  overview: string
  roadmapScore: number
  phases: Array<{
    phase: string
    duration: string
    goal: string
    topics: string[]
    projects: string[]
    resources: string[]
    checkpoints: string[]
  }>
  weeklyPlan: Array<{ week: string; focus: string; tasks: string[] }>
  milestones: string[]
  mistakesToAvoid: string[]
  finalProject: string
  interviewPrep: string[]
}

export function RoadmapPage() {
  const [form, setForm] = useState({
    goal: 'MERN Stack Full Stack Developer',
    currentLevel: 'Beginner to intermediate',
    timeline: '12 weeks',
    hoursPerWeek: 12,
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RoadmapResult | null>(null)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/career/roadmap/generate', form)
      setResult(res.data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-lg bg-ink p-6 text-white shadow-glow sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-mint">AI roadmap generator</p>
          <h1 className="mt-3 text-4xl font-black leading-tight">Get a clear route map for anything you want to learn.</h1>
          <p className="mt-4 leading-7 text-white/70">MERN stack, full stack, DSA, DevOps, AI engineering, system design, or any career goal. The AI turns it into phases, projects, checkpoints, and interview prep.</p>
        </div>

        <form onSubmit={submit} className="rounded-lg border border-white/10 bg-white/10 p-6 text-white shadow-glow backdrop-blur">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-sm font-bold text-white/70">What do you want to learn?</span>
              <input className="mt-2 w-full rounded-lg border border-white/10 bg-ink/70 px-4 py-3 text-white outline-none" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-white/70">Current level</span>
              <input className="mt-2 w-full rounded-lg border border-white/10 bg-ink/70 px-4 py-3 text-white outline-none" value={form.currentLevel} onChange={(e) => setForm({ ...form, currentLevel: e.target.value })} />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-white/70">Timeline</span>
              <input className="mt-2 w-full rounded-lg border border-white/10 bg-ink/70 px-4 py-3 text-white outline-none" value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })} />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-bold text-white/70">Hours per week</span>
              <input className="mt-2 w-full rounded-lg border border-white/10 bg-ink/70 px-4 py-3 text-white outline-none" type="number" min={1} max={80} value={form.hoursPerWeek} onChange={(e) => setForm({ ...form, hoursPerWeek: Number(e.target.value) })} />
            </label>
          </div>
          <button disabled={loading} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-black text-white disabled:opacity-60">
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />} Generate roadmap
          </button>
        </form>
      </section>

      {result && (
        <>
          <section className="rounded-lg border border-white/10 bg-white/10 p-6 text-white shadow-glow backdrop-blur">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.16em] text-coral">Generated plan</p>
                <h2 className="mt-2 text-3xl font-black">{result.title}</h2>
                <p className="mt-3 max-w-4xl leading-7 text-white/70">{result.overview}</p>
              </div>
              <div className="rounded-lg bg-mint p-5 text-ink">
                <p className="text-sm font-bold text-white/60">Roadmap clarity</p>
                <p className="mt-2 text-4xl font-black">{result.roadmapScore || 90}%</p>
              </div>
            </div>
          </section>

          <section className="grid gap-4">
            {result.phases?.map((phase, index) => (
              <article key={`${phase.phase}-${index}`} className="rounded-lg border border-white/10 bg-white/10 p-6 text-white shadow-glow backdrop-blur">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-lg bg-ink text-mint">{index + 1}</span>
                    <div>
                      <h3 className="text-xl font-black">{phase.phase}</h3>
                      <p className="mt-1 text-sm font-bold text-white/55">{phase.duration} - {phase.goal}</p>
                    </div>
                  </div>
                  <Map className="text-coral" />
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-4">
                  <List title="Topics" items={phase.topics} icon={<Target size={17} />} />
                  <List title="Projects" items={phase.projects} icon={<Rocket size={17} />} />
                  <List title="Resources" items={phase.resources} icon={<GitBranch size={17} />} />
                  <List title="Checkpoints" items={phase.checkpoints} icon={<CheckCircle2 size={17} />} />
                </div>
              </article>
            ))}
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-lg border border-white/10 bg-white/10 p-6 text-white shadow-glow backdrop-blur">
              <div className="flex items-center gap-3"><CalendarDays /><h2 className="text-xl font-black">Weekly plan</h2></div>
              <div className="mt-5 space-y-3">{result.weeklyPlan?.map((week) => <div key={week.week} className="rounded-lg bg-ink/70 p-4"><p className="font-black">{week.week}: {week.focus}</p><div className="mt-2 flex flex-wrap gap-2">{week.tasks?.map((task) => <span key={task} className="rounded-md bg-white/10 px-2 py-1 text-xs font-bold">{task}</span>)}</div></div>)}</div>
            </article>
            <article className="rounded-lg border border-white/10 bg-white/10 p-6 text-white shadow-glow backdrop-blur">
              <div className="flex items-center gap-3"><TriangleAlert /><h2 className="text-xl font-black">Mistakes to avoid</h2></div>
              <div className="mt-5 space-y-3">{result.mistakesToAvoid?.map((item) => <p key={item} className="rounded-lg bg-coral/10 p-4 font-bold">{item}</p>)}</div>
            </article>
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <article className="rounded-lg bg-ink p-6 text-white shadow-glow lg:col-span-2">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-mint">Final project</p>
              <h2 className="mt-3 text-2xl font-black">{result.finalProject}</h2>
            </article>
            <article className="rounded-lg border border-white/10 bg-white/10 p-6 text-white shadow-glow backdrop-blur">
              <h2 className="text-xl font-black">Interview prep</h2>
              <div className="mt-4 space-y-2">{result.interviewPrep?.map((item) => <p key={item} className="rounded-md bg-mint/10 px-3 py-2 text-sm font-bold">{item}</p>)}</div>
            </article>
          </section>
        </>
      )}
    </div>
  )
}

function List({ title, items, icon }: { title: string; items: string[]; icon: ReactNode }) {
  return (
    <div className="rounded-lg bg-ink/70 p-4">
      <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-mint">{icon}{title}</div>
      <div className="mt-3 space-y-2">{items?.map((item) => <p key={item} className="text-sm font-semibold leading-5 text-white/70">{item}</p>)}</div>
    </div>
  )
}
