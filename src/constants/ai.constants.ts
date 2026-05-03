/**
 * AI Data Transfer Interfaces
 * Defines the shape of data that the AI service expects.
 * All fields use camelCase to match MongoDB/Mongoose conventions.
 */

export interface AIJobData {
  id: string
  title: string
  description: string
  category: string
  skills: string[]
  budgetMin: number
  budgetMax: number
  status: string
  contractorId: string
  createdAt: string
}

export interface AIFreelancerData {
  id: string
  fullName: string
  description: string
  role: string
  ratingAvg: number | null
  ratingCount: number | null
  status: string
}
