import { PaginationQuery } from "./pagination.constant";

export enum EAdminAction {
  // Contract actions
  APPROVE_CONTRACT = 'approve_contract',
  REJECT_CONTRACT = 'reject_contract',
  CANCEL_CONTRACT = 'cancel_contract',
  COMPLETE_CONTRACT = 'complete_contract',

  // Dispute actions
  OPEN_DISPUTE = 'open_dispute',
  RESOLVE_DISPUTE = 'resolve_dispute',
  CLOSE_DISPUTE = 'close_dispute',
  REVIEW_DISPUTE = 'review_dispute',

  // User actions
  BAN_USER = 'ban_user',
  UNBAN_USER = 'unban_user',
  WARN_USER = 'warn_user',
  VERIFY_USER = 'verify_user',

  // General
  OTHER = 'other'
}

export interface AdminHistoryFilter {
  adminId?: string;
  contractId?: string;
  disputeId?: string;
  userId?: string;
  action?: string;
}

export interface ICreateAdminHistory {
  adminId: string;
  contractId?: string;
  disputeId?: string;
  userId?: string;
  action: string;
  note: string;
}

export interface IUpdateAdminHistory {
  action?: string;
  note?: string;
}

export interface AdminHistoryQuery extends PaginationQuery, AdminHistoryFilter {}
