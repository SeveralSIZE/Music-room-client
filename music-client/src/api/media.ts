// Запросы к media-service идут напрямую на порт 8084 (через vite proxy /internal и /stream)
import { getToken } from './auth'

function authHeader() {
  return { Authorization: `Bearer ${getToken()}` }
}

export async function parseAndAddTrack(roomId: string, youtubeUrl: string): Promise<TrackDto> {
  const res = await fetch(`/api/media/parse?youtubeUrl=${encodeURIComponent(youtubeUrl)}&roomId=${roomId}`, {
    method: 'POST',
    headers: authHeader(),
  })
  if (!res.ok) throw new Error('Не удалось добавить трек')
  return res.json()
}

export async function pausePlayback(roomId: string): Promise<void> {
  await fetch('/internal/pause', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId }),
  })
}

export async function resumePlayback(roomId: string): Promise<void> {
  await fetch('/internal/resume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId }),
  })
}

export async function stopPlayback(roomId: string): Promise<void> {
  await fetch('/internal/stop', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId }),
  })
}

export function getStreamUrl(roomId: string): string {
  return `/stream/${roomId}`
}