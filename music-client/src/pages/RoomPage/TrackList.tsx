import { TrackDto } from '../../types'
import { removeTrack } from '../../api/queue'
import { useApp } from '../../store/AppContext'

interface Props {
  tracks: TrackDto[]
  currentPosition: number
  onUpdate: () => void
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const SOURCE_COLOR: Record<string, string> = {
  VK: 'text-blue-400',
  YOUTUBE: 'text-red-400',
  YANDEX_MUSIC: 'text-yellow-400',
  SPOTIFY: 'text-green-400',
  LOCAL: 'text-zinc-400',
}

export default function TrackList({ tracks, currentPosition, onUpdate }: Props) {
  const { roomId } = useApp()

  const handleRemove = async (trackId: string) => {
    if (!roomId) return
    try {
      await removeTrack(roomId, trackId)
      onUpdate()
    } catch { }
  }

  if (!tracks.length) {
    return <div className="text-zinc-600 text-xs text-center py-8">Очередь пуста</div>
  }

  return (
    <div className="flex flex-col">
      {tracks.map((track, idx) => {
        const isCurrent = track.position === currentPosition
        return (
          <div
            key={track.id}
            className={`group flex items-center gap-3 px-3 py-2 rounded transition-colors ${isCurrent ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'}`}
          >
            <div className="w-5 text-right flex-shrink-0">
              {isCurrent
                ? <span className="inline-block w-2 h-2 bg-zinc-300 rounded-full" />
                : <span className="text-zinc-600 text-xs">{idx + 1}</span>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm truncate ${isCurrent ? 'text-zinc-100' : 'text-zinc-300'}`}>
                {track.name}
              </p>
              <p className="text-zinc-500 text-xs truncate">
                {track.artist}
                <span className={`ml-2 ${SOURCE_COLOR[track.source]}`}>{track.source}</span>
              </p>
            </div>
            <span className="text-zinc-600 text-xs flex-shrink-0">{formatDuration(track.durationSec)}</span>
            <button
              onClick={() => handleRemove(track.id)}
              className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all text-xs w-5 flex-shrink-0"
            >
              ✕
            </button>
          </div>
        )
      })}
    </div>
  )
}