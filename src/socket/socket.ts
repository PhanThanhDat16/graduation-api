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
    socket.on('staff_join_conv_general', () => {
      socket.join('staff_join_conv_general')
    })

    // USERS, STAFF JOIN CONVERSATION (to response internal)
    socket.on('user_join_conv', (data) => {
      const { groupId } = data
      const room = chatRoomForGroup(groupId)
      socket.join(room)
    })

    socket.on('disconnect', (reason) => {
      console.log(`[Socket] User disconnected: ${socket.id} - Reason: ${reason}`)
    })

    socket.on('error', (error) => {
      console.error(`[Socket] Error from ${socket.id}:`, error)
    })
  })
}
