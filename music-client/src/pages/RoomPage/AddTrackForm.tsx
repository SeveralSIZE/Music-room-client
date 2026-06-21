import { useState } from 'react'
import { parseAndAddTrack } from '../../api/media'
import { useApp } from '../../store/AppContext'
import Input from '../../components/Input'
import Button from '../../components/Button'

interface Props {
  onAdded: () => void
}

export default function AddTrackForm({ onAdded }: Props) {
  const { roomId } = useApp()
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!roomId || !url) return
    setError('')
    setLoading(true)
    try {
      await parseAndAddTrack(roomId, url)
      setUrl('')
      setOpen(false)
      onAdded()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <Button variant="ghost" onClick={() => setOpen(true)} className="w-full text-xs">
        + Добавить трек
      </Button>
    )
  }

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-zinc-300 text-xs font-medium">Новый трек</span>
        <button
          onClick={() => { setOpen(false); setError('') }}
          className="text-zinc-500 hover:text-zinc-300 text-xs"
        >
          ✕
        </button>
      </div>

      <Input
        label="Ссылка на YouTube"
        placeholder="https://youtube.com/watch?v=..."
        value={url}
        onChange={e => setUrl(e.target.value)}
      />

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <Button loading={loading} onClick={handleSubmit} className="w-full">
        Добавить
      </Button>
    </div>
  )
}