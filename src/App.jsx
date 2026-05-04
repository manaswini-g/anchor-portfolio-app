import { useState } from 'react'
import Onboarding    from './pages/Onboarding'
import Dashboard     from './pages/Dashboard'
import Scenario      from './pages/Scenario'
import FutureSelf    from './pages/FutureSelf'
import Recommendation from './pages/Recommendation'
import Chatbot       from './components/Chatbot'

export default function App() {
  const [screen, setScreen]           = useState('onboarding')
  const [userProfile, setUserProfile] = useState(null)
  const [scenarioResult, setScenarioResult] = useState(null)
  const [scenarioInputs, setScenarioInputs] = useState(null)
  const [chatOpen, setChatOpen]       = useState(false)

  const go = (s) => setScreen(s)
  const chatProps = { onOpenChat: () => setChatOpen(true) }

  return (
    <div>
      {screen === 'onboarding' && (
        <Onboarding onComplete={(profile) => { setUserProfile(profile); go('dashboard') }} />
      )}
      {screen === 'dashboard' && (
        <Dashboard userProfile={userProfile} onRunScenario={() => go('scenario')} {...chatProps} />
      )}
      {screen === 'scenario' && (
        <Scenario
          onResult={(inputs, result) => { setScenarioInputs(inputs); setScenarioResult(result); go('futureself') }}
          onBack={() => go('dashboard')}
          {...chatProps}
        />
      )}
      {screen === 'futureself' && (
        <FutureSelf result={scenarioResult} inputs={scenarioInputs} userProfile={userProfile}
          onContinue={() => go('recommendation')} onBack={() => go('scenario')} {...chatProps} />
      )}
      {screen === 'recommendation' && (
        <Recommendation result={scenarioResult} inputs={scenarioInputs} userProfile={userProfile}
          onBack={() => go('dashboard')} {...chatProps} />
      )}

      {chatOpen && <Chatbot onClose={() => setChatOpen(false)} />}

      {!chatOpen && screen !== 'onboarding' && (
        <button onClick={() => setChatOpen(true)} style={{
          position: 'fixed', bottom: 24, right: 24, background: 'var(--ink)', color: 'white',
          border: 'none', borderRadius: '50px', padding: '12px 20px', fontSize: '14px', fontWeight: 600,
          cursor: 'pointer', boxShadow: '0 4px 20px rgba(26,26,46,0.25)',
          display: 'flex', alignItems: 'center', gap: '8px',
          fontFamily: 'DM Sans, sans-serif', zIndex: 200, transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--anchor-blue)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--ink)'; e.currentTarget.style.transform = 'translateY(0)' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M14 2H2a1 1 0 00-1 1v9a1 1 0 001 1h2v2l3-2h7a1 1 0 001-1V3a1 1 0 00-1-1z" fill="white"/>
          </svg>
          Ask Anchor
        </button>
      )}
    </div>
  )
}
