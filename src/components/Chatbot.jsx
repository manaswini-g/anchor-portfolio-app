import { useState, useRef, useEffect } from 'react'
import { getPortfolioContext } from '../data/mockData'

const SUGGESTED_QUESTIONS = [
  "Am I on track for my house goal?",
  "What does my risk score of 6.4 mean?",
  "Should I be worried about my HDFC Mid-Cap fund?",
  "What is an exit load?",
  "What happens to my portfolio if RBI raises rates?",
  "Which of my funds has the highest fees?",
  "How does inflation affect my savings?",
  "What is a SIP and should I increase mine?",
]

export default function Chatbot({ onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hello, I'm Anchor. I can answer questions about your portfolio, explain financial terms, or help you understand your risk. What would you like to know?" }
  ])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const [showSuggested, setShowSuggested] = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  async function sendMessage(text) {
    const userText = (text || input).trim()
    if (!userText || loading) return
    setInput('')
    setShowSuggested(false)

    const newUserMsg = { role: 'user', text: userText }
    const updatedMessages = [...messages, newUserMsg]
    setMessages(updatedMessages)
    setLoading(true)

    try {
      // Build history excluding the first assistant greeting to keep context clean
      const history = updatedMessages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.text
      }))

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 1000,
          messages: [
            { role: 'system', content: getPortfolioContext() },
            ...history,
          ],
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        console.error('OpenAI error:', err)
        throw new Error(err?.error?.message || 'API error')
      }

      const data  = await res.json()
      const reply = data.choices?.[0]?.message?.content?.trim()
        || "I didn't get a response. Please try again."

      setMessages(prev => [...prev, { role: 'assistant', text: reply }])
    } catch (err) {
      console.error('Chat error:', err)
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: "I'm having trouble connecting right now. Please check your internet connection and try again."
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position:'fixed', bottom:24, right:24, width:400, maxHeight:'80vh', background:'white', borderRadius:'20px', boxShadow:'0 8px 40px rgba(26,26,46,0.18)', border:'1px solid var(--border)', display:'flex', flexDirection:'column', zIndex:300, animation:'chatIn 0.25s ease' }}>

      {/* Header */}
      <div style={{ padding:'18px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:'12px', flexShrink:0 }}>
        <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--ink)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <span style={{ color:'white', fontSize:'16px', fontFamily:'DM Serif Display, serif' }}>A</span>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:600, fontSize:'15px' }}>Ask Anchor</div>
          <div style={{ fontSize:'12px', color:'var(--sage)' }}>Portfolio-aware assistant</div>
        </div>
        <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--slate)', fontSize:'22px', lineHeight:1, padding:'4px' }}>×</button>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:'12px' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display:'flex', justifyContent: msg.role==='user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ maxWidth:'85%', padding:'12px 16px', borderRadius: msg.role==='user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: msg.role==='user' ? 'var(--ink)' : 'var(--cream)', color: msg.role==='user' ? 'white' : 'var(--ink)', fontSize:'14px', lineHeight:1.6, border: msg.role==='assistant' ? '1px solid var(--border)' : 'none', whiteSpace:'pre-wrap' }}>
              {msg.text}
            </div>
          </div>
        ))}

        {showSuggested && messages.length === 1 && (
          <div>
            <div style={{ fontSize:'12px', color:'var(--slate)', marginBottom:'8px', fontWeight:500 }}>Try asking</div>
            {SUGGESTED_QUESTIONS.map(q => (
              <button key={q} onClick={() => sendMessage(q)}
                style={{ width:'100%', background:'var(--cream)', border:'1px solid var(--border)', borderRadius:'10px', padding:'9px 14px', cursor:'pointer', fontSize:'13px', textAlign:'left', color:'var(--ink)', marginBottom:'6px', display:'block', transition:'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='var(--anchor-blue)'; e.currentTarget.style.background='var(--anchor-blue-light)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--cream)' }}>
                {q}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div style={{ display:'flex' }}>
            <div style={{ padding:'12px 16px', borderRadius:'16px 16px 16px 4px', background:'var(--cream)', border:'1px solid var(--border)', display:'flex', gap:'4px', alignItems:'center' }}>
              {[0,1,2].map(i => <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'var(--slate)', animation:`dot 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding:'14px 16px', borderTop:'1px solid var(--border)', flexShrink:0 }}>
        <div style={{ display:'flex', gap:'8px', alignItems:'flex-end' }}>
          <textarea value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            placeholder="Ask anything about your portfolio..." rows={1}
            style={{ flex:1, border:'1.5px solid var(--border)', borderRadius:'12px', padding:'10px 14px', fontSize:'14px', fontFamily:'DM Sans, sans-serif', resize:'none', outline:'none', lineHeight:1.4, background:'var(--cream)', color:'var(--ink)' }}
            onFocus={e => e.target.style.borderColor='var(--ink)'}
            onBlur={e => e.target.style.borderColor='var(--border)'}
          />
          <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
            style={{ width:40, height:40, borderRadius:'50%', background: input.trim()&&!loading ? 'var(--ink)' : 'var(--border)', border:'none', cursor: input.trim()&&!loading ? 'pointer' : 'default', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M14 8L2 2l2 6-2 6 12-6z" fill="white"/></svg>
          </button>
        </div>
        <div style={{ fontSize:'11px', color:'var(--slate)', marginTop:'6px', textAlign:'center' }}>Anchor AI — not a licensed financial advisor.</div>
      </div>

      <style>{`
        @keyframes dot { 0%,100%{opacity:.3;transform:scale(.8)} 50%{opacity:1;transform:scale(1)} }
        @keyframes chatIn { from{transform:scale(.95) translateY(8px);opacity:0} to{transform:scale(1) translateY(0);opacity:1} }
      `}</style>
    </div>
  )
}
