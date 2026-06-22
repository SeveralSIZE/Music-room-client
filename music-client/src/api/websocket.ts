import { Client } from '@stomp/stompjs'
import { getToken } from './auth'

let client: Client | null = null

const isSecure = window.location.protocol === 'https:'
const protocol = isSecure ? 'wss://' : 'ws://'

//export const brokerURL = `${protocol}${window.location.host}/api/ws/websocket`;

export function connectWebSocket(onConnected: () => void) {
    const token = getToken()
    client = new Client({
      //brokerURL: 'ws://localhost:8085/ws/websocket',
      brokerURL: 'ws://bore.pub:51216/ws/websocket',
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      onConnect: () => {
        console.log('STOMP connected')
        onConnected()
      },
      onDisconnect: () => console.log('STOMP disconnected'),
      onStompError: (frame) => console.error('STOMP error', frame),
    })
    client.activate()
}

export function subscribeToSessionStarted(roomId: string, callback: () => void) {
  if (!client) return
  client.subscribe(`/exchange/amq.topic/room.${roomId}.session.started`, () => {
    callback()
  })
}

export function subscribeToTrackChanged(roomId: string, callback: (track: any) => void) {
  if (!client) return
  client.subscribe(`/exchange/amq.topic/room.${roomId}.track.changed`, (message) => {
    const event = JSON.parse(message.body)
    callback(event.currentTrack)
  })
}

export function subscribeToRoomUpdated(roomId: string, callback: (roomResponse: any) => void) {
  if (!client) return

  return client.subscribe(`/exchange/amq.topic/room.${roomId}.changed`, (message) => {
    const event = JSON.parse(message.body)
    callback(event.roomResponse)
  })
}

export function subscribeToQueueChanged(roomId: string, callback: (event: any) => void) {
  if (!client) return

  return client.subscribe(`/exchange/amq.topic/room.${roomId}.queue.changed`, (message) => {
    const event = JSON.parse(message.body)
    callback(event)
  })
}

export function subscribeToPlaybackStatus(roomId: string, callback: (status: { paused: boolean }) => void) {
  if (!client) return
  return client.subscribe(`/exchange/amq.topic/room.${roomId}.playback.status`, (message) => {
    const event = JSON.parse(message.body)
    callback(event)
  })
}

export function disconnectWebSocket() {
  client?.deactivate()
  client = null
}