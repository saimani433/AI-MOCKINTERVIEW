import { Bell, LogOut, Menu, Search, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { navItems } from '../lib/data'

export function AppShell() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/auth/me').then((res) => setUser(res.data)).catch(() => navigate('/login'))
  }, [navigate])

  const logout = () => {
    localStorage.removeItem('vocavision_token')
    navigate('/login')
  }

  return (
    <div className="mesh-bg min-h-screen text-white">
      {open && <button aria-label="Close menu" className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`dark-glass fixed inset-y-0 left-0 z-50 flex w-[min(86vw,18rem)] flex-col border-r border-white/10 p-4 transition-transform duration-300 sm:p-5 lg:w-72 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-mint text-ink shadow-glow">
            <Sparkles size={22} />
          </span>
          <span>
            <span className="block text-lg font-black">VocaVision AI</span>
            <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Interview OS</span>
          </span>
        </Link>

        <nav className="mt-9 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `shine-card flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition ${isActive ? 'bg-white/15 text-white shadow-glow' : 'text-white/65 hover:bg-white/10 hover:text-white'}`
              }
            >
              <item.icon size={19} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="shine-card mt-auto rounded-lg border border-white/10 bg-white/10 p-4 text-white">
          <p className="text-sm font-bold">AI credits</p>
          <p className="mt-1 text-xs text-white/65">OpenRouter usage this month</p>
          <div className="mt-4 h-2 rounded-full bg-white/10">
            <div className="h-full w-2/3 rounded-full bg-mint" />
          </div>
        </div>
      </aside>

      <header className="dark-glass fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 px-3 sm:h-20 sm:px-6 lg:left-72 lg:px-8">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button className="ghost-button grid h-10 w-10 place-items-center rounded-lg lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <div className="hidden items-center gap-3 rounded-lg border border-white/10 bg-white/10 px-4 py-2.5 md:flex">
            <Search size={18} className="text-white/45" />
            <input className="w-72 border-0 bg-transparent text-sm text-white outline-none placeholder:text-white/40" placeholder="Search candidates, roles, reports" />
          </div>
        </div>
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button className="ghost-button grid h-10 w-10 place-items-center rounded-lg" aria-label="Notifications">
            <Bell size={18} />
          </button>
          {user && (
            <div className="hidden min-w-0 text-right sm:block">
              <p className="truncate text-sm font-black">{user.name}</p>
              <p className="truncate text-xs text-white/50">{user.email}</p>
            </div>
          )}
          <button onClick={logout} className="neon-button hidden items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold sm:flex">
            <LogOut size={17} />
            Exit
          </button>
        </div>
      </header>

      <main className="min-h-screen px-3 pb-8 pt-20 sm:px-6 sm:pt-24 lg:pl-[19.5rem] lg:pr-8">
        <Outlet />
      </main>
    </div>
  )
}
