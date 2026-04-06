import { PaginationQuery } from './pagination.constant'

export enum EApplicationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected'
}

export interface ApplicationFilter {
  projectId?: string
  freelancerId?: string
  status?: EApplicationStatus
}

export interface IApplicationCreate {
  projectId: string
  freelancerId: string
  proposal: string
  proposedBudget: number
}

export interface IApplicationUpdate {
  proposal?: string
  proposedBudget?: number
  status?: EApplicationStatus
}

export interface ApplicationQuery extends PaginationQuery, ApplicationFilter {}
