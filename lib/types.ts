// User types
export interface User {
  id: number
  username: string
  email: string
  role: string
  coinBalance: number
}

export interface AuthResponse {
  success: boolean
  token: string
  user: User
}

// Calendar types
export interface CalendarEvent {
  id: number
  title: string
  description: string
  eventType: string
  startTime: string
  endTime: string
}

// Problem types
export interface Problem {
  id: number
  title: string
  description: string
  difficulty: string
  topic: string
  pointValue: number
}

export interface ProblemAttempt {
  id: number
  title: string
  difficulty: string
  correct: boolean
  timestamp: string
}

export interface ProblemHistory {
  attempts: ProblemAttempt[]
}

export interface SubmitAnswerResponse {
  success: boolean
  correct: boolean
  message: string
}

// Leaderboard types
export interface LeaderboardEntry {
  rank: number
  id: number
  username: string
  coins: number
}

export interface LeaderboardResponse {
  users: LeaderboardEntry[]
}

// Visualization types
export interface Visualization {
  id: number
  title: string
  description: string
  visualizationType: string
  dataPayload: any
  topic: string
}

// Forum types
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

