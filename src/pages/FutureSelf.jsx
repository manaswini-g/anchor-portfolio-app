import { useEffect, useState } from 'react'

export default function FutureSelf({ result, inputs, onContinue, onBack, onOpenChat }) {
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 1000)
    return () => clearTimeout(t)
  }, [])

  const delay    = result?.goalDelay ?? 0
  const isDark   = delay > 12
  const goalYear = 2027
  const delayedFullYears  = Math.floor(delay / 12)
  const delayedMonthsRem  = delay % 12
  const delayedYear = goalYear + delayedFullYears

  const dark  = (opacity = 1) => `rgba(255,255,255,${opacity})`
  const fg    = isDark ? dark(0.85) : 'var(--ink)'
  const fgSub = isDark ? dark(0.5)  : 'var(--slate)'
  const bg    = isDark ? '#1A1A2E'  : 'var(--cream)'
  const navBg = isDark ? '#141428'  : 'white'
  const cardBg= isDark ? '#242440' : 'white'
  const cardBorder = isDark ? '#333350' : 'var(--border)'

  return (
    <div style={{ minHeight: '100vh', background: bg, transition: 'background 0.8s ease' }}>
      <nav className="nav-bar" style={{ background: navBg, borderColor: cardBorder }}>
        <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '20px', color: fg }}>Anchor</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onOpenChat}
            style={{ background: 'transparent', border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'var(--border)'}`, color: isDark ? dark(0.7) : 'var(--ink)', borderRadius: '50px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>
            Ask Anchor
          </button>
          <button onClick={onBack}
            style={{ background: 'transparent', border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'var(--border)'}`, color: isDark ? dark(0.7) : 'var(--ink)', borderRadius: '50px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>
            ← Back
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>

        <div className="screen">
          <div style={{ fontSize: '11px', color: fgSub, fontWeight: 600, marginBottom: '16px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Future Self Simulation
          </div>
          <h1 style={{ fontSize: '32px', marginBottom: '24px', color: fg, lineHeight: 1.2 }}>
            {delay === 0 ? "Good news — you're protected." : "If you do nothing about this..."}
          </h1>
        </div>

        {/* THE BIG NUMBER */}
        {delay > 0 && (
          <div className="screen" style={{
            background: isDark ? 'rgba(192,57,43,0.1)' : 'var(--rose-light)',
            border: `2px solid ${isDark ? 'rgba(192,57,43,0.35)' : '#F5BCBA'}`,
            borderRadius: '20px',
            padding: '48px 36px',
            marginBottom: '24px',
            transition: 'all 0.8s ease',
          }}>
            <div style={{ fontSize: '14px', color: 'var(--rose)', fontWeight: 600, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Your house goal is delayed by
            </div>
            <div style={{
              fontFamily: 'DM Serif Display, serif',
              fontSize: revealed ? '96px' : '0px',
              fontStyle: 'italic',
              color: 'var(--rose)',
              lineHeight: 1,
              transition: 'font-size 0.5s ease',
              marginBottom: '4px',
            }}>
              {delay}
            </div>
            <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '28px', color: 'var(--rose)', marginBottom: '28px' }}>months</div>
            <div style={{ background: 'var(--rose)', color: 'white', padding: '16px 20px', borderRadius: '12px', fontSize: '16px', lineHeight: 1.6, fontWeight: 500 }}>
              {result.doNothingConsequence}
            </div>
          </div>
        )}

        {delay === 0 && (
          <div className="screen" style={{ padding: '40px', marginBottom: '24px', background: isDark ? 'rgba(74,124,111,0.15)' : 'var(--sage-light)', border: `2px solid ${isDark ? 'rgba(74,124,111,0.4)' : 'var(--sage)'}`, borderRadius: '20px' }}>
            <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '28px', marginBottom: '12px', color: 'var(--sage)' }}>
              Your house goal stays on track
            </div>
            <p style={{ color: fgSub, fontSize: '15px' }}>
              Your portfolio can handle this scenario. Anchor still has suggestions to make you more resilient.
            </p>
          </div>
        )}

        {/* Timeline */}
        <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '16px', padding: '28px', marginBottom: '24px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '24px', color: fg }}>Your House Goal Timeline</div>

          <div style={{ position: 'relative', height: '4px', background: isDark ? '#333' : 'var(--border)', borderRadius: '50px', marginBottom: '20px' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, width: '52%', height: '100%', background: 'var(--sage)', borderRadius: '50px', opacity: 0.7 }} />
            <div style={{ position: 'absolute', left: '-2px', top: -5, width: 14, height: 14, borderRadius: '50%', background: isDark ? '#888' : 'var(--slate)' }} />
            <div style={{ position: 'absolute', left: '52%', top: -5, width: 14, height: 14, borderRadius: '50%', background: 'var(--sage)', transform: 'translateX(-50%)' }} />
            {delay > 0 && <div style={{ position: 'absolute', left: '80%', top: -5, width: 14, height: 14, borderRadius: '50%', background: 'var(--rose)', transform: 'translateX(-50%)' }} />}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: fgSub, marginBottom: '20px' }}>
            <span>Today (2025)</span>
            <span style={{ color: 'var(--sage)', fontWeight: 600 }}>Act now → {goalYear}</span>
            {delay > 0 && <span style={{ color: 'var(--rose)', fontWeight: 600 }}>Wait → {delayedYear}{delayedMonthsRem > 0 ? ` +${delayedMonthsRem}mo` : ''}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: isDark ? 'rgba(74,124,111,0.15)' : 'var(--sage-light)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--sage)', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Act now</div>
              <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '24px', color: 'var(--sage)' }}>{goalYear}</div>
              <div style={{ fontSize: '12px', color: fgSub, marginTop: '4px' }}>On schedule</div>
            </div>
            <div style={{ background: delay > 0 ? (isDark ? 'rgba(192,57,43,0.1)' : 'var(--rose-light)') : (isDark ? 'rgba(74,124,111,0.15)' : 'var(--sage-light)'), borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: delay > 0 ? 'var(--rose)' : 'var(--sage)', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Do nothing</div>
              <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '24px', color: delay > 0 ? 'var(--rose)' : 'var(--sage)' }}>
                {delay > 0 ? `${delayedYear}${delayedMonthsRem > 0 ? ` +${delayedMonthsRem}mo` : ''}` : goalYear}
              </div>
              <div style={{ fontSize: '12px', color: fgSub, marginTop: '4px' }}>{delay > 0 ? `${delay} months of extra rent` : 'Still on track'}</div>
            </div>
          </div>
        </div>

        {/* Extra rent callout */}
        {delay >= 6 && (
          <div style={{ background: isDark ? 'rgba(192,57,43,0.08)' : 'var(--rose-light)', border: `1px solid ${isDark ? 'rgba(192,57,43,0.25)' : '#F5BCBA'}`, borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', fontSize: '14px', color: fg, lineHeight: 1.5 }}>
            At ₹25,000/month in rent, that's an extra{' '}
            <strong style={{ color: 'var(--rose)' }}>₹{(delay * 25000).toLocaleString('en-IN')}</strong> spent waiting to own your home.
          </div>
        )}

        <p style={{ fontSize: '15px', color: fgSub, marginBottom: '20px' }}>
          Anchor has a plan to prevent this. It takes {delay > 0 ? 'a few simple steps.' : 'minor adjustments.'}
        </p>
        <button
          className="btn-primary"
          onClick={onContinue}
          style={{ width: '100%', justifyContent: 'center', fontSize: '16px', padding: '16px', background: isDark ? 'white' : 'var(--ink)', color: isDark ? 'var(--ink)' : 'white' }}
        >
          Show me the plan
        </button>
      </div>
    </div>
  )
}
