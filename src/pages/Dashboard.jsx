import { useState } from 'react'
import { mockPortfolio, getRiskBreakdown } from '../data/mockData'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts'

// Pie chart: show actual fund/stock names grouped by type, not just categories
const STOCK_COLOR  = '#1A1A2E'
const FUND_EQUITY_COLOR = '#2C5F9B'
const DEBT_COLOR   = '#4A7C6F'
const GOLD_COLOR   = '#D4862A'

// Generate a simple 12-month projected growth line for a holding
function makeGrowthData(currentValue, annualGrowthRate, months = 12) {
  const data = []
  for (let i = 0; i <= months; i++) {
    const month = new Date()
    month.setMonth(month.getMonth() + i)
    const label = month.toLocaleString('default', { month: 'short' })
    data.push({
      month: label,
      value: Math.round(currentValue * Math.pow(1 + annualGrowthRate / 12, i))
    })
  }
  return data
}

// Icon components — coloured SVGs, no emojis
const IconTarget   = ({ color = '#4A7C6F' }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2" fill={color}/></svg>
const IconShield   = ({ color = '#C07A1A' }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><path d="M12 2L3 7v6c0 5 4 9.3 9 10 5-.7 9-5 9-10V7L12 2z"/></svg>
const IconActivity = ({ color = '#1B4FBB' }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
const IconTrend    = ({ color = '#4A7C6F' }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
const IconTrendDown= ({ color = '#C0392B' }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
const IconLink     = ({ color = '#1B4FBB' }) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
const IconWarning  = ({ color = '#C07A1A' }) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><triangle/><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ fontWeight: 600 }}>₹{payload[0].value.toLocaleString('en-IN')}</div>
        <div style={{ color: 'var(--slate)' }}>{payload[0].payload.month}</div>
      </div>
    )
  }
  return null
}

