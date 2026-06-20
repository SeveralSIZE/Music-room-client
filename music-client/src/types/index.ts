export interface UserResponse {
  id: string
  username: string
}

export interface RoomResponse {
  id: string
  name: string
  inviteCode: string
  createdBy: string
  participants: UserResponse[]
  createdAt: string
}

export type TrackSource = 'VK' | 'YOUTUBE' | 'YANDEX_MUSIC' | 'SPOTIFY' | 'LOCAL'

export interface TrackDto {
  id: string
  name: string
  artist: string
  durationSec: number
  source: TrackSource
  streamUrl: string
  streamUrlExpiresAt: string
  addedBy: string
  position: number
}

export interface QueueDto {
  id: string
  roomId: string
  tracks: TrackDto[]
  currentTrackPosition: number
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  expires_in: number
}

export interface AppState {
  token: string | null
  userId: string | null
  username: string | null
  roomId: string | null
  room: RoomResponse | null
}