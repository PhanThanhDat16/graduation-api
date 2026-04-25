export enum EChatGroupType {
  CONTRACT_CHAT = 'contract_chat',
  GUEST_SUPPORT = 'guest_support'
}

export enum EChatMemberRole {
  MEMBER = 'member',
  ADMINISTRATOR = 'administrator'
}
export enum EMessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system'
}

export interface PublicChatUser {
  _id: string
  full_name: string
  avatar: string
}

export interface ChatGroupListItem {
  _id: string
  memberIds: string[]
  ownerId: string | null
  type: EChatGroupType
  disputeId: string | null
  lastMessage: string
  lastMessageAt: Date | null
  lastSenderId: PublicChatUser | null
  createdAt: Date
  unreadCount: number
}

export interface ReplyPreview {
  _id: string
  content: string
  senderId: PublicChatUser | null
  createdAt: Date
}

export interface MessageWithRelations {
  _id: string
  groupId: string
  senderId: PublicChatUser | null
  type: EMessageType
  content: string
  replyTo: ReplyPreview | null
  createdAt: Date
}

export interface GroupMemberRow {
  _id: string
  userId: string
  role: EChatMemberRole
  joinedAt: Date
}

export interface CreateChatGroupBody {
  type: EChatGroupType
  disputeId?: string
  memberIds: string[]
}
