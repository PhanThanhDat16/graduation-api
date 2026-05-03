import { EDisputeStatus } from './dispute_form.constants'

export enum EContractStatus {
  DRAFT = 'draft',
  CLOSED_FOR_REQUESTS = 'closed_for_requests',
  PENDING_AGREEMENT = 'pending_agreement',
  WAITING_PAYMENT = 'waiting_payment',
  RUNNING = 'running',
  SUBMITTED = 'submitted',
  COMPLETED = 'completed',
  DISPUTE = 'dispute',
  CANCELLED = 'cancelled'
}

export enum EEscrowStatus {
  PENDING = 'pending',
  PARTIAL = 'partial',
  FUNDED = 'funded',
  LOCKED = 'locked',
  RELEASED = 'released',
  REFUNDED = 'refunded',
  SPLIT = 'split'
}

export enum EResolutionType {
  EXTEND = 'extend',
  CANCEL = 'cancel',
  SPLIT = 'split',
  AUTO_CLOSE = 'auto_close'
}

export interface ContractFilter {
  status?: EContractStatus
  escrowStatus?: EEscrowStatus
  contractorId?: string
  freelancerId?: string
  projectId?: string
}

export interface DisputeFilter {
  status?: EDisputeStatus
  contractId?: string
  contractorId?: string
  freelancerId?: string
}

export interface ICreateContract {
  projectId: string
  applicationId?: string
  contractorId: string
  freelancerId: string
  description?: string
  contractorTerms?: string
  freelancerTerms?: string
  totalAmount: number
  adminFee?: number
  freelancerDeposit?: number
  deadline?: Date
}

export interface IUpdateContract {
  description?: string
  contractorTerms?: string
  freelancerTerms?: string
  totalAmount?: number
  adminFee?: number
  freelancerDeposit?: number
  deadline?: Date
  contractorAgreed?: boolean
  freelancerAgreed?: boolean
  status?: EContractStatus
}

export interface ICreateDispute {
  contractId: string
  openedBy: string
  reason?: string
}

export interface IProposeResolution {
  resolutionType: EResolutionType
  freelancerAmount?: number
  contractorAmount?: number
  newDeadline?: Date
}

export interface ISubmitContract {
  githubLink?: string
  webLink?: string
}

