import { createContext, useContext, useState, ReactNode } from 'react'
import type { AppState, RoomResponse } from '../types'

interface AppContextType extends AppState {
  setToken: (token: string, userId: string, username: string) => void
  setRoom: (room: RoomResponse) => void
  logout: () => void
}

const AppContext = createContext<AppContextType | null>(null)

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const savedToken = localStorage.getItem('token')

  const [state, setState] = useState<AppState>({
    token: savedToken && !isTokenExpired(savedToken) ? savedToken : null,
    userId: localStorage.getItem('userId'),
    username: localStorage.getItem('username'),
    roomId: localStorage.getItem('roomId'),
    room: null,
  })

  const setToken = (token: string, userId: string, username: string) => {
    localStorage.setItem('token', token)
    localStorage.setItem('userId', userId)
    localStorage.setItem('username', username)
    setState(s => ({ ...s, token, userId, username }))
  }

  const setRoom = (room: RoomResponse) => {
    localStorage.setItem('roomId', room.id)
    setState(s => ({ ...s, roomId: room.id, room }))
  }

  const logout = () => {
    localStorage.clear()
    setState({ token: null, userId: null, username: null, roomId: null, room: null })
  }

  return (
    <AppContext.Provider value={{ ...state, setToken, setRoom, logout }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}