import { PaginationQuery } from './pagination.constant'

/**
 * review later
export enum ENotificationType {
  // Contract
  CONTRACT_CREATED = 'contract_created',
  CONTRACT_AGREED = 'contract_agreed',
  CONTRACT_PAID = 'contract_paid',
  CONTRACT_SUBMITTED = 'contract_submitted',
  CONTRACT_COMPLETED = 'contract_completed',
  CONTRACT_CANCELLED = 'contract_cancelled',
  CONTRACT_EXTENDED = 'contract_extended',

  // Dispute
  DISPUTE_OPENED = 'dispute_opened',
  DISPUTE_RESOLVED = 'dispute_resolved',
  DISPUTE_CLOSED = 'dispute_closed',

  // Payment
  PAYMENT_RECEIVED = 'payment_received',
  PAYMENT_REFUNDED = 'payment_refunded',
  WALLET_DEPOSIT = 'wallet_deposit',
  WALLET_WITHDRAW = 'wallet_withdraw',

  // Review
  REVIEW_RECEIVED = 'review_received',

  // System
  SYSTEM = 'system',
  OTHER = 'other'
}
*/

export enum ENotificationType {
  CONTRACT = 'contract',
  PAYMENT = 'payment',
  DISPUTE = 'dispute',
  MESSAGE = 'message',
  SYSTEM = 'system'
}

export interface NotificationFilter {
  user_id?: string
  type?: ENotificationType
  is_read?: boolean
}

export interface ICreateNotification {
  user_id: string
  type: ENotificationType
  title: string
  content: string
}

export interface IUpdateNotification {
  is_read?: boolean
}

export interface NotificationQuery extends PaginationQuery, NotificationFilter {}
