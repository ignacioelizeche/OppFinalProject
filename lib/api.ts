/**
 * API Module for the DELTA Mathematics Education Platform
 * This file now re-exports the real API implementation from realApi.ts
 * The mock data and mock fetch implementation have been removed
 */

// Re-export all API endpoints from the real implementation
export { 
  authAPI, 
  calendarAPI, 
  problemsAPI, 
  leaderboardAPI, 
  forumAPI,
  dashboardAPI,
  mockExamAPI
} from './realApi';

// Re-export any interface types needed by consumers of this API
export interface ForumPost {
  id: number
  authorId: number
  authorName: string
  title: string
  content: string
  createdAt: string
}

export interface Comment {
  id: number
  postId: number
  authorId: number
  authorName: string
  content: string
  createdAt: string
}

