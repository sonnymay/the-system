import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
          email,
          password,
          options: { data: { username } },
        })
        if (error) throw error
        setSuccess('Check your email to confirm your account.')
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: '#0a0a0f' }}>

      {/* Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="text-4xl mb-3">⚔️</div>
          <h1 className="text-2xl font-bold text-white tracking-tight">The System</h1>
          <p className="text-sm mt-1" style={{ color: '#555570' }}>
            {mode === 'login' ? 'Welcome back, Hunter.' : 'Begin your journey.'}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-6" style={{ background: '#111118', border: '1px solid #1e1e2e' }}>
          {/* Toggle */}
          <div className="flex mb-6 rounded-xl p-1" style={{ background: '#0a0a0f' }}>
            {(['login', 'signup'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setMode(tab); setError(''); setSuccess('') }}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: mode === tab ? '#7c3aed' : 'transparent',
                  color: mode === tab ? 'white' : '#555570',
                }}
              >
                {tab === 'login' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  key="username"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Field
                    label="Hunter name"
                    type="text"
                    value={username}
                    onChange={setUsername}
                    placeholder="SungJinWoo"
                    required={mode === 'signup'}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              required
            />

            <div>
              <label className="block text-xs mb-1.5" style={{ color: '#555570' }}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none pr-10"
                  style={{ background: '#1a1a28', border: '1px solid #252535', color: '#e2e8f0' }}
                  onFocus={(e) => (e.target.style.borderColor = '#7c3aed80')}
                  onBlur={(e) => (e.target.style.borderColor = '#252535')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#555570' }}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs py-2.5 px-3 rounded-xl"
                style={{ color: '#ef4444', background: '#ef444412', border: '1px solid #ef444430' }}>
                {error}
              </p>
            )}
            {success && (
              <p className="text-xs py-2.5 px-3 rounded-xl"
                style={{ color: '#10b981', background: '#10b98112', border: '1px solid #10b98130' }}>
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all mt-2"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                opacity: loading ? 0.7 : 1,
                boxShadow: loading ? 'none' : '0 0 24px #7c3aed30',
              }}
            >
              {loading
                ? <><Loader2 size={14} className="animate-spin" /> Working…</>
                : mode === 'login' ? 'Enter The System' : 'Arise'
              }
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#333350' }}>
          "You don't rise to your goals. You fall to your systems."
        </p>
      </motion.div>
    </div>
  )
}

function Field({
  label, type, value, onChange, placeholder, required,
}: {
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  required?: boolean
}) {
  return (
    <div>
      <label className="block text-xs mb-1.5" style={{ color: '#555570' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
        style={{ background: '#1a1a28', border: '1px solid #252535', color: '#e2e8f0' }}
        onFocus={(e) => (e.target.style.borderColor = '#7c3aed80')}
        onBlur={(e) => (e.target.style.borderColor = '#252535')}
      />
    </div>
  )
}
