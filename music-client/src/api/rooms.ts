import type { RoomResponse } from '../types'
import { getToken } from './auth'

const BASE = '/api/rooms'

function headers() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  }
}

export async function createRoom(name: string): Promise<RoomResponse> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error('Не удалось создать комнату')
  return res.json()
}

export async function joinRoom(inviteCode: string): Promise<RoomResponse> {
  const res = await fetch(`${BASE}/join`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ inviteCode }),
  })
  if (!res.ok) throw new Error('Неверный инвайт-код')
  return res.json()
}

export async function getRoom(roomId: string): Promise<RoomResponse> {
  const res = await fetch(`${BASE}/${roomId}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (!res.ok) throw new Error('Комната не найдена')
  return res.json()
}