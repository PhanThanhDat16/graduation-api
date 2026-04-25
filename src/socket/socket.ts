import { Server, Socket } from 'socket.io'
import http from 'http'

import { setSocketServer } from './io'
import { chatRoomForGroup } from './chatEmit'

export function setupSocket(server: http.Server): void {
  const io = new Server(server, {
    cors: {
      origin: process.env.SOCKET_CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
      credentials: true
    }
  })

  // Store reference to IO instance
  setSocketServer(io)

  // Global connection handler
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] User connected: ${socket.id}`)

    // JOIN CONVERSATION
    socket.on('join_conversation', (data) => {
      const { groupId } = data
      const room = chatRoomForGroup(groupId)
      socket.join(room)
    })

    // STAFF JOIN CONVERSATION GENERAL (to response guest)
    socket.on('staff_room_general', () => {
      socket.join('staff_room_general')
    })

    // GUEST JOIN CONVERSATION (to response internal)
    socket.on('guest_join_conversation', (data) => {
      const { groupId } = data
      const room = chatRoomForGroup(groupId)
      socket.join(room)
      io.to('staff_room_general').emit('new_conversation', {
        groupId
      })
    })

    socket.on('disconnect', (reason) => {
      console.log(`[Socket] User disconnected: ${socket.id} - Reason: ${reason}`)
    })

  })
}
