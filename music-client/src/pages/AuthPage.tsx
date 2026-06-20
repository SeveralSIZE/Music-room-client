import { useState } from 'react'
import { login, register } from '../api/auth'
import { useApp } from '../store/AppContext'
import Input from '../components/Input'
import Button from '../components/Button'

export default function AuthPage() {
  const { setToken } = useApp()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const handleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      const { tokens, userId, username: uname } = await login(username, password)
      setToken(tokens.access_token, userId, uname)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    setError('')
    setSuccess('')
    if (password !== confirm) {
      setError('Пароли не совпадают')
      return
    }
    setLoading(true)
    try {
      await register(username, password, email)
      setSuccess('Аккаунт создан. Войдите в систему.')
      setMode('login')
      setPassword('')
      setConfirm('')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-2">
            <svg className="w-6 h-6 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <span className="text-zinc-100 font-semibold tracking-tight text-lg">MusicRoom</span>
          </div>
          <p className="text-zinc-500 text-xs">Совместное прослушивание музыки</p>
        </div>

        <div className="flex mb-6 border-b border-zinc-800">
          {(['login', 'register'] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); setSuccess('') }}
              className={`flex-1 pb-2 text-sm transition-colors ${
                mode === m
                  ? 'text-zinc-100 border-b border-zinc-100 -mb-px'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {m === 'login' ? 'Вход' : 'Регистрация'}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <Input
            label="Имя пользователя"
            placeholder="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && mode === 'login' && handleLogin()}
          />

          {mode === 'register' && (
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          )}

          <Input
            label="Пароль"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && mode === 'login' && handleLogin()}
          />

          {mode === 'register' && (
            <Input
              label="Повторите пароль"
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRegister()}
            />
          )}

          {error && <p className="text-red-400 text-xs">{error}</p>}
          {success && <p className="text-green-400 text-xs">{success}</p>}

          <Button
            className="w-full mt-1"
            loading={loading}
            onClick={mode === 'login' ? handleLogin : handleRegister}
          >
            {mode === 'login' ? 'Войти' : 'Создать аккаунт'}
          </Button>
        </div>
      </div>
    </div>
  )
}