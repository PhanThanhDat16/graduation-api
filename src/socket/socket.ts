import { Server } from 'socket.io'
import http from 'http'

let io: Server

export const setupSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  })

  io.on('connection', (socket) => {
    console.log('🟢 A user connected:', socket.id)

    socket.on('disconnect', () => {
      console.log('🔴 User disconnected:', socket.id)
    })
  })
}

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io has not been initialized')
  }
  return io
}
