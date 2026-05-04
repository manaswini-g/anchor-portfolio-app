import { useState } from 'react'
import { mockPortfolio } from '../data/mockData'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS_BEFORE = ['#1A1A2E', '#4A7C6F', '#D4862A']
const COLORS_AFTER  = ['#2C5F9B', '#4A7C6F', '#D4862A']

// Action type visual config
const ACTION_STYLES = {
  sell:      { color: '#C0392B', bg: '#FDECEA', border: '#F5BCBA', label: 'Reduce',          icon: '↓' },
  buy:       { color: '#4A7C6F', bg: '#E6F2EF', border: '#A8D5C7', label: 'Increase',        icon: '↑' },
  switch:    { color: '#1B4FBB', bg: '#E8EFFE', border: '#BFD0F7', label: 'Switch',           icon: '⇄' },
  hold:      { color: '#6B7280', bg: '#F5F0E8', border: '#E2DDD4', label: 'No change needed', icon: '—' },
  liquidate: { color: '#C07A1A', bg: '#FDF3E3', border: '#E8C87A', label: 'Withdraw first',  icon: '↗' },
}

export default function Recommendation({ result, inputs, userProfile, onBack, onOpenChat }) {
  const [activeModal, setActiveModal]           = useState(null)
  const [simple, setSimple]                     = useState(false)
  const [goalRecalculated, setGoalRecalculated] = useState(false)
  const [newGoalAmount, setNewGoalAmount]       = useState(null)

  if (!result) return null

  const p = mockPortfolio
  const { newAllocation, steps, equityShift, taxImpact, exitLoad, confidence,
          doNothingConsequence, rebalancingSuggestions, macroContext, macroSpecialNote } = result

  const goalData  = userProfile?.goalData || { label: 'your goal', year: 2027, amount: 6000000 }

  const beforeData = [
    { name: 'Stocks & Equity', value: p.allocation.equity },
    { name: 'Bonds & Savings',  value: p.allocation.debt },
    { name: 'Gold',             value: p.allocation.gold },
  ]
  const afterData = [
    { name: 'Stocks & Equity', value: newAllocation.equity },
    { name: 'Bonds & Savings',  value: newAllocation.debt },
    { name: 'Gold',             value: newAllocation.gold },
  ]

  const explanations = {
    normal: {
      why: `Your portfolio has ${p.allocation.equity}% in stocks and equity funds. When markets fall and you need cash soon, you may be forced to sell these at a loss. Moving ${equityShift}% into safer short-term bonds protects your ${goalData.label} goal without abandoning long-term growth. Professional investors call this "defensive rebalancing" — it's standard practice during uncertainty.`,
      cost: `Moving funds triggers a Short-Term Capital Gains tax of ~₹${taxImpact.toLocaleString('en-IN')} (only if you've held the fund under 1 year). There's also an exit fee of ₹${exitLoad.toLocaleString('en-IN')} charged by the fund for early withdrawal. Total: ₹${(taxImpact + exitLoad).toLocaleString('en-IN')} — a small cost to protect your savings.`,
      ignore: doNothingConsequence + ` During market downturns, investors who do nothing often panic and sell at the worst possible time. A small adjustment now prevents a much bigger problem later.`,
    },
    eli15: {
      why: `Think of your money in two jars. Jar A is exciting — it grows fast but can shrink fast too. Jar B is boring but rock solid — it barely moves. Right now, too much is in Jar A. If something bad happens and you need money, you'd have to take from a shrinking jar. We're moving some money to Jar B so you're not stuck.`,
      cost: `Two small costs when you move money: (1) The government takes a small percentage as tax, like when you earn any income — that's ₹${taxImpact.toLocaleString('en-IN')} here. (2) The fund charges a small exit fee, like a cancellation charge — ₹${exitLoad.toLocaleString('en-IN')}. Together that's ₹${(taxImpact + exitLoad).toLocaleString('en-IN')} to protect your savings. Worth it.`,
      ignore: `Imagine your house is near a flood zone and the forecast says heavy rain. You could move your valuables upstairs now — or wait and hope. Waiting is free today, but could cost you much more later. That's what doing nothing here looks like.`,
    }
  }

  const mode = simple ? 'eli15' : 'normal'
  const modals = {
    why:    { title: 'Why this change?',        text: explanations[mode].why },
    cost:   { title: 'What does it cost?',      text: explanations[mode].cost },
    ignore: { title: 'What if you do nothing?', text: explanations[mode].ignore },
  }

  function handleRecalculateGoal() {
    const newTarget = Math.round(goalData.amount * Math.pow(1.08, 2))
    setNewGoalAmount(newTarget)
    setGoalRecalculated(true)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <nav className="nav-bar">
        <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '20px' }}>Anchor</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={onOpenChat} style={{ fontSize: '13px', padding: '8px 16px' }}>Ask Anchor</button>
          <button className="btn-secondary" onClick={onBack}     style={{ fontSize: '13px', padding: '8px 16px' }}>← Dashboard</button>
        </div>
      </nav>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div className="screen" style={{ marginBottom: '32px' }}>
          <div className="pill pill-green" style={{ marginBottom: '14px' }}>Your Plan is Ready</div>
          <h1 style={{ fontSize: '32px', marginBottom: '8px', lineHeight: 1.2 }}>Here's what to do next</h1>
          <p style={{ color: 'var(--slate)', fontSize: '16px' }}>
            {steps.length} simple steps to protect your {goalData.label} savings. Tap each step to learn more.
          </p>
        </div>

        {/* Macro context */}
        {macroContext && (
          <div style={{ background: 'var(--amber-light)', border: '1px solid #E8C87A', borderLeft: '4px solid var(--amber)', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', fontSize: '14px', lineHeight: 1.6 }}>
            <div style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--amber)' }}>What's happened before in this situation</div>
            {macroContext}
            {macroSpecialNote && <div style={{ marginTop: '8px', color: 'var(--anchor-blue)', fontWeight: 500 }}>{macroSpecialNote}</div>}
          </div>
        )}

        {/* === STEPS — visual numbered timeline === */}
        <div className="card screen" style={{ padding: '28px', marginBottom: '20px' }}>
          <div style={{ fontWeight: 600, fontSize: '17px', marginBottom: '4px' }}>Your steps</div>
          <div style={{ fontSize: '13px', color: 'var(--slate)', marginBottom: '24px' }}>Do these in order — takes about 15 minutes total</div>

          {steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: i < steps.length - 1 ? '0' : '0', position: 'relative' }}>
              {/* Vertical line */}
              {i < steps.length - 1 && (
                <div style={{ position: 'absolute', left: 13, top: 32, width: 2, height: 'calc(100% + 4px)', background: 'var(--border)' }} />
              )}
              {/* Circle number */}
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--ink)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, flexShrink: 0, zIndex: 1 }}>
                {i + 1}
              </div>
              <div style={{ paddingBottom: i < steps.length - 1 ? '20px' : '0', flex: 1 }}>
                <div style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--ink)' }}>{step}</div>
              </div>
            </div>
          ))}
        </div>

        {/* === WHAT CHANGES — visual before/after with plain labels === */}
        <div className="card screen" style={{ padding: '28px', marginBottom: '20px' }}>
          <div style={{ fontWeight: 600, fontSize: '17px', marginBottom: '6px' }}>What changes in your portfolio</div>
          <p style={{ fontSize: '14px', color: 'var(--slate)', marginBottom: '24px' }}>
            The chart on the left is how your money is spread today. The right shows the safer mix Anchor recommends.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
            {/* Before */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--slate)', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Now</div>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={beforeData} cx="50%" cy="50%" innerRadius={35} outerRadius={62} dataKey="value" stroke="none">
                    {beforeData.map((_, i) => <Cell key={i} fill={COLORS_BEFORE[i]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Arrow */}
            <div style={{ fontSize: '28px', color: 'var(--slate)', fontWeight: 300 }}>→</div>
            {/* After */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--anchor-blue)', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>After</div>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={afterData} cx="50%" cy="50%" innerRadius={35} outerRadius={62} dataKey="value" stroke="none">
                    {afterData.map((_, i) => <Cell key={i} fill={COLORS_AFTER[i]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Plain-English legend */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {[
              { color: COLORS_BEFORE[0], label: 'Stocks & Equity', before: p.allocation.equity, after: newAllocation.equity },
              { color: COLORS_BEFORE[1], label: 'Bonds & Savings',  before: p.allocation.debt,   after: newAllocation.debt },
              { color: COLORS_BEFORE[2], label: 'Gold',             before: p.allocation.gold,   after: newAllocation.gold },
            ].map(item => (
              <div key={item.label} style={{ flex: 1, minWidth: '150px', background: 'var(--cream)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '2px', background: item.color }} />
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>{item.label}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '18px', fontFamily: 'DM Serif Display, serif', color: 'var(--slate)' }}>{item.before}%</span>
                  <span style={{ color: 'var(--slate)', fontSize: '14px' }}>→</span>
                  <span style={{ fontSize: '18px', fontFamily: 'DM Serif Display, serif', color: item.after < item.before ? 'var(--anchor-blue)' : item.after > item.before ? 'var(--sage)' : 'var(--slate)' }}>{item.after}%</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--slate)', marginTop: '2px' }}>
                  {item.after < item.before ? `↓ less risk` : item.after > item.before ? `↑ more safety` : 'unchanged'}
                </div>
              </div>
            ))}
          </div>

          {equityShift > 0 && (
            <div style={{ padding: '12px 16px', background: 'var(--anchor-blue-light)', borderRadius: '8px', fontSize: '14px', color: 'var(--anchor-blue)', lineHeight: 1.5 }}>
              In plain terms: we're moving <strong>{equityShift}%</strong> (about ₹{Math.round(p.totalValue * equityShift / 100).toLocaleString('en-IN')}) from high-risk stock funds into safer bond funds that are less likely to drop suddenly.
            </div>
          )}
        </div>

        {/* === SPECIFIC INVESTMENT ACTIONS — visual cards === */}
        {rebalancingSuggestions?.length > 0 && (
          <div className="card screen" style={{ padding: '28px', marginBottom: '20px' }}>
            <div style={{ fontWeight: 600, fontSize: '17px', marginBottom: '6px' }}>What to do with each investment</div>
            <p style={{ fontSize: '14px', color: 'var(--slate)', marginBottom: '20px' }}>
              Colour-coded actions for every stock and fund you own.
            </p>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {Object.entries(ACTION_STYLES).map(([key, s]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: s.color }}>
                  <div style={{ width: 8, height: 8, borderRadius: '2px', background: s.color }} />
                  {s.label}
                </div>
              ))}
            </div>

            {rebalancingSuggestions.map((s, i) => {
              const style = ACTION_STYLES[s.type] || ACTION_STYLES.hold
              return (
                <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '14px', background: style.bg, border: `1px solid ${style.border}`, borderRadius: '12px', marginBottom: '10px' }}>
                  {/* Action icon */}
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: style.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700, flexShrink: 0 }}>
                    {style.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: style.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{style.label}</span>
                      <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--ink)' }}>{s.asset}</span>
                    </div>
                    {s.amount && (
                      <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink)', marginBottom: '4px' }}>{s.amount}</div>
                    )}
                    <div style={{ fontSize: '13px', color: 'var(--slate)', lineHeight: 1.5 }}>{s.reason}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* === CONFIDENCE METER === */}
        <div className="card screen" style={{ padding: '24px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: '2px' }}>How confident is Anchor in this plan?</div>
              <div style={{ fontSize: '13px', color: 'var(--slate)' }}>Based on your goal, scenario, and current portfolio</div>
            </div>
            <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '32px', color: confidence >= 75 ? 'var(--sage)' : 'var(--amber)' }}>{confidence}%</div>
          </div>
          <div style={{ height: '12px', background: 'var(--border)', borderRadius: '50px', overflow: 'hidden', marginBottom: '10px' }}>
            <div style={{ width: `${confidence}%`, height: '100%', background: confidence >= 75 ? 'var(--sage)' : confidence >= 60 ? 'var(--amber)' : 'var(--rose)', borderRadius: '50px', transition: 'width 1.2s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--slate)' }}>
            <span>Not sure</span><span>Very confident</span>
          </div>
        </div>

        {/* === WHY IS ANCHOR RECOMMENDING THIS — transparency === */}
        <div className="card screen" style={{ padding: '24px', marginBottom: '20px', borderTop: '3px solid var(--ink)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '17px', marginBottom: '4px' }}>Why is Anchor recommending this?</div>
              <div style={{ fontSize: '13px', color: 'var(--slate)' }}>Tap any question for a clear, honest explanation.</div>
            </div>
            <button onClick={() => setSimple(!simple)}
              style={{ background: simple ? 'var(--anchor-blue)' : 'transparent', color: simple ? 'white' : 'var(--anchor-blue)', border: '1.5px solid var(--anchor-blue)', borderRadius: '50px', padding: '7px 16px', fontSize: '13px', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
              {simple ? 'Simple Mode: On' : "Explain Like I'm 15"}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', marginBottom: '16px' }}>
            {[
              { key: 'why',    label: 'Why this change?',       desc: 'The logic behind the plan', icon: '💡' },
              { key: 'cost',   label: 'What does it cost?',     desc: 'Taxes and fees explained',  icon: '💰' },
              { key: 'ignore', label: 'What if I do nothing?',  desc: 'Risks of waiting',           icon: '⏳' },
            ].map(btn => (
              <button key={btn.key} onClick={() => setActiveModal(btn.key)}
                style={{ background: 'var(--cream)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '16px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ink)'; e.currentTarget.style.background = 'white' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--cream)' }}>
                <div style={{ fontSize: '22px', marginBottom: '8px' }}>{btn.icon}</div>
                <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{btn.label}</div>
                <div style={{ fontSize: '12px', color: 'var(--slate)' }}>{btn.desc}</div>
              </button>
            ))}
          </div>

          <div style={{ padding: '12px 16px', background: 'var(--sage-light)', borderRadius: '10px', fontSize: '13px', color: 'var(--sage)', fontWeight: 500 }}>
            Anchor is not a licensed financial advisor. For major decisions, please consult a SEBI-registered investment advisor.
          </div>
        </div>

        {/* === COST SUMMARY === */}
        <div className="card screen" style={{ padding: '24px', marginBottom: '20px', background: 'var(--amber-light)', border: '1px solid #E8C87A' }}>
          <div style={{ fontWeight: 600, marginBottom: '16px' }}>What will this cost you?</div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
            <div style={{ flex: 1, background: 'white', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--slate)', marginBottom: '6px' }}>Tax on gains</div>
              <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '22px' }}>₹{taxImpact.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: '11px', color: 'var(--slate)', marginTop: '4px' }}>Only if fund held under 1 year</div>
            </div>
            <div style={{ flex: 1, background: 'white', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--slate)', marginBottom: '6px' }}>Exit fee</div>
              <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '22px' }}>₹{exitLoad.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: '11px', color: 'var(--slate)', marginTop: '4px' }}>Fund's early withdrawal charge</div>
            </div>
            <div style={{ flex: 1, background: 'var(--ink)', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>Total cost</div>
              <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '22px', color: 'white' }}>₹{(taxImpact + exitLoad).toLocaleString('en-IN')}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Estimated only</div>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--slate)', margin: 0 }}>
            Actual amounts depend on your fund's exit load schedule and your income tax bracket.
          </p>
        </div>

        {/* === ANCHOR INSIGHT === */}
        <div style={{ background: 'var(--ink)', borderRadius: '16px', padding: '24px', marginBottom: '24px', color: 'white' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontWeight: 600, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Anchor Insight</div>
          {!goalRecalculated ? (
            <>
              <p style={{ fontSize: '15px', lineHeight: 1.65, color: 'rgba(255,255,255,0.85)', marginBottom: '18px' }}>
                Property prices in major Indian cities rose ~8% last year. The amount you need to save for your {goalData.label} goal may be higher than you planned.
              </p>
              <button onClick={handleRecalculateGoal} className="btn-primary"
                style={{ background: 'white', color: 'var(--ink)', fontSize: '14px', padding: '10px 22px' }}>
                Recalculate My Goal
              </button>
            </>
          ) : (
            <div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', marginBottom: '6px' }}>Updated goal estimate</div>
              <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '36px', color: 'white', marginBottom: '8px' }}>
                ₹{newGoalAmount.toLocaleString('en-IN')}
              </div>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '16px', lineHeight: 1.5 }}>
                Up from ₹{goalData.amount.toLocaleString('en-IN')} — that's an extra ₹{(newGoalAmount - goalData.amount).toLocaleString('en-IN')} after 8% annual property inflation over 2 years.
              </p>
              <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.08)', borderRadius: '10px', fontSize: '14px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
                Your monthly investment may need to increase by approximately <strong style={{ color: 'white' }}>₹1,800/month</strong> to stay on track.
              </div>
              <button onClick={() => setGoalRecalculated(false)}
                style={{ marginTop: '14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', borderRadius: '50px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer' }}>
                Recalculate again
              </button>
            </div>
          )}
        </div>

        <button className="btn-primary" onClick={onBack}
          style={{ width: '100%', justifyContent: 'center', fontSize: '16px', padding: '16px' }}>
          Back to Dashboard
        </button>
      </div>

      {/* Transparency Modal */}
      {activeModal && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>{modals[activeModal].title}</h3>
            {simple && (
              <div style={{ marginBottom: '14px', padding: '8px 12px', background: 'var(--anchor-blue-light)', borderRadius: '8px', fontSize: '12px', color: 'var(--anchor-blue)', fontWeight: 500 }}>
                Simple Mode on — plain language only
              </div>
            )}
            <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--slate)' }}>{modals[activeModal].text}</p>
            <button className="btn-primary" onClick={() => setActiveModal(null)}
              style={{ marginTop: '24px', width: '100%', justifyContent: 'center' }}>
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
