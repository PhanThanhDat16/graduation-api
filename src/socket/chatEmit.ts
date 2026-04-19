import type { MessageWithRelations } from '@/constants/chat.constants'

import { getIO } from './io'

/**
 * Generate Socket.IO room name for a chat group
 * Format: `group:{groupId}`
 */
export function chatRoomForGroup(groupId: string): string {
  return `group_${groupId}`
}

/**
 * Emit new message to all users in a chat group (realtime sync)
 * Called after message is saved (via REST API or Socket event)
 */
export function emitChatNewMessage(groupId: string, message: MessageWithRelations): void {
  const io = getIO()
  const room = chatRoomForGroup(groupId)
  io.to(room).emit('new_message', message)
}
