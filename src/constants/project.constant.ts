import { PaginationQuery } from './pagination.constant'

export enum EProjectStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  CLOSED = 'closed'
}

export interface ProjectFilter {
  contractorId?: string
  category?: string
  status?: EProjectStatus
  likes?: number
  keyword?: string
  budgetMin?: number
  budgetMax?: number
}

export interface IProjectCreate {
  contractorId: string
  title: string
  description: string
  category: string
  skills?: string[]
  budgetMin: number
  budgetMax: number
  status?: EProjectStatus
}

export interface IProjectUpdate {
  title?: string
  description?: string
  category?: string
  skills?: string[]
  budgetMin?: number
  budgetMax?: number
  status?: EProjectStatus
}

export interface ProjectQuery extends PaginationQuery, ProjectFilter {}
