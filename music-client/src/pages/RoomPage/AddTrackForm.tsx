import { useState } from 'react'
import { addTrack, AddTrackPayload } from '../../api/queue'
import { useApp } from '../../store/AppContext'
import { TrackSource } from '../../types'
import Input from '../../components/Input'
import Button from '../../components/Button'

const SOURCES: TrackSource[] = ['VK', 'YOUTUBE', 'YANDEX_MUSIC', 'SPOTIFY', 'LOCAL']

interface Props {
  onAdded: () => void
}

const empty = (): AddTrackPayload => ({
  name: '',
  artist: '',
  durationSec: 0,
  source: 'LOCAL',
  streamUrl: '',
})

export default function AddTrackForm({ onAdded }: Props) {
  const { roomId } = useApp()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<AddTrackPayload>(empty())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (key: keyof AddTrackPayload, val: string | number) =>
    setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async () => {
    if (!roomId) return
    setError('')
    setLoading(true)
    try {
      await addTrack(roomId, form)
      setForm(empty())
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

      <div className="grid grid-cols-2 gap-2">
        <Input label="Название" placeholder="Song name" value={form.name}
          onChange={e => set('name', e.target.value)} />
        <Input label="Исполнитель" placeholder="Artist" value={form.artist}
          onChange={e => set('artist', e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Input label="Длительность (сек)" type="number" placeholder="240"
          value={form.durationSec || ''}
          onChange={e => set('durationSec', Number(e.target.value))} />
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-400 uppercase tracking-wider">Источник</label>
          <select
            className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
            value={form.source}
            onChange={e => set('source', e.target.value as TrackSource)}
          >
            {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <Input label="Stream URL" placeholder="https://..." value={form.streamUrl || ''}
        onChange={e => set('streamUrl', e.target.value)} />

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <Button loading={loading} onClick={handleSubmit} className="w-full">
        Добавить
      </Button>
    </div>
  )
}