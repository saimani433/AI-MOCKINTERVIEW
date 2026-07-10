import { ArrowRight, BrainCircuit, Eye, Lock, Mail, User } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { api } from '../lib/api'

export function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const isSignup = mode === 'signup'
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const endpoint = isSignup ? '/auth/signup' : '/auth/login'
      const payload = isSignup ? form : { email: form.email, password: form.password }
      const res = await api.post(endpoint, payload)
      localStorage.setItem('vocavision_token', res.data.token)
      navigate('/dashboard')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Backend is reachable, but the request failed.')
      } else {
        setError('Could not connect to the backend server.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mesh-bg page-shell grid min-h-screen place-items-center px-3 py-6 sm:px-4 sm:py-10">
      <div className="dark-glass grid w-full max-w-6xl overflow-hidden rounded-lg shadow-card lg:grid-cols-[0.9fr_1.1fr]">
        <div className="shine-card bg-ink p-6 text-white sm:p-10">
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-white text-ink">
              <BrainCircuit size={23} />
            </span>
            <span className="text-lg font-black">VocaVision AI</span>
          </Link>
          <h1 className="page-title mt-10 text-3xl font-black leading-tight sm:mt-16 sm:text-4xl">{isSignup ? 'Create your interview workspace.' : 'Continue your preparation.'}</h1>
          <p className="mt-5 leading-7 text-white/70">Your account connects to real interview sessions, OpenRouter question generation, answer scoring, and saved performance reports.</p>
          <div className="mt-10 rounded-lg border border-white/10 bg-white/10 p-5">
            <p className="text-sm font-bold text-mint">Functional flow</p>
            <p className="mt-3 text-2xl font-black">Login, create a role-based interview, answer questions, and generate a final report.</p>
          </div>
        </div>
        <div className="p-5 sm:p-10">
          <div className="mx-auto max-w-md">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-coral">{isSignup ? 'Sign up' : 'Login'}</p>
            <h2 className="page-title mt-3 text-3xl font-black">{isSignup ? 'Start a real session' : 'Open your dashboard'}</h2>
            <form className="mt-8 space-y-4" onSubmit={submit}>
              {isSignup && (
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Full name</span>
                  <span className="mt-2 flex items-center gap-3 rounded-lg border border-black/10 px-4 py-3">
                    <User size={18} className="text-slate-400" />
                    <input className="w-full outline-none" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Praneeth Kumar" required />
                  </span>
                </label>
              )}
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Email</span>
                <span className="mt-2 flex items-center gap-3 rounded-lg border border-black/10 px-4 py-3">
                  <Mail size={18} className="text-slate-400" />
                  <input className="w-full outline-none" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" type="email" required />
                </span>
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Password</span>
                <span className="mt-2 flex items-center gap-3 rounded-lg border border-black/10 px-4 py-3">
                  <Lock size={18} className="text-slate-400" />
                  <input className="w-full outline-none" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" placeholder="Minimum 6 characters" required minLength={6} />
                  <Eye size={18} className="text-slate-400" />
                </span>
              </label>
              {error && <p className="rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
              <button disabled={loading} className="neon-button flex w-full items-center justify-center gap-2 rounded-lg px-5 py-4 text-sm font-black shadow-glow disabled:opacity-60">
                {loading ? 'Working...' : isSignup ? 'Create account' : 'Login'} <ArrowRight size={18} />
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-600">
              {isSignup ? 'Already have an account?' : 'New here?'}{' '}
              <Link className="font-black text-mint" to={isSignup ? '/login' : '/signup'}>{isSignup ? 'Login' : 'Create account'}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

