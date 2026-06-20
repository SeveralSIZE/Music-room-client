import { useState } from 'react'
import { createRoom, joinRoom } from '../api/rooms'
import { useApp } from '../store/AppContext'
import Input from '../components/Input'
import Button from '../components/Button'

export default function HomePage() {
  const { token, username, logout, setRoom } = useApp()
  const [roomName, setRoomName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [joinLoading, setJoinLoading] = useState(false)
  const [createError, setCreateError] = useState('')
  const [joinError, setJoinError] = useState('')

  const handleCreate = async () => {
    if (!token || !roomName.trim()) return
    setCreateError('')
    setCreateLoading(true)
    try {
      const room = await createRoom(roomName.trim())
      setRoom(room)
    } catch (e: any) {
      setCreateError(e.message)
    } finally {
      setCreateLoading(false)
    }
  }

  const handleJoin = async () => {
    if (!token || !inviteCode.trim()) return
    setJoinError('')
    setJoinLoading(true)
    try {
      const room = await joinRoom(inviteCode.trim())
      setRoom(room)
    } catch (e: any) {
      setJoinError(e.message)
    } finally {
      setJoinLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Topbar */}
      <header className="border-b border-zinc-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          <span className="text-zinc-200 font-medium text-sm tracking-tight">MusicRoom</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-zinc-500 text-xs">{username}</span>
          <Button variant="ghost" onClick={logout} className="text-xs px-3 py-1">
            Выйти
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm flex flex-col gap-4">

          {/* Create room */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
            <h2 className="text-zinc-200 text-sm font-medium mb-3">Создать комнату</h2>
            <div className="flex flex-col gap-3">
              <Input
                placeholder="Название комнаты"
                value={roomName}
                onChange={e => setRoomName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
              />
              {createError && <p className="text-red-400 text-xs">{createError}</p>}
              <Button
                className="w-full"
                loading={createLoading}
                onClick={handleCreate}
                disabled={!roomName.trim()}
              >
                Создать
              </Button>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-zinc-600 text-xs">или</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          {/* Join room */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
            <h2 className="text-zinc-200 text-sm font-medium mb-3">Войти в комнату</h2>
            <div className="flex flex-col gap-3">
              <Input
                placeholder="Инвайт-код"
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
              />
              {joinError && <p className="text-red-400 text-xs">{joinError}</p>}
              <Button
                variant="ghost"
                className="w-full"
                loading={joinLoading}
                onClick={handleJoin}
                disabled={!inviteCode.trim()}
              >
                Войти
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}