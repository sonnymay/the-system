import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { username } },
        })
        if (error) throw error
        setSuccess('Check your email to confirm.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid #1a1a28',
    color: '#f0f0f5',
    outline: 'none',
    width: '100%',
    padding: '10px 0',
    fontSize: '15px',
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#08080e' }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-xs"
      >
        {/* Logo */}
        <div className="mb-12">
          <h1 className="text-3xl font-black text-white mb-1" style={{ letterSpacing: '-1px' }}>
            The System
          </h1>
          <p className="text-sm" style={{ color: '#404050' }}>
            {mode === 'login' ? 'Welcome back.' : 'Begin your journey.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {mode === 'signup' && (
              <motion.div
                key="username"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-xs mb-1" style={{ color: '#404050' }}>Hunter name</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="SungJinWoo"
                  required={mode === 'signup'}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderBottomColor = '#8b5cf680')}
                  onBlur={(e) => (e.target.style.borderBottomColor = '#1a1a28')}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="block text-xs mb-1" style={{ color: '#404050' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderBottomColor = '#8b5cf680')}
              onBlur={(e) => (e.target.style.borderBottomColor = '#1a1a28')}
            />
          </div>

          <div>
            <label className="block text-xs mb-1" style={{ color: '#404050' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderBottomColor = '#8b5cf680')}
              onBlur={(e) => (e.target.style.borderBottomColor = '#1a1a28')}
            />
          </div>

          {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}
          {success && <p className="text-xs" style={{ color: '#10b981' }}>{success}</p>}

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
              className="text-sm transition-opacity hover:opacity-60"
              style={{ color: '#404050' }}
            >
              {mode === 'login' ? 'Create account' : 'Sign in instead'}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
              style={{
                background: '#8b5cf6',
                color: 'white',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? '…' : mode === 'login' ? 'Enter' : 'Arise'}
            </button>
          </div>
        </form>

        <p className="text-xs mt-16" style={{ color: '#1e1e28' }}>
          "You don't rise to your goals. You fall to your systems."
        </p>
      </motion.div>
    </div>
  )
}
