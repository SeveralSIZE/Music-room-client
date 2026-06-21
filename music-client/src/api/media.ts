// Запросы к media-service идут напрямую на порт 8084 (через vite proxy /internal и /stream)
import { getToken } from './auth'
import type { TrackDto } from '../types'

function authHeader() {
  return { Authorization: `Bearer ${getToken()}` }
}

export async function startPlayback(roomId: string, youtubeUrl: string): Promise<void> {
  await fetch('/api/media/internal/play', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ roomId, youtubeUrl }),
  })
}

export async function getStreamMeta(roomId: string): Promise<boolean> {
  const res = await fetch(`/api/media/stream/${roomId}/meta`)
  return res.ok
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
  await fetch('/api/media/internal/pause', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ roomId }),
  })
}

export async function resumePlayback(roomId: string): Promise<void> {
  await fetch('/api/media/internal/resume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ roomId }),
  })
}

export async function stopPlayback(roomId: string): Promise<void> {
  await fetch('/api/media/internal/stop', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ roomId }),
  })
}

export function getStreamUrl(roomId: string): string {
  return `/api/media/stream/${roomId}`
}