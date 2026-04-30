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
  escrow_status?: EEscrowStatus
  contractor_id?: string
  freelancer_id?: string
  project_id?: string
}

export interface DisputeFilter {
  status?: EDisputeStatus
  contractId?: string
  contractorId?: string
  freelancerId?: string
}

export interface ICreateContract {
  project_id: string
  application_id?: string
  contractor_id: string
  freelancer_id: string
  description?: string
  contractor_terms?: string
  freelancer_terms?: string
  total_amount: number
  admin_fee?: number
  freelancer_deposit?: number
  deadline?: Date
}

export interface IUpdateContract {
  description?: string
  contractor_terms?: string
  freelancer_terms?: string
  total_amount?: number
  admin_fee?: number
  freelancer_deposit?: number
  deadline?: Date
  contractor_agreed?: boolean
  freelancer_agreed?: boolean
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

