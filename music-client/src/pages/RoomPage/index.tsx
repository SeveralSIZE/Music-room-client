import { useEffect, useState, useCallback, useRef } from 'react'
import {
  connectWebSocket,
  subscribeToTrackChanged,
  subscribeToSessionStarted,
  subscribeToRoomUpdated,
  subscribeToQueueChanged,
  subscribeToPlaybackStatus,
  disconnectWebSocket
} from '../../api/websocket'
import { useApp } from '../../store/AppContext'
import { getRoom } from '../../api/rooms'
import { getQueue, getCurrentTrack, nextTrack, previousTrack } from '../../api/queue'
import { QueueDto, TrackDto, RoomResponse } from '../../types'
import Player from './Player'
import TrackList from './TrackList'
import AddTrackForm from './AddTrackForm'
import { getStreamUrl } from '../../api/media'

export default function RoomPage() {
  const { roomId, room: cachedRoom, setRoom, logout } = useApp()
  const [room, setLocalRoom] = useState<RoomResponse | null>(cachedRoom)
  const [queue, setQueue] = useState<QueueDto | null>(null)
  const [currentTrack, setCurrentTrack] = useState<TrackDto | null>(null)
  const [copied, setCopied] = useState(false)
  const [audioUnlocked, setAudioUnlocked] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (!roomId || !audioUnlocked) return

    let roomSubscription: any = null
    let queueSubscription: any = null
    let playbackSubscription: any = null

    connectWebSocket(() => {
      roomSubscription = subscribeToRoomUpdated(roomId, (roomResponse) => {
        console.log('Состав комнаты обновлен:', roomResponse.participants)
        setLocalRoom(roomResponse)
        setRoom(roomResponse)
      })

      queueSubscription = subscribeToQueueChanged(roomId, (event) => {
        console.log('Получены обновленные треки из WS:', event.tracks)
        setQueue({
          tracks: event.tracks,
          currentTrackPosition: 0
        })
      })

      playbackSubscription = subscribeToPlaybackStatus(roomId, (status) => {
          if (!audioRef.current) return

          if (status.paused) {
            audioRef.current.pause()
          } else {
            audioRef.current.play().catch(() => {})
          }
      })

      subscribeToTrackChanged(roomId, (track) => {
        setCurrentTrack(track)
      })

      subscribeToSessionStarted(roomId, () => {
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.src = getStreamUrl(roomId)
            audioRef.current.load()
            audioRef.current.play().catch(() => {})
          }
        }, 500)
      })
    })

    return () => {
      if (roomSubscription?.unsubscribe) roomSubscription.unsubscribe()
      if (queueSubscription?.unsubscribe) queueSubscription.unsubscribe()
      disconnectWebSocket()
    }
  }, [roomId, audioUnlocked, setRoom])

  const fetchRoom = useCallback(async () => {
    if (!roomId) return
    try {
      const r = await getRoom(roomId)
      setLocalRoom(r)
      setRoom(r)
    } catch { }
  }, [roomId])

  const fetchQueue = useCallback(async () => {
    if (!roomId) return
    try {
      const q = await getQueue(roomId).catch(() => null)
      const ct = await getCurrentTrack(roomId).catch(() => null)
      setQueue(q)
      setCurrentTrack(ct)
    } catch { }
  }, [roomId])

  useEffect(() => {
    fetchRoom()
    fetchQueue()
  }, [fetchRoom, fetchQueue])

  const handleNext = async () => {
    if (!roomId) return
    await nextTrack(roomId)
    setTimeout(fetchQueue, 300)
  }

  const handlePrevious = async () => {
    if (!roomId) return
    await previousTrack(roomId)
    setTimeout(fetchQueue, 300)
  }

  const copyInvite = () => {
    if (!room?.inviteCode) return
    navigator.clipboard.writeText(room.inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const leaveRoom = () => {
    localStorage.removeItem('roomId')
    window.location.reload()
  }

  const unlockAudio = () => {
    setAudioUnlocked(true)
    if (audioRef.current) {
      audioRef.current.play().catch(() => {})
    }
  }

  return (
    <div className="relative min-h-screen bg-zinc-950 flex flex-col">

      {!audioUnlocked && (
        <div className="absolute inset-0 bg-zinc-950/90 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <p className="text-zinc-400 text-sm">{room?.name ?? 'Загрузка...'}</p>
            <button
              onClick={unlockAudio}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-sm px-6 py-3 rounded-lg border border-zinc-700 transition-colors"
            >
              Войти в комнату
            </button>
          </div>
        </div>
      )}

      <header className="border-b border-zinc-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <svg className="w-4 h-4 text-zinc-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          <span className="text-zinc-200 text-sm font-medium truncate">
            {room?.name ?? 'Загрузка...'}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {room?.inviteCode && (
            <button
              onClick={copyInvite}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors border border-zinc-800 hover:border-zinc-700 rounded px-2 py-1"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {copied ? 'Скопировано!' : room.inviteCode}
            </button>
          )}
          <button
            onClick={leaveRoom}
            className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors border border-zinc-800 hover:border-zinc-700 rounded px-2 py-1"
          >
            Выйти из комнаты
          </button>
          <button
            onClick={logout}
            className="text-zinc-600 hover:text-zinc-400 text-xs transition-colors"
          >
            Выход
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col gap-4 p-6 overflow-y-auto min-w-0">
          <Player
            currentTrack={currentTrack}
            onNext={handleNext}
            onPrevious={handlePrevious}
            audioRef={audioRef}
            audioUnlocked={audioUnlocked}
          />

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg flex flex-col">
            <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
              <span className="text-zinc-300 text-xs font-medium">
                Очередь
                {queue?.tracks?.length ? (
                  <span className="ml-2 text-zinc-600">{queue.tracks.length}</span>
                ) : null}
              </span>
            </div>
            <div className="p-2">
              <TrackList
                tracks={queue?.tracks ?? []}
                currentPosition={queue?.currentTrackPosition ?? -1}
                onUpdate={fetchQueue}
              />
            </div>
            <div className="px-2 pb-2">
              <AddTrackForm onAdded={fetchQueue} />
            </div>
          </div>
        </div>

        <div className="w-56 border-l border-zinc-800 p-4 flex flex-col gap-3 flex-shrink-0">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">
            Участники
            <span className="ml-1 text-zinc-700">{room?.participants?.length ?? 0}</span>
          </p>
          <div className="flex flex-col gap-1">
            {room?.participants?.map(p => (
              <div key={p.id} className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-zinc-900 transition-colors">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                <span className="text-zinc-300 text-xs truncate">{p.username}</span>
                {p.id === room.createdBy && (
                  <span className="ml-auto text-zinc-600 text-xs">host</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}