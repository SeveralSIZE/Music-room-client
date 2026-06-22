import { useEffect, RefObject } from 'react'
import { pausePlayback, resumePlayback, stopPlayback, getStreamUrl } from '../../api/media'
import { useApp } from '../../store/AppContext'
import { TrackDto } from '../../types'
import Button from '../../components/Button'

interface Props {
  currentTrack: TrackDto | null
  onNext: () => void
  onPrevious: () => void
  audioRef: RefObject<HTMLAudioElement>
  audioUnlocked: boolean
  sessionReady: boolean
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function Player({ currentTrack, onNext, onPrevious, audioRef, audioUnlocked, sessionReady }: Props) {
  const { roomId } = useApp()

  useEffect(() => {
    const audio = audioRef.current
    if (!roomId || !currentTrack || !audio || !sessionReady) return

    let isMounted = true
    let timeoutId: number | undefined

    const loadStream = () => {
      // Полный сброс
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
      audio.currentTime = 0

      // Новый URL с антикешевым параметром
      const url = getStreamUrl(roomId) + '?t=' + Date.now()
      audio.src = url
      audio.load()
      audio.currentTime = 0

      const onLoaded = () => {
        console.log('-=-=-=-=-=-=-=-=-=-=')
        console.log('currentTime:', audio.currentTime)
        if (!isMounted) return
        audio.currentTime = 0
        audio.play()
          .then(() => {
            if (isMounted) audio.currentTime = 0
          })
          .catch(() => {})
        cleanup()
        console.log('currentTime:', audio.currentTime)
        console.log('-=-=-=-=-=-=-=-=-=-=')
      }

      const onError = () => {
        if (!isMounted) return
        cleanup()
        timeoutId = setTimeout(loadStream, 500) as unknown as number
      }

      const cleanup = () => {
        audio.removeEventListener('loadeddata', onLoaded)
        audio.removeEventListener('error', onError)
        if (timeoutId) clearTimeout(timeoutId)
      }

      audio.addEventListener('loadeddata', onLoaded)
      audio.addEventListener('error', onError)

      timeoutId = setTimeout(() => {
        if (isMounted && audio.readyState >= 2) {
          audio.currentTime = 0
          audio.play()
            .then(() => {
              if (isMounted) audio.currentTime = 0
            })
            .catch(() => {})
          cleanup()
        }
      }, 3000) as unknown as number
    }

    loadStream()

    return () => {
      isMounted = false
      if (timeoutId) clearTimeout(timeoutId)
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
    }
  }, [currentTrack?.id, roomId, audioRef, sessionReady])

  const handlePause = async () => {
    if (!roomId) return
    await pausePlayback(roomId)
    audioRef.current?.pause()
  }

  const handleResume = async () => {
    if (!roomId) return
    await resumePlayback(roomId)
    audioRef.current?.play()
  }

  const handleStop = async () => {
    if (!roomId) return
    await stopPlayback(roomId)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
      <div className="mb-4">
        {currentTrack ? (
          <>
            <p className="text-zinc-100 text-sm font-medium truncate">{currentTrack.name}</p>
            <p className="text-zinc-500 text-xs truncate">
              {currentTrack.artist} · {formatDuration(currentTrack.durationSec)}
            </p>
          </>
        ) : (
          <p className="text-zinc-600 text-xs">Нет активного трека</p>
        )}
      </div>

      <audio ref={audioRef} className="hidden" />

      <div className="flex items-center gap-2">
        <Button variant="icon" onClick={onPrevious} title="Предыдущий">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
          </svg>
        </Button>
        <Button variant="icon" onClick={handlePause} title="Пауза">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        </Button>
        <Button variant="icon" onClick={handleResume} title="Воспроизвести">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </Button>
        <Button variant="icon" onClick={handleStop} title="Стоп">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h12v12H6z" />
          </svg>
        </Button>
        <Button variant="icon" onClick={onNext} title="Следующий">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 18l8.5-6L6 6v12zm2.5-6 5.5 3.9V8.1L8.5 12zM16 6h2v12h-2z" />
          </svg>
        </Button>
        <Button variant="danger" onClick={handleStop} className="ml-auto text-xs px-3 py-1">
          Стоп
        </Button>
      </div>
    </div>
  )
}