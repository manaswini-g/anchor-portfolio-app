import { useState } from 'react'
import { runScenario, macroScenarios } from '../data/mockData'

export default function Scenario({ onResult, onBack, onOpenChat }) {
  const [marketDrop, setMarketDrop]     = useState(0)
  const [cashNeed, setCashNeed]         = useState(0)
  const [emotion, setEmotion]           = useState('uncertain')
  const [selectedMacro, setSelectedMacro] = useState(null)
  const [showBeginner, setShowBeginner] = useState(false)

  function applyMacro(macro) {
    setSelectedMacro(macro.id === selectedMacro ? null : macro.id)
    const preset = macroScenarios.find(m => m.id === macro.id)
    if (preset && macro.id !== selectedMacro) {
      setMarketDrop(preset.presets.marketDrop)
      setCashNeed(preset.presets.cashNeed)
    }
  }

  function handleRun() {
    const inputs  = { marketDrop, cashNeed, emotion, macroId: selectedMacro }
    const result  = runScenario(inputs)
    onResult(inputs, result)
  }

  const severity = marketDrop + cashNeed
  const severityLabel =
    severity === 0  ? null :
    severity <= 20  ? 'Mild scenario' :
    severity <= 40  ? 'Moderate concern' : 'High impact scenario'
  const severityColor =
    severity <= 20  ? 'var(--sage)' :
    severity <= 40  ? 'var(--amber)' : 'var(--rose)'

  const activeMacro = macroScenarios.find(m => m.id === selectedMacro)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <nav className="nav-bar">
        <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '20px' }}>Anchor</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={onOpenChat} style={{ fontSize: '13px', padding: '8px 16px' }}>Ask Anchor</button>
          <button className="btn-secondary" onClick={onBack}     style={{ fontSize: '13px', padding: '8px 16px' }}>← Back</button>
        </div>
      </nav>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px' }}>

        <div className="screen">
          <div className="pill pill-blue" style={{ marginBottom: '16px' }}>What-If Scenario</div>
          <h1 style={{ fontSize: '32px', marginBottom: '8px', lineHeight: 1.2 }}>What's worrying you?</h1>
          <p style={{ color: 'var(--slate)', fontSize: '16px', marginBottom: '8px' }}>
            Pick a situation below — or use the sliders to describe what you're afraid might happen. Anchor will show you how it affects your goal and what to do.
          </p>
          <button onClick={() => setShowBeginner(!showBeginner)}
            style={{ background: 'none', border: 'none', color: 'var(--anchor-blue)', fontSize: '13px', cursor: 'pointer', fontWeight: 500, padding: 0, marginBottom: '28px' }}>
            {showBeginner ? 'Got it — hide this' : 'Not sure what these mean? Tap here'}
          </button>
          {showBeginner && (
            <div style={{ background: 'var(--anchor-blue-light)', border: '1px solid #BFD0F7', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', fontSize: '14px', color: 'var(--ink)', lineHeight: 1.8 }}>
              <strong>Market drop</strong> — Imagine the stock market is like a shopping mall. Sometimes prices fall temporarily. Your investments go down in value, but you still own the same shares. If you wait, they usually recover.<br /><br />
              <strong>Withdrawal</strong> — Taking some of your money out of investments to use it — like for a house deposit, hospital bill, or emergency.<br /><br />
              <strong>Nothing changes until you act.</strong> This is just a simulation to help you prepare.
            </div>
          )}
        </div>

        {/* SCENARIOS — friendly names */}
        <div className="card screen" style={{ padding: '24px', marginBottom: '20px' }}>
          <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>Pick a situation</div>
          <p style={{ fontSize: '13px', color: 'var(--slate)', marginBottom: '16px' }}>These are real things that can happen. Tap one to set it up automatically.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
            {macroScenarios.map(macro => (
              <button key={macro.id} onClick={() => applyMacro(macro)}
                style={{
                  border: `2px solid ${selectedMacro === macro.id ? 'var(--ink)' : 'var(--border)'}`,
                  background: selectedMacro === macro.id ? 'var(--ink)' : 'white',
                  color: selectedMacro === macro.id ? 'white' : 'var(--ink)',
                  borderRadius: '12px', padding: '14px 12px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                }}>
                <div style={{ fontSize: '18px', marginBottom: '6px', fontFamily: 'monospace' }}>{macro.icon}</div>
                <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '3px' }}>{macro.label}</div>
                <div style={{ fontSize: '12px', opacity: 0.7, lineHeight: 1.4 }}>{macro.description}</div>
              </button>
            ))}
          </div>

          {/* Context card for selected macro */}
          {activeMacro && (
            <div style={{ marginTop: '16px', padding: '14px 16px', background: 'var(--amber-light)', borderRadius: '10px', fontSize: '13px', color: 'var(--ink)', lineHeight: 1.6, borderLeft: '3px solid var(--amber)' }}>
              <strong>Historical context:</strong> {activeMacro.context}
              {activeMacro.specialNote && (
                <div style={{ marginTop: '8px', color: 'var(--anchor-blue)', fontWeight: 500 }}>
                  Anchor note: {activeMacro.specialNote}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Market Drop Slider */}
        <div className="card screen" style={{ padding: '28px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
            <div style={{ fontWeight: 600, fontSize: '16px' }}>Markets drop by</div>
            <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '30px', color: marketDrop >= 20 ? 'var(--rose)' : marketDrop >= 10 ? 'var(--amber)' : 'var(--ink)' }}>
              {marketDrop === 0 ? 'None' : `-${marketDrop}%`}
            </div>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--slate)', marginBottom: '16px' }}>
            {marketDrop === 0 && "Markets stay stable — no assumed drop"}
            {marketDrop > 0  && marketDrop <= 10 && "A minor correction — common in volatile periods"}
            {marketDrop > 10 && marketDrop <= 20 && "A notable decline — like a mild recession"}
            {marketDrop > 20 && marketDrop <= 30 && "A serious crash — like 2020 COVID-19 selloff"}
            {marketDrop > 30 && "A severe crash — like 2008 global financial crisis"}
          </p>

          {/* What this means for your portfolio */}
          {marketDrop > 0 && (
            <div style={{ background: 'var(--rose-light)', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', fontSize: '13px', color: 'var(--rose)', fontWeight: 500 }}>
              Your portfolio could lose approximately ₹{Math.round((marketDrop / 100) * 500000 * 0.62).toLocaleString('en-IN')} in equity value.
            </div>
          )}

          <input type="range" min={0} max={40} step={5} value={marketDrop} onChange={e => setMarketDrop(Number(e.target.value))} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--slate)', marginTop: '6px' }}>
            <span>0%</span><span>-10%</span><span>-20%</span><span>-30%</span><span>-40%</span>
          </div>
        </div>

        {/* Cash Need Slider */}
        <div className="card screen" style={{ padding: '28px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
            <div style={{ fontWeight: 600, fontSize: '16px' }}>I may need to withdraw</div>
            <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '30px', color: cashNeed >= 20 ? 'var(--rose)' : cashNeed >= 10 ? 'var(--amber)' : 'var(--ink)' }}>
              {cashNeed === 0 ? 'Nothing' : `${cashNeed}%`}
            </div>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--slate)', marginBottom: '16px' }}>
            {cashNeed === 0 && "No withdrawal planned — staying fully invested"}
            {cashNeed > 0  && cashNeed <= 10 && `~₹${(500000 * cashNeed / 100).toLocaleString('en-IN')} — a minor withdrawal, manageable`}
            {cashNeed > 10 && cashNeed <= 20 && `~₹${(500000 * cashNeed / 100).toLocaleString('en-IN')} — a significant chunk of your portfolio`}
            {cashNeed > 20 && `₹${(500000 * cashNeed / 100).toLocaleString('en-IN')} — a major withdrawal that requires careful planning`}
          </p>

          {cashNeed > 0 && (
            <div style={{ background: 'var(--amber-light)', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', fontSize: '13px', color: 'var(--amber)', fontWeight: 500 }}>
              Recommended source: Withdraw from your SBI Debt Fund first to avoid equity losses.
            </div>
          )}

          <input type="range" min={0} max={40} step={5} value={cashNeed} onChange={e => setCashNeed(Number(e.target.value))} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--slate)', marginTop: '6px' }}>
            <span>0%</span><span>10%</span><span>20%</span><span>30%</span><span>40%</span>
          </div>
        </div>

        {/* Emotion */}
        <div className="card screen" style={{ padding: '28px', marginBottom: '24px' }}>
          <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '6px' }}>How do you feel right now?</div>
          <p style={{ fontSize: '13px', color: 'var(--slate)', marginBottom: '16px' }}>Your emotional state matters — anxious investors often make costly decisions. Anchor factors this in.</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[
              { value: 'anxious',   label: 'Anxious',   sub: 'I want to reduce risk' },
              { value: 'uncertain', label: 'Unsure',    sub: 'Not sure what to do' },
              { value: 'confident', label: 'Confident', sub: 'I can handle volatility' },
            ].map(opt => (
              <button key={opt.value} className={`option-card ${emotion === opt.value ? 'selected' : ''}`}
                onClick={() => setEmotion(opt.value)} style={{ flex: 1, textAlign: 'center', padding: '14px 10px' }}>
                <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '3px' }}>{opt.label}</div>
                <div style={{ fontSize: '12px', opacity: 0.7 }}>{opt.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {severityLabel && (
          <div style={{ textAlign: 'center', marginBottom: '16px', color: severityColor, fontWeight: 600, fontSize: '14px' }}>
            {severityLabel} — Anchor will calculate the full impact on your goal
          </div>
        )}

        <button className="btn-primary" onClick={handleRun}
          style={{ width: '100%', justifyContent: 'center', fontSize: '16px', padding: '16px' }}>
          Show me how this affects my life
        </button>
        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--slate)', marginTop: '12px' }}>
          This is a simulation. No changes are made to your actual portfolio.
        </p>
      </div>
    </div>
  )
}
