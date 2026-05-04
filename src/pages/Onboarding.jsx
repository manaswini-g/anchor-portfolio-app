import { useState } from 'react'

// Goal options — user picks their actual goal
const goalOptions = [
  { value: 'house',      label: 'Buy a home',          sub: 'Save for a down payment or full purchase', year: 2027, amount: 6000000, icon: '🏠' },
  { value: 'education',  label: 'Education',            sub: 'College fees or study abroad', year: 2026, amount: 2000000, icon: '🎓' },
  { value: 'retirement', label: 'Retire comfortably',   sub: 'Build a long-term safety net', year: 2045, amount: 20000000, icon: '🌿' },
  { value: 'emergency',  label: 'Emergency fund',       sub: 'Have money ready for surprises', year: 2025, amount: 300000, icon: '🛡' },
  { value: 'wealth',     label: 'Grow my wealth',       sub: 'No specific goal — just invest smart', year: 2035, amount: 10000000, icon: '📈' },
  { value: 'other',      label: 'Something else',       sub: 'My goal isn\'t listed here', year: 2028, amount: 1000000, icon: '✦' },
]

const steps = [
  {
    id: 'goal',
    question: 'What are you saving for?',
    subtext: 'Pick your most important goal right now. This helps Anchor personalise everything for you.',
    type: 'goal',
  },
  {
    id: 'worry',
    question: 'What worries you more?',
    subtext: 'Be honest — there\'s no wrong answer here.',
    type: 'choice',
    options: [
      { value: 'loss',   label: 'Losing money',        sub: 'I want to keep what I have safe' },
      { value: 'growth', label: 'Not growing enough',  sub: 'I want my money to grow faster' },
    ],
  },
  {
    id: 'emotion',
    question: 'How do you feel about investing right now?',
    subtext: 'Your feelings affect your decisions — Anchor will factor this in.',
    type: 'choice',
    options: [
      { value: 'anxious',   label: 'Nervous',    sub: "I\'m worried something will go wrong" },
      { value: 'uncertain', label: 'Unsure',     sub: "I don\'t know if I\'m doing the right thing" },
      { value: 'confident', label: 'Confident',  sub: 'I feel good about where I am' },
    ],
  },
]

// Coloured SVG icons instead of emojis
const IconHouse   = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4A7C6F" strokeWidth="1.8" strokeLinecap="round"><path d="M3 9.5L12 3l9 6.5V21H3V9.5z"/><rect x="9" y="14" width="6" height="7"/></svg>
const IconGrad    = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1B4FBB" strokeWidth="1.8" strokeLinecap="round"><path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 2 2.7 4 6 4s6-2 6-4v-5"/></svg>
const IconLeaf    = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4A7C6F" strokeWidth="1.8" strokeLinecap="round"><path d="M2 22c1-4 4-9 10-10 4-.7 8 .5 10-4-1 4-4 9-10 10-4 .7-8-.5-10 4z"/></svg>
const IconShield  = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C07A1A" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2L3 7v6c0 5 4 9.3 9 10 5-.7 9-5 9-10V7L12 2z"/></svg>
const IconTrend   = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1B4FBB" strokeWidth="1.8" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
const IconStar    = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>

const goalIcons = { house: <IconHouse/>, education: <IconGrad/>, retirement: <IconLeaf/>, emergency: <IconShield/>, wealth: <IconTrend/>, other: <IconStar/> }

export default function Onboarding({ onComplete }) {
  const [step, setStep]       = useState(0)
  const [answers, setAnswers] = useState({})
  const [selected, setSelected] = useState(null)

  const current = steps[step]

  function handleNext() {
    if (!selected) return
    const newAnswers = { ...answers, [current.id]: selected }
    if (step < steps.length - 1) {
      setAnswers(newAnswers)
      setSelected(null)
      setStep(step + 1)
    } else {
      // Pass full goal info to app
      const goalData = goalOptions.find(g => g.value === newAnswers.goal) || goalOptions[0]
      onComplete({ ...newAnswers, goalData })
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'var(--cream)' }}>

      {/* Logo */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '32px', fontFamily: 'DM Serif Display, serif', color: 'var(--ink)', marginBottom: '6px' }}>Anchor</div>
        <div style={{ fontSize: '14px', color: 'var(--slate)' }}>Investing that adapts to your life</div>
      </div>

      {/* Step dots */}
      <div className="step-indicator">
        {steps.map((_, i) => (
          <div key={i} className={`step-dot ${i <= step ? 'active' : ''}`}
            style={i < step ? { background: 'var(--sage)', width: '8px' } : {}} />
        ))}
      </div>

      <div className="card screen" style={{ maxWidth: '560px', width: '100%', padding: '40px 36px' }}>
        <div style={{ fontSize: '13px', color: 'var(--slate)', marginBottom: '8px', fontWeight: 500 }}>
          Step {step + 1} of {steps.length}
        </div>
        <h2 style={{ fontSize: '24px', marginBottom: '8px', lineHeight: 1.3 }}>{current.question}</h2>
        <p style={{ color: 'var(--slate)', fontSize: '15px', marginBottom: '24px', lineHeight: 1.6 }}>{current.subtext}</p>

        {/* GOAL PICKER — grid of cards with icons */}
        {current.type === 'goal' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {goalOptions.map(opt => (
              <button key={opt.value}
                onClick={() => setSelected(opt.value)}
                style={{
                  border: `2px solid ${selected === opt.value ? 'var(--ink)' : 'var(--border)'}`,
                  background: selected === opt.value ? 'var(--ink)' : 'white',
                  borderRadius: '14px', padding: '16px 14px', cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '8px',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ filter: selected === opt.value ? 'brightness(10)' : 'none', transition: 'filter 0.2s', lineHeight: 0 }}>
                    {goalIcons[opt.value]}
                  </span>
                </div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: selected === opt.value ? 'white' : 'var(--ink)' }}>{opt.label}</div>
                <div style={{ fontSize: '12px', color: selected === opt.value ? 'rgba(255,255,255,0.65)' : 'var(--slate)', lineHeight: 1.4 }}>{opt.sub}</div>
              </button>
            ))}
          </div>
        )}

        {/* CHOICE — vertical list */}
        {current.type === 'choice' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {current.options.map(opt => (
              <button key={opt.value}
                className={`option-card ${selected === opt.value ? 'selected' : ''}`}
                onClick={() => setSelected(opt.value)}>
                <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '3px' }}>{opt.label}</div>
                <div style={{ fontSize: '13px', opacity: 0.65 }}>{opt.sub}</div>
              </button>
            ))}
          </div>
        )}

        <button className="btn-primary" onClick={handleNext} disabled={!selected}
          style={{ marginTop: '28px', width: '100%', justifyContent: 'center', opacity: selected ? 1 : 0.4 }}>
          {step < steps.length - 1 ? 'Continue' : 'See My Portfolio'}
        </button>
      </div>
    </div>
  )
}
