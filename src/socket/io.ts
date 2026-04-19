import { Server } from 'socket.io'

let io: Server | undefined

export function setSocketServer(server: Server): void {
  io = server
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.io has not been initialized')
  }
  return io
}
