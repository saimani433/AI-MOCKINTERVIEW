import {
  BarChart3,
  BrainCircuit,
  BriefcaseBusiness,
  Camera,
  GraduationCap,
  FileText,
  FileSearch,
  Gauge,
  Map,
  Mic2,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  Video,
} from 'lucide-react'

export const features = [
  {
    icon: BrainCircuit,
    title: 'Adaptive AI interviewer',
    text: 'OpenRouter-powered follow-up questions shift by role, seniority, confidence, and answer depth.',
  },
  {
    icon: Camera,
    title: 'Computer vision signals',
    text: 'Track eye contact, attention, posture stability, and expression confidence with Python CV services.',
  },
  {
    icon: Mic2,
    title: 'Speech and NLP scoring',
    text: 'Score clarity, filler words, semantic relevance, structure, and communication velocity.',
  },
  {
    icon: FileText,
    title: 'Recruiter-grade reports',
    text: 'Generate crisp candidate reports with strengths, risks, coaching notes, and hiring recommendation.',
  },
  {
    icon: FileSearch,
    title: 'Resume analysis',
    text: 'Upload or paste a resume to score ATS fit, grammar quality, missing keywords, and correction suggestions.',
  },
  {
    icon: Map,
    title: 'AI learning roadmap',
    text: 'Generate a clear preparation roadmap for MERN, full stack, DSA, system design, AI, or any career goal.',
  },
]

export const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: Gauge },
  { label: 'Interview', href: '/interview', icon: Video },
  { label: 'Question Bank', href: '/library', icon: BriefcaseBusiness },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'AI Coach', href: '/coach', icon: GraduationCap },
  { label: 'Resume Analyzer', href: '/resume', icon: FileSearch },
  { label: 'AI Roadmap', href: '/roadmap', icon: Map },
]

export const metrics = [
  { label: 'Interview readiness', value: '87%', delta: '+12%', color: 'bg-mint' },
  { label: 'Communication score', value: '8.4', delta: '+0.9', color: 'bg-cyan' },
  { label: 'CV confidence', value: '91%', delta: '+7%', color: 'bg-coral' },
  { label: 'Role fit index', value: 'A-', delta: 'top 14%', color: 'bg-amber' },
]

export const timeline = [
  { time: '09:00', title: 'Frontend system design', status: 'Completed', score: 89 },
  { time: '11:30', title: 'Behavioral leadership round', status: 'In review', score: 82 },
  { time: '15:00', title: 'Backend architecture mock', status: 'Scheduled', score: 0 },
]

export const signals = [
  { name: 'Answer relevance', value: 92 },
  { name: 'Eye contact', value: 84 },
  { name: 'Clarity', value: 88 },
  { name: 'Conciseness', value: 76 },
  { name: 'Confidence', value: 91 },
]

export const questions = [
  { role: 'SDE 1', type: 'Technical', title: 'Explain rate limiting in a distributed API gateway.', difficulty: 'Medium' },
  { role: 'Frontend', type: 'System Design', title: 'Design a collaborative whiteboard for 50 concurrent users.', difficulty: 'Hard' },
  { role: 'Product', type: 'Behavioral', title: 'Tell me about a time you changed your approach after user feedback.', difficulty: 'Medium' },
  { role: 'Data', type: 'AI/NLP', title: 'How would you evaluate semantic similarity between two answers?', difficulty: 'Hard' },
]

export const reportRows = [
  { candidate: 'Aarav Mehta', role: 'Full Stack Intern', score: 91, risk: 'Low', decision: 'Strong shortlist' },
  { candidate: 'Mira Shah', role: 'React Developer', score: 84, risk: 'Medium', decision: 'Coach and retry' },
  { candidate: 'Dev Rao', role: 'Backend Engineer', score: 78, risk: 'Medium', decision: 'Panel review' },
]

export const standout = [
  { icon: Sparkles, text: 'AI-generated micro coaching plan after every answer' },
  { icon: Target, text: 'Role-fit heatmap mapped to job descriptions' },
  { icon: Timer, text: 'Real-time hesitation, pace, and filler-word tracking' },
  { icon: ShieldCheck, text: 'Bias-aware scorecards with explainable scoring reasons' },
]
