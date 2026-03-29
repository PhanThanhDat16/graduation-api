export enum EContractStatus {
  DRAFT = 'draft',
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

export enum EDisputeStatus {
  OPEN = 'open',
  NEGOTIATING = 'negotiating',
  ADMIN_REVIEW = 'admin_review',
  RESOLVED = 'resolved',
  AUTO_CLOSED = 'auto_closed'
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
  contract_id?: string
  contractor_id?: string
  freelancer_id?: string
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
  contract_id: string
  opened_by: string
  reason?: string
}

export interface IProposeResolution {
  resolution_type: EResolutionType
  freelancer_amount?: number
  contractor_amount?: number
  new_deadline?: Date
}
