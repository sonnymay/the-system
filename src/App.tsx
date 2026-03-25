import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { useStore } from './store/useStore'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0f' }}>
      <div className="text-center">
        <div
          className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center animate-pulse"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
        >
          <span className="text-white text-lg">⚔️</span>
        </div>
        <p className="text-xs" style={{ color: '#4b5563' }}>Initializing The System...</p>
      </div>
    </div>
  )
}

export default function App() {
  const [loading, setLoading] = useState(true)
  const setUserId = useStore((s) => s.setUserId)
  const userId = useStore((s) => s.userId)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null)
    })

    return () => subscription.unsubscribe()
  }, [setUserId])

  if (loading) return <LoadingScreen />
  if (!userId) return <AuthPage />
  return <Dashboard />
}
