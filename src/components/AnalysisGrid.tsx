import { BrainCircuit, MessageSquareText, ScanFace, Sparkles } from 'lucide-react'
import type { AnalysisGroup, OverallEvaluation } from '../lib/api'

const percent = (value: unknown, fallback = 0) => Number(value || fallback)

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between gap-3 text-sm font-bold">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-mint shadow-glow" style={{ width: `${Math.max(4, Math.min(value, 100))}%` }} />
      </div>
    </div>
  )
}

export function AnalysisGrid({
  communicationSkills,
  technicalKnowledge,
  confidenceBehavior,
  overallEvaluation,
}: {
  communicationSkills?: AnalysisGroup
  technicalKnowledge?: AnalysisGroup
  confidenceBehavior?: AnalysisGroup
  overallEvaluation?: OverallEvaluation
}) {
  const cards = [
    {
      title: 'Communication Skills Analysis',
      icon: MessageSquareText,
      note: communicationSkills?.notes,
      meters: [
        ['Grammar accuracy', percent(communicationSkills?.grammarAccuracy, 84)],
        ['Vocabulary usage', percent(communicationSkills?.vocabularyUsage, 82)],
        ['Fluency', percent(communicationSkills?.fluency, 80)],
        ['Answer relevance', percent(communicationSkills?.answerRelevance, 86)],
      ] as const,
    },
    {
      title: 'Technical Knowledge Assessment',
      icon: BrainCircuit,
      note: technicalKnowledge?.notes,
      meters: [
        ['Technical keyword matching', percent(technicalKnowledge?.technicalKeywordMatching, 82)],
        ['Concept understanding', percent(technicalKnowledge?.conceptUnderstanding, 80)],
        ['Problem-solving ability', percent(technicalKnowledge?.problemSolvingAbility, 81)],
        ['Response correctness', percent(technicalKnowledge?.responseCorrectness, 79)],
      ] as const,
    },
    {
      title: 'Confidence & Behavior Analysis',
      icon: ScanFace,
      note: confidenceBehavior?.notes,
      meters: [
        ['Eye contact', percent(confidenceBehavior?.eyeContact, 83)],
        ['Facial expressions', percent(confidenceBehavior?.facialExpressions, 82)],
        ['Speaking confidence', percent(confidenceBehavior?.speakingConfidence, 85)],
        ['Body posture', percent(confidenceBehavior?.bodyPosture, 80)],
      ] as const,
    },
  ]

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {cards.map((card) => (
        <article key={card.title} className="shine-card app-card shine-card rounded-lg p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <card.icon className="text-ink" />
            <h3 className="text-lg font-black">{card.title}</h3>
          </div>
          <div className="mt-5 space-y-4">
            {card.meters.map(([label, value]) => <Meter key={label} label={label} value={value} />)}
          </div>
          {card.note && <p className="mt-5 rounded-lg bg-slate-50 p-3 text-sm font-semibold leading-6 text-slate-600">{card.note}</p>}
        </article>
      ))}

      <article className="shine-card rounded-lg border border-black/5 bg-ink p-4 text-white shadow-glow sm:p-5 xl:col-span-3">
        <div className="flex items-center gap-3">
          <Sparkles className="text-mint" />
          <h3 className="text-lg font-black">Overall Performance Evaluation</h3>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white/10 p-4">
            <p className="text-sm font-bold text-white/60">Interview score</p>
            <p className="mt-2 text-4xl font-black">{percent(overallEvaluation?.interviewScore, 84)}%</p>
          </div>
          <div className="rounded-lg bg-white/10 p-4">
            <p className="text-sm font-bold text-mint">Strengths identification</p>
            <div className="mt-3 space-y-2">{(overallEvaluation?.strengthsIdentification || ['Clear role intent']).map((item) => <p key={item} className="text-sm font-semibold">{item}</p>)}</div>
          </div>
          <div className="rounded-lg bg-white/10 p-4">
            <p className="text-sm font-bold text-coral">Weakness detection</p>
            <div className="mt-3 space-y-2">{(overallEvaluation?.weaknessDetection || ['Add more concrete examples']).map((item) => <p key={item} className="text-sm font-semibold">{item}</p>)}</div>
          </div>
        </div>
        <div className="mt-4 rounded-lg bg-white/10 p-4">
          <p className="text-sm font-bold text-amber">Improvement recommendations</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(overallEvaluation?.improvementRecommendations || ['Use metrics', 'Explain tradeoffs']).map((item) => <span key={item} className="rounded-md bg-white/10 px-2 py-1 text-xs font-bold">{item}</span>)}
          </div>
        </div>
      </article>
    </div>
  )
}

