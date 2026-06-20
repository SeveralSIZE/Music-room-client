import type { AuthTokens } from '../types'

function parseJwt(token: string): { sub: string; preferred_username: string } {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(atob(base64))
}

export async function login(
  username: string,
  password: string
): Promise<{ tokens: AuthTokens; userId: string; username: string }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Неверный логин или пароль')
  }

  const tokens: AuthTokens = await res.json()
  const payload = parseJwt(tokens.access_token)
  return { tokens, userId: payload.sub, username: payload.preferred_username }
}

export async function register(
  username: string,
  password: string,
  email: string
): Promise<void> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, email }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err || 'Ошибка регистрации')
  }
}

export function getToken(): string {
  return localStorage.getItem('token') ?? ''
}