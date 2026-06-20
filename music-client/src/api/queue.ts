import { getToken } from './auth'
import type { QueueDto, TrackDto, TrackSource } from '../types'

const BASE = '/api/queue'

function authHeader() {
  return { Authorization: `Bearer ${getToken()}` }
}

export interface AddTrackPayload {
  name: string
  artist: string
  durationSec: number
  source: TrackSource
  streamUrl?: string
  position?: number
}

export async function getQueue(roomId: string): Promise<QueueDto> {
  const res = await fetch(`${BASE}/${roomId}`, { headers: authHeader() })
  if (!res.ok) throw new Error('Не удалось загрузить очередь')
  return res.json()
}

export async function getCurrentTrack(roomId: string): Promise<TrackDto | null> {
  const res = await fetch(`${BASE}/${roomId}/tracks/current`, { headers: authHeader() })
  if (res.status === 404) return null
  if (!res.ok) throw new Error('Не удалось получить текущий трек')
  return res.json()
}

export async function addTrack(roomId: string, payload: AddTrackPayload): Promise<TrackDto> {
  const res = await fetch(`${BASE}/${roomId}/tracks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Не удалось добавить трек')
  return res.json()
}

export async function removeTrack(roomId: string, trackId: string): Promise<void> {
  const res = await fetch(`${BASE}/${roomId}/tracks/${trackId}`, {
    method: 'DELETE',
    headers: authHeader(),
  })
  if (!res.ok) throw new Error('Не удалось удалить трек')
}

export async function nextTrack(roomId: string): Promise<void> {
  await fetch(`${BASE}/${roomId}/tracks/next`, { method: 'PATCH', headers: authHeader() })
}

export async function previousTrack(roomId: string): Promise<void> {
  await fetch(`${BASE}/${roomId}/tracks/previous`, { method: 'PATCH', headers: authHeader() })
}