export default function Dashboard({ userProfile, onRunScenario, onOpenChat }) {
  const p    = mockPortfolio
  const risk = getRiskBreakdown()

  const [showFunds, setShowFunds]     = useState(false)
  const [showStocks, setShowStocks]   = useState(false)
  const [showRisk, setShowRisk]       = useState(false)
  const [riskModal, setRiskModal]     = useState(null)
  const [expandedFund, setExpandedFund] = useState(null)
  const [expandedStock, setExpandedStock] = useState(null)

  const emotion = userProfile?.emotion || 'uncertain'
  const emotionNudge = {
    anxious:   "Markets have been choppy lately. Let's check if your plan still holds.",
    uncertain: "You're doing better than you think. Here's where you stand today.",
    confident: "Good mindset. Let's make sure your confidence is backed by data.",
  }[emotion]

  // Use the goal the user picked in onboarding, fallback to default
  const goalData   = userProfile?.goalData || { label: 'Buy a home', year: 2027, amount: 6000000 }
  const goalTarget = goalData.amount || 6000000
  const goalYear   = goalData.year   || 2027
  const goalLabel  = goalData.label  || 'Buy a home'

  const totalStockValue = p.stocks.reduce((s, x) => s + x.value, 0)
  const totalFundValue  = p.funds.reduce((s, x) => s + x.value, 0)
  const goalProgress    = Math.min(Math.round((p.totalValue / goalTarget) * 100), 100)

  // Pie chart — shows individual holdings, not abstract categories
  const pieData = [
    ...p.stocks.map(s => ({ name: s.name, value: s.value, color: STOCK_COLOR, type: 'Stock' })),
    ...p.funds.map(f => ({
      name: f.name,
      value: f.value,
      color: f.category === 'Equity' ? FUND_EQUITY_COLOR : f.category === 'Debt' ? DEBT_COLOR : GOLD_COLOR,
      type: f.category === 'Gold' ? 'Gold ETF' : f.type,
    })),
  ]

  // Goal progress chart data
  const goalChartData = Array.from({ length: 9 }, (_, i) => {
    const year = 2024 + Math.floor(i / 4)
    const q    = (i % 4) + 1
    return {
      label: `Q${q} ${year}`,
      saved: Math.round(p.totalValue * (0.5 + i * 0.07)),
      target: 6000000,
    }
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>

      <nav className="nav-bar">
        <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '20px' }}>Anchor</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn-secondary" onClick={onOpenChat} style={{ fontSize: '13px', padding: '8px 16px' }}>Ask Anchor</button>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--ink)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '14px' }}>{p.user[0]}</div>
        </div>
      </nav>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Greeting */}
        <div className="screen" style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '6px' }}>Hello, {p.user}</h1>
          <p style={{ color: 'var(--slate)', fontSize: '16px' }}>{emotionNudge}</p>
        </div>

        {/* Alert */}
        <div className="alert-banner screen" style={{ marginBottom: '28px' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--amber)', flexShrink: 0, marginTop: 3 }} />
          <div>
            <strong>Markets moved 2.3% today.</strong> This may affect your investments.{' '}
            <span onClick={onRunScenario} style={{ textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}>See the impact</span>
          </div>
        </div>

        {/* 3 Status Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '28px' }}>

          {/* House Goal */}
          <div className="card screen" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <IconTarget />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--sage)' }}>{goalLabel} — {goalProgress >= 100 ? 'Reached!' : 'On Track'}</span>
            </div>
            <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '24px', marginBottom: '4px' }}>Target: {goalYear}</div>
            <div style={{ fontSize: '14px', color: 'var(--slate)', marginBottom: '16px' }}>You've saved {goalProgress}% of your goal amount</div>
            <div style={{ background: 'var(--border)', borderRadius: '50px', height: '10px', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{ width: `${goalProgress}%`, height: '100%', background: 'var(--sage)', borderRadius: '50px', transition: 'width 1s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: 'var(--sage)', fontWeight: 600 }}>₹{p.totalValue.toLocaleString('en-IN')} saved</span>
              <span style={{ color: 'var(--slate)' }}>Goal: ₹{goalTarget.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Emergency Safety */}
          <div className="card screen" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <IconShield />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--amber)' }}>Emergency Safety — Low</span>
            </div>
            <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '28px', marginBottom: '4px' }}>Quick access cash</div>
            <p style={{ fontSize: '14px', color: 'var(--slate)', lineHeight: 1.6, marginBottom: '14px' }}>
              If something unexpected happened today — job loss, medical bill — you'd need to sell your investments to get cash. That's risky if markets are down.
            </p>
            <div style={{ background: 'var(--amber-light)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: 'var(--amber)', fontWeight: 500 }}>
              Tip: Keep 3 months of expenses in a separate savings account
            </div>
          </div>

          {/* Risk Level */}
          <div className="card screen" style={{ padding: '24px', cursor: 'pointer' }} onClick={() => setShowRisk(!showRisk)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <IconActivity />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--anchor-blue)' }}>How risky are my investments?</span>
            </div>
            <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '40px', marginBottom: '4px' }}>
              {risk.overall}<span style={{ fontSize: '18px', color: 'var(--slate)' }}>/10</span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--amber)', marginBottom: '8px' }}>{risk.label}</div>
            <p style={{ fontSize: '13px', color: 'var(--slate)', lineHeight: 1.5, marginBottom: '10px' }}>
              Think of this as a speedometer. 10 = very fast (high risk, high reward). 1 = very slow (very safe, low return). You're at {risk.overall}.
            </p>
            <div style={{ fontSize: '13px', color: 'var(--anchor-blue)', fontWeight: 500 }}>
              {showRisk ? 'Hide details ↑' : 'Understand my risk ↓'}
            </div>
          </div>
        </div>

        {/* RISK BREAKDOWN — expanded */}
        {showRisk && (
          <div className="card screen" style={{ padding: '28px', marginBottom: '28px', borderTop: '3px solid var(--anchor-blue)' }}>
            <div style={{ fontWeight: 600, fontSize: '17px', marginBottom: '6px' }}>What risks does your portfolio carry?</div>
            <p style={{ fontSize: '14px', color: 'var(--slate)', marginBottom: '20px', lineHeight: 1.6 }}>
              Your money faces different kinds of risk. Tap any one to understand it in plain terms.
            </p>
            {risk.components.map(comp => (
              <div key={comp.name}
                style={{ marginBottom: '12px', padding: '16px', background: 'var(--cream)', borderRadius: '12px', cursor: 'pointer', border: `1.5px solid ${riskModal === comp.name ? comp.color : 'transparent'}`, transition: 'border-color 0.2s' }}
                onClick={() => setRiskModal(riskModal === comp.name ? null : comp.name)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{comp.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: comp.color, background: 'white', padding: '2px 10px', borderRadius: '50px', border: `1px solid ${comp.color}` }}>{comp.label}</span>
                  </div>
                </div>
                <div style={{ background: 'var(--border)', borderRadius: '50px', height: '6px', overflow: 'hidden' }}>
                  <div style={{ width: `${comp.score * 10}%`, height: '100%', background: comp.color, borderRadius: '50px', transition: 'width 0.8s ease' }} />
                </div>
                {riskModal === comp.name && (
                  <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
                    <p style={{ fontSize: '14px', color: 'var(--ink)', lineHeight: 1.7, marginBottom: '10px' }}>{comp.explanation}</p>
                    <div style={{ padding: '10px 14px', background: 'var(--anchor-blue-light)', borderRadius: '8px', fontSize: '13px', color: 'var(--anchor-blue)', fontWeight: 500 }}>
                      Plain English: {comp.simple}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* WHERE YOUR MONEY IS — two pies side by side */}
        <div className="card screen" style={{ padding: '28px', marginBottom: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '4px' }}>Where is your money?</h3>
            <p style={{ fontSize: '14px', color: 'var(--slate)' }}>
              Total invested: <strong style={{ color: 'var(--ink)', fontSize: '18px' }}>₹{p.totalValue.toLocaleString('en-IN')}</strong>
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', flexWrap: 'wrap' }}>

            {/* Pie 1: Stocks vs Mutual Funds */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--slate)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stocks vs Funds</div>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Company Shares', value: totalStockValue },
                      { name: 'Mutual Funds',   value: totalFundValue  },
                    ]}
                    cx="50%" cy="50%" innerRadius={42} outerRadius={72} dataKey="value" stroke="none">
                    <Cell fill="#1A1A2E" />
                    <Cell fill="#4A7C6F" />
                  </Pie>
                  <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center', marginTop: '8px' }}>
                {[
                  { label: 'Company Shares', value: totalStockValue, color: '#1A1A2E' },
                  { label: 'Mutual Funds',   value: totalFundValue,  color: '#4A7C6F' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '2px', background: item.color, flexShrink: 0 }} />
                    <span style={{ color: 'var(--slate)' }}>{item.label}</span>
                    <strong>{Math.round(item.value / p.totalValue * 100)}%</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Pie 2: Each individual holding */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--slate)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Each Holding</div>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={72} dataKey="value" stroke="none">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} opacity={0.85 - i * 0.04} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [`₹${v.toLocaleString('en-IN')}`, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start', marginTop: '8px' }}>
                {pieData.slice(0, 5).map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '2px', background: item.color, opacity: 0.85 - i * 0.04, flexShrink: 0 }} />
                    <span style={{ color: 'var(--slate)', flex: 1 }}>{item.name}</span>
                    <strong>{Math.round(item.value / p.totalValue * 100)}%</strong>
                  </div>
                ))}
                {pieData.length > 5 && <div style={{ fontSize: '12px', color: 'var(--slate)', marginLeft: '16px' }}>+{pieData.length - 5} more</div>}
              </div>
            </div>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--slate)', marginTop: '16px', fontStyle: 'italic', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
            You own shares in {p.stocks.length} companies and hold {p.funds.length} mutual funds spread across different parts of the economy.
          </p>
        </div>

        {/* STOCKS — visual cards with mini chart */}
        <div className="card screen" style={{ padding: '28px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>Company Shares</h3>
              <p style={{ fontSize: '13px', color: 'var(--slate)' }}>
                You own small pieces of these companies. When they do well, your investment grows.
              </p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '22px' }}>₹{totalStockValue.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: '12px', color: 'var(--slate)' }}>total in stocks</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
            {p.stocks.map(stock => {
              const growthRate = stock.change >= 0 ? 0.12 : 0.04
              const chartData  = makeGrowthData(stock.value, growthRate)
              const isUp       = stock.change >= 0
              const isExpanded = expandedStock === stock.id
              const gainLoss   = stock.currentPrice - stock.buyPrice
              const gainPct    = ((gainLoss / stock.buyPrice) * 100).toFixed(1)

              return (
                <div key={stock.id}
                  style={{ border: '1.5px solid var(--border)', borderRadius: '14px', overflow: 'hidden', background: 'white', cursor: 'pointer', transition: 'border-color 0.2s, box-shadow 0.2s', boxShadow: isExpanded ? '0 4px 20px rgba(26,26,46,0.1)' : 'none' }}
                  onClick={() => setExpandedStock(isExpanded ? null : stock.id)}
                  onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.borderColor = 'var(--anchor-blue)' }}
                  onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.borderColor = 'var(--border)' }}>

                  {/* Mini chart header */}
                  <div style={{ height: 72 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`grad-${stock.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={isUp ? '#4A7C6F' : '#C0392B'} stopOpacity={0.25}/>
                            <stop offset="95%" stopColor={isUp ? '#4A7C6F' : '#C0392B'} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="value" stroke={isUp ? '#4A7C6F' : '#C0392B'} strokeWidth={2} fill={`url(#grad-${stock.id})`} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>{stock.name}</div>
                        <div style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--anchor-blue)', background: 'var(--anchor-blue-light)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block' }}>{stock.ticker}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, fontSize: '15px' }}>₹{stock.value.toLocaleString('en-IN')}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', marginTop: '2px' }}>
                          {isUp ? <IconTrend /> : <IconTrendDown />}
                          <span style={{ fontSize: '12px', fontWeight: 600, color: isUp ? 'var(--sage)' : 'var(--rose)' }}>
                            {isUp ? '+' : ''}{stock.change}% today
                          </span>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                          <div style={{ background: 'var(--cream)', borderRadius: '8px', padding: '10px' }}>
                            <div style={{ fontSize: '11px', color: 'var(--slate)', marginBottom: '3px' }}>You bought at</div>
                            <div style={{ fontWeight: 600, fontSize: '14px' }}>₹{stock.buyPrice}</div>
                          </div>
                          <div style={{ background: 'var(--cream)', borderRadius: '8px', padding: '10px' }}>
                            <div style={{ fontSize: '11px', color: 'var(--slate)', marginBottom: '3px' }}>Current price</div>
                            <div style={{ fontWeight: 600, fontSize: '14px' }}>₹{stock.currentPrice}</div>
                          </div>
                          <div style={{ background: gainLoss >= 0 ? 'var(--sage-light)' : 'var(--rose-light)', borderRadius: '8px', padding: '10px', gridColumn: 'span 2' }}>
                            <div style={{ fontSize: '11px', color: 'var(--slate)', marginBottom: '3px' }}>Your total gain / loss</div>
                            <div style={{ fontWeight: 700, fontSize: '15px', color: gainLoss >= 0 ? 'var(--sage)' : 'var(--rose)' }}>
                              {gainLoss >= 0 ? '+' : ''}₹{(gainLoss * stock.shares).toLocaleString('en-IN')} ({gainPct}%)
                            </div>
                          </div>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--slate)', marginBottom: '10px' }}>{stock.sector} · {stock.shares} shares owned</div>
                        <a href={stock.yahooUrl} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--anchor-blue)', textDecoration: 'none', fontWeight: 500, border: '1px solid var(--anchor-blue-light)', padding: '6px 14px', borderRadius: '50px', background: 'var(--anchor-blue-light)' }}>
                          <IconLink /> Live price on Yahoo Finance
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* MUTUAL FUNDS — visual cards with mini chart */}
        <div className="card screen" style={{ padding: '28px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>Mutual Funds</h3>
              <p style={{ fontSize: '13px', color: 'var(--slate)' }}>
                A mutual fund pools your money with thousands of other investors and spreads it across many companies — automatically.
              </p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '22px' }}>₹{totalFundValue.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: '12px', color: 'var(--slate)' }}>total in funds</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {p.funds.map(fund => {
              const isExpanded = expandedFund === fund.id
              const isUp = fund.change >= 0
              const growthRate = fund.category === 'Equity' ? 0.13 : fund.category === 'Debt' ? 0.07 : 0.09
              const chartData  = makeGrowthData(fund.value, growthRate)
              const catColor   = fund.category === 'Equity' ? FUND_EQUITY_COLOR : fund.category === 'Debt' ? DEBT_COLOR : GOLD_COLOR
              const catLabel   = fund.category === 'Equity' ? 'Grows with the stock market' : fund.category === 'Debt' ? 'Stable, low-risk savings' : 'Protects against inflation'

              return (
                <div key={fund.id}
                  style={{ border: `1.5px solid ${isExpanded ? catColor : 'var(--border)'}`, borderRadius: '14px', overflow: 'hidden', background: 'white', cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => setExpandedFund(isExpanded ? null : fund.id)}>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 0 }}>
                    {/* Left info */}
                    <div style={{ padding: '16px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '2px', background: catColor, flexShrink: 0 }} />
                        <span style={{ fontSize: '12px', color: catColor, fontWeight: 600 }}>{fund.type}</span>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{fund.name}</div>
                      <div style={{ fontSize: '13px', color: 'var(--slate)', marginBottom: '8px' }}>{catLabel}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '16px' }}>₹{fund.value.toLocaleString('en-IN')}</div>
                          <div style={{ fontSize: '12px', color: 'var(--slate)' }}>{fund.units} units @ ₹{fund.nav} each</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {isUp ? <IconTrend /> : <IconTrendDown />}
                          <span style={{ fontSize: '13px', fontWeight: 600, color: isUp ? 'var(--sage)' : 'var(--rose)' }}>
                            {isUp ? '+' : ''}{fund.change}% today
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right mini-chart */}
                    <div style={{ borderLeft: '1px solid var(--border)' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id={`fgrad-${fund.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={catColor} stopOpacity={0.3}/>
                              <stop offset="95%" stopColor={catColor} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="value" stroke={catColor} strokeWidth={2} fill={`url(#fgrad-${fund.id})`} dot={false} />
                          <Tooltip content={<CustomTooltip />} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div style={{ padding: '16px 18px', borderTop: '1px solid var(--border)', background: 'var(--cream)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '14px' }}>
                        <div style={{ background: 'white', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                          <div style={{ fontSize: '11px', color: 'var(--slate)', marginBottom: '4px' }}>Annual fee</div>
                          <div style={{ fontWeight: 700, fontSize: '15px' }}>{fund.expenseRatio}%</div>
                          <div style={{ fontSize: '11px', color: 'var(--slate)' }}>of your investment/yr</div>
                        </div>
                        <div style={{ background: 'white', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                          <div style={{ fontSize: '11px', color: 'var(--slate)', marginBottom: '4px' }}>Risk level</div>
                          <div style={{ fontWeight: 700, fontSize: '15px', color: catColor }}>{fund.risk}</div>
                        </div>
                        <div style={{ background: 'white', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                          <div style={{ fontSize: '11px', color: 'var(--slate)', marginBottom: '4px' }}>Min. monthly SIP</div>
                          <div style={{ fontWeight: 700, fontSize: '15px' }}>{fund.minSip ? `₹${fund.minSip}` : 'N/A'}</div>
                        </div>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--slate)', lineHeight: 1.6, marginBottom: '12px' }}>
                        {fund.category === 'Equity' && `This fund invests in company stocks. It has the potential to grow significantly over time, but can also dip in the short term. Best suited for goals that are 3+ years away.`}
                        {fund.category === 'Debt' && `This fund invests in government and corporate bonds — very safe, steady growth. Think of it like a fixed deposit that's a bit more flexible. Good for money you may need in 1-3 years.`}
                        {fund.category === 'Gold' && `This fund tracks the price of gold without you needing to store physical gold. Gold tends to hold its value when everything else falls — it's a safety net.`}
                      </p>
                      <a href={fund.amfiUrl} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--anchor-blue)', textDecoration: 'none', fontWeight: 500, border: '1px solid var(--anchor-blue-light)', padding: '6px 14px', borderRadius: '50px', background: 'var(--anchor-blue-light)' }}>
                        <IconLink /> View on AMFI India
                      </a>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Plain-English Attention Cards — replacing "Watch Points" */}
        <div className="screen" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>A few things to know</h3>
          <p style={{ fontSize: '14px', color: 'var(--slate)', marginBottom: '16px' }}>These are not emergencies — just things worth understanding about your current investments.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            <div style={{ background: 'white', border: '1px solid #F5BCBA', borderLeft: '4px solid var(--rose)', borderRadius: '12px', padding: '16px 20px' }}>
              <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--rose)', marginBottom: '6px' }}>Your investments can go up and down a lot</div>
              <p style={{ fontSize: '14px', color: 'var(--slate)', lineHeight: 1.6, margin: 0 }}>
                62% of your money is in stocks and equity funds. These can grow a lot over time, but in a bad month, they might drop by 10–15%. That's normal — but it means you shouldn't keep money here that you'll need soon.
              </p>
            </div>

            <div style={{ background: 'white', border: '1px solid #E8C87A', borderLeft: '4px solid var(--amber)', borderRadius: '12px', padding: '16px 20px' }}>
              <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--amber)', marginBottom: '6px' }}>You don't have easy access to quick cash</div>
              <p style={{ fontSize: '14px', color: 'var(--slate)', lineHeight: 1.6, margin: 0 }}>
                If you needed money urgently today — say for a hospital bill or emergency repair — you'd have to sell some investments. That can take 1–3 days, and you might have to sell when prices are low. It helps to keep 2–3 months of expenses in a regular bank account as a backup.
              </p>
            </div>

            <div style={{ background: 'white', border: '1px solid #BFD0F7', borderLeft: '4px solid var(--anchor-blue)', borderRadius: '12px', padding: '16px 20px' }}>
              <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--anchor-blue)', marginBottom: '6px' }}>One of your funds is riskier than the others</div>
              <p style={{ fontSize: '14px', color: 'var(--slate)', lineHeight: 1.6, margin: 0 }}>
                Your HDFC Mid-Cap fund invests in medium-sized companies. These can grow faster than big companies — but they also fall harder when markets are nervous. It makes up {Math.round(76000 / p.totalValue * 100)}% of your portfolio, which is fine for long-term goals, but worth watching.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="card screen" style={{ padding: '36px', textAlign: 'center', background: 'var(--ink)', color: 'white', border: 'none' }}>
          <h2 style={{ color: 'white', fontSize: '26px', marginBottom: '12px' }}>What if the market crashes tomorrow?</h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', marginBottom: '28px', fontSize: '15px', maxWidth: '480px', margin: '0 auto 28px' }}>
            See exactly how a market crash, rising prices, or a sudden cash need would affect your house goal — and what to do about it.
          </p>
          <button className="btn-primary" onClick={onRunScenario} style={{ background: 'white', color: 'var(--ink)', fontSize: '15px', padding: '14px 32px' }}>
            Run a What-If Scenario
          </button>
        </div>

      </div>
    </div>
  )
}
