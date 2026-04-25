/**
 * AI Data Transfer Interfaces
 * Defines the shape of data that the AI service expects.
 * These match the format of MOCK_JOBS / MOCK_FREELANCERS in the AI codebase.
 */

export interface AIJobData {
  id: string
  title: string
  description: string
  skills_required: string[]
  budget: number
  category: string
  experience_level: string
  duration: string
}

export interface AIFreelancerData {
  id: string
  name: string
  title: string
  bio: string
  skills: string[]
  rating: number
  hourly_rate: number
  projects_completed: number
  apply_history: string[]
  certifications: string[]
}
