import { Client } from '@stomp/stompjs'

let client: Client | null = null

export function connectWebSocket(onConnected: () => void) {
  client = new Client({
    brokerURL: 'ws://localhost:8085/ws/websocket',
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

export function disconnectWebSocket() {
  client?.deactivate()
  client = null
}