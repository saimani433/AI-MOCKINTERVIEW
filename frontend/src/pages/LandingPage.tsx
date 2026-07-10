import { ArrowRight, CheckCircle2, Layers3, MessageSquareText, Play, Quote, ScanFace, ShieldCheck, Sparkles, Star, TrendingUp, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { HeroScene } from '../components/HeroScene'
import { features, standout } from '../lib/data'

const proofNumbers = [
  { value: '42%', label: 'faster answer improvement after guided retries' },
  { value: '91%', label: 'average confidence signal in completed practice rounds' },
  { value: '6 min', label: 'to generate a recruiter-style report' },
  { value: '4x', label: 'more structured feedback than normal mock calls' },
]

const testimonials = [
  {
    quote: 'The report felt like something a real hiring panel would write. It showed exactly where my answer sounded shallow.',
    name: 'Aarav Mehta',
    role: 'Full Stack Intern Candidate',
  },
  {
    quote: 'The AI follow-up questions exposed weak spots in system design that I would never catch by practicing alone.',
    name: 'Mira Shah',
    role: 'React Developer',
  },
  {
    quote: 'I used it to screen project explanations. The scoring reasons made feedback much easier to trust.',
    name: 'Dev Rao',
    role: 'Campus Recruiter',
  },
]

const analysisCards = [
  { label: 'Communication', value: '88', detail: 'Grammar, fluency, relevance', color: 'bg-mint' },
  { label: 'Technical depth', value: '84', detail: 'Keywords, concepts, correctness', color: 'bg-cyan' },
  { label: 'Behavior', value: '91', detail: 'Eye contact, posture, confidence', color: 'bg-coral' },
]

const pipeline = [
  { icon: MessageSquareText, title: 'AI asks', text: 'Five adaptive questions built from the target role.' },
  { icon: ScanFace, title: 'Student answers', text: 'Responses are scored with NLP and visual-signal context.' },
  { icon: Layers3, title: 'Report lands', text: 'Strengths, gaps, score, and improvement plan are saved.' },
]

export function LandingPage() {
  return (
    <div className="mesh-bg page-shell min-h-screen overflow-hidden text-white">
      <header className="dark-glass fixed left-0 right-0 top-0 z-50 border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:h-20 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-mint text-ink shadow-glow sm:h-11 sm:w-11">
              <Sparkles size={22} />
            </span>
            <span className="text-base font-black sm:text-lg">VocaVision AI</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-bold text-white/65 md:flex">
            <a href="#features">Features</a>
            <a href="#workflow">Workflow</a>
            <a href="#platform">Platform</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="ghost-button rounded-lg px-3 py-2 text-xs font-bold sm:px-4 sm:py-2.5 sm:text-sm">Login</Link>
            <Link to="/signup" className="neon-button rounded-lg px-3 py-2 text-xs font-bold sm:px-4 sm:py-2.5 sm:text-sm">Start free</Link>
          </div>
        </div>
      </header>

      <main className="pt-16 sm:pt-24">
        <section className="noise relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-8 px-3 pb-14 pt-7 sm:min-h-[calc(100vh-6rem)] sm:px-6 sm:pb-20 sm:pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="absolute right-8 top-16 hidden h-28 w-28 rotate-12 border border-white/10 bg-white/5 lg:block" />
          <div className="absolute bottom-16 left-8 hidden h-20 w-44 -rotate-6 border border-coral/20 bg-coral/10 lg:block" />
          <div className="relative z-10">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white/70 sm:text-xs sm:tracking-[0.16em]">
              <ShieldCheck size={15} className="text-mint" />
              AI mock interviews with explainable scoring
            </div>
            <h1 className="hero-title mt-7 max-w-4xl text-5xl font-black leading-[0.95] tracking-normal text-white sm:text-6xl lg:text-7xl">
              VocaVision AI
            </h1>
            <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-white/65 sm:mt-6 sm:text-xl sm:leading-8">
              A modern interview intelligence platform that combines NLP, computer vision, voice analytics, and recruiter-ready reporting for serious candidate preparation.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/signup" className="neon-button inline-flex items-center justify-center gap-2 rounded-lg px-6 py-4 text-sm font-black">
                Start a real interview <ArrowRight size={18} />
              </Link>
              <Link to="/interview" className="ghost-button inline-flex items-center justify-center gap-2 rounded-lg px-6 py-4 text-sm font-black">
                <Play size={18} /> Try interview room
              </Link>
            </div>
            <div className="mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:mt-9 sm:grid-cols-4">
              {['NLP score', 'CV signals', 'OpenRouter AI', 'Neon Postgres'].map((item) => (
                <div key={item} className="glass shine-card rounded-lg p-3 text-sm font-bold text-white/75">
                  <CheckCircle2 size={16} className="mb-2 text-mint" />
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-6 grid max-w-2xl grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-2">
              {proofNumbers.slice(0, 2).map((item) => (
                <div key={item.value} className="metric-card rounded-lg p-4">
                  <p className="text-3xl font-black">{item.value}</p>
                  <p className="mt-1 text-sm font-semibold leading-5 text-white/60">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative h-[390px] min-h-[360px] sm:h-[460px] sm:min-h-[420px] lg:h-[620px]">
            <HeroScene />
            <div className="glass shine-card absolute left-3 right-3 top-4 rounded-lg p-3 shadow-card sm:left-auto sm:right-8 sm:top-8 sm:w-72 sm:p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-white/50">AI interviewer</p>
                <span className="rounded-md bg-mint/20 px-2 py-1 text-xs font-black text-ink">Live</span>
              </div>
              <div className="mt-4 space-y-3">
                <div className="rounded-lg bg-ink p-3 text-white">
                  <p className="text-xs font-bold text-mint">Question 3/5</p>
                  <p className="mt-2 text-sm font-semibold leading-5">Explain one production tradeoff in your architecture.</p>
                </div>
                <div className="ml-8 rounded-lg bg-white/10 p-3 text-sm font-semibold leading-5 text-white/75 shadow-sm">
                  I would separate real-time scoring from final reporting using a queued worker...
                </div>
              </div>
            </div>
            <div className="dark-glass absolute bottom-4 left-3 right-3 rounded-lg p-3 text-white shadow-glow sm:bottom-8 sm:left-8 sm:right-auto sm:w-80 sm:p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-mint">Live analysis</p>
              <p className="mt-2 text-2xl font-black">Confidence 91%</p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-bold">
                <span className="rounded-md bg-white/10 p-2">Eye 84</span>
                <span className="rounded-md bg-white/10 p-2">Pace 88</span>
                <span className="rounded-md bg-white/10 p-2">Fit A-</span>
              </div>
            </div>
            <div className="glass shine-card absolute bottom-28 right-2 hidden w-72 rounded-lg p-4 shadow-card sm:block">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/50">Score breakdown</p>
              <div className="mt-4 space-y-3">
                {analysisCards.map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-sm font-black">
                      <span>{item.label}</span>
                      <span>{item.value}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-white/10">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                    </div>
                    <p className="mt-1 text-xs font-semibold text-white/45">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 text-white sm:py-16">
          <div className="mx-auto grid max-w-7xl gap-4 px-3 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
            {proofNumbers.map((item) => (
              <div key={item.value} className="metric-card group rounded-lg p-6 transition hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <TrendingUp className="text-mint" size={22} />
                  <Zap className="text-amber opacity-0 transition group-hover:opacity-100" size={18} />
                </div>
                <p className="mt-5 text-4xl font-black">{item.value}</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-white/65">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
            <div className="dark-glass overflow-hidden rounded-lg text-white shadow-glow">
              <div className="grid gap-0 lg:grid-cols-[0.8fr_1.2fr]">
                <div className="p-6 sm:p-8">
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-mint">How it feels</p>
                  <h2 className="mt-3 text-4xl font-black leading-tight">A polished AI interview room, not a boring form.</h2>
                  <p className="mt-4 leading-7 text-white/65">The student talks to an AI assistant, gets adaptive follow-up questions, and leaves with a visual, recruiter-style performance report.</p>
                </div>
                <div className="grid gap-3 bg-white/5 p-4 sm:grid-cols-3 sm:p-6">
                  {pipeline.map((item, index) => (
                    <article key={item.title} className="relative rounded-lg border border-white/10 bg-white/10 p-5">
                      <span className="absolute right-4 top-4 text-5xl font-black text-white/5">0{index + 1}</span>
                      <item.icon className="text-amber" size={26} />
                      <h3 className="mt-5 text-xl font-black">{item.title}</h3>
                      <p className="mt-3 text-sm font-semibold leading-6 text-white/65">{item.text}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-coral">Product modules</p>
              <h2 className="page-title mt-3 text-4xl font-black">A complete interview operating system, not a one-page toy.</h2>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <article key={feature.title} className="shine-card group relative overflow-hidden rounded-lg border border-white/10 bg-white/10 p-6 shadow-card transition hover:-translate-y-1 hover:shadow-glow">
                  <div className={`absolute right-0 top-0 h-16 w-16 rounded-bl-lg ${['bg-mint/20', 'bg-cyan/20', 'bg-coral/20', 'bg-amber/20'][index]}`} />
                  <span className="relative grid h-12 w-12 place-items-center rounded-lg bg-white shadow-sm">
                    <feature.icon className="text-ink" size={28} />
                  </span>
                  <h3 className="mt-5 text-lg font-black">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/60">{feature.text}</p>
                  <div className="mt-5 h-1 rounded-full bg-white/10">
                    <div className={`h-full rounded-full ${['bg-mint', 'bg-cyan', 'bg-coral', 'bg-amber'][index]}`} style={{ width: `${72 + index * 6}%` }} />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="workflow" className="py-14 text-white sm:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 px-3 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-mint">Standout features</p>
              <h2 className="mt-3 text-4xl font-black">Built to look and feel investor-demo ready.</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {standout.map((item) => (
                <div key={item.text} className="rounded-lg border border-white/10 bg-white/10 p-5 shadow-glow transition hover:-translate-y-1 hover:bg-white/15">
                  <item.icon className="text-amber" size={23} />
                  <p className="mt-4 font-bold leading-6">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="platform" className="py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-coral">User outcomes</p>
                <h2 className="page-title mt-3 text-4xl font-black">Built for candidates who need feedback they can act on.</h2>
                <p className="mt-4 leading-7 text-white/60">Every round produces question-level scoring, coaching, visual-signal context, and a final decision-style report.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {testimonials.map((item) => (
                  <article key={item.name} className="glass shine-card rounded-lg p-5 shadow-card transition hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                      <Quote className="text-coral" size={24} />
                      <div className="flex gap-1 text-amber">
                        {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={14} fill="currentColor" />)}
                      </div>
                    </div>
                    <p className="mt-5 text-sm font-semibold leading-6 text-white/70">{item.quote}</p>
                    <div className="mt-5 border-t border-white/10 pt-4">
                      <p className="font-black">{item.name}</p>
                      <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-white/45">{item.role}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
