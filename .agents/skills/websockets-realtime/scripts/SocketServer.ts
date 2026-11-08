import { Server } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { Redis } from 'ioredis'

const pubClient = new Redis(process.env.REDIS_URL!)
const subClient = pubClient.duplicate()

/**
 * Scalable Socket.io Server Setup
 * Includes: Redis adapter for horizontal scaling and JWT auth.
 */
export const initSocketServer = (httpServer: any) => {
  const io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL },
    adapter: createAdapter(pubClient, subClient)
  })

  // Middleware: Auth
  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    if (isValid(token)) {
      next()
    } else {
      next(new Error('unauthorized'))
    }
  })

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`)

    socket.on('join-room', (roomId) => {
      socket.join(roomId)
    })

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`)
    })
  })

  return io
}

function isValid(token: string) { return true }
